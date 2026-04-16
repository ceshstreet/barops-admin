/**
 * tokenUtils.js
 * Cryptographic helpers for the client-access token system.
 *
 * RULES:
 *  - Never store the raw token. Only store its SHA-256 hash.
 *  - Send only the raw token to the client (in the URL).
 *  - On every incoming request, hash the incoming token and look up the hash.
 */

const crypto = require('crypto');
const jwt    = require('jsonwebtoken');

const JWT_SECRET = process.env.CLIENT_PORTAL_JWT_SECRET;  // separate from admin JWT secret

if (!JWT_SECRET) {
  throw new Error('CLIENT_PORTAL_JWT_SECRET env var is required');
}

// ─── Token generation ─────────────────────────────────────────────────────────

/**
 * Generate a cryptographically secure raw token and its SHA-256 hash.
 * Store the hash; send the raw token in the link.
 */
function generateAccessToken() {
  const raw  = crypto.randomBytes(32).toString('hex'); // 64 hex chars
  const hash = hashToken(raw);
  return { raw, hash };
}

/** SHA-256 hash of a raw token string. */
function hashToken(raw) {
  return crypto.createHash('sha256').update(raw).digest('hex');
}

// ─── OTP ─────────────────────────────────────────────────────────────────────

/** 6-digit numeric OTP code. */
function generateOtpCode() {
  const code = crypto.randomInt(100_000, 999_999).toString();
  const hash = crypto.createHash('sha256').update(code).digest('hex');
  return { code, hash };
}

/** Constant-time comparison to avoid timing attacks. */
function verifyOtpCode(incoming, storedHash) {
  const incomingHash = crypto.createHash('sha256').update(incoming).digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(incomingHash, 'hex'),
    Buffer.from(storedHash,   'hex')
  );
}

// ─── Client session JWT (issued after token + optional OTP verification) ──────

/**
 * Issue a short-lived session JWT after successful token validation.
 * This JWT is what the Angular client sends in the Authorization header
 * for subsequent action calls (accept, decline, add-upgrade, etc.).
 */
function signClientSession({ tokenId, resourceType, resourceId, permissions }) {
  return jwt.sign(
    { tokenId: tokenId.toString(), resourceType, resourceId: resourceId.toString(), permissions },
    JWT_SECRET,
    { expiresIn: '4h', issuer: 'barops-client-portal' }
  );
}

/**
 * Verify a client session JWT.
 * Returns the decoded payload or throws if invalid/expired.
 */
function verifyClientSession(sessionJwt) {
  return jwt.verify(sessionJwt, JWT_SECRET, { issuer: 'barops-client-portal' });
}

module.exports = {
  generateAccessToken,
  hashToken,
  generateOtpCode,
  verifyOtpCode,
  signClientSession,
  verifyClientSession,
};
