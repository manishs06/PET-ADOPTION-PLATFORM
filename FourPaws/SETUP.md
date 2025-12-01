# FourPaws Pet Adoption Platform - Setup Guide

## Overview
FourPaws is a comprehensive pet adoption platform built with React (frontend) and Node.js/Express (backend). It allows users to list pets for adoption, create donation campaigns, and manage pet adoption requests.

## Features
- 🐕 Pet listing and management
- 💰 Donation campaigns for pet welfare
- 📝 Adoption request system
- 👥 User authentication and authorization
- 💳 Payment processing with Stripe
- 📸 Image upload with ImgBB
- 🎨 Modern UI with Tailwind CSS and DaisyUI
- 📧 Email notifications with Nodemailer

## Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

## Backend Setup

### 1. Navigate to backend directory
```bash
cd backend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the backend directory with the following variables:

```env
# Server Configuration
PORT=5001
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/pet-adoption-platform

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here

# ImgBB Configuration (for image uploads)
IMGBB_API_KEY=your_imgbb_api_key

# CORS Configuration
FRONTEND_URL=http://localhost:5173

# Nodemailer Configuration (for email notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=FourPaws <your_email@gmail.com>
```

### 4. Start the backend server
```bash
# Development mode with auto-restart
npm run dev

# Or production mode
npm start
```

The backend will be available at `http://localhost:5001`

## Frontend Setup

### 1. Navigate to frontend directory
```bash
cd frontend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the frontend directory:

```env
# Frontend Environment Variables
VITE_API_BASE_URL=http://localhost:5001/api

# ImgBB (for image uploads)
VITE_IMGBB_API_KEY=your_imgbb_api_key_here

# Stripe (for payment processing)
VITE_Payment_Gateway_PK=pk_test_your_stripe_publishable_key_here
```

### 4. Start the frontend development server
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Third-Party Services Setup

### MongoDB
1. Install MongoDB locally or use MongoDB Atlas (cloud)
2. Update the `MONGODB_URI` in your backend `.env` file
3. The database will be created automatically when you first run the application

### ImgBB (Image Upload)
1. Sign up at [ImgBB](https://imgbb.com/)
2. Go to [https://api.imgbb.com/](https://api.imgbb.com/) and click "Get API Key"
3. Update the ImgBB API key in your backend `.env` file

### Stripe (Payment Processing)
1. Sign up at [Stripe](https://stripe.com/)
2. Get your test API keys from the dashboard
3. Update the Stripe configuration in both backend and frontend `.env` files

### Gmail (Email Notifications with Nodemailer)
1. Use a Gmail account for sending emails
2. Enable 2-factor authentication
3. Generate an App Password:
   - Go to your Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
4. Update the email configuration in your backend `.env` file:
   - EMAIL_USER: Your Gmail address
   - EMAIL_PASS: The generated app password

### EmailJS (Removed)
EmailJS has been replaced with Nodemailer for better control and no external dependencies.

## Creating the First Admin User

After setting up the backend, you can create the first admin user using the script:

```bash
cd backend
npm run create-admin
```

Follow the prompts to create your admin account.

You can also update an admin password using:
```bash
cd backend
npm run update-admin-password
```

## API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user profile

### Pet Endpoints
- `GET /api/pets` - Get all pets with pagination
- `POST /api/pets` - Create new pet
- `GET /api/pets/:id` - Get pet by ID
- `PUT /api/pets/:id` - Update pet
- `DELETE /api/pets/:id` - Delete pet

### Adoption Request Endpoints
- `GET /api/adoption-requests` - Get user's adoption requests
- `GET /api/adoption-requests/owner/:email` - Get adoption requests for pet owner
- `POST /api/adoption-requests` - Create adoption request
- `PATCH /api/adoption-requests/admin/accept/:id` - Accept adoption request
- `PATCH /api/adoption-requests/admin/reject/:id` - Reject adoption request

### Donation Campaign Endpoints
- `GET /api/donations` - Get all campaigns
- `POST /api/donations` - Create campaign
- `GET /api/donations/:id` - Get campaign by ID
- `PUT /api/donations/:id` - Update campaign
- `DELETE /api/donations/:id` - Delete campaign

### Payment Endpoints
- `POST /api/payments/create-payment-intent` - Create payment intent
- `POST /api/payments/confirm` - Confirm payment

### User Endpoints
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get user by ID
- `GET /api/users/stats/overview` - Get user statistics (admin only)
- `PATCH /api/users/:id/role` - Update user role (admin only)

### Contact Endpoints
- `POST /api/contact` - Send contact form message

## Development Scripts

### Backend
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run create-admin` - Create first admin user
- `npm run update-admin-password` - Update admin password

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check the connection string in your `.env` file
   - Verify network access if using MongoDB Atlas

2. **ImgBB Upload Errors**
   - Verify your ImgBB API key
   - Check if your account has sufficient storage
   - Ensure the image size is within ImgBB limits (32MB max)

3. **Stripe Payment Issues**
   - Use test keys for development
   - Check if your Stripe account is activated
   - Verify webhook endpoints are configured

4. **CORS Errors**
   - Ensure the frontend URL is correctly set in backend `.env`
   - Check if both servers are running on the correct ports

5. **Email Sending Issues**
   - Verify your Gmail credentials and app password
   - Check if 2-factor authentication is enabled
   - Ensure the EMAIL_HOST, EMAIL_PORT, and EMAIL_SECURE settings are correct

### Getting Help

If you encounter issues:
1. Check the console logs for error messages
2. Verify all environment variables are set correctly
3. Ensure all dependencies are installed
4. Check if all required services (MongoDB, etc.) are running

## Production Deployment

For production deployment:

1. Set `NODE_ENV=production` in backend `.env`
2. Use production database URLs
3. Use production Stripe keys
4. Configure proper CORS origins
5. Set up proper error monitoring
6. Use a process manager like PM2 for the backend
7. Serve the frontend build through a web server like Nginx
8. Use a production email service (not Gmail) for better deliverability

## Security Notes

- Never commit `.env` files to version control
- Use strong JWT secrets in production
- Implement rate limiting for API endpoints
- Validate all user inputs
- Use HTTPS in production
- Regularly update dependencies
- Use app-specific passwords for email services
- Monitor logs for suspicious activity

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.