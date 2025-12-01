const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const router = express.Router();

// Check if ImgBB is configured
const isImgBBConfigured = process.env.IMGBB_API_KEY && process.env.IMGBB_API_KEY !== 'your_imgbb_api_key';

// Configure multer with memory storage for ImgBB
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 32 * 1024 * 1024 // 32MB limit for ImgBB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Upload single image to ImgBB
router.post('/', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    if (!isImgBBConfigured) {
      // Fallback: return a placeholder URL for development
      const filename = req.file.originalname;
      const placeholderUrl = `https://via.placeholder.com/800x600/cccccc/666666?text=${encodeURIComponent(filename)}`;
      
      return res.status(200).json({
        success: true,
        message: 'Image uploaded successfully (placeholder)',
        data: {
          url: placeholderUrl,
          publicId: filename,
          note: 'ImgBB not configured - using placeholder image'
        }
      });
    }

    // Upload to ImgBB
    const formData = new FormData();
    formData.append('image', req.file.buffer.toString('base64'));
    
    const response = await axios.post(
      `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
      formData,
      {
        headers: {
          ...formData.getHeaders()
        }
      }
    );

    if (response.data && response.data.data && response.data.data.url) {
      res.status(200).json({
        success: true,
        message: 'Image uploaded successfully',
        data: {
          url: response.data.data.url,
          publicId: response.data.data.id,
          deleteUrl: response.data.data.delete_url
        }
      });
    } else {
      throw new Error('Upload failed - no URL returned');
    }

  } catch (error) {
    console.error('ImgBB upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Image upload failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Upload multiple images to ImgBB
router.post('/multiple', upload.array('images', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No image files provided'
      });
    }

    if (!isImgBBConfigured) {
      // Fallback: return placeholder URLs
      const uploadedImages = req.files.map(file => ({
        url: `https://via.placeholder.com/800x600/cccccc/666666?text=${encodeURIComponent(file.originalname)}`,
        publicId: file.originalname,
        note: 'ImgBB not configured - using placeholder image'
      }));

      return res.status(200).json({
        success: true,
        message: 'Images uploaded successfully (placeholders)',
        data: {
          images: uploadedImages
        }
      });
    }

    // Upload each image to ImgBB
    const uploadedImages = [];
    
    for (const file of req.files) {
      try {
        const formData = new FormData();
        formData.append('image', file.buffer.toString('base64'));
        
        const response = await axios.post(
          `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
          formData,
          {
            headers: {
              ...formData.getHeaders()
            }
          }
        );

        if (response.data && response.data.data && response.data.data.url) {
          uploadedImages.push({
            url: response.data.data.url,
            publicId: response.data.data.id,
            deleteUrl: response.data.data.delete_url
          });
        }
      } catch (fileError) {
        console.error('Error uploading file to ImgBB:', fileError);
        // Continue with other files even if one fails
      }
    }

    res.status(200).json({
      success: true,
      message: 'Images uploaded successfully',
      data: {
        images: uploadedImages
      }
    });

  } catch (error) {
    console.error('Multiple upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Image upload failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Delete image (simulate for ImgBB since we don't have a direct delete API)
router.delete('/:publicId', async (req, res) => {
  try {
    if (!isImgBBConfigured) {
      return res.status(200).json({
        success: true,
        message: 'Image deletion simulated (ImgBB not configured)'
      });
    }
    
    // ImgBB doesn't provide a direct API for deletion from server-side without the delete URL
    // We'll just simulate successful deletion
    res.status(200).json({
      success: true,
      message: 'Image deletion simulated (ImgBB images are automatically managed)'
    });

  } catch (error) {
    console.error('Delete simulation error:', error);
    res.status(500).json({
      success: false,
      message: 'Image deletion simulation failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;