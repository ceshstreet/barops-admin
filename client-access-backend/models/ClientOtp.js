/**
 * ClientOtp.js
 *
 * One document per OTP code generation attempt.
 * Invalidated by: expiry, maxAttempts, or used=true.
 *
 * SECURITY:
 *  - The 6-digit code is stored as SHA-256 hash only.
 *  - Constant-time comparison on verification (see tokenUtils.verifyOtpCode).
 *  - Max 3 failed attempts before lockout.
 *  - 10-minute expiry window.
 */

const mongoose = require('mongoose');

const ClientOtpSchema = new mongoose.Schema({

  accessTokenId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ClientAccessToken',
    required: true,
    index: true,
  },

  // SHA-256 of the 6-digit code. Raw code only lives in the SMS/WhatsApp message.
  codeHash: { type: String, required: true },

  expiresAt: {
    type: Date,
    required: true,
    // Set to now + 10 min in the service layer
  },

  attempts:    { type: Number, default: 0 },
  maxAttempts: { type: Number, default: 3 },
  used:        { type: Boolean, default: false },

  // Delivery tracking
  deliveredVia:  { type: String, enum: ['sms', 'whatsapp'] },
  deliveredTo:   { type: String },  // phone number (masked in logs)
  deliveredAt:   { type: Date },
  deliveryError: { type: String },

}, {
  timestamps: true,
});

// TTL: auto-delete expired OTPs after 1 hour (keep briefly for debugging)
ClientOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 3600 });

ClientOtpSchema.methods.isValid = function () {
  return !this.used &&
         this.attempts < this.maxAttempts &&
         this.expiresAt > new Date();
};

module.exports = mongoose.model('ClientOtp', ClientOtpSchema);
