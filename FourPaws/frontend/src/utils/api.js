import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      // Clear invalid token and redirect to login
      localStorage.removeItem('access-token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API functions

// ==================== AUTHENTICATION ====================

/**
 * Login user
 * @param {Object} credentials - User credentials
 * @param {string} credentials.email - User email
 * @param {string} credentials.password - User password
 * @returns {Promise<Object>} User data and token
 */
export const login = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('access-token', response.data.token);
    }
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

/**
 * Register new user
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} Created user data
 */
export const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('access-token', response.data.token);
    }
    return response.data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

/**
 * Logout user
 */
export const logout = async () => {
  try {
    await api.post('/auth/logout');
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    localStorage.removeItem('access-token');
    window.location.href = '/';
  }
};

// ==================== PETS ====================

/**
 * Fetch all pets with optional filters
 * @param {Object} filters - Optional filters
 * @returns {Promise<Array>} Array of pets
 */
export const fetchPets = async (filters = {}) => {
  try {
    const response = await api.get('/pets', { params: filters });
    return response.data;
  } catch (error) {
    console.error('Error fetching pets:', error);
    throw error;
  }
};

/**
 * Fetch single pet by ID
 * @param {string} id - Pet ID
 * @returns {Promise<Object>} Pet data
 */
export const fetchPetById = async (id) => {
  try {
    const response = await api.get(`/pets/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching pet ${id}:`, error);
    throw error;
  }
};

/**
 * Create new pet
 * @param {Object} petData - Pet data
 * @returns {Promise<Object>} Created pet data
 */
export const createPet = async (petData) => {
  try {
    const response = await api.post('/pets', petData);
    return response.data;
  } catch (error) {
    console.error('Error creating pet:', error);
    throw error;
  }
};

/**
 * Update pet
 * @param {string} id - Pet ID
 * @param {Object} updates - Updated pet data
 * @returns {Promise<Object>} Updated pet data
 */
export const updatePet = async (id, updates) => {
  try {
    const response = await api.put(`/pets/${id}`, updates);
    return response.data;
  } catch (error) {
    console.error(`Error updating pet ${id}:`, error);
    throw error;
  }
};

/**
 * Delete pet
 * @param {string} id - Pet ID
 * @returns {Promise<void>}
 */
export const deletePet = async (id) => {
  try {
    await api.delete(`/pets/${id}`);
  } catch (error) {
    console.error(`Error deleting pet ${id}:`, error);
    throw error;
  }
};

// ==================== USERS ====================

/**
 * Fetch current user profile
 * @returns {Promise<Object>} User data
 */
export const fetchCurrentUser = async () => {
  try {
    const response = await api.get('/users/me');
    return response.data;
  } catch (error) {
    console.error('Error fetching current user:', error);
    throw error;
  }
};

/**
 * Update user profile
 * @param {Object} updates - Updated user data
 * @returns {Promise<Object>} Updated user data
 */
