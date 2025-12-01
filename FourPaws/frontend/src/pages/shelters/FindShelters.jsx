import { useState, useEffect } from 'react';
import { getAllShelters } from '../../services/shelterService';

const FindShelters = () => {
  const [location, setLocation] = useState('');
  const [shelters, setShelters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load all shelters when component mounts
  useEffect(() => {
    const loadShelters = () => {
      try {
        const allShelters = getAllShelters();
        setShelters(allShelters);
      } catch (err) {
        console.error('Error loading shelters:', err);
        setError('Failed to load shelters');
      }
    };
    
    loadShelters();
  }, []);

  const handleSearch = () => {
    if (!location.trim()) {
      setError('Please enter a location');
      return;
    }

    setLoading(true);
    setError('');
    
    // Simulate API call delay
    setTimeout(() => {
      try {
        // Get all shelters from the service
        const allShelters = getAllShelters();
        
        // Filter shelters based on location
        const filteredShelters = allShelters.filter(shelter => 
          shelter.location.toLowerCase().includes(location.toLowerCase()) ||
          shelter.address.toLowerCase().includes(location.toLowerCase())
        );
        
        setShelters(filteredShelters);
        setLoading(false);
        
        if (filteredShelters.length === 0) {
          setError('No shelters found in this area. Try a different location.');
        }
      } catch (err) {
        console.error('Error searching shelters:', err);
        setError('Failed to search shelters');
        setLoading(false);
      }
    }, 800);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Function to show all shelters
  const showAllSheltersHandler = () => {
    try {
      const allShelters = getAllShelters();
      setShelters(allShelters);
      setLocation('');
      setError('');
    } catch (err) {
      console.error('Error loading all shelters:', err);
      setError('Failed to load shelters');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-center text-gray-800 mb-6">Find Shelters & Rescuers</h1>
          <p className="text-xl text-center text-gray-600 max-w-3xl mx-auto">
            Locate nearby shelters and rescuers where you can get your pet vaccinated or neutered
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 flex-grow">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-grow">
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                  Enter your location
                </label>
                <input
                  type="text"
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="City, State or Pin Code"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                />
              </div>
              <div className="flex items-end gap-2">
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50"
                >
                  {loading ? 'Searching...' : 'Find Shelters'}
                </button>
                <button
                  onClick={showAllSheltersHandler}
                  className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-700 hover:from-gray-600 hover:to-gray-800 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Show All
                </button>
              </div>
            </div>
            {error && (
              <div className="mt-4 text-red-600 text-center">
                {error}
              </div>
            )}
          </div>

          {/* Popular Locations Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Popular Locations</h2>
            <div className="flex flex-wrap gap-3">
              {['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Bareilly', 'Shahjahanpur', 'Jaipur', 'Lucknow', 'Varanasi'].map((city) => (
                <button
                  key={city}
                  onClick={() => {
                    setLocation(city);
                    // Simulate search for this city
                    try {
                      const allShelters = getAllShelters();
                      const filteredShelters = allShelters.filter(shelter => 
                        shelter.location.toLowerCase().includes(city.toLowerCase())
                      );
                      setShelters(filteredShelters);
                    } catch (err) {
                      console.error('Error filtering shelters:', err);
                      setError('Failed to filter shelters');
                    }
                  }}
                  className="px-5 py-2 bg-gradient-to-r from-pink-100 to-red-100 text-pink-800 font-semibold rounded-full hover:from-pink-200 hover:to-red-200 transition-all duration-300"
                >
                  {city}
                </button>
              ))}
            </div>
          </div>

          {/* Shelters Section */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-800">
                {location ? `Shelters & Rescuers near ${location}` : 'All Shelters & Rescuers'}
              </h2>
              <span className="text-gray-600 bg-gray-100 px-3 py-1 rounded-full">{shelters.length} locations found</span>
            </div>
            {shelters.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {shelters.map((shelter) => (
                  <div key={shelter.id} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-pink-200 transform hover:-translate-y-2">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-bold text-gray-800 group-hover:text-pink-600 transition-colors duration-300">{shelter.name}</h3>
                        <span className="text-sm bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{shelter.distance}</span>
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
                        <button 
                          onClick={() => {
                            // Open Google Maps with the shelter address
                            const encodedAddress = encodeURIComponent(shelter.address);
                            window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
                          }}
                          className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                          Get Directions
                        </button>
                        <button 
                          onClick={() => {
                            // Open email client with pre-filled email
                            window.open(`mailto:${shelter.email}`, '_blank');
                          }}
                          className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                          Contact
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
                <h3 className="text-2xl font-bold text-gray-800 mb-2">No Shelters Found</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  {error || 'Try searching for a different location or click "Show All" to see all shelters.'}
                </p>
                <button
                  onClick={showAllSheltersHandler}
                  className="px-6 py-3 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Show All Shelters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FindShelters;