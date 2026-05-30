const Razorpay = require('razorpay');

let razorpay = null;
let isRazorpayConfigured = false;

if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  try {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    isRazorpayConfigured = true;
    console.log('Razorpay SDK initialized successfully.');
  } catch (error) {
    console.error('Error initializing Razorpay SDK:', error.message);
  }
} else {
  console.log('Razorpay keys not provided. Server will fall back to Simulated Payment checkout.');
}

module.exports = {
  razorpay,
  isRazorpayConfigured,
  keyId: process.env.RAZORPAY_KEY_ID || '',
};
