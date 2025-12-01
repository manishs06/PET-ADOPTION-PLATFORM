import { NavLink } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../components/providers/AuthWrapper';
import useAxiosPublic from '../../hooks/useAxiosPublic';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import useAdmin from '../../hooks/useAdmin';
import logo from "../../assets/logo.png";
import { getAllShelters } from '../../services/shelterService';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activePets: 0,
    totalCampaigns: 0,
    totalShelters: 0,
    vaccinatedPets: 0,
    neuteredPets: 0
  });
  const { user } = useContext(AuthContext);
  const [isAdmin, isAdminLoading] = useAdmin();
  const axiosPublic = useAxiosPublic();
  const axiosSecure = useAxiosSecure();

  // Check if the current user is the main admin
  const isMainAdmin = user?.email === 'admin@example.com';

  // Fetch statistics
  useEffect(() => {
    const fetchStats = async () => {
      let totalUsers = 0;
      let activePets = 0;
      let totalCampaigns = 0;
      let totalShelters = 0;
      let vaccinatedPets = 0;
      let neuteredPets = 0;
      
      try {
        // Fetch user statistics (requires authentication)
        try {
          const userStatsResponse = await axiosSecure.get('/users/stats/overview');
          totalUsers = userStatsResponse.data.data.totalUsers || 0;
        } catch (error) {
          console.error('Error fetching user stats:', error);
        }
        
        // Fetch pet count and health statistics
        try {
          // First get the total count of pets
          let countResponse;
          try {
            countResponse = await axiosSecure.get('/pets?limit=1');
          } catch (secureError) {
            countResponse = await axiosPublic.get('/pets?limit=1');
          }
          
          activePets = countResponse.data.pagination?.total || 0;
          
          // If we have pets, fetch them in smaller batches to count vaccinated/neutered
          if (activePets > 0) {
            // Use the maximum allowed limit (50) and fetch in batches if needed
            const limit = 50;
            const totalPages = Math.ceil(activePets / limit);
            let allPets = [];
            
            // Fetch pets in batches (limit to 10 pages max to avoid performance issues)
            const pagesToFetch = Math.min(totalPages, 10);
            for (let page = 1; page <= pagesToFetch; page++) {
              try {
                let petsResponse;
                try {
                  petsResponse = await axiosSecure.get('/pets', {
                    params: {
                      page: page,
                      limit: limit
                    }
                  });
                } catch (secureError) {
                  petsResponse = await axiosPublic.get('/pets', {
                    params: {
                      page: page,
                      limit: limit
                    }
                  });
                }
                
                if (petsResponse.data?.data && Array.isArray(petsResponse.data.data)) {
                  allPets = [...allPets, ...petsResponse.data.data];
                }
              } catch (batchError) {
                console.error(`Error fetching pet batch ${page}:`, batchError);
                // Continue with next batch instead of breaking
              }
            }
            
            // Count vaccinated and neutered pets
            let vaccCount = 0;
            let neutCount = 0;
            
            allPets.forEach((pet) => {
              // Count vaccinated pets
              if (pet.vaccinated === true) {
                vaccCount++;
              }
              
              // Count neutered pets
              if (pet.spayedNeutered === true) {
                neutCount++;
              }
            });
            
            vaccinatedPets = vaccCount;
            neuteredPets = neutCount;
          }
        } catch (error) {
          console.error('Error fetching pet stats:', error);
        }
        
        // Fetch donation campaigns count (public endpoint)
        try {
          const donationsResponse = await axiosPublic.get('/donations?limit=1');
          totalCampaigns = donationsResponse.data.pagination?.total || 0;
        } catch (error) {
          console.error('Error fetching donation stats:', error);
        }
        
        // Fetch shelters count
        try {
          const shelters = getAllShelters();
          totalShelters = shelters.length;
        } catch (error) {
          console.error('Error fetching shelter stats:', error);
        }
      } catch (error) {
        console.error('Error in fetchStats:', error);
      } finally {
        // Always set the stats, even if some values are 0
        setStats({
          totalUsers,
          activePets,
          totalCampaigns,
          totalShelters,
          vaccinatedPets,
          neuteredPets
        });
        setLoading(false);
      }
    };

    // Fetch stats when admin status is confirmed
    if (!isAdminLoading && isAdmin) {
      fetchStats();
    } else if (!isAdminLoading) {
      // Not admin and loading is complete
      setLoading(false);
    }
  }, [isAdmin, isAdminLoading, axiosPublic, axiosSecure]);

  if (loading || isAdminLoading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  // If not admin, redirect to home (this should be handled by AdminRoute, but just in case)
  if (!isAdmin) {
    window.location.href = '/';
    return null;
  }

  const navLinks = (
    <>
      <div className="flex flex-col items-center mb-5">
        <div className=" bg-white rounded-full p-5 w-24"> <img src={logo} alt="" /></div>
        <div className="  text-2xl font-bold ">FourPaws</div>
      </div>
      
      {/* Admin Management Section */}
      <li className="menu-title text-white mt-4">
        <span>ADMIN MANAGEMENT</span>
      </li>
      <li>
        <NavLink
          to="/allusers"
          className={({ isActive, isPending }) =>
            isPending
              ? "pending text-white"
              : isActive
                ? "text-warning  text-lg font-bold underline underline-offset-8 hover:text-red  "
                : ""
          }
        >
          All Users
        </NavLink>
      </li>
      <li>
        <NavLink
          to="/allpetsadmin"
          className={({ isActive, isPending }) =>
            isPending
              ? "pending text-white"
              : isActive
                ? "text-warning font-bold underline underline-offset-8 hover:text-red  "
                : ""
          }
        >
          All Pets
        </NavLink>
      </li>
      <li>
        <NavLink
          to="/alldonationcampadmin"
          className={({ isActive, isPending }) =>
            isPending
              ? "pending text-white"
              : isActive
                ? "text-warning font-bold underline underline-offset-8 hover:text-red  "
                : ""
          }
        >
          All Donation Campaigns
        </NavLink>
      </li>
      
      {/* User Functions Section */}
      <li className="menu-title text-white mt-6">
        <span>MY FUNCTIONS</span>
      </li>
      <li><NavLink to="/addpet" className={({ isActive, isPending }) =>
        isPending ? "pending  text-white" : isActive ? "text-warning  font-bold underline underline-offset-8 hover:text-red  " : ""
      }>Add a Pet</NavLink></li>
      <li><NavLink to="/myaddedpets" className={({ isActive, isPending }) =>
        isPending ? "pending  text-white" : isActive ? "text-warning font-bold  underline underline-offset-8 hover:text-red  " : ""
      }>My Added Pets</NavLink></li>
      <li><NavLink to="/adoptionreq" className={({ isActive, isPending }) =>
        isPending ? "pending text-white" : isActive ? "text-warning font-bold  underline underline-offset-8 hover:text-red  " : ""
      }>Adoption Requests (Received)</NavLink></li>
      <li><NavLink to="/myadoptionrequests" className={({ isActive, isPending }) =>
        isPending ? "pending text-white" : isActive ? "text-warning font-bold  underline underline-offset-8 hover:text-red  " : ""
      }>My Adoption Requests (Sent)</NavLink></li>
      <li><NavLink to="/createdonationcamp" className={({ isActive, isPending }) =>
        isPending ? "pending text-white" : isActive ? "text-warning font-bold  underline underline-offset-8 hover:text-red  " : ""
      }>Create Donation Campaign</NavLink></li>
      <li><NavLink to="/mydonationcamp" className={({ isActive, isPending }) =>
        isPending ? "pending text-white" : isActive ? "text-warning font-bold  underline underline-offset-8 hover:text-red  " : ""
      }>My Donation Campaigns</NavLink></li>
      <li><NavLink to="/mydonation" className={({ isActive, isPending }) =>
        isPending ? "pending text-white" : isActive ? "text-warning font-bold  underline underline-offset-8 hover:text-red  " : ""
      }>My Donations</NavLink></li>
      
      {/* Shelter Management (Main Admin Only) */}
      {isMainAdmin && (
        <>
          <li className="menu-title text-white mt-6">
            <span>SHELTER MANAGEMENT</span>
          </li>
          <li><NavLink to="/add-shelter" className={({ isActive, isPending }) =>
            isPending ? "pending text-white" : isActive ? "text-warning font-bold  underline underline-offset-8 hover:text-red  " : ""
          }>Add Shelter</NavLink></li>
          <li><NavLink to="/my-shelters" className={({ isActive, isPending }) =>
            isPending ? "pending text-white" : isActive ? "text-warning font-bold  underline underline-offset-8 hover:text-red  " : ""
          }>Manage Shelters</NavLink></li>
        </>
      )}
      
      <hr />
      <li className="pt-4 "><NavLink to="/" className={({ isActive, isPending }) =>
        isPending ? "pending  text-white" : isActive ? "text-warning font-bold  underline underline-offset-8  hover:text-red " : ""
      }>Home</NavLink></li>
    </>
  );

  const adminCards = [
    {
      title: "Users",
      description: "Manage users and roles",
      link: "/allusers",
      icon: "👥",
      color: "bg-blue-500"
    },
    {
      title: "Pets",
      description: "Manage pets and adoptions",
      link: "/allpetsadmin",
      icon: "🐾",
      color: "bg-green-500"
    },
    {
      title: "Donations",
      description: "Manage donation campaigns",
      link: "/alldonationcampadmin",
      icon: "💝",
      color: "bg-purple-500"
    }
  ];

  // Add Manage Shelters card for main admin (instead of the duplicate Shelters card)
  if (isMainAdmin) {
    adminCards.push({
      title: "Manage Shelters",
      description: "Add or remove shelters",
      link: "/manage-shelters",
      icon: "🏥",
      color: "bg-pink-500"
    });
  }

  return (
    <div className='grid grid-cols-4 pt-14'>
      <div className=' min-h-[100vh] bg-[#D52B5C] col-span-1 hidden lg:flex'>
        <ul className="menu mt-6 z-[1] p-2 dropdown-content  text-white   ">
          {navLinks}
        </ul>
      </div>

      <div className=' min-h-[100vh] bg-pink-100 lg:col-span-3 col-span-4 '>
        <div className="dropdown absolute mt-10">
          <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" /></svg>
          </div>
          <ul className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
            {navLinks}
          </ul>
        </div>
        <div className=' h-40 bg-warning py-10 '>
          <p className='border-y-2 w-4/12 mx-auto text-3xl  font-bold text-center '>Admin Dashboard</p>
        </div>

        {/* Welcome Section */}
        <div className="mb-8 p-6">
          <h2 className="text-xl text-gray-700">Welcome back, {user?.name || 'Admin'}</h2>
          {isMainAdmin && (
            <p className="text-gray-600 mt-1">Main Administrator - Full access to all features</p>
          )}
          {!isMainAdmin && (
            <p className="text-gray-600 mt-1">Manage your pet adoption platform</p>
          )}
        </div>

        {/* Admin Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-6">
          {adminCards.map((card, index) => (
            <NavLink
              key={index}
              to={card.link}
              className="block bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-6">
                <div className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center text-white text-xl mb-4`}>
                  {card.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{card.title}</h3>
                <p className="text-gray-600 text-sm">{card.description}</p>
              </div>
            </NavLink>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6 mx-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">{stats.totalUsers}</div>
              <div className="text-sm text-gray-600 mt-2">Total Users</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600">{stats.activePets}</div>
              <div className="text-sm text-gray-600 mt-2">Active Pets</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-3xl font-bold text-purple-600">{stats.totalCampaigns}</div>
              <div className="text-sm text-gray-600 mt-2">Campaigns</div>
            </div>
            <div className="text-center p-4 bg-pink-50 rounded-lg">
              <div className="text-3xl font-bold text-pink-600">{stats.totalShelters}</div>
              <div className="text-sm text-gray-600 mt-2">Shelters</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-3xl font-bold text-yellow-600">{stats.vaccinatedPets}</div>
              <div className="text-sm text-gray-600 mt-2">Vaccinated Pets</div>
            </div>
            <div className="text-center p-4 bg-indigo-50 rounded-lg">
              <div className="text-3xl font-bold text-indigo-600">{stats.neuteredPets}</div>
              <div className="text-sm text-gray-600 mt-2">Neutered Pets</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;