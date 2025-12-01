const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config({ path: '../config.env' });

const migrateUserPhotos = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.DATABASE_URI);
    console.log('Connected to MongoDB');

    // Find all users with via.placeholder.com URLs
    const usersToUpdate = await User.find({
      photoURL: { $regex: 'via.placeholder.com', $options: 'i' }
    });

    console.log(`Found ${usersToUpdate.length} users with broken photo URLs`);

    if (usersToUpdate.length === 0) {
      console.log('No users need photo URL updates');
      return;
    }

    // Update all users with broken URLs
    const updateResult = await User.updateMany(
      { photoURL: { $regex: 'via.placeholder.com', $options: 'i' } },
      { $set: { photoURL: 'https://placehold.co/150x150/e2e8f0/64748b?text=User' } }
    );

    console.log(`Updated ${updateResult.modifiedCount} users with new photo URLs`);

    // Also update any empty or null photoURLs
    const emptyPhotoUpdate = await User.updateMany(
      { $or: [{ photoURL: null }, { photoURL: '' }, { photoURL: { $exists: false } }] },
      { $set: { photoURL: 'https://placehold.co/150x150/e2e8f0/64748b?text=User' } }
    );

    console.log(`Updated ${emptyPhotoUpdate.modifiedCount} users with empty photo URLs`);

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the migration
migrateUserPhotos();
