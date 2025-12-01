import { createBrowserRouter, redirect } from "react-router-dom";

// Layouts
import MainLayout from "../../layouts/MainLayout";

// Auth Pages
import Login from "../../pages/login/Login";
import Register from "../../pages/register/Register";
import ForgotPassword from "../../pages/login/ForgotPassword";
import ResetPassword from "../../pages/login/ResetPassword";

// Public Pages
import Home from "../../pages/home/Home";
import PetListing from "../../pages/petListing/PetListing";
import AdoptPet from "../../pages/petListing/petlistingComponent/AdoptPet";
import DonationCampaign from "../../pages/donationCampaign/DonationCampaign";
import DonationCampaignDetails from "../../pages/donationCampaign/donationCampaignDetails/DonationCampaignDetails";
import AllPetsByCategory from "../../pages/allPetsByCategory/AllPetsByCategory";
import AboutUs from "../../pages/aboutus/AboutUs";
import Contact from "../../pages/contact/Contact";
// Added import for FindShelters
import FindShelters from "../../pages/shelters/FindShelters";
// Added import for AddShelter
import AddShelter from "../../pages/shelters/AddShelter";
// Added import for MyShelters
import MyShelters from "../../pages/shelters/MyShelters";
// Added import for ManageShelters
import ManageShelters from "../../pages/shelters/ManageShelters";

// User Dashboard
import UserDashboard from "../../pages/userDashboard/UserDashboard";
import AddPet from "../../pages/addpet/AddPet";
import AddPetDashboard from "../../pages/addpet/AddPetDashboard";
import MyAddedPets from "../../pages/userDashboard/myaddedpet/MyAddedPets";
import MyAddedPetsDashboard from "../../pages/userDashboard/MyAddedPetsDashboard";
import UpdatePet from "../../pages/userDashboard/myaddedpet/updatePets/UpdatePet";
import UpdatePetDashboard from "../../pages/userDashboard/myaddedpet/updatePets/UpdatePetDashboard";
import AdoptionReq from "../../pages/userDashboard/adoptionReq/AdoptionReq";
import AdoptionReqDashboard from "../../pages/userDashboard/AdoptionReqDashboard";
import MyAdoptionRequests from "../../pages/userDashboard/myAdoptionRequests/MyAdoptionRequests";
import MyDonation from "../../pages/userDashboard/myDonation/MyDonation";
import MyDonationDashboard from "../../pages/userDashboard/myDonation/MyDonationDashboard";

// Donation Campaigns
import CreateDonationCampaignDashboard from "../../pages/userDashboard/CreateDonationCampaignDashboard";
import UpdateDonationCamp from "../../pages/userDashboard/updateDonationCampaign/UpdateDonationCamp";
import UpdateDonationCampDashboard from "../../pages/userDashboard/updateDonationCampaign/UpdateDonationCampDashboard";
import MyDonationCamp from "../../pages/donationCampaign/myDonationCamp/MyDonationCamp";
import MyDonationCampDashboard from "../../pages/donationCampaign/myDonationCamp/MyDonationCampDashboard";

// Admin
import AllUsers from "../../pages/userDashboard/admin/alluser/AllUsers";
import AllUsersDashboard from "../../pages/userDashboard/admin/alluser/AllUsersDashboard";
import AllPetsAdmin from "../../pages/userDashboard/admin/allpets/AllPetsAdmin";
import AllPetsAdminDashboard from "../../pages/userDashboard/admin/allpets/AllPetsAdminDashboard";
import AllDonationCampAdmin from "../../pages/userDashboard/admin/allDonationCamp/AllDonationCampAdmin";
import AllDonationCampAdminDashboard from "../../pages/userDashboard/admin/allDonationCamp/AllDonationCampAdminDashboard";
import AdminDashboard from "../../pages/userDashboard/AdminDashboard";

