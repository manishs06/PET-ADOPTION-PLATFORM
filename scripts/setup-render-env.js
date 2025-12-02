#!/usr/bin/env node

/**
 * Script to automatically set environment variables in Render
 * 
 * Usage:
 * 1. Get your Render API key from: https://dashboard.render.com/account/api-keys
 * 2. Set RENDER_API_KEY environment variable
 * 3. Get your service ID from Render dashboard (in the URL or service settings)
 * 4. Run: node scripts/setup-render-env.js <SERVICE_ID>
 * 
 * Or set variables in .env file:
 * RENDER_API_KEY=your_api_key
 * RENDER_SERVICE_ID=your_service_id
 */

const https = require('https');
require('dotenv').config();

const RENDER_API_KEY = process.env.RENDER_API_KEY;
const RENDER_SERVICE_ID = process.env.RENDER_SERVICE_ID || process.argv[2];

if (!RENDER_API_KEY) {
  console.error('❌ Error: RENDER_API_KEY not found');
  console.log('\n📝 To get your API key:');
  console.log('   1. Go to https://dashboard.render.com/account/api-keys');
  console.log('   2. Create a new API key');
  console.log('   3. Set it as: export RENDER_API_KEY=your_key');
  console.log('   Or add it to a .env file: RENDER_API_KEY=your_key\n');
  process.exit(1);
}

if (!RENDER_SERVICE_ID) {
  console.error('❌ Error: RENDER_SERVICE_ID not provided');
  console.log('\n📝 Usage:');
  console.log('   node scripts/setup-render-env.js <SERVICE_ID>');
  console.log('   Or set RENDER_SERVICE_ID in .env file\n');
  console.log('💡 Find your Service ID in Render dashboard URL or service settings\n');
  process.exit(1);
}

// Environment variables to set
const envVars = {
  NODE_ENV: 'production',
  JWT_EXPIRE: '7d',
  RATE_LIMIT_WINDOW_MS: '900000',
  RATE_LIMIT_MAX_REQUESTS: '1000',
  EMAIL_HOST: 'smtp.gmail.com',
  EMAIL_PORT: '587',
  EMAIL_SECURE: 'false',
  // These need to be provided by user
  MONGODB_URI: process.env.MONGODB_URI || '',
  JWT_SECRET: process.env.JWT_SECRET || '',
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
  STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY || '',
  IMGBB_API_KEY: process.env.IMGBB_API_KEY || '',
  FRONTEND_URL: process.env.FRONTEND_URL || '',
  CORS_ORIGIN: process.env.CORS_ORIGIN || process.env.FRONTEND_URL || '',
  EMAIL_USER: process.env.EMAIL_USER || '',
  EMAIL_PASS: process.env.EMAIL_PASS || '',
  EMAIL_FROM: process.env.EMAIL_FROM || '',
  FIRST_ADMIN_SECRET: process.env.FIRST_ADMIN_SECRET || '',
};

// Filter out empty values
const varsToSet = Object.entries(envVars).filter(([_, value]) => value !== '');

console.log('🚀 Setting up Render environment variables...\n');
console.log(`📦 Service ID: ${RENDER_SERVICE_ID}\n`);

// Function to make API request
function setEnvVar(key, value) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      key,
      value,
    });

    const options = {
      hostname: 'api.render.com',
      path: `/v1/services/${RENDER_SERVICE_ID}/env-vars`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RENDER_API_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': data.length,
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(body));
        } else {
          // Try to update if it already exists
          if (res.statusCode === 409) {
            updateEnvVar(key, value).then(resolve).catch(reject);
          } else {
            reject(new Error(`Failed: ${res.statusCode} - ${body}`));
          }
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function updateEnvVar(key, value) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      value,
    });

    const options = {
      hostname: 'api.render.com',
      path: `/v1/services/${RENDER_SERVICE_ID}/env-vars/${key}`,
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${RENDER_API_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': data.length,
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(body));
        } else {
          reject(new Error(`Failed: ${res.statusCode} - ${body}`));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// Set all environment variables
async function setupEnvVars() {
  const results = [];
  
  for (const [key, value] of varsToSet) {
    try {
      console.log(`⏳ Setting ${key}...`);
      await setEnvVar(key, value);
      console.log(`✅ ${key} set successfully\n`);
      results.push({ key, status: 'success' });
    } catch (error) {
      console.error(`❌ Failed to set ${key}: ${error.message}\n`);
      results.push({ key, status: 'error', error: error.message });
    }
  }

  console.log('\n📊 Summary:');
  const success = results.filter(r => r.status === 'success').length;
  const failed = results.filter(r => r.status === 'error').length;
  console.log(`✅ Success: ${success}`);
  console.log(`❌ Failed: ${failed}`);

  if (failed > 0) {
    console.log('\n⚠️  Some variables failed. You may need to set them manually in Render dashboard.');
  } else {
    console.log('\n🎉 All environment variables set successfully!');
    console.log('💡 Redeploy your service in Render dashboard for changes to take effect.');
  }
}

setupEnvVars().catch(console.error);

