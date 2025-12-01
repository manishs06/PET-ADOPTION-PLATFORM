import { useState, useContext, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import { AuthContext } from '../../components/providers/AuthWrapper';
import { addShelter, getAllShelters, updateShelter } from '../../services/shelterService';

const AddShelter = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingShelterId, setEditingShelterId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    address: '',
    contact: '',
    email: '',
    services: [],
    status: 'Active' // Add status field with default value
  });
  const [newService, setNewService] = useState('');

  // Check if we're in edit mode
  useEffect(() => {
    const editId = searchParams.get('edit');
    if (editId) {
      setIsEditMode(true);
      setEditingShelterId(editId);
      
      // Load existing shelter data
      const shelters = getAllShelters();
      const shelterToEdit = shelters.find(shelter => shelter.id == editId);
      
      if (shelterToEdit) {
        setFormData({
          name: shelterToEdit.name,
          location: shelterToEdit.location,
          address: shelterToEdit.address,
          contact: shelterToEdit.contact,
          email: shelterToEdit.email,
          services: [...shelterToEdit.services],
          status: shelterToEdit.status || 'Active' // Include status if available
        });
      }
    }
  }, [searchParams]);

  // Check if the current user is the main admin
  const isMainAdmin = user?.email === 'admin@example.com';

  // If not the main admin, show an error and redirect
  if (!isMainAdmin) {
    Swal.fire({
      icon: 'error',
      title: 'Access Denied',
      text: 'Only the main admin can add shelters.',
      confirmButtonText: 'Go Back',
      customClass: {
        confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
      }
    }).then(() => {
      navigate('/find-shelters');
    });
    return null;
  }

  const servicesOptions = [
    "Vaccination",
    "Neutering",
    "Microchipping",
    "Emergency Care",
    "Training",
    "Grooming",
    "Adoption"
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleServiceToggle = (service) => {
    setFormData(prev => {
      const services = prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service];
      
      return {
        ...prev,
        services
      };
    });
  };

  const handleAddCustomService = () => {
    if (newService.trim() && !formData.services.includes(newService.trim())) {
      setFormData(prev => ({
        ...prev,
        services: [...prev.services, newService.trim()]
      }));
      setNewService('');
    }
  };

  const handleRemoveService = (service) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.filter(s => s !== service)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.location || !formData.address || !formData.contact || !formData.email) {
      Swal.fire({
        icon: 'error',
        title: 'Missing Information',
        text: 'Please fill in all required fields',
        confirmButtonText: 'OK',
        customClass: {
          confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
        }
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Email',
        text: 'Please enter a valid email address',
        confirmButtonText: 'OK',
        customClass: {
          confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
        }
      });
      return;
    }

    try {
      if (isEditMode) {
        // Update existing shelter
        const updatedShelter = {
          id: editingShelterId, // Keep the original ID
          name: formData.name,
          location: formData.location,
          address: formData.address,
          contact: formData.contact,
          email: formData.email,
          services: formData.services,
          status: formData.status // Include status in update
        };
        
        const result = updateShelter(editingShelterId, updatedShelter);
        
        if (result) {
          Swal.fire({
            icon: 'success',
            title: 'Shelter Updated!',
            text: 'The shelter has been successfully updated.',
            confirmButtonText: 'View Shelters',
            customClass: {
              confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
            }
          }).then((result) => {
            if (result.isConfirmed) {
              navigate('/my-shelters');
            }
          });
        } else {
          throw new Error('Failed to update shelter');
        }
      } else {
        // Add new shelter
        const newShelter = {
          name: formData.name,
          location: formData.location,
          address: formData.address,
          contact: formData.contact,
          email: formData.email,
          services: formData.services,
          status: formData.status // Include status for new shelters
        };
        
        const addedShelter = addShelter(newShelter);
        
        if (addedShelter) {
          Swal.fire({
            icon: 'success',
            title: 'Shelter Added!',
            text: 'The shelter has been successfully added to the database.',
            confirmButtonText: 'View Shelters',
            customClass: {
              confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
            }
          }).then((result) => {
            if (result.isConfirmed) {
              navigate('/my-shelters');
            }
          });
        } else {
          throw new Error('Failed to add shelter');
        }
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'adding'} shelter:`, error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: `Failed to ${isEditMode ? 'update' : 'add'} shelter. Please try again.`,
        confirmButtonText: 'OK',
        customClass: {
          confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
        }
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-center text-gray-800 mb-6">
            {isEditMode ? 'Edit Shelter' : 'Add New Shelter'}
          </h1>
          <p className="text-xl text-center text-gray-600 max-w-3xl mx-auto">
            {isEditMode 
              ? 'Update shelter information to help pet owners find vaccination and neutering services' 
              : 'Add a new shelter or rescue organization to help pet owners find vaccination and neutering services'}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 flex-grow">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Shelter Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter shelter name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                    Location (City, State) *
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="e.g., Delhi, Uttar Pradesh"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Address *
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter complete address with pin code"
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="contact" className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Number *
                  </label>
                  <input
                    type="text"
                    id="contact"
                    name="contact"
                    value={formData.contact}
                    onChange={handleInputChange}
                    placeholder="e.g., +91 11 1234 5678"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="e.g., info@shelter.org"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                    required
                  />
                </div>
              </div>

              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Services Offered *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4">
                  {servicesOptions.map((service) => (
                    <div key={service} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`service-${service}`}
                        checked={formData.services.includes(service)}
                        onChange={() => handleServiceToggle(service)}
                        className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`service-${service}`} className="ml-2 text-sm text-gray-700">
                        {service}
                      </label>
                    </div>
                  ))}
                </div>

                <div className="flex mt-4">
                  <input
                    type="text"
                    value={newService}
                    onChange={(e) => setNewService(e.target.value)}
                    placeholder="Add custom service"
                    className="flex-grow px-4 py-2 border border-gray-300 rounded-l-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomService}
                    className="px-4 py-2 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white font-semibold rounded-r-xl transition-all duration-300"
                  >
                    Add
                  </button>
                </div>

                {formData.services.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Services:</h4>
                    <div className="flex flex-wrap gap-2">
                      {formData.services.map((service) => (
                        <span 
                          key={service} 
                          className="px-3 py-1 bg-gradient-to-r from-pink-100 to-red-100 text-pink-800 text-sm font-semibold rounded-full flex items-center"
                        >
                          {service}
                          <button
                            type="button"
                            onClick={() => handleRemoveService(service)}
                            className="ml-2 text-pink-600 hover:text-pink-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => navigate('/my-shelters')}
                  className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-700 hover:from-gray-600 hover:to-gray-800 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  {isEditMode ? 'Update Shelter' : 'Add Shelter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddShelter;