const express = require('express');
const { body, validationResult } = require('express-validator');
const Category = require('../models/Category');
const Pet = require('../models/Pet');

const router = express.Router();

// Pet categories data with all required fields
const petCategories = [
  {
    _id: '1',
    category: 'Dogs',
    name: 'Dogs',
    icon: '🐶',
    slug: 'dogs',
    petCount: 0,
    image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1074&q=80'
  },
  {
    _id: '2',
    category: 'Cats',
    name: 'Cats',
    icon: '🐱',
    slug: 'cats',
    petCount: 0,
    image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-4.0.3&auto=format&fit=crop&w=1143&q=80'
  },
  {
    _id: '3',
    category: 'Birds',
    name: 'Birds',
    icon: '🐦',
    slug: 'birds',
    petCount: 0,
    image: 'https://images.unsplash.com/photo-1497206365907-f5e630693df0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80'
  },
  {
    _id: '4',
    category: 'Fish',
    name: 'Fish',
    icon: '🐠',
    slug: 'fish',
    petCount: 0,
    image: 'https://images.unsplash.com/photo-1524704796725-9fc3044a58b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1171&q=80'
  },
  {
    _id: '5',
    category: 'Rabbits',
    name: 'Rabbits',
    icon: '🐰',
    slug: 'rabbits',
    petCount: 0,
    image: 'https://images.unsplash.com/photo-1516912481808-3406841bd33c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1133&q=80'
  },
  {
    _id: '6',
    category: 'Hamsters',
    name: 'Hamsters',
    icon: '🐹',
    slug: 'hamsters',
    petCount: 0,
    image: 'https://images.unsplash.com/photo-1511047103917-3f7b8f9e0b5a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80'
  },
  {
    _id: '7',
    category: 'Other',
    name: 'Other',
    icon: '🐾',
    slug: 'other',
    petCount: 0,
    image: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1159&q=80'
  }
];

// Get all pet categories with counts
router.get('/pet-categories', async (req, res) => {
  try {
    // Get pet counts from the database
    const petCounts = await Pet.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    // Create a map of category names to counts
    const countMap = new Map();
    petCounts.forEach(item => {
      countMap.set(item._id, item.count);
    });

    // Pet counts are now properly calculated

    // Update the pet categories with counts
    const categoriesWithCounts = petCategories.map(category => {
      // Convert category name to lowercase for database lookup
      const dbCategoryKey = category.category.toLowerCase();
      return {
        ...category,
        petCount: countMap.get(dbCategoryKey) || 0
      };
    });

    res.status(200).json({
      success: true,
      data: categoriesWithCounts
    });
  } catch (error) {
    console.error('Error fetching pet categories:', error);
    // Fallback to static data if database query fails
    res.status(200).json({
      success: true,
      data: petCategories
    });
  }
});

// Get pet category by ID with count
router.get('/pet-categories/:id', async (req, res) => {
  try {
    const category = petCategories.find(cat => cat._id === req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Get pet count for this category from the database
    try {
      const petCount = await Pet.countDocuments({ category: category.category.toLowerCase() });

      res.status(200).json({
        success: true,
        data: {
          ...category,
          petCount
        }
      });
    } catch (dbError) {
      console.error('Database error fetching pet count:', dbError);
      // Return the category with default count if database query fails
      res.status(200).json({
        success: true,
        data: category
      });
    }
  } catch (error) {
    console.error('Error fetching pet category:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pet category',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get pet category by name (legacy route)
router.get('/pet-categories/category/:name', (req, res) => {
  try {
    const category = petCategories.find(cat =>
      cat.category.toLowerCase() === req.params.name.toLowerCase()
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Error fetching pet category by name:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pet category',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .sort({ sortOrder: 1, name: 1 });

    res.status(200).json({
      success: true,
      data: categories
    });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
});

// Get category by ID
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.status(200).json({
      success: true,
      data: category
    });

  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
});

// Get category by slug
router.get('/slug/:slug', async (req, res) => {
  try {
    const category = await Category.findOne({
      slug: req.params.slug,
      isActive: true
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.status(200).json({
      success: true,
      data: category
    });

  } catch (error) {
    console.error('Get category by slug error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
});

// Initialize default categories (for first-time setup)
router.post('/initialize', async (req, res) => {
  try {
    const defaultCategories = [
      {
        name: 'Dogs',
        slug: 'dogs',
        description: 'Loyal and loving companions',
        image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400',
        icon: '🐕',
        color: '#3B82F6',
        sortOrder: 1
      },
      {
        name: 'Cats',
        slug: 'cats',
        description: 'Independent and graceful pets',
        image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400',
        icon: '🐱',
        color: '#EF4444',
        sortOrder: 2
      },
      {
        name: 'Birds',
        slug: 'birds',
        description: 'Colorful and musical friends',
        image: 'https://images.unsplash.com/photo-1444464666168-49d633b86797?w=400',
        icon: '🐦',
        color: '#10B981',
        sortOrder: 3
      },
      {
        name: 'Fish',
        slug: 'fish',
        description: 'Peaceful aquatic pets',
        image: 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=400',
        icon: '🐠',
        color: '#06B6D4',
        sortOrder: 4
      },
      {
        name: 'Rabbits',
        slug: 'rabbits',
        description: 'Gentle and social animals',
        image: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=400',
        icon: '🐰',
        color: '#F59E0B',
        sortOrder: 5
      },
      {
        name: 'Hamsters',
        slug: 'hamsters',
        description: 'Small and active pets',
        image: 'https://images.unsplash.com/photo-1591946614720-90a587da4a36?w=400',
        icon: '🐹',
        color: '#8B5CF6',
        sortOrder: 6
      },
      {
        name: 'Other',
        slug: 'other',
        description: 'Unique and special pets',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
        icon: '🐾',
        color: '#6B7280',
        sortOrder: 7
      }
    ];

    // Check if categories already exist
    const existingCategories = await Category.find();
    if (existingCategories.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Categories already initialized'
      });
    }

    // Create default categories
    const categories = await Category.insertMany(defaultCategories);

    res.status(201).json({
      success: true,
      message: 'Default categories initialized successfully',
      data: categories
    });

  } catch (error) {
    console.error('Initialize categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
});

// Get category statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .select('name slug petCount')
      .sort({ petCount: -1 });

    const totalPets = categories.reduce((sum, category) => sum + category.petCount, 0);

    res.status(200).json({
      success: true,
      data: {
        categories,
        totalPets,
        totalCategories: categories.length
      }
    });

  } catch (error) {
    console.error('Get category stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
});

module.exports = router;
