import { Link, NavLink } from "react-router-dom";
import logo from "../../assets/logo.png";
import { CiLogin, CiUser, CiSettings } from 'react-icons/ci';
import { useContext, useEffect, useState } from "react";
import { AuthContext } from '../../components/providers/AuthWrapper';
import { MdArrowDropDown, MdPets, MdDashboard, MdAddBox } from "react-icons/md";
import { HiHeart, HiUserCircle } from 'react-icons/hi';


// import icon from '../../assets/user.png';

const Navbar = ({ children }) => {
  const { user, logout } = useContext(AuthContext);
  const [theme, setTheme] = useState(localStorage.getItem("theme") ? localStorage.getItem("theme") : "light");
  const [isScrolled, setIsScrolled] = useState(false);

  // Check if the current user is the main admin
  const isMainAdmin = user?.email === 'admin@example.com';
  
  // Check if user is an admin (not necessarily the main admin)
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    localStorage.setItem("theme", theme);
    const localTheme = localStorage.getItem("theme");
    document.querySelector("html").setAttribute("data-theme", localTheme);

    // Add an event listener to handle scroll position
    window.addEventListener("scroll", handleScroll);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [theme]);

  const handleScroll = () => {
    // Check if the user has scrolled down, and set isScrolled accordingly
    if (window.scrollY > 0) {
      setIsScrolled(true);
    } else {
      setIsScrolled(false);
    }
  };
  const handleToggle=(e)=>{
        if(e.target.checked){
          setTheme("dark");
      
        }else{
          setTheme("light");
        }
      }
  const handleSignOut=()=>{
      logout()
      .then()
      .catch();
        }
  // The class to apply when the user has scrolled down
  const navbarClass = isScrolled ? "fixed top-0 left-0 right-0" : "";
  const containerClass = isScrolled ? "py-3" : ""; 
  const darkThemeClass = theme === "dark" ? "bg-gray-900" : "bg-white"; 

    const navLinks = [
      { to: "/", label: "Home" },
      { to: "/petlisting", label: "Pet Listing" },
      { to: "/donationcampaign", label: "Donations" },
      { to: "/find-shelters", label: "Find Shelters" },
      { to: "/about", label: "About Us" },
      { to: "/contact", label: "Contact" }
    ];

    const getNavLinkClassName = (isActive, isPending) => {
      if (isPending) return "pending";
      if (isActive) return "text-white font-semibold rounded-lg bg-gradient-to-r from-pink-500 to-red-500 px-4 py-2 shadow-lg hover:shadow-xl transition-all duration-300";
      return "text-gray-700 hover:text-pink-600 transition-colors duration-200 font-medium";
    };
    return (
      <div className="z-40">
        <div className={`drawer ${navbarClass}`}>
          <input id="my-drawer-3" type="checkbox" className="drawer-toggle" />
          <div className="drawer-content flex flex-col">
            <div className={`w-full ${darkThemeClass} shadow-lg border-b border-gray-200`}>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                  {/* Mobile menu button */}
                  <div className="flex lg:hidden">
                    <label
                      htmlFor="my-drawer-3"
                      aria-label="open sidebar"
                      className="btn btn-square btn-ghost text-gray-600 hover:text-gray-900"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        className="inline-block w-6 h-6 stroke-current"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M4 6h16M4 12h16M4 18h16"
                        ></path>
                      </svg>
                    </label>
                  </div>

                  {/* Logo */}
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10">
                      <img src={logo} alt="FourPaws" className="w-full h-full object-contain" />
                    </div>
                    <div className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent">
                      FourPaws
                    </div>
                  </div>

                  {/* Desktop Navigation */}
                  <div className="hidden lg:flex items-center space-x-8">
                    <ul className="flex space-x-6">
                      {navLinks.map((link, index) => (
                        <li key={index}>
                          <NavLink 
                            to={link.to} 
                            className={({ isActive, isPending }) => getNavLinkClassName(isActive, isPending)}
                          >
                            {link.label}
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Right side - User menu and actions */}
                  <div className="flex items-center space-x-4">
                    {/* User Avatar and Dropdown */}
                    {user ? (
                      <div className="dropdown dropdown-end">
                        <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
                          <div className="w-10 rounded-full ring-2 ring-pink-200 ring-offset-2 ring-offset-white">
                            <img src={user.photoURL} alt={user.name} />
                          </div>
                        </label>
                        <ul tabIndex={0} className="dropdown-content z-[1] menu p-4 shadow-lg bg-white rounded-xl w-64 border border-gray-200">
                          {/* User Info */}
                          <div className="flex flex-col items-center pb-4 border-b border-gray-100">
                            <div className="w-16 h-16 rounded-full ring-4 ring-pink-100 mb-3">
                              <img src={user.photoURL} alt={user.name} className="w-full h-full rounded-full object-cover" />
                            </div>
                            <h3 className="font-semibold text-gray-800">{user.name}</h3>
                            <p className="text-sm text-gray-500">{user.email}</p>
                            {isMainAdmin && (
                              <span className="mt-1 px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full">
                                Main Admin
                              </span>
                            )}
                          </div>
                          
                          {/* Menu Items */}
                          <div className="py-2">
                            <li>
                              <Link to='/userdashboard' className="flex items-center gap-3 py-3 px-2 hover:bg-pink-50 rounded-lg transition-colors">
                                <MdDashboard className="text-lg text-pink-600" />
                                <span className="font-medium">Dashboard</span>
                              </Link>
                            </li>
                            <li>
                              <Link to='/addpet' className="flex items-center gap-3 py-3 px-2 hover:bg-pink-50 rounded-lg transition-colors">
                                <MdAddBox className="text-lg text-pink-600" />
                                <span className="font-medium">Add Pet</span>
                              </Link>
                            </li>
                            {/* Only show My Shelters to main admin */}
                            {isMainAdmin && (
                              <li>
                                <Link to='/my-shelters' className="flex items-center gap-3 py-3 px-2 hover:bg-pink-50 rounded-lg transition-colors">
                                  <MdPets className="text-lg text-pink-600" />
                                  <span className="font-medium">My Shelters</span>
                                </Link>
                              </li>
                            )}
                            {/* Show My Campaigns to all users who can create campaigns */}
                            <li>
                              <Link to='/mydonationcamp' className="flex items-center gap-3 py-3 px-2 hover:bg-pink-50 rounded-lg transition-colors">
                                <HiHeart className="text-lg text-pink-600" />
                                <span className="font-medium">My Campaigns</span>
                              </Link>
                            </li>
                            {isAdmin && (
                              <li>
                                <Link to='/admin-dashboard' className="flex items-center gap-3 py-3 px-2 hover:bg-pink-50 rounded-lg transition-colors">
                                  <CiSettings className="text-lg text-pink-600" />
                                  <span className="font-medium">Admin Dashboard</span>
                                </Link>
                              </li>
                            )}
                            {/* Debug: Show user role */}
                            <li className="text-xs text-gray-500 py-1 px-2">
                              Role: {user.role}
                            </li>
                          </div>
                          
                          {/* Logout */}
                          <div className="pt-2 border-t border-gray-100">
                            <button 
                              onClick={handleSignOut} 
                              className="flex items-center gap-3 w-full py-3 px-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
                            >
                              <CiLogin className="text-lg" />
                              <span>Log Out</span>
                            </button>
                          </div>
                        </ul>
                      </div>
                    ) : (
                      <Link to='/login'>
                        <button className="btn bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white border-none px-6 py-2 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300">
                          <CiLogin className="mr-2" />
                          <span>Login</span>
                        </button>
                      </Link>
                    )}

                    {/* Theme Toggle */}
                    <div className="ml-2">
                      <label className="swap swap-rotate btn btn-ghost btn-circle">
                        <input type="checkbox" onChange={handleToggle} checked={theme === "dark"} />
                        {/* sun icon */}
                        <svg className="swap-on fill-current w-5 h-5 text-yellow-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                          <path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7-.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0 0,0,17.5,12,5.51,5.51,0 0,0,12,6.5Zm0,9A3.5,3.5,0 0,1,15.5,12,3.5,3.5,0 0,1,12,15.5Z"/>
                        </svg>
                        {/* moon icon */}
                        <svg className="swap-off fill-current w-5 h-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                          <path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0 0,1-3.37.73A8.15,8.15,0 0,1,9.08,5.49a8.59,8.59,0 0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0 1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0 0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z"/>
                        </svg>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Sidebar */}
          <div className="drawer-side">
            <label
              htmlFor="my-drawer-3"
              aria-label="close sidebar"
              className="drawer-overlay"
            ></label>
            <div className="menu p-6 w-80 min-h-full bg-white shadow-xl">
              {/* Mobile Logo */}
              <div className="flex items-center space-x-3 mb-8 pb-6 border-b border-gray-200">
                <div className="w-8 h-8">
                  <img src={logo} alt="FourPaws" className="w-full h-full object-contain" />
                </div>
                <div className="text-xl font-bold bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent">
                  FourPaws
                </div>
              </div>

              {/* Mobile Navigation Links */}
              <ul className="space-y-2">
                {navLinks.map((link, index) => (
                  <li key={index} className="w-full">
                    <NavLink 
                      to={link.to} 
                      className={({ isActive, isPending }) => getNavLinkClassName(isActive, isPending)}
                    >
                      {link.label}
                    </NavLink>
                  </li>
                ))}
              </ul>

              {/* Mobile User Section */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                {user ? (
                  <div className="space-y-4">
                    {/* User Info */}
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-12 h-12 rounded-full ring-2 ring-pink-200">
                        <img src={user.photoURL} alt={user.name} className="w-full h-full rounded-full object-cover" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">{user.name}</h3>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        {isMainAdmin && (
                          <span className="mt-1 px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full">
                            Main Admin
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Mobile Menu Items */}
                    <div className="space-y-2">
                      <Link to='/userdashboard' className="flex items-center gap-3 py-3 px-4 hover:bg-pink-50 rounded-lg transition-colors">
                        <MdDashboard className="text-lg text-pink-600" />
                        <span className="font-medium">Dashboard</span>
                      </Link>
                      <Link to='/addpet' className="flex items-center gap-3 py-3 px-4 hover:bg-pink-50 rounded-lg transition-colors">
                        <MdAddBox className="text-lg text-pink-600" />
                        <span className="font-medium">Add Pet</span>
                      </Link>
                      {/* Only show My Shelters to main admin */}
                      {isMainAdmin && (
                        <Link to='/my-shelters' className="flex items-center gap-3 py-3 px-4 hover:bg-pink-50 rounded-lg transition-colors">
                          <MdPets className="text-lg text-pink-600" />
                          <span className="font-medium">My Shelters</span>
                        </Link>
                      )}
                      {/* Show My Campaigns to all users who can create campaigns */}
                      <Link to='/mydonationcamp' className="flex items-center gap-3 py-3 px-4 hover:bg-pink-50 rounded-lg transition-colors">
                        <HiHeart className="text-lg text-pink-600" />
                        <span className="font-medium">My Campaigns</span>
                      </Link>
                      {isAdmin && (
                        <Link to='/admin-dashboard' className="flex items-center gap-3 py-3 px-4 hover:bg-pink-50 rounded-lg transition-colors">
                          <CiSettings className="text-lg text-pink-600" />
                          <span className="font-medium">Admin Dashboard</span>
                        </Link>
                      )}
                      {/* Debug: Show user role */}
                      <div className="text-xs text-gray-500 py-1 px-4">
                        Role: {user.role}
                      </div>
                    </div>

                    {/* Mobile Logout */}
                    <button 
                      onClick={handleSignOut} 
                      className="flex items-center gap-3 w-full py-3 px-4 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
                    >
                      <CiLogin className="text-lg" />
                      <span>Log Out</span>
                    </button>
                  </div>
                ) : (
                  <Link to='/login'>
                    <button className="btn bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white border-none w-full py-3 rounded-lg font-medium shadow-lg">
                      <CiLogin className="mr-2" />
                      <span>Login</span>
                    </button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
};

export default Navbar;