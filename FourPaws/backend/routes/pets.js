const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Pet = require('../models/Pet');
const { authenticateToken, isAdmin } = require('../middleware/auth');

const router = express.Router();

// Legacy compatible GET /api/pets
router.get('/legacy', async (req, res) => {
  try {
    const { limit = 10, category, offset = 0 } = req.query;
    
    let filter = {};
    if (category) {
      filter.category = category;
    }

    const pets = await Pet.find(filter)
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .sort({ createdAt: -1 })
      .populate('owner', 'name email photoURL');

    const total = await Pet.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: pets.length,
      total,
      data: pets
    });
  } catch (error) {
    console.error('Error fetching pets:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pets',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get all pets with pagination and filtering
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('category').optional().isString().withMessage('Category must be a string'),
  query('type').optional().isString().withMessage('Type must be a string'),
  query('location').optional().isString().withMessage('Location must be a string'),
  query('minAge').optional().isInt({ min: 0 }).withMessage('Min age must be a non-negative integer'),
  query('maxAge').optional().isInt({ min: 0 }).withMessage('Max age must be a non-negative integer'),
  query('gender').optional().isIn(['male', 'female']).withMessage('Gender must be male or female'),
  query('size').optional().isIn(['small', 'medium', 'large']).withMessage('Size must be small, medium, or large')
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
    const filter = { isAvailable: true };
    
    if (req.query.category) filter.category = req.query.category;
    if (req.query.type) filter.type = req.query.type;
    if (req.query.location) filter.location = { $regex: req.query.location, $options: 'i' };
    if (req.query.gender) filter.gender = req.query.gender;
    if (req.query.size) filter.size = req.query.size;
    
    if (req.query.minAge || req.query.maxAge) {
      filter.age = {};
      if (req.query.minAge) filter.age.$gte = parseInt(req.query.minAge);
      if (req.query.maxAge) filter.age.$lte = parseInt(req.query.maxAge);
    }

    const pets = await Pet.find(filter)
      .populate('owner', 'name email photoURL')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Pet.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: pets,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get pets error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
});

// Get single pet by ID
router.get('/:id', async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id)
      .populate('owner', 'name email photoURL phone address')
      .populate('adoptedBy', 'name email photoURL');

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found'
      });
    }

    // Increment views
    pet.views += 1;
    await pet.save();

    res.status(200).json({
      success: true,
      data: pet
    });

  } catch (error) {
    console.error('Get pet error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
});

