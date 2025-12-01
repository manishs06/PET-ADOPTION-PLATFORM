const express = require('express');
const rateLimit = require('express-rate-limit');
const { sendContactEmail } = require('../services/emailService');

const router = express.Router();

// Rate limiting for contact form submissions
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: 'Too many contact requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// POST /api/contact - Handle contact form submissions
router.post('/', contactLimiter, async (req, res) => {
  try {
    const { user_name, user_email, subject, message } = req.body;

    // Validate required fields
    if (!user_name || !user_email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, and message.'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(user_email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.'
      });
    }

    // Check if this is a shelter-related message
    if (subject && subject.toLowerCase().includes('shelter')) {
      return res.status(200).json({
        success: true,
        message: 'Redirecting to shelters page...',
        redirect: '/find-shelters'
      });
    }

    // Send email using Nodemailer
    const emailResult = await sendContactEmail({
      user_name,
      user_email,
      subject: subject || 'Contact Form Submission',
      message
    });

    if (emailResult.success) {
      res.status(200).json({
        success: true,
        message: 'Message sent successfully!'
      });
    } else {
      throw new Error(emailResult.error);
    }
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message. Please try again later.'
    });
  }
});

module.exports = router;