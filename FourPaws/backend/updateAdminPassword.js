const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config({ path: './config.env' });

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pet-adoption-platform')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const updateAdminPassword = async () => {
  try {
    // Find the admin user
    const user = await User.findOne({ email: 'admin@example.com' });
    
    if (!user) {
      console.log('Admin user not found');
      return;
    }
    
    console.log('User found:', user.email, user.role);
    
    // Update password
    user.password = 'Admin123!';
    await user.save();
    
    console.log('Password updated successfully');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
};

updateAdminPassword();