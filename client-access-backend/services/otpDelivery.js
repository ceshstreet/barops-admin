/**
 * otpDelivery.js — OTP delivery service interface
 *
 * Plug in Twilio (SMS) or WhatsApp Business API here.
 * Install: npm install twilio
 *
 * Environment variables needed:
 *   TWILIO_ACCOUNT_SID
 *   TWILIO_AUTH_TOKEN
 *   TWILIO_PHONE_FROM       (for SMS)
 *   TWILIO_WHATSAPP_FROM    (e.g. 'whatsapp:+14155238886' for sandbox)
 */

// const twilio = require('twilio');
// const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

/**
 * @param {object} opts
 * @param {'sms'|'whatsapp'} opts.channel
 * @param {string} opts.to      — E.164 phone number, e.g. +15551234567
 * @param {string} opts.code    — 6-digit plain text code
 * @param {string} opts.clientName
 * @param {string} opts.eventName
 */
async function send({ channel, to, code, clientName, eventName }) {
  const body = buildMessage(code, clientName, eventName);

  if (process.env.NODE_ENV !== 'production') {
    // In development, just log the OTP — never send real SMS
    console.log(`[OTP DEV] Channel: ${channel} | To: ${to} | Code: ${code}`);
    console.log(`[OTP DEV] Message: ${body}`);
    return;
  }

  if (channel === 'sms') {
    await sendSms(to, body);
  } else if (channel === 'whatsapp') {
    await sendWhatsApp(to, body);
  } else {
    throw new Error(`Unknown OTP channel: ${channel}`);
  }
}

async function sendSms(to, body) {
  // Uncomment when ready:
  // await client.messages.create({
  //   body,
  //   from: process.env.TWILIO_PHONE_FROM,
  //   to,
  // });
  throw new Error('SMS not configured. Set TWILIO_* env vars and uncomment sendSms().');
}

async function sendWhatsApp(to, body) {
  // Uncomment when ready:
  // await client.messages.create({
  //   body,
  //   from: process.env.TWILIO_WHATSAPP_FROM,
  //   to: `whatsapp:${to}`,
  // });
  throw new Error('WhatsApp not configured. Set TWILIO_WHATSAPP_FROM and uncomment sendWhatsApp().');
}

function buildMessage(code, clientName, eventName) {
  const name = clientName ? `Hi ${clientName.split(' ')[0]}, ` : '';
  return (
    `${name}your BarOps verification code for ${eventName || 'your event'} is:\n\n` +
    `*${code}*\n\n` +
    `This code expires in 10 minutes. Do not share it with anyone.`
  );
}

module.exports = { send };
