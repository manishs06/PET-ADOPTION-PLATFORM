const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult, query } = require('express-validator');
const DonationCampaign = require('../models/DonationCampaign');
const User = require('../models/User');

const router = express.Router();

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
};

// Get all donation campaigns
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('category').optional().isString().withMessage('Category must be a string'),
  query('status').optional().isIn(['active', 'completed', 'paused', 'cancelled']).withMessage('Invalid status'),
  query('search').optional().isString().withMessage('Search must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};
    
    if (req.query.category) filter.category = req.query.category;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
        { location: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const campaigns = await DonationCampaign.find(filter)
      .populate('organizer', 'name email photoURL')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await DonationCampaign.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: campaigns,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get donation campaigns error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
});

// Get single donation campaign by ID
router.get('/:id', async (req, res) => {
  try {
    const campaign = await DonationCampaign.findById(req.params.id)
      .populate('organizer', 'name email photoURL phone address')
      .populate('donors.donor', 'name email photoURL');

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Donation campaign not found'
      });
    }

    // Increment views
    campaign.views += 1;
    await campaign.save();

    res.status(200).json({
      success: true,
      data: campaign
    });

  } catch (error) {
    console.error('Get donation campaign error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
});

// Create new donation campaign (authenticated users only)
router.post('/', authenticateToken, [
  body('title').trim().isLength({ min: 5, max: 100 }).withMessage('Title must be between 5 and 100 characters'),
  body('description').trim().isLength({ min: 20, max: 2000 }).withMessage('Description must be between 20 and 2000 characters'),
  body('image').isURL().withMessage('Valid image URL is required'),
  body('targetAmount').isFloat({ min: 1 }).withMessage('Target amount must be at least 1'),
  body('currency').optional().isIn(['INR', 'USD', 'EUR', 'GBP', 'CAD', 'AUD']).withMessage('Invalid currency'),
  body('category').isIn(['medical', 'food', 'shelter', 'rescue', 'education', 'other']).withMessage('Invalid category'),
  body('endDate').isISO8601().withMessage('Valid end date is required'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('beneficiaries').optional().isArray().withMessage('Beneficiaries must be an array'),
  body('tags').optional().isArray().withMessage('Tags must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const campaignData = {
      ...req.body,
      organizer: req.user._id,
      endDate: new Date(req.body.endDate)
    };

    // Check if end date is in the future
    if (campaignData.endDate <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'End date must be in the future'
      });
    }

    const campaign = await DonationCampaign.create(campaignData);

    const populatedCampaign = await DonationCampaign.findById(campaign._id)
      .populate('organizer', 'name email photoURL');

    res.status(201).json({
      success: true,
      message: 'Donation campaign created successfully',
      data: populatedCampaign
    });

  } catch (error) {
    console.error('Create donation campaign error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
});

// Update donation campaign (organizer or admin only)
router.put('/:id', authenticateToken, [
  body('title').optional().trim().isLength({ min: 5, max: 100 }).withMessage('Title must be between 5 and 100 characters'),
  body('description').optional().trim().isLength({ min: 20, max: 2000 }).withMessage('Description must be between 20 and 2000 characters'),
  body('image').optional().isURL().withMessage('Valid image URL is required'),
  body('targetAmount').optional().isFloat({ min: 1 }).withMessage('Target amount must be at least 1'),
  body('currency').optional().isIn(['INR', 'USD', 'EUR', 'GBP', 'CAD', 'AUD']).withMessage('Invalid currency'),
  body('category').optional().isIn(['medical', 'food', 'shelter', 'rescue', 'education', 'other']).withMessage('Invalid category'),
  body('endDate').optional().isISO8601().withMessage('Valid end date is required'),
  body('location').optional().trim().notEmpty().withMessage('Location cannot be empty'),
  body('status').optional().isIn(['active', 'completed', 'paused', 'cancelled']).withMessage('Invalid status'),
  body('beneficiaries').optional().isArray().withMessage('Beneficiaries must be an array'),
  body('tags').optional().isArray().withMessage('Tags must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const campaign = await DonationCampaign.findById(req.params.id);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Donation campaign not found'
      });
    }

    // Check if user is organizer or admin
    if (campaign.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this campaign'
      });
    }

    // Check if end date is in the future (if being updated)
    if (req.body.endDate && new Date(req.body.endDate) <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'End date must be in the future'
      });
    }

    const updateData = { ...req.body };
    if (req.body.endDate) {
      updateData.endDate = new Date(req.body.endDate);
    }

    const updatedCampaign = await DonationCampaign.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('organizer', 'name email photoURL');

    res.status(200).json({
      success: true,
      message: 'Donation campaign updated successfully',
      data: updatedCampaign
    });

  } catch (error) {
    console.error('Update donation campaign error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
});

// Delete donation campaign (organizer or admin only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const campaign = await DonationCampaign.findById(req.params.id);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Donation campaign not found'
      });
    }

    // Check if user is the organizer or an admin
    if (campaign.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this campaign'
      });
    }

    // Check if campaign has donations
    if (campaign.donors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete campaign with existing donations. You can mark it as cancelled instead.'
      });
    }

    await DonationCampaign.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Donation campaign deleted successfully'
    });

  } catch (error) {
    console.error('Delete donation campaign error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
});

// Add donation to campaign
router.post('/:id/donate', authenticateToken, [
  body('amount').isFloat({ min: 1 }).withMessage('Amount must be at least 1'),
  body('anonymous').optional().isBoolean().withMessage('Anonymous must be a boolean'),
  body('message').optional().trim().isLength({ max: 500 }).withMessage('Message cannot exceed 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const campaign = await DonationCampaign.findById(req.params.id);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Donation campaign not found'
      });
    }

    if (campaign.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Campaign is not active'
      });
    }

    const { amount, anonymous = false, message = '' } = req.body;

    // Add donation to campaign
    campaign.donors.push({
      donor: req.user._id,
      amount,
      anonymous,
      message,
      date: new Date()
    });

    // Update current amount
    campaign.currentAmount += amount;

    // Check if target reached
    if (campaign.currentAmount >= campaign.targetAmount) {
      campaign.status = 'completed';
    }

    await campaign.save();

    const populatedCampaign = await DonationCampaign.findById(campaign._id)
      .populate('organizer', 'name email photoURL')
      .populate('donors.donor', 'name email photoURL');

    res.status(200).json({
      success: true,
      message: 'Donation added successfully',
      data: populatedCampaign
    });

  } catch (error) {
    console.error('Add donation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
});

// Get user's donation campaigns
router.get('/user/my-campaigns', authenticateToken, async (req, res) => {
  try {
    const campaigns = await DonationCampaign.find({ organizer: req.user._id })
      .populate('organizer', 'name email photoURL')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: campaigns
    });

  } catch (error) {
    console.error('Get user campaigns error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
});

// Get user's donations
router.get('/user/my-donations', authenticateToken, async (req, res) => {
  try {
    const campaigns = await DonationCampaign.find({
      'donors.donor': req.user._id
    })
      .populate('organizer', 'name email photoURL')
      .sort({ createdAt: -1 });

    // Filter to only show user's donations
    const userDonations = campaigns.map(campaign => {
      const userDonation = campaign.donors.find(donation => 
        donation.donor.toString() === req.user._id.toString()
      );
      return {
        ...campaign.toObject(),
        userDonation
      };
    });

    res.status(200).json({
      success: true,
      data: userDonations
    });

  } catch (error) {
    console.error('Get user donations error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
});

module.exports = router;
