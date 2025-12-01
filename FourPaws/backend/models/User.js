const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  photoURL: {
    type: String,
    default: 'https://placehold.co/150x150/e2e8f0/64748b?text=User'
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Encrypt password before saving
userSchema.pre('save', async function(next) {
  console.log('Pre-save hook called for user:', this.email);
  if (!this.isModified('password')) {
    console.log('Password not modified, skipping encryption');
    return next();
  }
  
  console.log('Encrypting password for user:', this.email);
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  console.log('Password encrypted successfully');
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(enteredPassword) {
  console.log('Comparing password for user:', this.email);
  try {
    const result = await bcrypt.compare(enteredPassword, this.password);
    console.log('Password comparison result:', result);
    return result;
  } catch (error) {
    console.error('Error comparing passwords:', error);
    return false;
  }
};

// Generate JWT token
userSchema.methods.getJwtToken = function() {
  console.log('Generating JWT token for user:', this.email);
  const token = jwt.sign({ 
    id: this._id,
    email: this.email,
    role: this.role 
  }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
  console.log('JWT token generated successfully');
  return token;
};

module.exports = mongoose.model('User', userSchema);