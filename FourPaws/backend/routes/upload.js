const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const router = express.Router();
console.log('--- Upload Route File Initialized ---');

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

    const key = process.env.IMGBB_API_KEY;
    console.log(`Upload attempt: ${req.file.originalname}, size: ${req.file.size}`);

    if (!isImgBBConfigured) {
      console.log('ImgBB not configured, returning placeholder');
      const filename = req.file.originalname;
      const placeholderUrl = `https://via.placeholder.com/800x600/cccccc/666666?text=${encodeURIComponent(filename)}`;
      return res.status(200).json({
        success: true,
        message: 'Image uploaded (placeholder)',
        data: { url: placeholderUrl, publicId: filename }
      });
    }

    // Convert to base64
    const base64Image = req.file.buffer.toString('base64');

    // Create form data using native URLSearchParams for simplicity and avoid stream issues
    const params = new URLSearchParams();
    params.append('image', base64Image);

    const response = await axios.post(
      `https://api.imgbb.com/1/upload?key=${key}`,
      params,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        timeout: 60000
      }
    );

    if (response.data && response.data.data) {
      console.log('Upload success');
      return res.status(200).json({
        success: true,
        message: 'Image uploaded successfully',
        data: {
          url: response.data.data.url,
          publicId: response.data.data.id,
          deleteUrl: response.data.data.delete_url
        }
      });
    } else {
      throw new Error('Invalid response from ImgBB');
    }
  } catch (error) {
    console.error('Upload Error:', error.response?.data || error.message);
    const detail = error.response?.data?.error?.message || error.message;
    res.status(error.response?.status || 500).json({
      success: false,
      message: 'Upload failed',
      error: detail,
      debug: process.env.NODE_ENV === 'development' ? error.response?.data : undefined
    });
  }
});

// Test route to verify API key
router.get('/test-key', async (req, res) => {
  try {
    const key = process.env.IMGBB_API_KEY;
    console.log('Testing ImgBB key:', key ? `${key.substring(0, 4)}...` : 'not found');

    if (!key || key === 'your_imgbb_api_key') {
      return res.status(400).json({ success: false, message: 'API key not configured' });
    }

    // Upload a dummy small pixel to test the key
    const pixelBase64 = 'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    const form = new FormData();
    form.append('image', pixelBase64);

    const response = await axios.post(
      `https://api.imgbb.com/1/upload?key=${key}`,
      form,
      { headers: { ...form.getHeaders() } }
    );

    res.status(200).json({
      success: true,
      message: 'API Key is valid',
      data: response.data.data
    });
  } catch (error) {
    console.error('API Key test failed:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      message: 'API Key verification failed',
      error: error.response?.data?.error?.message || error.message,
      details: error.response?.data
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

    console.log(`Starting multiple upload for ${req.files.length} files`);

    if (!isImgBBConfigured) {
      console.log('ImgBB not configured, using placeholder fallbacks for multiple upload');
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
    const errors = [];

    for (const file of req.files) {
      try {
        const form = new FormData();
        form.append('image', file.buffer, {
          filename: file.originalname,
          contentType: file.mimetype,
        });

        const response = await axios.post(
          `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
          form,
          {
            headers: {
              ...form.getHeaders()
            },
            timeout: 60000
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
        console.error(`Error uploading file ${file.originalname} to ImgBB:`, fileError.response?.data || fileError.message);
        errors.push({
          file: file.originalname,
          error: fileError.response?.data?.error?.message || fileError.message
        });
      }
    }

    res.status(200).json({
      success: true,
      message: uploadedImages.length > 0 ? 'Images processed' : 'Image upload failed',
      data: {
        images: uploadedImages,
        errors: errors.length > 0 ? errors : undefined
      }
    });

  } catch (error) {
    console.error('Multiple upload main error:', error);
    res.status(500).json({
      success: false,
      message: 'Image upload process failed',
      error: error.message
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