export const updateUserProfile = async (updates) => {
  try {
    const response = await api.patch('/users/me', updates);
    return response.data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// ==================== CATEGORIES ====================

/**
 * Fetch all pet categories
 * @returns {Promise<Array>} Array of pet categories
 */
export const fetchPetCategories = async () => {
  try {
    const response = await api.get('/categories/pet-categories');
    return response.data;
  } catch (error) {
    console.error('Error fetching pet categories:', error);
    throw error;
  }
};

/**
 * Fetch single pet category by ID
 * @param {string} id - Category ID
 * @returns {Promise<Object>} Category data
 */
export const fetchPetCategory = async (id) => {
  try {
    const response = await api.get(`/categories/pet-categories/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching category ${id}:`, error);
    throw error;
  }
};

// ==================== ADOPTION REQUESTS ====================

/**
 * Create adoption request
 * @param {string} petId - Pet ID
 * @param {Object} requestData - Request data
 * @returns {Promise<Object>} Created request data
 */
export const createAdoptionRequest = async (petId, requestData) => {
  try {
    const response = await api.post(`/pets/${petId}/adoption-requests`, requestData);
    return response.data;
  } catch (error) {
    console.error('Error creating adoption request:', error);
    throw error;
  }
};

/**
 * Get user's adoption requests
 * @returns {Promise<Array>} Array of adoption requests
 */
export const getUserAdoptionRequests = async () => {
  try {
    const response = await api.get('/users/me/adoption-requests');
    return response.data;
  } catch (error) {
    console.error('Error fetching adoption requests:', error);
    throw error;
  }
};

// ==================== DONATION CAMPAIGNS ====================

/**
 * Fetch all donation campaigns
 * @param {Object} filters - Optional filters
 * @returns {Promise<Object>} Campaigns data with pagination
 */
export const fetchDonationCampaigns = async (filters = {}) => {
  try {
    const response = await api.get('/donations', { params: filters });
    return response.data;
  } catch (error) {
    console.error('Error fetching donation campaigns:', error);
    throw error;
  }
};

/**
 * Fetch single donation campaign by ID
 * @param {string} id - Campaign ID
 * @returns {Promise<Object>} Campaign data
 */
export const fetchDonationCampaignById = async (id) => {
  try {
    const response = await api.get(`/donations/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching donation campaign ${id}:`, error);
    throw error;
  }
};

/**
 * Create new donation campaign
 * @param {Object} campaignData - Campaign data
 * @returns {Promise<Object>} Created campaign data
 */
export const createDonationCampaign = async (campaignData) => {
  try {
    const response = await api.post('/donations', campaignData);
    return response.data;
  } catch (error) {
    console.error('Error creating donation campaign:', error);
    throw error;
  }
};

/**
 * Update donation campaign
 * @param {string} id - Campaign ID
 * @param {Object} updates - Updated campaign data
 * @returns {Promise<Object>} Updated campaign data
 */
export const updateDonationCampaign = async (id, updates) => {
  try {
    const response = await api.put(`/donations/${id}`, updates);
    return response.data;
  } catch (error) {
    console.error(`Error updating donation campaign ${id}:`, error);
    throw error;
  }
};

/**
 * Delete donation campaign
 * @param {string} id - Campaign ID
 * @returns {Promise<void>}
 */
export const deleteDonationCampaign = async (id) => {
  try {
    await api.delete(`/donations/${id}`);
  } catch (error) {
    console.error(`Error deleting donation campaign ${id}:`, error);
    throw error;
  }
};

/**
 * Add donation to campaign
 * @param {string} campaignId - Campaign ID
 * @param {Object} donationData - Donation data
 * @returns {Promise<Object>} Updated campaign data
 */
export const addDonationToCampaign = async (campaignId, donationData) => {
  try {
    const response = await api.post(`/donations/${campaignId}/donate`, donationData);
    return response.data;
  } catch (error) {
    console.error(`Error adding donation to campaign ${campaignId}:`, error);
    throw error;
  }
};

/**
 * Get user's donation campaigns
 * @returns {Promise<Array>} Array of user's campaigns
 */
export const getUserDonationCampaigns = async () => {
  try {
    const response = await api.get('/donations/user/my-campaigns');
    return response.data;
  } catch (error) {
    console.error('Error fetching user donation campaigns:', error);
    throw error;
  }
};

/**
 * Get user's donations
 * @returns {Promise<Array>} Array of user's donations
 */
export const getUserDonations = async () => {
  try {
    const response = await api.get('/donations/user/my-donations');
    return response.data;
  } catch (error) {
    console.error('Error fetching user donations:', error);
    throw error;
  }
};

// ==================== PAYMENTS ====================

/**
 * Create payment intent
 * @param {Object} paymentData - Payment data
 * @returns {Promise<Object>} Payment intent data
 */
export const createPaymentIntent = async (paymentData) => {
  try {
    const response = await api.post('/payments/create-payment-intent', paymentData);
    return response.data;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
};

/**
 * Confirm payment
 * @param {Object} paymentData - Payment confirmation data
 * @returns {Promise<Object>} Payment confirmation result
 */
export const confirmPayment = async (paymentData) => {
  try {
    const response = await api.post('/payments/confirm', paymentData);
    return response.data;
  } catch (error) {
    console.error('Error confirming payment:', error);
    throw error;
  }
};

/**
 * Get user's payments
 * @param {Object} filters - Optional filters
 * @returns {Promise<Object>} Payments data with pagination
 */
export const getUserPayments = async (filters = {}) => {
  try {
    const response = await api.get('/payments/user/my-payments', { params: filters });
    return response.data;
  } catch (error) {
    console.error('Error fetching user payments:', error);
    throw error;
  }
};

// ==================== FILE UPLOADS ====================

/**
 * Upload file
 * @param {File} file - File to upload
 * @param {string} type - File type (e.g., 'pet', 'user')
 * @returns {Promise<Object>} Upload response with file URL
 */
export const uploadFile = async (file, type = 'pet') => {
  try {
    const formData = new FormData();
    formData.append('image', file);

    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

/**
 * Upload multiple files
 * @param {FileList} files - Files to upload
 * @returns {Promise<Object>} Upload response with file URLs
 */
export const uploadMultipleFiles = async (files) => {
  try {
    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('images', file);
    });

    const response = await api.post('/upload/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error uploading multiple files:', error);
    throw error;
  }
};

export default api;
