const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  price: {
    type: Number,
    required: true,
  },
  monthlyPrice: {
    type: Number,
    required: true,
  },
  yearlyPrice: {
    type: Number,
    required: true,
  },
  features: {
    type: [String],
    required: true,
  },
  duration: {
    type: Number,
    default: 30,
  },
  popular: {
    type: Boolean,
    default: false,
  },
  active: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Plan', planSchema);
