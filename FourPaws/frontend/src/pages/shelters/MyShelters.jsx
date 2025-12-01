import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { getAllShelters, updateShelter } from '../../services/shelterService';

const MyShelters = () => {
  const [shelters, setShelters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch user's shelters from localStorage
    try {
      const userShelters = getAllShelters().filter(shelter => 
        shelter.email === "mypetcare@example.com" || shelter.email === "communityshelter@example.com"
      );
      setShelters(userShelters);
    } catch (error) {
      console.error('Error loading shelters:', error);
      // Fallback to mock data if there's an error
      setShelters(mockUserShelters);
    } finally {
      setLoading(false);
    }
  }, []);

  // Mock data for user's shelters (fallback)
  const mockUserShelters = [
    {
      id: 1,
      name: "My Pet Care Center",
      location: "Delhi, India",
      services: ["Vaccination", "Neutering", "Microchipping"],
      contact: "+91 11 1234 5678",
      email: "mypetcare@example.com",
      address: "123 Main Street, Delhi, India 110001",
      status: "Active"
    },
    {
      id: 2,
      name: "Community Animal Shelter",
      location: "Mumbai, Maharashtra",
      services: ["Vaccination", "Emergency Care"],
      contact: "+91 22 9876 5432",
      email: "communityshelter@example.com",
      address: "456 Beach Road, Mumbai, Maharashtra 400001",
      status: "Active"
    }
  ];

  const handleDeactivateShelter = (shelterId, shelterName) => {
    Swal.fire({
      title: 'Deactivate Shelter?',
      text: `Are you sure you want to deactivate "${shelterName}"? You can reactivate it later.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Deactivate',
      cancelButtonText: 'Cancel',
      customClass: {
        confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        cancelButton: 'bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        try {
          // Update shelter status to "Inactive"
          const updatedShelter = updateShelter(shelterId, { status: "Inactive" });
          
          if (updatedShelter) {
            // Update local state
            setShelters(prevShelters => 
              prevShelters.map(shelter => 
                shelter.id === shelterId 
                  ? { ...shelter, status: "Inactive" } 
                  : shelter
              )
            );
            
            Swal.fire({
              title: 'Deactivated!',
              text: `"${shelterName}" has been deactivated.`,
              icon: 'success',
              confirmButtonText: 'OK',
              customClass: {
                confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
              }
            });
          } else {
            throw new Error('Failed to deactivate shelter');
          }
        } catch (error) {
          console.error('Error deactivating shelter:', error);
          Swal.fire({
            title: 'Error!',
            text: 'Failed to deactivate shelter. Please try again.',
            icon: 'error',
            confirmButtonText: 'OK',
            customClass: {
              confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
            }
          });
        }
      }
    });
  };

  const handleActivateShelter = (shelterId, shelterName) => {
    Swal.fire({
      title: 'Activate Shelter?',
      text: `Are you sure you want to activate "${shelterName}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Activate',
      cancelButtonText: 'Cancel',
      customClass: {
        confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        cancelButton: 'bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        try {
          // Update shelter status to "Active"
          const updatedShelter = updateShelter(shelterId, { status: "Active" });
          
          if (updatedShelter) {
            // Update local state
            setShelters(prevShelters => 
              prevShelters.map(shelter => 
                shelter.id === shelterId 
                  ? { ...shelter, status: "Active" } 
                  : shelter
              )
            );
            
            Swal.fire({
              title: 'Activated!',
              text: `"${shelterName}" has been activated.`,
              icon: 'success',
              confirmButtonText: 'OK',
              customClass: {
                confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
              }
            });
          } else {
            throw new Error('Failed to activate shelter');
          }
        } catch (error) {
          console.error('Error activating shelter:', error);
          Swal.fire({
            title: 'Error!',
            text: 'Failed to activate shelter. Please try again.',
            icon: 'error',
            confirmButtonText: 'OK',
            customClass: {
              confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
            }
          });
        }
      }
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-center text-gray-800 mb-6">My Shelters</h1>
          <p className="text-xl text-center text-gray-600 max-w-3xl mx-auto">
            Manage your registered shelters and rescuers
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 flex-grow">
        <div className="max-w-6xl mx-auto">
          {/* Action Bar */}
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800">Your Registered Shelters</h2>
            <Link 
              to="/add-shelter" 
              className="px-6 py-3 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Add New Shelter
            </Link>
          </div>

          {/* Shelters List */}
          {loading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading your shelters...</p>
            </div>
          ) : shelters.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {shelters.map((shelter) => (
                <div key={shelter.id} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-pink-200 transform hover:-translate-y-2">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold text-gray-800 group-hover:text-pink-600 transition-colors duration-300">{shelter.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        shelter.status === 'Active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {shelter.status}
                      </span>
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex items-start text-gray-600">
                        <svg className="w-5 h-5 text-pink-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{shelter.address}</span>
                      </div>
                      
                      <div className="flex items-start text-gray-600">
                        <svg className="w-5 h-5 text-pink-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span>{shelter.contact}</span>
                      </div>
                      
                      <div className="flex items-start text-gray-600">
                        <svg className="w-5 h-5 text-pink-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span>{shelter.email}</span>
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-800 mb-3">Services Offered:</h4>
                      <div className="flex flex-wrap gap-2">
                        {shelter.services.map((service, index) => (
                          <span 
                            key={index} 
                            className="px-3 py-1 bg-gradient-to-r from-pink-100 to-red-100 text-pink-800 text-sm font-semibold rounded-full"
                          >
                            {service}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <Link 
                        to={`/add-shelter?edit=${shelter.id}`}
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl text-center"
                      >
                        Edit
                      </Link>
                      <button 
                        onClick={() => 
                          shelter.status === 'Active' 
                            ? handleDeactivateShelter(shelter.id, shelter.name)
                            : handleActivateShelter(shelter.id, shelter.name)
                        }
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-gray-500 to-gray-700 hover:from-gray-600 hover:to-gray-800 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                      >
                        {shelter.status === 'Active' ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-gray-100">
              <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">No Shelters Registered</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                You haven't registered any shelters yet. Start by adding your first shelter.
              </p>
              <Link
                to="/add-shelter"
                className="px-6 py-3 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Add Your First Shelter
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyShelters;