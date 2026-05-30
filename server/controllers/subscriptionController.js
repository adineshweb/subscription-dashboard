const Subscription = require('../models/Subscription');
const Plan = require('../models/Plan');
const { isRazorpayConfigured, razorpay, keyId } = require('../config/razorpay');
const crypto = require('crypto');
const { subscribeSchema } = require('../validators/zodSchemas');

exports.createOrder = async (req, res, next) => {
  try {
    const { planId } = req.params;
    subscribeSchema.parse({ planId });

    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found.' });
    }

    if (isRazorpayConfigured) {
      const options = {
        amount: Math.round(plan.price * 100),
        currency: 'INR',
        receipt: `rcpt_${req.user.id.substring(0, 10)}_${Date.now()}`,
      };

      razorpay.orders.create(options, (err, order) => {
        if (err) {
          console.error('Razorpay order error:', err);
          return res.status(500).json({ message: 'Error creating payment gateway order.', error: err });
        }
        return res.status(200).json({
          razorpayEnabled: true,
          orderId: order.id,
          amount: order.amount,
          currency: order.currency,
          keyId: keyId,
        });
      });
    } else {
      const mockOrderId = `mock_order_${crypto.randomBytes(8).toString('hex')}`;
      return res.status(200).json({
        razorpayEnabled: false,
        orderId: mockOrderId,
        amount: plan.price * 100,
        currency: 'INR',
      });
    }
  } catch (error) {
    next(error);
  }
};

exports.verifyPayment = async (req, res, next) => {
  try {
    const { planId } = req.params;
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    subscribeSchema.parse({ planId });

    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found.' });
    }

    if (isRazorpayConfigured) {
      if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
        return res.status(400).json({ message: 'Payment verification parameters missing.' });
      }

      const generatedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest('hex');

      if (generatedSignature !== razorpaySignature) {
        return res.status(400).json({ message: 'Invalid payment signature.' });
      }
    }

    await Subscription.updateMany(
      { userId: req.user.id, status: 'active' },
      { $set: { status: 'expired' } }
    );

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + plan.duration);

    const subscription = new Subscription({
      userId: req.user.id,
      planId: plan._id,
      startDate,
      endDate,
      status: 'active',
      razorpayOrderId: razorpayOrderId || `mock_order_${Date.now()}`,
      razorpayPaymentId: razorpayPaymentId || `mock_pay_${Date.now()}`,
    });

    await subscription.save();
    await subscription.populate('planId');

    res.status(201).json({
      message: 'Subscribed successfully.',
      subscription,
    });
  } catch (error) {
    next(error);
  }
};

exports.getMySubscription = async (req, res, next) => {
  try {
    let subscription = await Subscription.findOne({
      userId: req.user.id,
      status: 'active',
    }).populate('planId');

    if (subscription && subscription.endDate < new Date()) {
      subscription.status = 'expired';
      await subscription.save();
      subscription = null;
    }

    res.status(200).json(subscription);
  } catch (error) {
    next(error);
  }
};
