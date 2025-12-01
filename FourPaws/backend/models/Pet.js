const mongoose = require('mongoose');

const petSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Pet name is required'],
    trim: true,
    maxlength: [50, 'Pet name cannot exceed 50 characters']
  },
  type: {
    type: String,
    required: [true, 'Pet type is required'],
    enum: ['dog', 'cat', 'bird', 'fish', 'rabbit', 'hamster', 'other']
  },
  breed: {
    type: String,
    required: [true, 'Pet breed is required'],
    trim: true
  },
  age: {
    type: Number,
    required: [true, 'Pet age is required'],
    min: [0, 'Age cannot be negative']
  },
  gender: {
    type: String,
    required: [true, 'Pet gender is required'],
    enum: ['male', 'female']
  },
  size: {
    type: String,
    required: [true, 'Pet size is required'],
    enum: ['small', 'medium', 'large']
  },
  color: {
    type: String,
    required: [true, 'Pet color is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Pet description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  images: [{
    type: String,
    required: [true, 'At least one image is required']
  }],
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  adoptionFee: {
    type: Number,
    default: 0,
    min: [0, 'Adoption fee cannot be negative']
  },
  isAdopted: {
    type: Boolean,
    default: false
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  healthStatus: {
    type: String,
    enum: ['healthy', 'sick', 'recovering', 'special_needs'],
    default: 'healthy'
  },
  vaccinated: {
    type: Boolean,
    default: false
  },
  spayedNeutered: {
    type: Boolean,
    default: false
  },
  microchipped: {
    type: Boolean,
    default: false
  },
  specialNeeds: {
    type: String,
    trim: true
  },
  // Vaccination details
  vaccinationDetails: {
    type: String,
    trim: true
  },
  lastVaccinationDate: {
    type: Date
  },
  nextVaccinationDate: {
    type: Date
  },
  // Neutering details
  neuteringDate: {
    type: Date
  },
  // Vet information
  vetName: {
    type: String,
    trim: true
  },
  vetContact: {
    type: String,
    trim: true
  },
  // Reminder settings
  vaccinationReminder: {
    type: Boolean,
    default: true
  },
  neuteringReminder: {
    type: Boolean,
    default: true
  },
  reminderFrequency: {
    type: String,
    enum: ['weekly', 'monthly', 'quarterly'],
    default: 'monthly'
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Pet owner is required']
  },
  adoptedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  adoptionDate: {
    type: Date
  },
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  category: {
    type: String,
    required: [true, 'Pet category is required'],
    enum: ['dogs', 'cats', 'birds', 'fish', 'rabbits', 'hamsters', 'other']
  }
}, {
  timestamps: true
});

// Index for better search performance
petSchema.index({ type: 1, category: 1, isAvailable: 1 });
petSchema.index({ location: 1 });
petSchema.index({ owner: 1 });

module.exports = mongoose.model('Pet', petSchema);
