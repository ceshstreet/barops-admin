/**
 * ClientActivityLog.js
 *
 * Immutable audit trail. Every client action is recorded here.
 * Never updated — only inserted. Never deleted except by data-retention policy.
 *
 * Query examples:
 *  - All activity for a quote:    find({ resourceId: quoteId })
 *  - All declines this month:     find({ action: 'DECLINE', timestamp: { $gte: ... } })
 *  - Suspicious IPs:              find({ action: 'TOKEN_REJECTED' }).group by ip
 */

const mongoose = require('mongoose');

const ACTIONS = [
  'TOKEN_ACCESSED',     // Token was looked up and validated
  'TOKEN_REJECTED',     // Token invalid / expired / revoked
  'SESSION_STARTED',    // Session JWT issued (after token + optional OTP)
  'OTP_SENT',           // OTP code was generated and sent
  'OTP_VERIFIED',       // OTP code verified successfully
  'OTP_FAILED',         // Wrong OTP code entered
  'OTP_LOCKED',         // Max OTP attempts reached
  'VIEW',               // Client viewed the quote/reservation
  'ACCEPT',             // Client accepted the proposal
  'DECLINE',            // Client declined the proposal
  'REQUEST_CHANGES',    // Client submitted a change request
  'ADD_UPGRADE',        // Client added an upgrade/add-on
  'PERMISSION_DENIED',  // Client attempted an action they don't have permission for
  'TOKEN_REVOKED',      // Admin revoked the token
];

const ClientActivityLogSchema = new mongoose.Schema({

  // ── What ────────────────────────────────────────────────────────────────
  action: { type: String, enum: ACTIONS, required: true, index: true },

  // ── Who / Which token ────────────────────────────────────────────────────
  accessTokenId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ClientAccessToken',
    index: true,
    // May be null for REJECTED events (token not found)
  },

  // ── Resource ─────────────────────────────────────────────────────────────
  resourceType: { type: String, enum: ['quote', 'reservation'] },
  resourceId:   { type: mongoose.Schema.Types.ObjectId, index: true },

  // ── Request context ──────────────────────────────────────────────────────
  ip:        { type: String },
  userAgent: { type: String },

  // ── Action-specific payload ───────────────────────────────────────────────
  // Examples:
  //   DECLINE:         { reason: "Too expensive" }
  //   REQUEST_CHANGES: { message: "Can we change the date?" }
  //   ADD_UPGRADE:     { addOnId: "...", addOnName: "LED Bar", price: 150 }
  //   OTP_FAILED:      { attemptsLeft: 2 }
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },

  timestamp: { type: Date, default: Date.now, index: true },

}, {
  // No timestamps: true — we use a single `timestamp` field for clarity
  versionKey: false,
});

// ── Compound index for admin dashboard queries ────────────────────────────────
ClientActivityLogSchema.index({ resourceId: 1, timestamp: -1 });
ClientActivityLogSchema.index({ accessTokenId: 1, timestamp: -1 });
ClientActivityLogSchema.index({ action: 1, timestamp: -1 });

// ── Static factory method ─────────────────────────────────────────────────────
ClientActivityLogSchema.statics.record = function (data) {
  return this.create({
    action:        data.action,
    accessTokenId: data.accessTokenId,
    resourceType:  data.resourceType,
    resourceId:    data.resourceId,
    ip:            data.ip,
    userAgent:     data.userAgent,
    metadata:      data.metadata || {},
  });
};

module.exports = mongoose.model('ClientActivityLog', ClientActivityLogSchema);
