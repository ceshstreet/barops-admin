/**
 * clientAccess.js  —  Express middleware for client portal routes
 *
 * Two middlewares exported:
 *
 *  1. validateClientToken(requiredPermission?)
 *     Reads the raw token from req.params.token,
 *     hashes it, looks it up, validates it, attaches
 *     req.clientToken and req.clientSession to the request.
 *
 *  2. requirePermission(action)
 *     Guards a specific route with a permission check.
 *     Must be used AFTER validateClientToken.
 *
 * Usage in routes:
 *   router.post('/:token/accept',
 *     validateClientToken(),
 *     requirePermission('accept'),
 *     acceptHandler
 *   );
 */

const rateLimit      = require('express-rate-limit');
const ClientAccessToken = require('../models/ClientAccessToken');
const ClientActivityLog = require('../models/ClientActivityLog');
const { hashToken, verifyClientSession } = require('../utils/tokenUtils');

// ─── Rate limiters ────────────────────────────────────────────────────────────

/** 20 token lookups per minute per IP — prevents enumeration attacks. */
const tokenLookupLimiter = rateLimit({
  windowMs: 60_000,
  max: 20,
  standardHeaders: true,
  legacyHeaders:   false,
  handler: (req, res) => {
    log(req, 'TOKEN_REJECTED', null, null, null, { reason: 'rate_limited' });
    res.status(429).json({ ok: false, message: 'Too many requests. Please slow down.' });
  },
});

/** 5 OTP attempts per 15 minutes per IP. */
const otpLimiter = rateLimit({
  windowMs: 15 * 60_000,
  max: 5,
  standardHeaders: true,
  legacyHeaders:   false,
  handler: (req, res) => {
    res.status(429).json({ ok: false, message: 'Too many OTP attempts. Wait 15 minutes.' });
  },
});

// ─── Main token validation middleware ─────────────────────────────────────────

/**
 * Validates the raw token in :token param.
 * On success: attaches req.clientToken (DB document).
 * Accepts either token-in-URL or session JWT in Authorization header.
 *
 * If the client already has a session JWT (issued after OTP), we
 * validate the JWT and skip the DB token lookup.
 */
function validateClientToken() {
  return [
    tokenLookupLimiter,
    async (req, res, next) => {
      const rawToken  = req.params.token;
      const authHeader = req.headers['authorization'];
      const ip        = req.ip || req.connection?.remoteAddress;
      const userAgent = req.headers['user-agent'];

      // ── Path A: Session JWT present ────────────────────────────────────────
      // Client has already passed token (+ OTP) validation and holds a session.
      if (authHeader?.startsWith('Bearer ')) {
        const sessionJwt = authHeader.slice(7);
        try {
          const payload = verifyClientSession(sessionJwt);

          // Verify the token in the JWT matches the URL (prevents session-swap attacks)
          const tokenDoc = await ClientAccessToken.findById(payload.tokenId).lean();
          if (!tokenDoc || !tokenDoc.isValid?.() && !isTokenDocValid(tokenDoc)) {
            return res.status(401).json({ ok: false, message: 'Session expired.' });
          }

          req.clientToken   = tokenDoc;
          req.clientSession = payload;  // { tokenId, resourceType, resourceId, permissions }
          return next();
        } catch {
          return res.status(401).json({ ok: false, message: 'Invalid or expired session.' });
        }
      }

      // ── Path B: Raw token in URL ────────────────────────────────────────────
      if (!rawToken) {
        return res.status(400).json({ ok: false, message: 'No token provided.' });
      }

      const tokenHash = hashToken(rawToken);

      try {
        const tokenDoc = await ClientAccessToken
          .findOne({ rawTokenHash: tokenHash })
          .select('+ipLog');  // explicitly include the select:false field for logging

        // ── Not found ──────────────────────────────────────────────────────
        if (!tokenDoc) {
          await logAnon(req, 'TOKEN_REJECTED', { reason: 'not_found' });
          return res.status(404).json({ ok: false, message: 'Link not found or has expired.' });
        }

        // ── Revoked ────────────────────────────────────────────────────────
        if (tokenDoc.status === 'revoked') {
          await log(req, 'TOKEN_REJECTED', tokenDoc, { reason: 'revoked' });
          return res.status(410).json({ ok: false, message: 'This link has been revoked.' });
        }

        // ── Expired ────────────────────────────────────────────────────────
        if (tokenDoc.expiresAt <= new Date()) {
          tokenDoc.status = 'expired';
          await tokenDoc.save();
          await log(req, 'TOKEN_REJECTED', tokenDoc, { reason: 'expired' });
          return res.status(410).json({ ok: false, message: 'This link has expired.' });
        }

        // ── Valid ──────────────────────────────────────────────────────────
        // Track usage (fire-and-forget, don't await)
        ClientAccessToken.findByIdAndUpdate(tokenDoc._id, {
          $set:  { lastUsedAt: new Date() },
          $inc:  { useCount: 1 },
          $push: { ipLog: { $each: [{ ip, userAgent }], $slice: -20 } },  // keep last 20
        }).exec().catch(console.error);

        req.clientToken = tokenDoc;
        req.rawToken    = rawToken;
        return next();

      } catch (err) {
        console.error('[clientAccess] DB error:', err);
        return res.status(500).json({ ok: false, message: 'Server error.' });
      }
    },
  ];
}

// ─── Permission guard ─────────────────────────────────────────────────────────

/**
 * Checks that req.clientToken (or req.clientSession) includes the required permission.
 * Must be used after validateClientToken().
 */
function requirePermission(action) {
  return async (req, res, next) => {
    const permissions = req.clientSession?.permissions || req.clientToken?.permissions || [];

    if (!permissions.includes(action)) {
      await log(req, 'PERMISSION_DENIED', req.clientToken, { action });
      return res.status(403).json({
        ok: false,
        message: `You don't have permission to perform this action.`,
      });
    }
    next();
  };
}

// ─── OTP middleware ───────────────────────────────────────────────────────────

/** Exposes the OTP rate limiter for use in the OTP verify route. */
function otpRateLimit() {
  return otpLimiter;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isTokenDocValid(tokenDoc) {
  return tokenDoc.status === 'active' && tokenDoc.expiresAt > new Date();
}

async function log(req, action, tokenDoc, metadata = {}) {
  try {
    await ClientActivityLog.record({
      action,
      accessTokenId: tokenDoc?._id,
      resourceType:  tokenDoc?.resourceType,
      resourceId:    tokenDoc?.resourceId,
      ip:        req.ip || req.connection?.remoteAddress,
      userAgent: req.headers['user-agent'],
      metadata,
    });
  } catch { /* non-blocking */ }
}

async function logAnon(req, action, metadata = {}) {
  try {
    await ClientActivityLog.record({
      action,
      ip:        req.ip || req.connection?.remoteAddress,
      userAgent: req.headers['user-agent'],
      metadata,
    });
  } catch { /* non-blocking */ }
}

module.exports = {
  validateClientToken,
  requirePermission,
  otpRateLimit,
};
