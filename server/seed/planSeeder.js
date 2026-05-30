const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Plan = require('../models/Plan');
const connectDB = require('../config/db');

dotenv.config();

const plans = [
  {
    name: 'Basic',
    price: 299,
    duration: 30,
    features: ['Basic Support', 'Dashboard Access'],
  },
  {
    name: 'Pro',
    price: 599,
    duration: 30,
    features: ['Priority Support', 'Analytics'],
  },
  {
    name: 'Premium',
    price: 999,
    duration: 30,
    features: ['Dedicated Support', 'Premium Analytics', 'Team Access'],
  },
  {
    name: 'Enterprise',
    price: 1999,
    duration: 90,
    features: ['Unlimited Users', 'Dedicated Manager', 'Advanced Reports'],
  },
];

const seedPlans = async () => {
  try {
    // Attempt database connection
    await connectDB();
    console.log('Seeding plans into database...');

    // Clear existing plans
    await Plan.deleteMany({});
    console.log('Cleared existing plans.');

    // Insert new plans
    await Plan.insertMany(plans);
    console.log('Plans seeded successfully!');

    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding plans:', error.message);
    if (mongoose.connection.readyState !== 0) {
      mongoose.connection.close();
    }
    process.exit(1);
  }
};

seedPlans();
