# Automated Render Setup Scripts

## Option 1: Automated Setup with Render API

This script automatically sets all environment variables in Render using their API.

### Prerequisites

1. Get your Render API key:
   - Go to https://dashboard.render.com/account/api-keys
   - Click "Create API Key"
   - Copy the key

2. Get your Service ID:
   - Go to your Render service dashboard
   - The Service ID is in the URL: `https://dashboard.render.com/web/services/[SERVICE_ID]`
   - Or find it in service settings

### Setup Steps

1. **Copy the template:**
   ```bash
   cp scripts/render-env-template.env .env
   ```

2. **Edit `.env` file** and fill in all your values:
   - `RENDER_API_KEY` - Your Render API key
   - `RENDER_SERVICE_ID` - Your service ID
   - `MONGODB_URI` - Your MongoDB connection string
   - `JWT_SECRET` - Generate a strong random string
   - `STRIPE_SECRET_KEY` - Your Stripe secret key
   - `STRIPE_PUBLISHABLE_KEY` - Your Stripe publishable key
   - `IMGBB_API_KEY` - Your ImgBB API key
   - `FRONTEND_URL` - Your frontend URL (after deploying)
   - `CORS_ORIGIN` - Same as FRONTEND_URL
   - `EMAIL_USER` - Your Gmail address
   - `EMAIL_PASS` - Your Gmail app password
   - `EMAIL_FROM` - `FourPaws <your_email@gmail.com>`
   - `FIRST_ADMIN_SECRET` - Your admin secret

3. **Run the script:**
   ```bash
   node scripts/setup-render-env.js
   ```

   Or if you set SERVICE_ID as command line argument:
   ```bash
   node scripts/setup-render-env.js <SERVICE_ID>
   ```

4. **Redeploy your service** in Render dashboard for changes to take effect.

## Option 2: Using render.yaml (If Render detects it)

The `render.yaml` file already has environment variables defined. However, variables with `sync: false` need to be set manually or via API.

If Render properly detects your `render.yaml`, it will automatically set the variables that have values (like `NODE_ENV=production`).

## Option 3: Manual Setup (Fallback)

If the automated script doesn't work, follow the instructions in `RENDER_SETUP.md` to set variables manually in the Render dashboard.

## Generating Secrets

For `JWT_SECRET` and `FIRST_ADMIN_SECRET`, you can generate strong random strings:

**Using Node.js:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Using OpenSSL:**
```bash
openssl rand -hex 32
```

**Online:** Use a password generator to create a 32+ character random string.

