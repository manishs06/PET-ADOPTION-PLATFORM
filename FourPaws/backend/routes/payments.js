const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Payment = require('../models/Payment');
const User = require('../models/User');
const DonationCampaign = require('../models/DonationCampaign');

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

// Create payment intent for donation
router.post('/create-payment-intent', authenticateToken, [
  body('amount').isFloat({ min: 1 }).withMessage('Amount must be at least 1'),
  body('currency').optional().isIn(['inr', 'usd', 'eur', 'gbp', 'cad', 'aud']).withMessage('Invalid currency'),
  body('donationCampaignId').optional().isMongoId().withMessage('Invalid donation campaign ID'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters')
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

    const { amount, currency = 'inr', donationCampaignId, description } = req.body;

    // Verify donation campaign exists if provided
    if (donationCampaignId) {
      const campaign = await DonationCampaign.findById(donationCampaignId);
      if (!campaign) {
        return res.status(404).json({
          success: false,
          message: 'Donation campaign not found'
        });
      }
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency,
      metadata: {
        userId: req.user._id.toString(),
        donationCampaignId: donationCampaignId || '',
        description: description || ''
      }
    });

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });

  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
});

// Confirm payment
router.post('/confirm', authenticateToken, [
  body('paymentIntentId').notEmpty().withMessage('Payment intent ID is required'),
  body('donationCampaignId').optional().isMongoId().withMessage('Invalid donation campaign ID'),
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

    const { paymentIntentId, donationCampaignId, amount, anonymous = false, message = '' } = req.body;

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({
        success: false,
        message: 'Payment not completed'
      });
    }

    // Create payment record
    const payment = await Payment.create({
      paymentId: paymentIntent.id,
      amount: amount,
      currency: paymentIntent.currency,
      status: 'succeeded',
      paymentMethod: paymentIntent.payment_method_types[0] || 'card',
      paymentType: donationCampaignId ? 'donation' : 'other',
      donor: req.user._id,
      donationCampaign: donationCampaignId,
      description: message || 'Donation payment',
      stripePaymentIntentId: paymentIntent.id,
      receiptUrl: paymentIntent.charges?.data[0]?.receipt_url
    });

    // If this is a donation, update the campaign
    if (donationCampaignId) {
      const campaign = await DonationCampaign.findById(donationCampaignId);
      if (campaign) {
        // Add donation to campaign
        campaign.donors.push({
          donor: req.user._id,
          amount: amount,
          anonymous: anonymous,
          message: message,
          date: new Date()
        });

        // Update current amount
        campaign.currentAmount += amount;

        // Check if target reached
        if (campaign.currentAmount >= campaign.targetAmount) {
          campaign.status = 'completed';
        }

        await campaign.save();
      }
    }

    res.status(200).json({
      success: true,
      message: 'Payment confirmed successfully',
      data: payment
    });

  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
});

// Get user's payments
router.get('/user/my-payments', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const payments = await Payment.find({ donor: req.user._id })
      .populate('donationCampaign', 'title image')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Payment.countDocuments({ donor: req.user._id });

    res.status(200).json({
      success: true,
      data: payments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get user payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
});

// Get payment by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('donor', 'name email photoURL')
      .populate('donationCampaign', 'title image description');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Check if user is the donor or admin
    if (payment.donor._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this payment'
      });
    }

    res.status(200).json({
      success: true,
      data: payment
    });

  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
});

// Webhook for Stripe events
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('Payment succeeded:', paymentIntent.id);
      
      // Update payment status in database
      await Payment.findOneAndUpdate(
        { stripePaymentIntentId: paymentIntent.id },
        { status: 'succeeded' }
      );
      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      console.log('Payment failed:', failedPayment.id);
      
      // Update payment status in database
      await Payment.findOneAndUpdate(
        { stripePaymentIntentId: failedPayment.id },
        { 
          status: 'failed',
          failureReason: failedPayment.last_payment_error?.message,
          failureCode: failedPayment.last_payment_error?.code
        }
      );
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

// Get payment statistics (admin only)
router.get('/stats/overview', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const totalPayments = await Payment.countDocuments();
    const successfulPayments = await Payment.countDocuments({ status: 'succeeded' });
    const failedPayments = await Payment.countDocuments({ status: 'failed' });
    
    // Total amount collected
    const totalAmount = await Payment.aggregate([
      { $match: { status: 'succeeded' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Payments in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentPayments = await Payment.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
      status: 'succeeded'
    });

    res.status(200).json({
      success: true,
      data: {
        totalPayments,
        successfulPayments,
        failedPayments,
        totalAmount: totalAmount[0]?.total || 0,
        recentPayments
      }
    });

  } catch (error) {
    console.error('Get payment stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
});

module.exports = router;
