const Subscription = require('../models/Subscription');
const User = require('../models/User');
const Plan = require('../models/Plan');

exports.getSubscriptions = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const status = req.query.status || '';
    const planId = req.query.planId || '';

    let userIds = [];
    let isSearchApplied = false;

    // Search users by name or email
    if (search) {
      isSearchApplied = true;
      const matchingUsers = await User.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      }).select('_id');
      userIds = matchingUsers.map(u => u._id);
    }

    // Build query
    const query = {};

    if (isSearchApplied) {
      query.userId = { $in: userIds };
    }

    if (status) {
      query.status = status;
    }

    if (planId) {
      query.planId = planId;
    }

    // Fetch total count for pagination
    const total = await Subscription.countDocuments(query);

    const subscriptions = await Subscription.find(query)
      .populate('userId', 'name email role')
      .populate('planId', 'name price duration')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Calculate basic analytics for admin header
    const totalActiveCount = await Subscription.countDocuments({ status: 'active' });
    const totalSubscriptionsCount = await Subscription.countDocuments({});
    
    // Revenue logic: sum plan prices from active subscriptions
    const activeSubsWithPlans = await Subscription.find({ status: 'active' }).populate('planId', 'price');
    const totalMonthlyRevenue = activeSubsWithPlans.reduce((sum, sub) => sum + (sub.planId?.price || 0), 0);

    res.status(200).json({
      subscriptions,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
      analytics: {
        totalActiveCount,
        totalSubscriptionsCount,
        totalMonthlyRevenue,
      }
    });
  } catch (error) {
    next(error);
  }
};