// Legacy POST /api/pets - simplified version for frontend compatibility
router.post('/legacy', authenticateToken, async (req, res) => {
  try {
    const {
      name, type, breed, age, gender, size, color, description, images, location, category, adoptionFee,
      shortdesp, longdesp, image, addedDate, adopted = false, userEmail,
      // Added health status fields
      vaccinated, spayedNeutered
    } = req.body;

    // Validate required fields
    if (!name || !breed || !gender || !size || !color || !location || !category) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Process fields
    const parsedAge = parseInt(age) || 0;
    const desc = description || longdesp || shortdesp || 'No description provided';
    const petImages = images || (image ? [image] : []);

    if (petImages.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one image is required'
      });
    }

    // Validate description length
    if (desc.length < 10 || desc.length > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Description must be between 10 and 1000 characters'
      });
    }

    // Handle type derivation for special cases
    let derivedType = 'other';
    if (category?.toLowerCase() === 'fish') {
      derivedType = 'fish';
    } else if (category?.toLowerCase() === 'birds') {
      derivedType = 'bird';
    } else if (type) {
      derivedType = type.toLowerCase();
    }

    // Create new pet with owner from authenticated user
    console.log('Creating pet document...');
    const newPet = new Pet({
      name: name.trim(),
      type: derivedType,
      breed: breed.trim(),
      age: parsedAge,
      gender: gender.toLowerCase().trim(),
      size: size.toLowerCase().trim(),
      color: color.trim(),
      description: desc.trim(),
      images: petImages,
      location: location.trim(),
      category: category.toLowerCase().trim(),
      adoptionFee: parseFloat(adoptionFee) || 0,
      owner: req.user._id,
      status: adopted ? 'adopted' : 'available',
      addedDate: addedDate ? new Date(addedDate) : new Date(),
      // Added health status fields
      vaccinated: vaccinated || false,
      spayedNeutered: spayedNeutered || false,
      // Legacy fields
      shortdesp: shortdesp || desc.substring(0, 100) || '',
      longdesp: longdesp || desc || '',
      adopted: !!adopted,
      userEmail: userEmail || req.user.email
    });

    await newPet.save();

    // Populate owner details for response
    const populatedPet = await Pet.findById(newPet._id).populate('owner', 'name email photoURL');

    res.status(201).json({
      success: true,
      message: 'Pet added successfully',
      insertedId: newPet._id,
      data: populatedPet
    });
  } catch (error) {
    console.error('Error adding pet:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding pet',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Add new pet (authenticated users only)
router.post('/', authenticateToken, [
  body('name').trim().isLength({ min: 1, max: 50 }).withMessage('Pet name is required and must be less than 50 characters'),
  body('type').isIn(['dog', 'cat', 'bird', 'fish', 'rabbit', 'hamster', 'other']).withMessage('Invalid pet type'),
  body('breed').trim().notEmpty().withMessage('Breed is required'),
  body('age').isInt({ min: 0 }).withMessage('Age must be a non-negative integer'),
  body('gender').isIn(['male', 'female']).withMessage('Gender must be male or female'),
  body('size').isIn(['small', 'medium', 'large']).withMessage('Size must be small, medium, or large'),
  body('color').trim().notEmpty().withMessage('Color is required'),
  body('description').trim().isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),
  body('images').isArray({ min: 1 }).withMessage('At least one image is required'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('adoptionFee').optional().isFloat({ min: 0 }).withMessage('Adoption fee must be a non-negative number'),
  body('category').isIn(['dogs', 'cats', 'birds', 'fish', 'rabbits', 'hamsters', 'other']).withMessage('Invalid category'),
  // Added validation for health status fields
  body('vaccinated').optional().isBoolean().withMessage('Vaccinated must be a boolean value'),
  body('spayedNeutered').optional().isBoolean().withMessage('Spayed/Neutered must be a boolean value')
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

    const petData = {
      ...req.body,
      owner: req.user._id
    };

    const pet = await Pet.create(petData);

    const populatedPet = await Pet.findById(pet._id)
      .populate('owner', 'name email photoURL');

    res.status(201).json({
      success: true,
      message: 'Pet added successfully',
      data: populatedPet
    });

  } catch (error) {
    console.error('Add pet error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
});

// Update pet (owner or admin only)
router.put('/:id', authenticateToken, [
  body('name').optional().trim().isLength({ min: 1, max: 50 }).withMessage('Pet name must be less than 50 characters'),
  body('type').optional().isIn(['dog', 'cat', 'bird', 'fish', 'rabbit', 'hamster', 'other']).withMessage('Invalid pet type'),
  body('breed').optional().trim().notEmpty().withMessage('Breed cannot be empty'),
  body('age').optional().isInt({ min: 0 }).withMessage('Age must be a non-negative integer'),
  body('status').optional().isIn(['available', 'pending', 'adopted']).withMessage('Invalid status'),
  body('isAdopted').optional().isBoolean().withMessage('isAdopted must be a boolean'),
  body('gender').optional().isIn(['male', 'female']).withMessage('Gender must be male or female'),
  body('size').optional().isIn(['small', 'medium', 'large']).withMessage('Size must be small, medium, or large'),
  body('color').optional().trim().notEmpty().withMessage('Color cannot be empty'),
  body('description').optional().trim().isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),
  body('images').optional().isArray({ min: 1 }).withMessage('At least one image is required'),
  body('location').optional().trim().notEmpty().withMessage('Location cannot be empty'),
  body('adoptionFee').optional().isFloat({ min: 0 }).withMessage('Adoption fee must be a non-negative number'),
  body('category').optional().isIn(['dogs', 'cats', 'birds', 'fish', 'rabbits', 'hamsters', 'other']).withMessage('Invalid category')
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

    const pet = await Pet.findById(req.params.id);

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found'
      });
    }

    // Only the pet owner or an admin can update the pet
    if (pet.owner.toString() !== req.user._id.toString() && req.user.role.toLowerCase() !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this pet'
      });
    }

    let updateData = { ...req.body };

    // If the status is being set to 'adopted', handle related fields
    if (updateData.status === 'adopted' || updateData.isAdopted === true) {
      updateData.isAdopted = true;
      updateData.status = 'adopted';
      updateData.adoptedAt = new Date();
      // The adoptedBy field should be sent in the request body if applicable
    }

    const updatedPet = await Pet.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('owner', 'name email photoURL');

    res.status(200).json({
      success: true,
      message: 'Pet updated successfully',
      data: updatedPet
    });

  } catch (error) {
    console.error('Update pet error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
});

