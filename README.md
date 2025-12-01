# FourPaws - Pet Adoption Platform

A full-stack web application for pet adoption, built with React, Node.js, Express, and MongoDB.

## Project Structure

```
FourPaws/
├── backend/               # Backend server (Node.js + Express)
│   ├── config/           # Configuration files
│   ├── controllers/      # Request handlers
│   ├── middleware/       # Custom middleware
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── services/         # Service modules (email, etc.)
│   ├── utils/            # Utility functions
│   ├── .env.example      # Environment variables example
│   └── server.js         # Entry point
│
├── frontend/             # Frontend application (React)
│   ├── public/           # Static files
│   └── src/              # Source code
│       ├── components/   # Reusable components
│       ├── pages/        # Page components
│       ├── hooks/        # Custom hooks
│       ├── utils/        # Utility functions
│       └── App.js        # Main component
│
└── README.md             # This file
```

## Features

- User authentication (register, login, logout)
- Browse and search adoptable pets
- Submit adoption applications
- Manage pet listings (add, edit, delete)
- Donation campaigns
- Admin dashboard
- Image hosting with ImgBB
- Email notifications with Nodemailer
- Responsive design

## Recent Cleanup (2025-03-26)

### Backend
- Removed unused route files: `petCategory.js` and `legacy-pets.js`
- Cleaned up unused dependencies
- Optimized API endpoints
- Replaced EmailJS with Nodemailer for email functionality

### Frontend
- Moved unused assets to `unused_assets` folder
- Removed unused dependencies:
  - firebase
  - localforage
  - lottie-react
  - react-markdown
  - react-quill
  - @emailjs/browser
- Optimized component imports
- Improved code organization

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB (local or cloud)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example` and update the variables.

4. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Environment Variables

### Backend (`.env`)

```
PORT=5001
MONGODB_URI=mongodb://localhost:27017/pet-adoption-platform
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
IMGBB_API_KEY=your_imgbb_api_key
NODE_ENV=development

# Nodemailer Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=FourPaws <your_email@gmail.com>
```

### Frontend (`.env`)

```
VITE_API_BASE_URL=http://localhost:5001/api
VITE_IMGBB_API_KEY=your_imgbb_api_key
```

## Available Scripts

### Backend

- `npm run dev` - Start the development server
- `npm start` - Start the production server
- `npm test` - Run tests

### Frontend

- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Contributing

1. Fork the repository
2. Create a new branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.