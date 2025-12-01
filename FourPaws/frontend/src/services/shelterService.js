// Shelter data service to manage shelters across components
const SHELTER_STORAGE_KEY = 'fourpaws_shelters';

// Default shelters data
const defaultShelters = [
  {
    id: 1,
    name: "Mumbai Animal Care Center",
    location: "Mumbai, Maharashtra",
    services: ["Vaccination", "Neutering", "Microchipping"],
    contact: "+91 22 1234 5678",
    email: "info@mumbaicare.org",
    address: "123 Marine Drive, Mumbai, Maharashtra 400020",
    distance: "2.5 km",
    status: "Active"
  },
  {
    id: 2,
    name: "Delhi Pet Rescue Foundation",
    location: "Delhi",
    services: ["Vaccination", "Neutering"],
    contact: "+91 11 9876 5432",
    email: "help@delhipetrescue.org",
    address: "456 Nehru Place, Delhi 110019",
    distance: "3.2 km",
    status: "Active"
  },
  {
    id: 3,
    name: "Bangalore Animal Welfare Society",
    location: "Bangalore, Karnataka",
    services: ["Vaccination", "Neutering", "Microchipping", "Training"],
    contact: "+91 80 2345 6789",
    email: "care@bawsonline.org",
    address: "789 MG Road, Bangalore, Karnataka 560001",
    distance: "5.1 km",
    status: "Active"
  },
  {
    id: 4,
    name: "Chennai Veterinary Clinic",
    location: "Chennai, Tamil Nadu",
    services: ["Vaccination", "Neutering", "Emergency Care"],
    contact: "+91 44 3456 7890",
    email: "appointments@chennaivet.com",
    address: "321 Anna Salai, Chennai, Tamil Nadu 600002",
    distance: "1.8 km",
    status: "Active"
  },
  {
    id: 5,
    name: "Kolkata Animal Shelter",
    location: "Kolkata, West Bengal",
    services: ["Vaccination", "Neutering", "Adoption"],
    contact: "+91 33 4567 8901",
    email: "adopt@kolkatashelter.org",
    address: "555 Park Street, Kolkata, West Bengal 700016",
    distance: "0.9 km",
    status: "Active"
  },
  {
    id: 6,
    name: "Hyderabad Pet Care Center",
    location: "Hyderabad, Telangana",
    services: ["Vaccination", "Neutering", "Grooming"],
    contact: "+91 40 5678 9012",
    email: "care@hyderabadpetcare.com",
    address: "777 Banjara Hills, Hyderabad, Telangana 500034",
    distance: "4.3 km",
    status: "Active"
  },
  {
    id: 7,
    name: "Bareilly Animal Welfare Center",
    location: "Bareilly, Uttar Pradesh",
    services: ["Vaccination", "Neutering", "Microchipping"],
    contact: "+91 581 234 5678",
    email: "info@bareillyawc.org",
    address: "12 Civil Lines, Bareilly, Uttar Pradesh 243001",
    distance: "1.2 km",
    status: "Active"
  },
  {
    id: 8,
    name: "Shahjahanpur Pet Care Clinic",
    location: "Shahjahanpur, Uttar Pradesh",
    services: ["Vaccination", "Neutering"],
    contact: "+91 5842 234 567",
    email: "care@shahjahanpurpets.org",
    address: "45 Cantt Road, Shahjahanpur, Uttar Pradesh 242001",
    distance: "0.8 km",
    status: "Active"
  },
  {
    id: 9,
    name: "Jaipur Animal Rescue Foundation",
    location: "Jaipur, Rajasthan",
    services: ["Vaccination", "Neutering", "Emergency Care"],
    contact: "+91 141 234 5678",
    email: "rescue@jaipuranimals.org",
    address: "78 MI Road, Jaipur, Rajasthan 302001",
    distance: "2.1 km",
    status: "Active"
  },
  {
    id: 10,
    name: "Lucknow Veterinary Hospital",
    location: "Lucknow, Uttar Pradesh",
    services: ["Vaccination", "Neutering", "Microchipping", "Training"],
    contact: "+91 522 234 5678",
    email: "hospital@lucknowvet.com",
    address: "156 Hazratganj, Lucknow, Uttar Pradesh 226001",
    distance: "1.5 km",
    status: "Active"
  },
  {
    id: 11,
    name: "Varanasi Animal Shelter",
    location: "Varanasi, Uttar Pradesh",
    services: ["Vaccination", "Neutering", "Adoption"],
    contact: "+91 542 234 5678",
    email: "shelter@varanasianimals.org",
    address: "32 Godaulia, Varanasi, Uttar Pradesh 221001",
    distance: "0.7 km",
    status: "Active"
  }
];

// Initialize with default shelters if no data exists
const initializeShelters = () => {
  try {
    const storedShelters = localStorage.getItem(SHELTER_STORAGE_KEY);
    if (!storedShelters) {
      localStorage.setItem(SHELTER_STORAGE_KEY, JSON.stringify(defaultShelters));
    }
  } catch (error) {
    console.error('Error initializing shelters:', error);
  }
};

// Initialize on first import
initializeShelters();

// Get all shelters from localStorage or use default
export const getAllShelters = () => {
  try {
    const storedShelters = localStorage.getItem(SHELTER_STORAGE_KEY);
    if (storedShelters) {
      return JSON.parse(storedShelters);
    }
    // If no stored data for some reason, return default
    return defaultShelters;
  } catch (error) {
    console.error('Error loading shelters:', error);
    return defaultShelters;
  }
};

// Add a new shelter
export const addShelter = (shelter) => {
  try {
    const shelters = getAllShelters();
    // Generate a new ID (use timestamp to ensure uniqueness)
    const newId = Date.now();
    const newShelter = {
      ...shelter,
      id: newId,
      distance: "N/A", // Distance would be calculated in a real app
      status: "Active" // New shelters are active by default
    };
    const updatedShelters = [...shelters, newShelter];
    localStorage.setItem(SHELTER_STORAGE_KEY, JSON.stringify(updatedShelters));
    return newShelter;
  } catch (error) {
    console.error('Error adding shelter:', error);
    return null;
  }
};

// Remove a shelter by ID
export const removeShelter = (shelterId) => {
  try {
    const shelters = getAllShelters();
    const updatedShelters = shelters.filter(shelter => shelter.id !== shelterId);
    localStorage.setItem(SHELTER_STORAGE_KEY, JSON.stringify(updatedShelters));
    return updatedShelters;
  } catch (error) {
    console.error('Error removing shelter:', error);
    return null;
  }
};

// Update a shelter
export const updateShelter = (shelterId, updatedData) => {
  try {
    const shelters = getAllShelters();
    const updatedShelters = shelters.map(shelter => 
      shelter.id === shelterId ? { ...shelter, ...updatedData } : shelter
    );
    localStorage.setItem(SHELTER_STORAGE_KEY, JSON.stringify(updatedShelters));
    return updatedShelters.find(shelter => shelter.id === shelterId);
  } catch (error) {
    console.error('Error updating shelter:', error);
    return null;
  }
};