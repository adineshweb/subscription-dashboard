const Razorpay = require('razorpay');

let razorpay = null;
let isRazorpayConfigured = false;

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

const hasKeys = keyId && 
                keySecret && 
                keyId !== 'undefined' && 
                keyId !== 'null' && 
                keySecret !== 'undefined' && 
                keySecret !== 'null' &&
                keyId.trim() !== '' &&
                keySecret.trim() !== '';

if (hasKeys) {
  try {
    razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
    isRazorpayConfigured = true;
    console.log('Razorpay SDK initialized successfully.');
  } catch (error) {
    console.error('Error initializing Razorpay SDK:', error.message);
  }
} else {
  console.log('Razorpay keys not provided or invalid. Server will fall back to Simulated Payment checkout.');
}

module.exports = {
  razorpay,
  isRazorpayConfigured,
  keyId: process.env.RAZORPAY_KEY_ID || '',
};
