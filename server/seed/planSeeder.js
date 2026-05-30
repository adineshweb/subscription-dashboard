const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Plan = require('../models/Plan');
const connectDB = require('../config/db');

dotenv.config();

const samplePlans = [
  {
    name: 'Free',
    description: 'Basic dashboard tracking and community features.',
    price: 0,
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: ['Dashboard Access', 'Community Support', 'Basic Analytics'],
    duration: 30,
    popular: false,
    active: true,
  },
  {
    name: 'Starter',
    description: 'Great for individual freelancers and small startups.',
    price: 299,
    monthlyPrice: 299,
    yearlyPrice: 2990,
    features: ['Priority Email Support', 'Advanced Analytics', '1 Team Member'],
    duration: 30,
    popular: false,
    active: true,
  },
  {
    name: 'Professional',
    description: 'Perfect for growing businesses and professional agencies.',
    price: 599,
    monthlyPrice: 599,
    yearlyPrice: 5990,
    features: ['24/7 Dedicated Support', 'Enterprise Analytics', 'Up to 5 Team Members', 'Custom Reports'],
    duration: 30,
    popular: true,
    active: true,
  },
  {
    name: 'Enterprise',
    description: 'Tailored operations and support for large companies.',
    price: 1999,
    monthlyPrice: 1999,
    yearlyPrice: 19990,
    features: ['Unlimited Team Members', 'Dedicated Account Manager', 'Custom SLA & Integrations', 'Advanced Data Export'],
    duration: 90,
    popular: false,
    active: true,
  },
];

const seedPlans = async () => {
  try {
    await connectDB();
    console.log('Seeding updated plans database...');

    // Clear existing
    await Plan.deleteMany({});
    console.log('Cleared existing plans.');

    // Insert new plans
    await Plan.insertMany(samplePlans);
    console.log('Successfully seeded database with Free, Starter, Professional, and Enterprise plans!');

    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding plans database:', error.message);
    if (mongoose.connection.readyState !== 0) {
      mongoose.connection.close();
    }
    process.exit(1);
  }
};

seedPlans();
