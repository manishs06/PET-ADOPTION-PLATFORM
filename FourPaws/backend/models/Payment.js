const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  paymentId: {
    type: String,
    required: [true, 'Payment ID is required'],
    unique: true
  },
  amount: {
    type: Number,
    required: [true, 'Payment amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  currency: {
    type: String,
    default: 'inr',
    enum: ['inr', 'usd', 'eur', 'gbp', 'cad', 'aud']
  },
  status: {
    type: String,
    enum: ['pending', 'succeeded', 'failed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    required: [true, 'Payment method is required']
  },
  paymentType: {
    type: String,
    enum: ['donation', 'adoption_fee', 'subscription'],
    required: [true, 'Payment type is required']
  },
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Donor is required']
  },
  donationCampaign: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DonationCampaign'
  },
  pet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pet'
  },
  description: {
    type: String,
    trim: true
  },
  receiptUrl: {
    type: String
  },
  metadata: {
    type: Map,
    of: String
  },
  stripeSessionId: {
    type: String
  },
  stripePaymentIntentId: {
    type: String
  },
  refundedAmount: {
    type: Number,
    default: 0
  },
  refundReason: {
    type: String,
    trim: true
  },
  refundedAt: {
    type: Date
  },
  failureReason: {
    type: String,
    trim: true
  },
  failureCode: {
    type: String
  }
}, {
  timestamps: true
});

// Index for better query performance
paymentSchema.index({ donor: 1, createdAt: -1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ paymentType: 1 });
paymentSchema.index({ donationCampaign: 1 });
paymentSchema.index({ pet: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
