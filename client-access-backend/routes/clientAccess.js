/**
 * clientAccess.js — Express router
 *
 * Mount in app.js as:
 *   app.use('/api/client-access', require('./routes/clientAccess'));
 *
 * ALL routes here are public (no admin JWT required).
 * Security is provided by the token validation middleware.
 *
 * Routes:
 *   GET  /:token                     — validate token, return resource + permissions
 *   POST /:token/otp/send            — (re)send OTP to client phone
 *   POST /:token/otp/verify          — verify OTP, return session JWT
 *   GET  /:token/resource            — return full quote/reservation data (requires session)
 *   POST /:token/accept              — accept proposal
 *   POST /:token/decline             — decline proposal
 *   POST /:token/request-changes     — submit a change request message
 *   POST /:token/add-upgrade         — add an allowed add-on to the quote
 */

const express   = require('express');
const router    = express.Router();
const mongoose  = require('mongoose');

const ClientAccessToken = require('../models/ClientAccessToken');
const ClientOtp         = require('../models/ClientOtp');
const ClientActivityLog = require('../models/ClientActivityLog');

const { validateClientToken, requirePermission, otpRateLimit } = require('../middleware/clientAccess');
const {
  generateAccessToken,
  hashToken,
  generateOtpCode,
  verifyOtpCode,
  signClientSession,
} = require('../utils/tokenUtils');

// Lazy references to existing models — use whatever your project has
const Quote       = () => mongoose.model('Quote');
const Reservation = () => mongoose.model('Reservation');