// Routes
import PrivateRoute from "./PrivateRoute";
import AdminRoute from "./AdminRoute";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout></MainLayout>,
    children: [
      {
        path: '/',
        element: <Home></Home>,
      },
      {
        path: '/about',
        element: <AboutUs></AboutUs>
      },
      {
        path: '/contact',
        element: <Contact></Contact>
      },
      {
        path: '/pets',
        loader: ({ request }) => {
          const url = new URL(request.url);
          return redirect(`/petlisting${url.search}`);
        }
      },
      {
        path: '/petlisting',
        element: <PetListing></PetListing>
      },
      {
        path: '/catagorized_pets/:cat',
        element: <AllPetsByCategory></AllPetsByCategory>,
        loader: ({ params }) => fetch(`${import.meta.env.VITE_API_BASE_URL}/pets/category/${params.cat}`)
      },
      {
        path: '/adoptionreq',
        element:<PrivateRoute><AdoptionReqDashboard></AdoptionReqDashboard></PrivateRoute>
      },
      {
        path: '/myadoptionrequests',
        element:<PrivateRoute><MyAdoptionRequests></MyAdoptionRequests></PrivateRoute>
      },
      {
        path: '/donationcampaign',
        element: <DonationCampaign></DonationCampaign>
      },
      {
        path: '/donationcampaigndetails/:id',
        element: <PrivateRoute><DonationCampaignDetails></DonationCampaignDetails></PrivateRoute>,
        loader: async ({ params }) => {
          const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/donations/${params.id}`);
          const result = await response.json();
          // The API returns { success: true, data: {...} }, so we need to return the data property
          return result.data;
        }
      },
      {
        path: "/login",
        element: <Login></Login>
      },
      {
        path: "/register",
        element: <Register></Register>
      },
      {
        path: "/forgot-password",
        element: <ForgotPassword></ForgotPassword>
      },
      {
        path: "/reset-password/:resetToken",
        element: <ResetPassword></ResetPassword>
      },
      {
        path: '/userdashboard',
        element: <PrivateRoute><UserDashboard></UserDashboard></PrivateRoute>
      },
      {
        path: '/admin-dashboard',
        element: <AdminRoute><AdminDashboard></AdminDashboard></AdminRoute>
      },
      {
        path: '/addpet',
        element: <PrivateRoute><AddPetDashboard></AddPetDashboard></PrivateRoute>
      },
      {
        path: '/adoptpet/:id',
        element: <PrivateRoute><AdoptPet></AdoptPet></PrivateRoute>,
        loader: async ({ params }) => {
          const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/pets/${params.id}`);
          const result = await response.json();
          return result.data; // Extract the pet data from the API response
        }
      },
      {
        path: '/myaddedpets',
        element: <PrivateRoute><MyAddedPetsDashboard></MyAddedPetsDashboard></PrivateRoute>
      },
      {
        path: '/createdonationcamp',
        element: <PrivateRoute><CreateDonationCampaignDashboard></CreateDonationCampaignDashboard></PrivateRoute>
      },
      {
        path: '/mydonation',
        element:<PrivateRoute> <MyDonationDashboard></MyDonationDashboard></PrivateRoute>
      },
      {
        path: '/updatedonationcamp/:donationCampaignId',
        element: <PrivateRoute><UpdateDonationCampDashboard></UpdateDonationCampDashboard></PrivateRoute>,
        loader: ({ params }) => fetch(`${import.meta.env.VITE_API_BASE_URL}/donations/${params.donationCampaignId}`)
      },


      {
        path: '/updatepet/:petId',
        element: <PrivateRoute><UpdatePetDashboard></UpdatePetDashboard></PrivateRoute>,
        loader: ({ params }) => fetch(`${import.meta.env.VITE_API_BASE_URL}/pets/${params.petId}`)

      },
      {
        path: '/mydonationcamp',
        element: <PrivateRoute><MyDonationCampDashboard></MyDonationCampDashboard></PrivateRoute>
      },
      {
        path: '/allusers',
        element: <AdminRoute><AllUsersDashboard></AllUsersDashboard></AdminRoute>
      },
      {
        path: '/allpetsadmin',
        element: <AdminRoute><AllPetsAdminDashboard></AllPetsAdminDashboard></AdminRoute>
      },

      {
        path: '/alldonationcampadmin',
        element: <AdminRoute><AllDonationCampAdminDashboard></AllDonationCampAdminDashboard></AdminRoute>
      },
      // Added route for Find Shelters
      {
        path: '/find-shelters',
        element: <FindShelters></FindShelters>
      },
      // Added route for Add Shelter (admin only)
      {
        path: '/add-shelter',
        element: <AdminRoute><AddShelter></AddShelter></AdminRoute>
      },
      // Added route for My Shelters (private)
      {
        path: '/my-shelters',
        element: <PrivateRoute><MyShelters></MyShelters></PrivateRoute>
      },
      // Added route for Manage Shelters (admin only)
      {
        path: '/manage-shelters',
        element: <AdminRoute><ManageShelters></ManageShelters></AdminRoute>
      },




    ]
  },

]);
export default router;