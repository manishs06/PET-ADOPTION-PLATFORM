import { NavLink, useNavigate } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import logo from "../../assets/logo.png";
import { AuthContext } from '../../components/providers/AuthWrapper';
import useAxiosSecure from '../../hooks/useAxiosSecure';

// Import utility functions for fetching user data
import { getUserDonationCampaigns } from '../../utils/api';
import { getUserDonations } from '../../utils/api';

const UserDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    petsAdded: 0,
    adoptionRequests: 0,
    donationCampaigns: 0,
    donationsMade: 0
  });
  const { user } = useContext(AuthContext);
  const [isAdmin, setIsAdmin] = useState(false);
  const axiosSecure = useAxiosSecure();
  const navigate = useNavigate();

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        // Use the AuthContext isAdmin function for consistency
        const adminStatus = user?.role === 'admin' || user?.role === 'Admin';
        setIsAdmin(adminStatus);
      } catch (error) {
        console.error('Error checking user role:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      checkUserRole();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Fetch user statistics
  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        // Fetch adoption requests received for user's own pets (where user is the owner)
        let adoptionRequestsCount = 0;
        if (user?.email) {
          try {
            const response = await axiosSecure.get(`/adoption-requests/owner/${encodeURIComponent(user.email)}`);
            console.log('Adoption Requests Data (as owner):', response.data); // Debug log
            adoptionRequestsCount = response.data?.data?.length || 0;
          } catch (error) {
            console.error('Error fetching adoption requests as owner:', error);
          }
        }

        // Fetch user's donation campaigns count
        const donationCampaigns = await getUserDonationCampaigns();
        console.log('Donation Campaigns Data:', donationCampaigns); // Debug log
        const donationCampaignsCount = donationCampaigns.data?.length || 0;

        // Fetch user's donations count
        const donations = await getUserDonations();
        console.log('Donations Data:', donations); // Debug log
        const donationsCount = donations.data?.length || 0;

        // Fetch user's pets count (using the pets route)
        const userPetsResponse = await axiosSecure.get('/pets/user/my-pets?limit=1');
        console.log('User Pets Response:', userPetsResponse); // Debug log
        const petsAddedCount = userPetsResponse.data.pagination?.total || 0;

        setStats({
          petsAdded: petsAddedCount,
          adoptionRequests: adoptionRequestsCount,
          donationCampaigns: donationCampaignsCount,
          donationsMade: donationsCount
        });
      } catch (error) {
        console.error('Error fetching user stats:', error);
      }
    };

    if (user) {
      fetchUserStats();
    }
  }, [user, axiosSecure]);

  if (loading) {
    // Show a loading spinner or message while waiting for data
    return (
      <div className="h-screen flex justify-center items-center">
        <div className="rounded-md h-12 w-12 border-4 border-t-4 border-pink-600 animate-spin"></div>
      </div>
    );
  }

  const navLinks = (
    <>
      <div className="flex flex-col items-center mb-5">
        <div className="bg-white rounded-full p-5 w-24">
          <img src={logo} alt="" />
        </div>
        <div className="text-2xl font-bold">FourPaws</div>
      </div>
      <li>
        <NavLink
          to="/addpet"
          className={({ isActive, isPending }) =>
            isPending
              ? "pending text-white"
              : isActive
                ? "text-warning font-bold underline underline-offset-8 hover:text-red"
                : ""
          }
        >
          Add a Pet
        </NavLink>
      </li>
      <li>
        <NavLink
          to="/myaddedpets"
          className={({ isActive, isPending }) =>
            isPending
              ? "pending text-white"
              : isActive
                ? "text-warning font-bold underline underline-offset-8 hover:text-red"
                : ""
          }
        >
          My Added Pets
        </NavLink>
      </li>
      <li>
        <NavLink
          to="/adoptionreq"
          className={({ isActive, isPending }) =>
            isPending
              ? "pending text-white"
              : isActive
                ? "text-warning font-bold underline underline-offset-8 hover:text-red"
                : ""
          }
        >
          Adoption Requests (Received)
        </NavLink>
      </li>
      <li>
        <NavLink
          to="/myadoptionrequests"
          className={({ isActive, isPending }) =>
            isPending
              ? "pending text-white"
              : isActive
                ? "text-warning font-bold underline underline-offset-8 hover:text-red"
                : ""
          }
        >
          My Adoption Requests (Sent)
        </NavLink>
      </li>
      <li>
        <NavLink
          to="/createdonationcamp"
          className={({ isActive, isPending }) =>
            isPending
              ? "pending text-white"
              : isActive
                ? "text-warning font-bold underline underline-offset-8 hover:text-red"
                : ""
          }
        >
          Create Donation Campaign
        </NavLink>
      </li>
      <li>
        <NavLink
          to="/mydonationcamp"
          className={({ isActive, isPending }) =>
            isPending
              ? "pending text-white"
              : isActive
                ? "text-warning font-bold underline underline-offset-8 hover:text-red"
                : ""
          }
        >
          My Donation Campaigns
        </NavLink>
      </li>
      <li>
        <NavLink
          to="/mydonation"
          className={({ isActive, isPending }) =>
            isPending
              ? "pending text-white"
              : isActive
                ? "text-warning font-bold underline underline-offset-8 hover:text-red"
                : ""
          }
        >
          My Donations
        </NavLink>
      </li>
      <hr />
      <li className="pt-4">
        <NavLink
          to="/"
          className={({ isActive, isPending }) =>
            isPending
              ? "pending text-white"
              : isActive
                ? "text-warning font-bold underline underline-offset-8 hover:text-red"
                : ""
          }
        >
          Home
        </NavLink>
      </li>
    </>
  );

  // User dashboard cards for quick actions
  const userCards = [
    {
      title: "Add a Pet",
      description: "List a new pet for adoption",
      link: "/addpet",
      icon: "🐾",
      color: "bg-green-500"
    },
    {
      title: "My Pets",
      description: "View and manage your listed pets",
      link: "/myaddedpets",
      icon: "🐶",
      color: "bg-blue-500"
    },
    {
      title: "Adopt a Pet",
      description: "Browse pets available for adoption",
      link: "/petlisting",
      icon: "❤️",
      color: "bg-pink-500"
    },
    {
      title: "Create Campaign",
      description: "Start a new donation campaign",
      link: "/createdonationcamp",
      icon: "💝",
      color: "bg-purple-500"
    }
  ];

  return (
    <div className='grid grid-cols-4 pt-14'>
      <div className='min-h-[100vh] bg-[#D52B5C] col-span-1 hidden lg:flex'>
        <ul className="menu mt-6 z-[1] p-2 dropdown-content text-white">
          {navLinks}
        </ul>
      </div>

      <div className='min-h-[100vh] bg-pink-100 lg:col-span-3 col-span-4'>
        <div className="dropdown absolute mt-10">
          <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
            </svg>
          </div>
          <ul className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
            {navLinks}
          </ul>
        </div>
        <div className='h-40 bg-warning py-10'>
          <p className='border-y-2 w-4/12 mx-auto text-3xl font-bold text-center'>User Dashboard</p>
        </div>

        {/* Welcome Section */}
        <div className="mb-8 p-6">
          <h2 className="text-2xl font-bold text-gray-800">Welcome back, {user?.name || 'User'}!</h2>
          <p className="text-gray-600 mt-2">Manage your pet adoption activities and contributions</p>
        </div>

        {/* Quick Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-6">
          {userCards.map((card, index) => (
            <div
              key={index}
              onClick={() => navigate(card.link)}
              className="block bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
            >
              <div className="p-6">
                <div className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center text-white text-xl mb-4`}>
                  {card.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{card.title}</h3>
                <p className="text-gray-600 text-sm">{card.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* User Statistics */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6 mx-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Activity Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-100">
              <div className="text-3xl font-bold text-green-600">{stats.petsAdded}</div>
              <div className="text-sm text-gray-600 mt-2">Pets Listed</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="text-3xl font-bold text-blue-600">{stats.adoptionRequests}</div>
              <div className="text-sm text-gray-600 mt-2">Adoption Requests</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-100">
              <div className="text-3xl font-bold text-purple-600">{stats.donationCampaigns}</div>
              <div className="text-sm text-gray-600 mt-2">Campaigns Created</div>
            </div>
            <div className="text-center p-4 bg-pink-50 rounded-lg border border-pink-100">
              <div className="text-3xl font-bold text-pink-600">{stats.donationsMade}</div>
              <div className="text-sm text-gray-600 mt-2">Donations Made</div>
            </div>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6 mx-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-pink-600">🐾</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">You listed a new pet for adoption</p>
                <p className="text-sm text-gray-500">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-blue-600">💝</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">You donated to a campaign</p>
                <p className="text-sm text-gray-500">1 day ago</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-green-600">❤️</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">You requested to adopt a pet</p>
                <p className="text-sm text-gray-500">3 days ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;