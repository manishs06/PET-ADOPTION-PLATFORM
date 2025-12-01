const mongoose = require('mongoose');

const donationCampaignSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Campaign title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Campaign description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  image: {
    type: String,
    required: [true, 'Campaign image is required']
  },
  targetAmount: {
    type: Number,
    required: [true, 'Target amount is required'],
    min: [1, 'Target amount must be at least 1']
  },
  currentAmount: {
    type: Number,
    default: 0,
    min: [0, 'Current amount cannot be negative']
  },
  currency: {
    type: String,
    default: 'INR',
    enum: ['INR', 'USD', 'EUR', 'GBP', 'CAD', 'AUD']
  },
  category: {
    type: String,
    required: [true, 'Campaign category is required'],
    enum: ['medical', 'food', 'shelter', 'rescue', 'education', 'other']
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'paused', 'cancelled'],
    default: 'active'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Campaign organizer is required']
  },
  beneficiaries: [{
    type: String,
    trim: true
  }],
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  updates: [{
    title: {
      type: String,
      required: true,
      trim: true
    },
    content: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    }
  }],
  donors: [{
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    amount: {
      type: Number,
      required: true
    },
    anonymous: {
      type: Boolean,
      default: false
    },
    message: {
      type: String,
      trim: true
    },
    date: {
      type: Date,
      default: Date.now
    }
  }],
  views: {
    type: Number,
    default: 0
  },
  shares: {
    type: Number,
    default: 0
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationNotes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for better search performance
donationCampaignSchema.index({ status: 1, category: 1 });
donationCampaignSchema.index({ organizer: 1 });
donationCampaignSchema.index({ endDate: 1 });

// Virtual for progress percentage
donationCampaignSchema.virtual('progressPercentage').get(function() {
  return Math.round((this.currentAmount / this.targetAmount) * 100);
});

// Virtual for days remaining
donationCampaignSchema.virtual('daysRemaining').get(function() {
  const now = new Date();
  const end = new Date(this.endDate);
  const diffTime = end - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
});

// Ensure virtuals are serialized
donationCampaignSchema.set('toJSON', { virtuals: true });
donationCampaignSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('DonationCampaign', donationCampaignSchema);