// Delete pet (owner or admin only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found'
      });
    }

    // Check if user is owner or admin
    if (pet.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this pet'
      });
    }

    await Pet.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Pet deleted successfully'
    });

  } catch (error) {
    console.error('Delete pet error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
});

// Get pets by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const pets = await Pet.find({ 
      category: { $regex: new RegExp(`^${category}$`, 'i') },
      isAvailable: true 
    })
      .populate('owner', 'name email photoURL')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Pet.countDocuments({ 
      category: { $regex: new RegExp(`^${category}$`, 'i') },
      isAvailable: true 
    });

    res.status(200).json({
      success: true,
      data: pets,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get pets by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
});

// Get user's pets with pagination
router.get('/user/my-pets', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
], authenticateToken, async (req, res) => {
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

    const pets = await Pet.find({ owner: req.user._id })
      .populate('adoptedBy', 'name email photoURL')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Pet.countDocuments({ owner: req.user._id });

    res.status(200).json({
      success: true,
      data: pets,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get user pets error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
});

// Create adoption request for a pet
router.post('/:id/adoption-requests', authenticateToken, async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id).populate('owner', 'name email');
    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found'
      });
    }

    // Prevent users from adopting their own pets
    if (pet.owner._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot send an adoption request for your own pet'
      });
    }

    const adoptionRequestData = {
      userEmail: req.user.email,
      userName: req.user.name,
      userAddress: req.user.address || 'Not provided',
      phone: req.user.phone || 'Not provided',
      ownerEmail: pet.owner.email,
      petId: pet._id,
      name: pet.name,
      category: pet.category,
      image: pet.images[0] || '',
      longdesp: pet.description,
      shortdesp: pet.description.substring(0, 100),
      adopt_Req: true,
      status: 'pending'
    };

    const AdoptionRequest = mongoose.model('AdoptionRequest');
    
    // Check if user already has a pending request for this pet
    const existingRequest = await AdoptionRequest.findOne({
      userEmail: req.user.email,
      petId: pet._id,
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending adoption request for this pet'
      });
    }

    const adoptionRequest = await AdoptionRequest.create(adoptionRequestData);

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

// Admin route to mark pet as adopted
router.patch('/admin/adopted/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const petId = req.params.id;
    const pet = await Pet.findByIdAndUpdate(
      petId,
      { 
        isAdopted: true,
        isAvailable: false,
        status: 'adopted',
        adoptedAt: new Date()
      },
      { new: true }
    );

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Pet marked as adopted',
      modifiedCount: 1,
      data: pet
    });

  } catch (error) {
    console.error('Error updating adoption status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Admin route to mark pet as not adopted
router.patch('/admin/notadopted/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const petId = req.params.id;
    const pet = await Pet.findByIdAndUpdate(
      petId,
      { 
        isAdopted: false,
        isAvailable: true,
        status: 'available',
        adoptedAt: null
      },
      { new: true }
    );

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Pet marked as not adopted',
      modifiedCount: 1,
      data: pet
    });

  } catch (error) {
    console.error('Error updating adoption status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;
