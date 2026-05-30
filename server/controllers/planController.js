const Plan = require('../models/Plan');

exports.getPlans = async (req, res, next) => {
  try {
    const plans = await Plan.find({}).sort({ price: 1 });
    res.status(200).json(plans);
  } catch (error) {
    next(error);
  }
};
