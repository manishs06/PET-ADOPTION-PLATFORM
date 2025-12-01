import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/logo.png';
import { MdEmail, MdPhone, MdLocationOn } from 'react-icons/md';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaHeart } from 'react-icons/fa';

const Footer = () => {
    return (
        <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
            {/* Main Footer Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Company Info */}
                    <div className="lg:col-span-1">
                        <div className="flex items-center space-x-2 mb-3">
                            <div className="w-8 h-8">
                                <img src={logo} alt="FourPaws" className="w-full h-full object-contain" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold bg-gradient-to-r from-pink-400 to-red-400 bg-clip-text text-transparent">
                                    FourPaws
                                </h3>
                                <p className="text-xs text-gray-400">Helping Friends of Pets</p>
                            </div>
                        </div>
                        <p className="text-gray-300 mb-3 text-xs leading-relaxed">
                            Connecting loving families with pets in need. Every adoption is a story of hope, 
                            love, and second chances. Join us in making a difference, one pet at a time.
                        </p>
                        <div className="flex space-x-2">
                            <a href="#" className="w-7 h-7 bg-pink-600 hover:bg-pink-700 rounded-full flex items-center justify-center transition-colors duration-300">
                                <FaFacebook className="text-white text-xs" />
                            </a>
                            <a href="#" className="w-7 h-7 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transition-colors duration-300">
                                <FaTwitter className="text-white text-xs" />
                            </a>
                            <a href="#" className="w-7 h-7 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-full flex items-center justify-center transition-colors duration-300">
                                <FaInstagram className="text-white text-xs" />
                            </a>
                            <a href="#" className="w-7 h-7 bg-blue-700 hover:bg-blue-800 rounded-full flex items-center justify-center transition-colors duration-300">
                                <FaLinkedin className="text-white text-xs" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-sm font-semibold mb-3 text-white">Quick Links</h4>
                        <ul className="space-y-1">
                            <li>
                                <Link to="/" className="text-gray-300 hover:text-pink-400 transition-colors duration-300 text-xs">
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link to="/petlisting" className="text-gray-300 hover:text-pink-400 transition-colors duration-300 text-xs">
                                    Pet Listing
                                </Link>
                            </li>
                            <li>
                                <Link to="/donationcampaign" className="text-gray-300 hover:text-pink-400 transition-colors duration-300 text-xs">
                                    Donations
                                </Link>
                            </li>
                            <li>
                                <Link to="/about" className="text-gray-300 hover:text-pink-400 transition-colors duration-300 text-xs">
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link to="/contact" className="text-gray-300 hover:text-pink-400 transition-colors duration-300 text-xs">
                                    Contact
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Pet Categories */}
                    <div>
                        <h4 className="text-sm font-semibold mb-3 text-white">Pet Categories</h4>
                        <ul className="space-y-1">
                            <li>
                                <Link to="/petlisting?category=dogs" className="text-gray-300 hover:text-pink-400 transition-colors duration-300 text-xs">
                                    Dogs
                                </Link>
                            </li>
                            <li>
                                <Link to="/petlisting?category=cats" className="text-gray-300 hover:text-pink-400 transition-colors duration-300 text-xs">
                                    Cats
                                </Link>
                            </li>
                            <li>
                                <Link to="/petlisting?category=birds" className="text-gray-300 hover:text-pink-400 transition-colors duration-300 text-xs">
                                    Birds
                                </Link>
                            </li>
                            <li>
                                <Link to="/petlisting?category=fish" className="text-gray-300 hover:text-pink-400 transition-colors duration-300 text-xs">
                                    Fish
                                </Link>
                            </li>
                            <li>
                                <Link to="/petlisting?category=rabbits" className="text-gray-300 hover:text-pink-400 transition-colors duration-300 text-xs">
                                    Rabbits
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="text-sm font-semibold mb-3 text-white">Contact Info</h4>
                        <div className="space-y-2">
                            <div className="flex items-start space-x-2">
                                <MdLocationOn className="text-pink-400 text-sm mt-0.5" />
                                <span className="text-gray-300 text-xs">123 Pet Street, Animal City, AC 12345</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <MdPhone className="text-pink-400 text-sm" />
                                <span className="text-gray-300 text-xs">+1 (555) 123-4567</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <MdEmail className="text-pink-400 text-sm" />
                                <span className="text-gray-300 text-xs">info@fourpaws.com</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Footer */}
            <div className="border-t border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="text-gray-400 text-xs mb-3 md:mb-0">
                            {/* Copyright line removed */}
                        </div>
                        <div className="flex space-x-4 text-xs">
                            {/* Policy links removed */}
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;