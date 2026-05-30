const mongoose = require('mongoose');

const connectDB = async () => {
  const atlasUri = process.env.MONGODB_URI;
  const localUri = process.env.MONGODB_LOCAL_URI || 'mongodb://127.0.0.1:27017/subscription_dashboard';

  // Try Atlas first if provided
  if (atlasUri) {
    try {
      console.log('Attempting to connect to MongoDB Atlas...');
      await mongoose.connect(atlasUri);
      console.log('Successfully connected to MongoDB Atlas.');
      return;
    } catch (error) {
      console.error('Failed to connect to MongoDB Atlas:', error.message);
      console.log('Falling back to local MongoDB...');
    }
  } else {
    console.log('No MongoDB Atlas URI provided. Attempting connection to local MongoDB...');
  }

  // Fallback to local
  try {
    await mongoose.connect(localUri);
    console.log(`Successfully connected to local MongoDB: ${localUri}`);
  } catch (error) {
    console.error('Failed to connect to local MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
