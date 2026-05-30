const Subscription = require('../models/Subscription');
const Plan = require('../models/Plan');
const User = require('../models/User');
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

    let planName = '';
    let planPrice = 0;
    let planDuration = 30;
    let planDbId = null;

    if (planId.startsWith('mock_')) {
      if (planId === 'mock_free_id') {
        planName = 'Free';
        planPrice = 0;
        planDuration = 30;
      } else if (planId === 'mock_starter_id') {
        planName = 'Starter';
        planPrice = 299;
        planDuration = 30;
      } else if (planId === 'mock_professional_id') {
        planName = 'Professional';
        planPrice = 599;
        planDuration = 30;
      } else if (planId === 'mock_enterprise_id') {
        planName = 'Enterprise';
        planPrice = 1999;
        planDuration = 90;
      }
      
      const dbPlan = await Plan.findOne({ name: planName });
      if (dbPlan) {
        planDbId = dbPlan._id;
      }
    } else {
      const plan = await Plan.findById(planId);
      if (!plan) {
        return res.status(404).json({ message: 'Plan not found.' });
      }
      planName = plan.name;
      planPrice = plan.price;
      planDuration = plan.duration;
      planDbId = plan._id;
    }

    if (isRazorpayConfigured && !planId.startsWith('mock_')) {
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
    endDate.setDate(startDate.getDate() + planDuration);

    const subscription = new Subscription({
      userId: req.user.id,
      planId: planDbId,
      planName,
      amount: planPrice,
      paymentId: razorpayPaymentId || `mock_pay_${Date.now()}`,
      orderId: razorpayOrderId || `mock_order_${Date.now()}`,
      razorpaySignature: razorpaySignature || null,
      startDate,
      endDate,
      status: 'active',
      paymentMethod: 'card',
    });

    await subscription.save();

    const updatedUser = await User.findByIdAndUpdate(req.user.id, {
      $set: {
        subscriptionId: subscription._id,
        currentPlan: planName,
        subscriptionStatus: 'active',
        subscriptionStartDate: startDate,
        subscriptionEndDate: endDate,
      }
    }, { new: true });

    let subObj = subscription.toObject();
    if (!subObj.planId) {
      subObj.planId = {
        _id: planId,
        name: planName,
        price: planPrice,
        duration: planDuration,
      };
    } else {
      await subscription.populate('planId');
      subObj = subscription.toObject();
    }

    res.status(201).json({
      message: 'Subscribed successfully.',
      subscription: subObj,
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        currentPlan: updatedUser.currentPlan,
        subscriptionStatus: updatedUser.subscriptionStatus,
        subscriptionStartDate: updatedUser.subscriptionStartDate,
        subscriptionEndDate: updatedUser.subscriptionEndDate,
        subscriptionId: updatedUser.subscriptionId,
        createdAt: updatedUser.createdAt,
      }
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
    });

    if (subscription && subscription.endDate < new Date()) {
      subscription.status = 'expired';
      await subscription.save();
      
      await User.findByIdAndUpdate(req.user.id, {
        $set: { subscriptionStatus: 'inactive' }
      });
      
      subscription = null;
    }

    if (subscription) {
      let subObj = subscription.toObject();
      if (!subObj.planId) {
        subObj.planId = {
          _id: subscription.orderId,
          name: subscription.planName,
          price: subscription.amount,
          duration: Math.round((new Date(subscription.endDate) - new Date(subscription.startDate)) / (1000 * 60 * 60 * 24)),
        };
      } else {
        await subscription.populate('planId');
        subObj = subscription.toObject();
      }
      return res.status(200).json(subObj);
    }

    res.status(200).json(null);
  } catch (error) {
    next(error);
  }
};

exports.getSubscriptionMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    let active = false;
    if (user.subscriptionStatus === 'active' && user.subscriptionEndDate > new Date()) {
      active = true;
    } else if (user.subscriptionStatus === 'active') {
      user.subscriptionStatus = 'inactive';
      await user.save();
      await Subscription.updateMany(
        { userId: req.user.id, status: 'active' },
        { $set: { status: 'expired' } }
      );
    }

    res.status(200).json({
      active,
      planName: user.currentPlan || 'None',
      amount: active ? (await Subscription.findById(user.subscriptionId))?.amount || 0 : 0,
      startDate: user.subscriptionStartDate,
      endDate: user.subscriptionEndDate,
    });
  } catch (error) {
    next(error);
  }
};

exports.cancelSubscription = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user.id, {
      $set: {
        subscriptionStatus: 'inactive',
      }
    });

    await Subscription.updateMany(
      { userId: req.user.id, status: 'active' },
      { $set: { status: 'expired' } }
    );

    res.status(200).json({ message: 'Subscription cancelled successfully.' });
  } catch (error) {
    next(error);
  }
};
