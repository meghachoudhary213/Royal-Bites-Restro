const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const dbUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/royal-bites';
    const conn = await mongoose.connect(dbUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Seed default physical rooms if they don't exist
    const { seedRooms } = require('../services/roomSeeder');
    await seedRooms();

    // Seed default spa services if they don't exist
    const { seedSpaServices } = require('../services/spaSeeder');
    await seedSpaServices();

    // Seed default event packages if they don't exist
    const { seedEventPackages } = require('../services/eventSeeder');
    await seedEventPackages();
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // Do not exit process so that the hybrid local fallback architecture can function
    // process.exit(1);
  }
};

module.exports = connectDB;
