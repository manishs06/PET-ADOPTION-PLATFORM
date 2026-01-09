const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
// Load environment variables - try .env first, fallback to config.env for backward compatibility
require('dotenv').config();
if (!process.env.MONGODB_URI) {
  require('dotenv').config({ path: './config.env' });
}

// Import routes
const authRoutes = require('./routes/auth');
const petRoutes = require('./routes/pets');
const userRoutes = require('./routes/users');
const donationRoutes = require('./routes/donations');
const paymentRoutes = require('./routes/payments');
const categoryRoutes = require('./routes/categories');
const uploadRoutes = require('./routes/upload');
const adoptionRequestRoutes = require('./routes/adoptionRequests');
const contactRoutes = require('./routes/contact');

const app = express();

// Add request logging (only in development)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`=== INCOMING REQUEST ===`);
    console.log(`Method: ${req.method}`);
    console.log(`URL: ${req.url}`);
    console.log(`Time: ${new Date().toISOString()}`);
    next();
  });
}

// Security middleware
app.use(helmet({
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
}));

// Rate limiting - more permissive for development
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000, // increased from 100 to 1000 for development
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS configuration
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173,http://127.0.0.1:5173').split(',').map(origin => origin.trim());

// Also include FRONTEND_URL if specified
if (process.env.FRONTEND_URL) {
  const frontendUrl = process.env.FRONTEND_URL.trim();
  if (!allowedOrigins.includes(frontendUrl)) {
    allowedOrigins.push(frontendUrl);
  }
}

console.log('Allowed Origins:', allowedOrigins);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Dynamic check for production origins
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      // Direct match
      if (allowedOrigin === origin) return true;
      // Also allow any onrender.com subdomains if the user is using them
      if (origin.endsWith('.onrender.com') && origin.includes('pet-adoption-platform')) return true;
      return false;
    });

    if (isAllowed || process.env.NODE_ENV !== 'production' || origin.includes('localhost') || origin.includes('127.0.0.1')) {
      callback(null, true);
    } else {
      console.log('CORS blocked for origin:', origin);
      const corsError = new Error('Not allowed by CORS');
      corsError.status = 403;
      callback(corsError);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  optionsSuccessStatus: 200
}));

// Handle preflight requests
app.options('*', cors());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/PetAdoption')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    console.log('Please ensure MongoDB is running or use MongoDB Atlas for cloud database');
    console.log('For MongoDB Atlas setup: https://www.mongodb.com/atlas');
  });

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Pet Adoption Platform API is running',
    timestamp: new Date().toISOString()
  });
});

// API routes
console.log('Mounting API routes...');
app.use('/api/auth', authRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/users', userRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/adoption-requests', adoptionRequestRoutes);
app.use('/api/contact', contactRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    console.error('=== GLOBAL ERROR HANDLER ===');
    console.error('Error name:', err.name);
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);
    console.error('Error code:', err.code);
  } else {
    // In production, log errors but don't expose details
    console.error('Error:', err.message);
  }

  res.status(err.status || 500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('404 - Route not found:', req.originalUrl);
  }
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Updated port to 5001
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
  console.log(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  console.log(`API Base URL: http://localhost:${PORT}/api`);
});