# FourPaws - Pet Adoption Platform

A full-stack web application for pet adoption that connects pet owners with potential adopters. Built with React, Node.js, Express, and MongoDB.

## What It Does

FourPaws is a comprehensive pet adoption platform that allows users to:

- **Browse and search** for adoptable pets by category, breed, age, and location
- **Submit adoption requests** for pets they're interested in
- **List pets for adoption** with detailed information and photos
- **Create and manage donation campaigns** to support pet welfare organizations
- **Process payments** securely through Stripe for donations
- **Manage user accounts** with authentication and role-based access (users, admins)
- **Admin dashboard** for managing pets, users, adoption requests, and donation campaigns
- **Email notifications** for adoption requests and important updates
- **Find and manage animal shelters** in the area

The platform provides a seamless experience for both pet owners looking to find homes for their pets and individuals seeking to adopt a new companion.

## Deployment

This project is ready for deployment on various platforms including Render, Vercel, Railway, Heroku, and Netlify. See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy

1. Set up environment variables (see `.env.example` files in backend and frontend directories)
2. Deploy backend to your preferred platform (Render, Railway, Heroku, etc.)
3. Deploy frontend separately (Vercel, Netlify, or as static site)
4. Update CORS settings in backend to include your frontend URL
5. Configure MongoDB Atlas for production database
