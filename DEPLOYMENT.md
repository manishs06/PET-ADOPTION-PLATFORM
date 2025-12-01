# Deployment Guide

This guide covers deploying the FourPaws Pet Adoption Platform to various hosting platforms.

## Prerequisites

- MongoDB database (local or cloud like MongoDB Atlas)
- Stripe account for payment processing
- ImgBB account for image hosting
- Gmail account for email notifications (or use a production email service)

## Environment Variables

### Backend Environment Variables

Create a `.env` file in `FourPaws/backend/` with the following variables:

```env
PORT=5001
NODE_ENV=production
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_strong_jwt_secret
JWT_EXPIRE=7d
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
IMGBB_API_KEY=your_imgbb_api_key
FRONTEND_URL=https://your-frontend-domain.com
CORS_ORIGIN=https://your-frontend-domain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000
FIRST_ADMIN_SECRET=your_admin_secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=FourPaws <your_email@gmail.com>
```

### Frontend Environment Variables

Create a `.env` file in `FourPaws/frontend/` with:

```env
VITE_API_BASE_URL=https://your-backend-api-url.com/api
VITE_IMGBB_API_KEY=your_imgbb_api_key
VITE_Payment_Gateway_PK=your_stripe_publishable_key
```

## Deployment Options

### Option 1: Render (Recommended for Full-Stack)

1. **Deploy Backend:**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - **Option A: Using render.yaml (Recommended)**
     - Render will automatically detect and use `render.yaml` from your repo
     - All settings will be pre-configured
     - The start command is already set: `cd FourPaws/backend && npm start`
   - **Option B: Manual Setup**
     - **Root Directory:** `FourPaws/backend` (recommended - makes commands simpler)
     - **Build Command:** `npm install`
     - **Start Command:** `npm start` (if root directory is set) OR `cd FourPaws/backend && npm start`
     - **Environment:** Node
     - **Note:** If you set Root Directory to `FourPaws/backend`, you can use just `npm start` instead of the full path
   - Add all environment variables in the Render dashboard (see Environment Variables section above)
   - Set **PORT** environment variable (Render provides this automatically, but ensure it's set)
   - Deploy

2. **Deploy Frontend:**
   - Go to Render Dashboard
   - Click "New +" → "Static Site"
   - Connect your GitHub repository
   - **Root Directory:** `FourPaws/frontend` (optional, but recommended)
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist` (if root directory is set) OR `FourPaws/frontend/dist`
   - Add environment variables (VITE_API_BASE_URL, VITE_IMGBB_API_KEY, VITE_Payment_Gateway_PK)
   - **Important:** Set `VITE_API_BASE_URL` to your deployed backend URL (e.g., `https://your-backend.onrender.com/api`)
   - Deploy

### Option 2: Vercel

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy Backend:**
   ```bash
   cd FourPaws/backend
   vercel
   ```
   - Add environment variables in Vercel dashboard

3. **Deploy Frontend:**
   ```bash
   cd FourPaws/frontend
   vercel
   ```
   - Add environment variables in Vercel dashboard

### Option 3: Railway

1. Go to [Railway](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Railway will auto-detect the backend
5. Add environment variables in Railway dashboard
6. For frontend, create a separate service and deploy the frontend folder

### Option 4: Heroku

1. **Install Heroku CLI:**
   ```bash
   npm install -g heroku
   ```

2. **Deploy Backend:**
   ```bash
   heroku create your-app-name-backend
   cd FourPaws/backend
   heroku git:remote -a your-app-name-backend
   git push heroku main
   ```
   - Set environment variables: `heroku config:set KEY=value`

3. **Deploy Frontend:**
   - Use Heroku's static buildpack or deploy to Netlify/Vercel separately

### Option 5: Netlify (Frontend Only)

1. Go to [Netlify](https://www.netlify.com)
2. Connect your GitHub repository
3. Build settings:
   - Build command: `cd FourPaws/frontend && npm install && npm run build`
   - Publish directory: `FourPaws/frontend/dist`
4. Add environment variables in Netlify dashboard

## Post-Deployment Steps

1. **Update CORS settings** in backend to include your production frontend URL
2. **Update Stripe webhooks** to point to your production backend URL
3. **Create first admin user** using the createAdmin script
4. **Test all functionality** including payments, image uploads, and email notifications
5. **Set up monitoring** and error tracking (e.g., Sentry)

## Important Notes

- Never commit `.env` files to version control
- Use production MongoDB Atlas for database
- Use production Stripe keys (not test keys) for live payments
- Consider using a production email service (SendGrid, Mailgun) instead of Gmail
- Set up proper error monitoring and logging
- Enable HTTPS for all services
- Regularly update dependencies for security