// Optional: OTP delivery service (plug in Twilio / WhatsApp Business API)
const otpDelivery = require('../services/otpDelivery');  // see otpDelivery.js template

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN HELPER: generate a token link (call this from your admin API)
// POST /api/client-access/admin/generate
// Body: { resourceType, resourceId, permissions?, expiryDays?, otpRequired?, otpChannel?, clientName?, clientPhone?, clientEmail? }
// ─────────────────────────────────────────────────────────────────────────────
router.post('/admin/generate', /* your adminAuth middleware */ async (req, res) => {
  try {
    const {
      resourceType, resourceId, permissions, expiryDays = 14,
      otpRequired = false, otpChannel = 'none',
      clientName, clientPhone, clientEmail,
    } = req.body;

    if (!['quote', 'reservation'].includes(resourceType)) {
      return res.status(400).json({ ok: false, message: 'Invalid resourceType.' });
    }

    const { raw, hash } = generateAccessToken();

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiryDays);

    const defaultPerms = resourceType === 'quote'
      ? ['view', 'accept', 'decline', 'request_changes', 'add_upgrade']
      : ['view', 'request_changes'];

    const tokenDoc = await ClientAccessToken.create({
      rawTokenHash: hash,
      resourceType,
      resourceId,
      permissions: permissions || defaultPerms,
      expiresAt,
      otpRequired,
      otpChannel,
      clientName,
      clientPhone,
      clientEmail,
      createdBy: req.user?.id || 'admin',
    });

    // Build the public URL
    const prefix = resourceType === 'quote' ? '/q' : '/r';
    const publicUrl = `${process.env.FRONTEND_URL}${prefix}/${raw}`;

    res.json({ ok: true, data: { tokenId: tokenDoc._id, publicUrl, expiresAt } });

  } catch (err) {
    console.error('[generate]', err);
    res.status(500).json({ ok: false, message: 'Could not generate link.' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN HELPER: revoke a token
// POST /api/client-access/admin/revoke/:tokenId
// ─────────────────────────────────────────────────────────────────────────────
router.post('/admin/revoke/:tokenId', /* your adminAuth middleware */ async (req, res) => {
  try {
    const tokenDoc = await ClientAccessToken.findById(req.params.tokenId);
    if (!tokenDoc) return res.status(404).json({ ok: false, message: 'Token not found.' });

    await tokenDoc.revoke(req.body.reason || 'admin_revoke');

    await ClientActivityLog.record({
      action: 'TOKEN_REVOKED',
      accessTokenId: tokenDoc._id,
      resourceType: tokenDoc.resourceType,
      resourceId: tokenDoc.resourceId,
      metadata: { reason: req.body.reason, revokedBy: req.user?.id },
    });

    res.json({ ok: true, message: 'Token revoked.' });
  } catch (err) {
    res.status(500).json({ ok: false, message: 'Could not revoke token.' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /:token  — Initial token validation
// Returns either:
//   { requiresOtp: true }                        (if OTP not yet done)
//   { sessionToken, resourceType, permissions }   (if no OTP needed)
// ─────────────────────────────────────────────────────────────────────────────
router.get('/:token', validateClientToken(), async (req, res) => {
  const tokenDoc = req.clientToken;

  await ClientActivityLog.record({
    action: 'TOKEN_ACCESSED',
    accessTokenId: tokenDoc._id,
    resourceType: tokenDoc.resourceType,
    resourceId:   tokenDoc.resourceId,
    ip:        req.ip,
    userAgent: req.headers['user-agent'],
  });

  // ── OTP required and not yet verified ──────────────────────────────────
  if (tokenDoc.otpRequired && !tokenDoc.otpVerifiedAt) {
    return res.json({
      ok: true,
      requiresOtp: true,
      clientPhone: maskPhone(tokenDoc.clientPhone),
    });
  }

  // ── No OTP or already verified → issue session JWT ──────────────────────
  const sessionToken = signClientSession({
    tokenId:      tokenDoc._id,
    resourceType: tokenDoc.resourceType,
    resourceId:   tokenDoc.resourceId,
    permissions:  tokenDoc.permissions,
  });

  await ClientActivityLog.record({
    action: 'SESSION_STARTED',
    accessTokenId: tokenDoc._id,
    resourceType: tokenDoc.resourceType,
    resourceId:   tokenDoc.resourceId,
    ip: req.ip, userAgent: req.headers['user-agent'],
  });

  res.json({
    ok: true,
    requiresOtp: false,
    sessionToken,
    resourceType: tokenDoc.resourceType,
    resourceId:   tokenDoc.resourceId.toString(),
    permissions:  tokenDoc.permissions,
    expiresAt:    tokenDoc.expiresAt,
    clientName:   tokenDoc.clientName,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /:token/otp/send  — Generate + deliver OTP
// ─────────────────────────────────────────────────────────────────────────────
router.post('/:token/otp/send', otpRateLimit(), validateClientToken(), async (req, res) => {
  const tokenDoc = req.clientToken;

  if (!tokenDoc.otpRequired) {
    return res.status(400).json({ ok: false, message: 'OTP not required for this link.' });
  }

  if (!tokenDoc.clientPhone) {
    return res.status(400).json({ ok: false, message: 'No phone number on file for this client.' });
  }

  const { code, hash } = generateOtpCode();
  const expiresAt = new Date(Date.now() + 10 * 60_000); // 10 minutes

  // Invalidate any existing unused OTPs for this token
  await ClientOtp.updateMany(
    { accessTokenId: tokenDoc._id, used: false },
    { $set: { used: true } }
  );

  const otpDoc = await ClientOtp.create({
    accessTokenId: tokenDoc._id,
    codeHash:      hash,
    expiresAt,
    deliveredVia:  tokenDoc.otpChannel,
    deliveredTo:   tokenDoc.clientPhone,
  });

  // Deliver via configured channel
  try {
    await otpDelivery.send({
      channel:     tokenDoc.otpChannel,
      to:          tokenDoc.clientPhone,
      code,
      clientName:  tokenDoc.clientName,
      eventName:   'your upcoming event',  // optionally look up the resource name
    });
    await ClientOtp.findByIdAndUpdate(otpDoc._id, { deliveredAt: new Date() });
  } catch (err) {
    console.error('[otp/send] delivery error:', err.message);
    await ClientOtp.findByIdAndUpdate(otpDoc._id, { deliveryError: err.message });
    // Still return OK so the attacker can't confirm if phone is valid
  }

  await ClientActivityLog.record({
    action: 'OTP_SENT',
    accessTokenId: tokenDoc._id,
    resourceType: tokenDoc.resourceType,
    resourceId: tokenDoc.resourceId,
    ip: req.ip, userAgent: req.headers['user-agent'],
    metadata: { channel: tokenDoc.otpChannel },
  });

  res.json({
    ok: true,
    message: `A verification code was sent to ${maskPhone(tokenDoc.clientPhone)}.`,
    expiresIn: 600,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /:token/otp/verify  — Verify OTP code, return session JWT
// ─────────────────────────────────────────────────────────────────────────────
router.post('/:token/otp/verify', otpRateLimit(), validateClientToken(), async (req, res) => {
  const tokenDoc = req.clientToken;
  const { code }  = req.body;

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ ok: false, message: 'OTP code is required.' });
  }

  const otpDoc = await ClientOtp.findOne({
    accessTokenId: tokenDoc._id,
    used: false,
    expiresAt: { $gt: new Date() },
    attempts: { $lt: 3 },
  }).sort({ createdAt: -1 });

  if (!otpDoc) {
    return res.status(400).json({
      ok: false,
      message: 'No valid OTP found. Please request a new code.',
    });
  }

  const valid = verifyOtpCode(code.trim(), otpDoc.codeHash);

  if (!valid) {
    otpDoc.attempts += 1;
    await otpDoc.save();

    const attemptsLeft = otpDoc.maxAttempts - otpDoc.attempts;

    await ClientActivityLog.record({
      action: 'OTP_FAILED',
      accessTokenId: tokenDoc._id,
      resourceType: tokenDoc.resourceType,
      resourceId: tokenDoc.resourceId,
      ip: req.ip, userAgent: req.headers['user-agent'],
      metadata: { attemptsLeft },
    });

    if (attemptsLeft <= 0) {
      await ClientActivityLog.record({
        action: 'OTP_LOCKED',
        accessTokenId: tokenDoc._id,
        resourceType: tokenDoc.resourceType,
        resourceId: tokenDoc.resourceId,
        ip: req.ip, userAgent: req.headers['user-agent'],
      });
      return res.status(429).json({
        ok: false,
        message: 'Too many failed attempts. Please request a new code.',
        locked: true,
      });
    }

    return res.status(400).json({
      ok: false,
      message: `Incorrect code. ${attemptsLeft} attempt${attemptsLeft !== 1 ? 's' : ''} remaining.`,
      attemptsLeft,
    });
  }

  // ── Success ────────────────────────────────────────────────────────────────
  otpDoc.used = true;
  await otpDoc.save();

  tokenDoc.otpVerifiedAt = new Date();
  await tokenDoc.save();

  const sessionToken = signClientSession({
    tokenId:      tokenDoc._id,
    resourceType: tokenDoc.resourceType,
    resourceId:   tokenDoc.resourceId,
    permissions:  tokenDoc.permissions,
  });

  await ClientActivityLog.record({
    action: 'OTP_VERIFIED',
    accessTokenId: tokenDoc._id,
    resourceType: tokenDoc.resourceType,
    resourceId: tokenDoc.resourceId,
    ip: req.ip, userAgent: req.headers['user-agent'],
  });

  await ClientActivityLog.record({
    action: 'SESSION_STARTED',
    accessTokenId: tokenDoc._id,
    resourceType: tokenDoc.resourceType,
    resourceId: tokenDoc.resourceId,
    ip: req.ip, userAgent: req.headers['user-agent'],
  });

  res.json({
    ok: true,
    sessionToken,
    resourceType: tokenDoc.resourceType,
    resourceId:   tokenDoc.resourceId.toString(),
    permissions:  tokenDoc.permissions,
    expiresAt:    tokenDoc.expiresAt,
    clientName:   tokenDoc.clientName,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /:token/resource  — Fetch the actual quote or reservation data
// Requires a valid session JWT in Authorization header
// ─────────────────────────────────────────────────────────────────────────────
router.get('/:token/resource', validateClientToken(), requirePermission('view'), async (req, res) => {
  const { resourceType, resourceId } = req.clientToken;

  try {
    let data;
    if (resourceType === 'quote') {
      data = await Quote()
        .findById(resourceId)
        .select('-internalNotes -__v')  // never expose internal notes to the client
        .lean();
    } else {
      data = await Reservation()
        .findById(resourceId)
        .select('-internalNotes -__v')
        .lean();
    }

    if (!data) {
      return res.status(404).json({ ok: false, message: 'Resource not found.' });
    }

    await ClientActivityLog.record({
      action: 'VIEW',
      accessTokenId: req.clientToken._id,
      resourceType, resourceId,
      ip: req.ip, userAgent: req.headers['user-agent'],
    });

    res.json({ ok: true, data });

  } catch (err) {
    console.error('[resource]', err);
    res.status(500).json({ ok: false, message: 'Could not load data.' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /:token/accept
// ─────────────────────────────────────────────────────────────────────────────
router.post('/:token/accept', validateClientToken(), requirePermission('accept'), async (req, res) => {
  const { resourceType, resourceId, _id: accessTokenId } = req.clientToken;

  try {
    let updated;
    if (resourceType === 'quote') {
      updated = await Quote().findByIdAndUpdate(
        resourceId,
        { $set: { status: 'APPROVED', clientAcceptedAt: new Date() } },
        { new: true, select: '-internalNotes' }
      );
    } else {
      updated = await Reservation().findByIdAndUpdate(
        resourceId,
        { $set: { clientStatus: 'CONFIRMED', clientConfirmedAt: new Date() } },
        { new: true, select: '-internalNotes' }
      );
    }

    if (!updated) return res.status(404).json({ ok: false, message: 'Not found.' });

    await ClientActivityLog.record({
      action: 'ACCEPT',
      accessTokenId,
      resourceType, resourceId,
      ip: req.ip, userAgent: req.headers['user-agent'],
    });

    // Optional: trigger webhook / notification to admin here

    res.json({ ok: true, message: 'Proposal accepted. Our team will be in touch shortly.', data: updated });

  } catch (err) {
    console.error('[accept]', err);
    res.status(500).json({ ok: false, message: 'Could not process.' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /:token/decline
// ─────────────────────────────────────────────────────────────────────────────
router.post('/:token/decline', validateClientToken(), requirePermission('decline'), async (req, res) => {
  const { resourceType, resourceId, _id: accessTokenId } = req.clientToken;
  const { reason } = req.body;  // optional reason from client

  try {
    if (resourceType === 'quote') {
      await Quote().findByIdAndUpdate(resourceId, {
        $set: { status: 'REJECTED', clientDeclinedAt: new Date(), clientDeclineReason: reason },
      });
    }

    await ClientActivityLog.record({
      action: 'DECLINE',
      accessTokenId,
      resourceType, resourceId,
      ip: req.ip, userAgent: req.headers['user-agent'],
      metadata: { reason },
    });

    res.json({ ok: true, message: 'Response recorded. Thank you for your feedback.' });

  } catch (err) {
    console.error('[decline]', err);
    res.status(500).json({ ok: false, message: 'Could not process.' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /:token/request-changes
// Body: { message: string }
// ─────────────────────────────────────────────────────────────────────────────
router.post('/:token/request-changes', validateClientToken(), requirePermission('request_changes'), async (req, res) => {
  const { resourceType, resourceId, _id: accessTokenId } = req.clientToken;
  const { message } = req.body;

  if (!message || message.trim().length < 5) {
    return res.status(400).json({ ok: false, message: 'Please describe the changes you need.' });
  }

  if (message.trim().length > 1000) {
    return res.status(400).json({ ok: false, message: 'Message too long (max 1000 characters).' });
  }

  await ClientActivityLog.record({
    action: 'REQUEST_CHANGES',
    accessTokenId,
    resourceType, resourceId,
    ip: req.ip, userAgent: req.headers['user-agent'],
    metadata: { message: message.trim() },
  });

  // Optional: push to admin notification / Slack webhook

  res.json({
    ok: true,
    message: "Your request has been sent. We'll get back to you within 24 hours.",
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /:token/add-upgrade
// Body: { addOnId: string }
// Only allowed add-ons (from the catalog) can be added — no price manipulation.
// ─────────────────────────────────────────────────────────────────────────────
router.post('/:token/add-upgrade', validateClientToken(), requirePermission('add_upgrade'), async (req, res) => {
  const { resourceType, resourceId, _id: accessTokenId } = req.clientToken;
  const { addOnId } = req.body;

  if (resourceType !== 'quote') {
    return res.status(400).json({ ok: false, message: 'Upgrades are only available on quotes.' });
  }

  if (!mongoose.Types.ObjectId.isValid(addOnId)) {
    return res.status(400).json({ ok: false, message: 'Invalid add-on.' });
  }

  try {
    // CRITICAL: Price comes from the catalog, NOT from the client request.
    const AddOn = mongoose.model('AddOn');
    const addOn = await AddOn.findOne({ _id: addOnId, active: true }).lean();
    if (!addOn) {
      return res.status(404).json({ ok: false, message: 'Add-on not found or not available.' });
    }

    const quote = await Quote().findById(resourceId);
    if (!quote) return res.status(404).json({ ok: false, message: 'Quote not found.' });

    // Prevent duplicates
    const alreadyAdded = (quote.addOnLines || []).some(l => l.addOnId?.toString() === addOnId);
    if (alreadyAdded) {
      return res.status(409).json({ ok: false, message: 'This upgrade is already in your quote.' });
    }

    // Push with catalog price — client cannot set price
    const newLine = {
      addOnId:  addOn._id,
      name:     addOn.name,
      detail:   addOn.defaultDetail,
      price:    addOn.defaultPrice || 0,   // <-- price from DB, never from req.body
    };

    quote.addOnLines = [...(quote.addOnLines || []), newLine];

    // Recalculate totals
    const addOnsTotal = quote.addOnLines.reduce((s, l) => s + (l.price || 0), 0);
    const packageTotal = (quote.packageBasePrice || 0) + (quote.guestCount || 0) * (quote.pricePerGuest || 0);
    quote.subtotal = packageTotal + addOnsTotal;
    quote.total    = Math.max(0, quote.subtotal - (quote.discount || 0) + (quote.tax || 0));

    await quote.save();

    await ClientActivityLog.record({
      action: 'ADD_UPGRADE',
      accessTokenId,
      resourceType, resourceId,
      ip: req.ip, userAgent: req.headers['user-agent'],
      metadata: { addOnId, addOnName: addOn.name, price: addOn.defaultPrice },
    });

    res.json({
      ok: true,
      message: `"${addOn.name}" added to your quote.`,
      data: { newLine, newTotal: quote.total },
    });

  } catch (err) {
    console.error('[add-upgrade]', err);
    res.status(500).json({ ok: false, message: 'Could not add upgrade.' });
  }
});

// ─── Utilities ────────────────────────────────────────────────────────────────

function maskPhone(phone) {
  if (!phone || phone.length < 4) return '****';
  return '****' + phone.slice(-4);
}

module.exports = router;
