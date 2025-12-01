import React from 'react';
import { Link } from 'react-router-dom';

const AboutUs = () => {
  return (
    <div className="min-h-screen flex flex-col">
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-center text-gray-800 mb-6">About FourPaws</h1>
          <p className="text-xl text-center text-gray-600 max-w-3xl mx-auto">
            Connecting loving homes with pets in need since 2023
          </p>
        </div>
      </div>

      {/* Our Story */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Our Story</h2>
            <div className="prose prose-lg text-gray-600">
              <p className="mb-4">
                FourPaws was founded with a simple mission: to make pet adoption easier, more accessible, and more transparent. 
                We believe that every pet deserves a loving home, and every person deserves the joy that comes from adopting a pet.
              </p>
              <p className="mb-4">
                Our platform connects potential pet parents with shelters, rescues, and individual pet owners looking to rehome their pets. 
                We provide the tools and resources needed to make the adoption process smooth and successful for everyone involved.
              </p>
              <p>
                Since our inception, we've helped thousands of pets find their forever homes, and we're just getting started.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="py-16 bg-indigo-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Adopt a Pet?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Browse our available pets and find your new best friend today.
          </p>
          <Link 
            to="/petlisting" 
            className="inline-block bg-white text-indigo-600 font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors"
          >
            View Pets
          </Link>
        </div>
      </div>

      </div>
  );
};

export default AboutUs;
