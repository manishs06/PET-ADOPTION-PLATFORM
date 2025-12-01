const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const { sendAdoptionRequestNotification, sendAdoptionStatusUpdate } = require('../services/emailService');

const router = express.Router();

// AdoptionRequest Schema
const adoptionRequestSchema = new mongoose.Schema({
  userEmail: {
    type: String,
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  adoptDate: {
    type: String,
    required: true
  },
  userAddress: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  ownerEmail: {
    type: String,
    required: true
  },
  petId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  image: {
    type: String
  },
  longdesp: {
    type: String
  },
  shortdesp: {
    type: String
  },
  adopt_Req: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  // Vaccination verification
  vaccinationVerified: {
    type: Boolean,
    default: false
  },
  vaccinationProof: {
    type: String // URL to uploaded proof document/image
  },
  // Neutering verification
  neuteringVerified: {
    type: Boolean,
    default: false
  },
  neuteringProof: {
    type: String // URL to uploaded proof document/image
  },
  // Adoption agreement acceptance
  agreementAccepted: {
    type: Boolean,
    default: false
  },
  // Vet verification status
  vetVerified: {
    type: Boolean,
    default: false
  },
  vetVerificationDate: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const AdoptionRequest = mongoose.model('AdoptionRequest', adoptionRequestSchema);

// Create adoption request
router.post('/', [
  body('userEmail').isEmail().withMessage('Valid email is required'),
  body('userName').trim().notEmpty().withMessage('User name is required'),
  body('userAddress').trim().notEmpty().withMessage('User address is required'),
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('ownerEmail').isEmail().withMessage('Valid owner email is required'),
  body('petId').trim().notEmpty().withMessage('Pet ID is required'),
  body('name').trim().notEmpty().withMessage('Pet name is required'),
  body('category').trim().notEmpty().withMessage('Pet category is required')
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

    // Prevent users from adopting their own pets
    if (req.body.userEmail === req.body.ownerEmail) {
      return res.status(400).json({
        success: false,
        message: 'You cannot send an adoption request for your own pet'
      });
    }

    // Check if user already has a pending request for this pet
    const existingRequest = await AdoptionRequest.findOne({
      userEmail: req.body.userEmail,
      petId: req.body.petId,
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending adoption request for this pet'
      });
    }

    const adoptionRequest = await AdoptionRequest.create(req.body);

    // Send notification email to pet owner
    try {
      await sendAdoptionRequestNotification({
        ownerEmail: req.body.ownerEmail,
        userName: req.body.userName,
        userEmail: req.body.userEmail,
        petName: req.body.name,
        petId: req.body.petId
      });
    } catch (emailError) {
      console.error('Failed to send adoption request notification email:', emailError);
      // Don't fail the whole request if email fails, but log the error
    }

    res.status(201).json({
      success: true,
      message: 'Adoption request sent successfully',
      data: adoptionRequest
    });

  } catch (error) {
    console.error('Create adoption request error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
});

// Get adoption requests by user email (for users to see their own requests)
router.get('/', async (req, res) => {
  try {
    const { userEmail } = req.query;
    
    if (!userEmail) {
      return res.status(400).json({
        success: false,
        message: 'User email is required'
      });
    }

    const requests = await AdoptionRequest.find({ 
      userEmail: userEmail
    }).sort({ createdAt: -1 });

    res.status(200).json(requests);

  } catch (error) {
    console.error('Get user adoption requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
});

// Get adoption requests by owner email
router.get('/owner/:email', async (req, res) => {
  try {
    const requests = await AdoptionRequest.find({ 
      ownerEmail: req.params.email,
      status: 'pending'
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: requests
    });

  } catch (error) {
    console.error('Get adoption requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
});

// Get adoption requests pending health verification (for admin dashboard)
router.get('/health-pending', async (req, res) => {
  try {
    // Find accepted adoption requests where health verification is pending
    const requests = await AdoptionRequest.find({ 
      status: 'accepted',
      $or: [
        { vaccinationVerified: false },
        { neuteringVerified: false }
      ]
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: requests
    });

  } catch (error) {
    console.error('Get health verification requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
});

// Update adoption request status
router.patch('/:id/status', [
  body('status').isIn(['accepted', 'rejected']).withMessage('Status must be accepted or rejected')
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

    const request = await AdoptionRequest.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Adoption request not found'
      });
    }

    res.status(200).json({
      success: true,
      message: `Adoption request ${req.body.status} successfully`,
      data: request
    });

  } catch (error) {
    console.error('Update adoption request error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
});

// Accept adoption request - specific endpoint for frontend compatibility
router.patch('/admin/accept/:id', async (req, res) => {
  try {
    const { petId, id } = req.body;
    
    console.log('Accepting adoption request:', req.params.id);
    console.log('Pet ID from request body:', petId);
    
    const request = await AdoptionRequest.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'accepted',
        adopt_Req: false // Mark as processed
      },
      { new: true }
    );

    if (!request) {
      console.log('Adoption request not found:', req.params.id);
      return res.status(404).json({
        success: false,
        message: 'Adoption request not found'
      });
    }

    console.log('Adoption request updated:', request);

    // Send notification email to requester
    try {
      await sendAdoptionStatusUpdate({
        userEmail: request.userEmail,
        userName: request.userName,
        petName: request.name,
        petId: request.petId
      }, 'accepted');
    } catch (emailError) {
      console.error('Failed to send adoption status update email:', emailError);
      // Don't fail the whole request if email fails, but log the error
    }

    // Update the pet as adopted if petId is provided
    if (petId) {
      try {
        const Pet = mongoose.model('Pet');
        console.log('Updating pet status for pet ID:', petId);
        const updatedPet = await Pet.findByIdAndUpdate(petId, { 
          isAdopted: true,
          isAvailable: false 
        }, { new: true });
        
        if (!updatedPet) {
          console.warn('Pet not found for adoption update:', petId);
        } else {
          console.log('Pet adoption status updated successfully:', updatedPet);
        }
      } catch (petError) {
        console.error('Error updating pet adoption status:', petError);
        // Don't fail the whole request if pet update fails, but log the error
      }
    }

    res.status(200).json({
      success: true,
      message: 'Adoption request accepted successfully',
      data: request,
      modifiedCount: 1
    });

  } catch (error) {
    console.error('Accept adoption request error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
});

// Reject adoption request - specific endpoint for frontend compatibility
router.patch('/admin/reject/:id', async (req, res) => {
  try {
    const request = await AdoptionRequest.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'rejected',
        adopt_Req: false // Mark as processed
      },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Adoption request not found'
      });
    }

    // Send notification email to requester
    try {
      await sendAdoptionStatusUpdate({
        userEmail: request.userEmail,
        userName: request.userName,
        petName: request.name,
        petId: request.petId
      }, 'rejected');
    } catch (emailError) {
      console.error('Failed to send adoption status update email:', emailError);
      // Don't fail the whole request if email fails, but log the error
    }

    res.status(200).json({
      success: true,
      message: 'Adoption request rejected successfully',
      data: request,
      modifiedCount: 1
    });

  } catch (error) {
    console.error('Reject adoption request error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
});

// Verify vaccination status for adoption request
router.patch('/admin/verify-vaccination/:id', async (req, res) => {
  try {
    const { vaccinationProof } = req.body;
    
    const request = await AdoptionRequest.findByIdAndUpdate(
      req.params.id,
      { 
        vaccinationVerified: true,
        vaccinationProof: vaccinationProof || '',
        vetVerified: true,
        vetVerificationDate: new Date()
      },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Adoption request not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Vaccination status verified successfully',
      data: request
    });

  } catch (error) {
    console.error('Vaccination verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
});

// Verify neutering status for adoption request
router.patch('/admin/verify-neutering/:id', async (req, res) => {
  try {
    const { neuteringProof } = req.body;
    
    const request = await AdoptionRequest.findByIdAndUpdate(
      req.params.id,
      { 
        neuteringVerified: true,
        neuteringProof: neuteringProof || '',
        vetVerified: true,
        vetVerificationDate: new Date()
      },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Adoption request not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Neutering status verified successfully',
      data: request
    });

  } catch (error) {
    console.error('Neutering verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
});

module.exports = router;