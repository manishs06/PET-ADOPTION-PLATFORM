# Render Deployment - Manual Setup Instructions

## ⚠️ IMPORTANT: Render is NOT reading render.yaml automatically

You MUST manually configure these settings in the Render dashboard.

## Step-by-Step Setup in Render Dashboard

1. **Go to your Render service** → Click on "Settings"

2. **Scroll to "Build & Deploy" section**

3. **Set these EXACT values:**

   - **Root Directory:** `FourPaws/backend`
     - ⚠️ This is CRITICAL - it tells Render where your package.json is located
   
   - **Build Command:** `npm install`
     - (Since Root Directory is set, you don't need `cd` command)
   
   - **Start Command:** `npm start`
     - (Since Root Directory is set, you don't need `cd` command)
   
   - **Environment:** `Node`
   
   - **Node Version:** `18` or `20` (optional, but recommended)

4. **Save Changes**

5. **Go to "Environment" section** and add these variables:
   - `NODE_ENV=production`
   - `PORT` (Render sets this automatically)
   - `MONGODB_URI=your_mongodb_connection_string`
   - `JWT_SECRET=your_strong_secret`
   - `JWT_EXPIRE=7d`
   - `STRIPE_SECRET_KEY=your_stripe_secret`
   - `STRIPE_PUBLISHABLE_KEY=your_stripe_publishable`
   - `IMGBB_API_KEY=your_imgbb_key`
   - `FRONTEND_URL=your_frontend_url`
   - `CORS_ORIGIN=your_frontend_url`
   - `EMAIL_USER=your_email`
   - `EMAIL_PASS=your_app_password`
   - `EMAIL_FROM=FourPaws <your_email>`

6. **Click "Manual Deploy" → "Deploy latest commit"**

## Why This Happens

Render doesn't always auto-detect `render.yaml` files. The dashboard settings override the YAML file, so you need to set them manually.

## Alternative: If Root Directory Doesn't Work

If setting Root Directory doesn't work, use these commands instead:

- **Build Command:** `cd FourPaws/backend && npm install`
- **Start Command:** `cd FourPaws/backend && npm start`

But try Root Directory first - it's cleaner and more reliable.

