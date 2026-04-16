/**
 * ClientAccessToken.js
 *
 * One document per tokenized link sent to a client.
 * Links one access token → one resource (quote or reservation).
 *
 * SECURITY DESIGN:
 *  - rawTokenHash : SHA-256 of the raw token. NEVER stored in plain text.
 *  - Raw token lives only in the URL sent to the client.
 *  - All DB lookups use the hash.
 */

const mongoose = require('mongoose');

const IpEntrySchema = new mongoose.Schema({
  ip:        { type: String },
  userAgent: { type: String },
  at:        { type: Date, default: Date.now },
}, { _id: false });

const ClientAccessTokenSchema = new mongoose.Schema({

  // ── Core identity ────────────────────────────────────────────────────────
  rawTokenHash: {
    type: String, required: true, unique: true, index: true,
    // SHA-256 hex of the raw token sent in the URL
  },
  resourceType: {
    type: String, enum: ['quote', 'reservation'], required: true,
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId, required: true, index: true,
  },

  // ── Permissions granted for this link ────────────────────────────────────
  // Granular: each link can be configured with only the actions it needs.
  permissions: {
    type: [String],
    enum: ['view', 'accept', 'decline', 'request_changes', 'add_upgrade'],
    default: ['view', 'accept', 'decline'],
  },

  // ── Client identity (denormalized, no FK) ────────────────────────────────
  clientName:  { type: String },
  clientPhone: { type: String },  // used for OTP delivery
  clientEmail: { type: String },

  // ── Lifecycle ────────────────────────────────────────────────────────────
  expiresAt: {
    type: Date,
    required: true,
    // Set to 14 days from creation by default in the service layer
  },
  status: {
    type: String,
    enum: ['active', 'revoked', 'expired'],
    default: 'active',
    index: true,
  },
  revokedAt:     { type: Date },
  revokedReason: { type: String },

  // ── OTP config ───────────────────────────────────────────────────────────
  otpRequired:    { type: Boolean, default: false },
  otpChannel:     { type: String, enum: ['sms', 'whatsapp', 'none'], default: 'none' },
  otpVerifiedAt:  { type: Date },  // null until first OTP verification passes

  // ── Usage tracking ───────────────────────────────────────────────────────
  lastUsedAt: { type: Date },
  useCount:   { type: Number, default: 0 },
  ipLog:      { type: [IpEntrySchema], default: [], select: false },
  // select:false — not returned by default, only when explicitly projected

  // ── Audit ────────────────────────────────────────────────────────────────
  createdBy: { type: String },   // admin user ID or email

}, {
  timestamps: true,
});

// ── Indexes ──────────────────────────────────────────────────────────────────

// TTL index: MongoDB auto-marks expired tokens — does NOT delete them
// (deletion is done in a cron job so we keep the audit trail).
ClientAccessTokenSchema.index({ expiresAt: 1 });

// Lookup by resource (admin dashboard use: "show all tokens for quote X")
ClientAccessTokenSchema.index({ resourceType: 1, resourceId: 1 });

// ── Instance methods ─────────────────────────────────────────────────────────

ClientAccessTokenSchema.methods.isValid = function () {
  return this.status === 'active' && this.expiresAt > new Date();
};

ClientAccessTokenSchema.methods.hasPermission = function (action) {
  return this.permissions.includes(action);
};

ClientAccessTokenSchema.methods.revoke = function (reason = 'manual') {
  this.status      = 'revoked';
  this.revokedAt   = new Date();
  this.revokedReason = reason;
  return this.save();
};

module.exports = mongoose.model('ClientAccessToken', ClientAccessTokenSchema);
