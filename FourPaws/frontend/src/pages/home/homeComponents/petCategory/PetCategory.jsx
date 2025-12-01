import { Link } from "react-router-dom";
import PropTypes from 'prop-types';

const PetCategory = ({ card }) => {
    const { _id, category, image, icon, petCount = 0 } = card;
    
    return (
        <div className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-pink-200 transform hover:-translate-y-2">
            <div className="relative h-56 overflow-hidden">
                <img 
                    src={image || `https://placehold.co/600x400?text=${encodeURIComponent(category)}`} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                    alt={category}
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://placehold.co/600x400?text=${encodeURIComponent(category)}`;
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                {icon && (
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-3 text-3xl shadow-lg">
                        {icon}
                    </div>
                )}
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                    <span className="text-sm font-semibold text-gray-700">{petCount} available</span>
                </div>
            </div>
            
            <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-pink-600 transition-colors duration-300">
                    {category}
                </h3>
                <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                    Discover amazing {category.toLowerCase()} waiting for their forever homes
                </p>
                
                <Link 
                    to={`/petlisting?category=${encodeURIComponent(category.toLowerCase())}`}
                    className="block w-full text-center bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                    Browse {category}
                </Link>
            </div>
        </div>
    );
};

PetCategory.propTypes = {
    card: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        category: PropTypes.string.isRequired,
        image: PropTypes.string,
        icon: PropTypes.string,
        petCount: PropTypes.number
    }).isRequired
};

export default PetCategory;
