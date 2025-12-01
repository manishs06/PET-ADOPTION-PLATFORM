/* eslint-disable react/prop-types */

import { Link } from "react-router-dom";
import { getDefaultPetImage } from "../../utils/petImageDefaults";

const PetListingCard = ({ pet }) => {
  const { _id, images, name, age, location, category, type, addedDate, gender, breed, adoptionFee } = pet;
  
  // Handle image URL with better fallback logic
  const getImageUrl = () => {
    // First, try to get image from images array
    if (images && Array.isArray(images) && images.length > 0 && images[0]) {
      return images[0];
    }
    
    // Fallback to default image based on category or type
    return getDefaultPetImage(category || type);
  };
  
  const imageUrl = getImageUrl();
  
  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-pink-200 transform hover:-translate-y-2">
      {/* Image Section */}
      <div className="relative h-64 overflow-hidden">
        <img 
          src={imageUrl} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
          alt={name || 'Pet'}
          onError={(e) => {
            // If the image fails to load, try the default image
            if (e.target.src !== getDefaultPetImage(category || type)) {
              e.target.onerror = null;
              e.target.src = getDefaultPetImage(category || type);
            }
          }} 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Category Badge */}
        {category && (
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
            <span className="text-sm font-semibold text-gray-700 capitalize">{category}</span>
          </div>
        )}
        
        {/* Gender Badge */}
        {gender && (
          <div className={`absolute top-4 right-4 rounded-full px-3 py-1 text-sm font-semibold ${
            gender.toLowerCase() === 'male' 
              ? 'bg-blue-100 text-blue-800' 
              : 'bg-pink-100 text-pink-800'
          }`}>
            {gender}
          </div>
        )}
      </div>
      
      {/* Content Section */}
      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-pink-600 transition-colors duration-300">
            {name || 'Unnamed Pet'}
          </h3>
          {breed && (
            <p className="text-sm text-gray-600 mb-2">
              <span className="font-medium">Breed:</span> {breed}
            </p>
          )}
        </div>
        
        {/* Pet Details */}
        <div className="space-y-2 mb-6">
          <div className="flex items-center text-gray-600">
            <svg className="w-4 h-4 mr-2 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
            </svg>
            <span className="text-sm"><span className="font-medium">Age:</span> {age || 'Unknown'} years old</span>
          </div>
          
          <div className="flex items-center text-gray-600">
            <svg className="w-4 h-4 mr-2 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-sm"><span className="font-medium">Location:</span> {location || 'Not specified'}</span>
          </div>
          
          {/* Adoption Fee Display */}
          {adoptionFee && adoptionFee > 0 && (
            <div className="flex items-center text-gray-600">
              <svg className="w-4 h-4 mr-2 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              <span className="text-sm">
                <span className="font-medium">Adoption Fee:</span> ₹{parseFloat(adoptionFee).toFixed(2)}
              </span>
            </div>
          )}
          
          {addedDate && (
            <div className="flex items-center text-gray-500">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs">Added {new Date(addedDate).toLocaleDateString()}</span>
            </div>
          )}
          
          {/* Vaccination Status */}
          {pet.vaccinated !== undefined && (
            <div className="flex items-center text-gray-600">
              <svg className={`w-4 h-4 mr-2 ${pet.vaccinated ? 'text-green-500' : 'text-red-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm">
                <span className="font-medium">Vaccinated:</span> {pet.vaccinated ? 'Yes' : 'No'}
              </span>
            </div>
          )}
          
          {/* Neutering Status */}
          {pet.spayedNeutered !== undefined && (
            <div className="flex items-center text-gray-600">
              <svg className={`w-4 h-4 mr-2 ${pet.spayedNeutered ? 'text-green-500' : 'text-red-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm">
                <span className="font-medium">Spayed/Neutered:</span> {pet.spayedNeutered ? 'Yes' : 'No'}
              </span>
            </div>
          )}
        </div>
        
        {/* Action Button */}
        <Link 
          to={`../adoptpet/${_id}`} 
          className="block w-full text-center bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          View Details & Adopt
        </Link>
      </div>
    </div>
  );
};

export default PetListingCard;