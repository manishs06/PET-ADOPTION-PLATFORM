import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../../components/providers/AuthWrapper';
import { Link } from 'react-router-dom';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import Swal from 'sweetalert2';

const MyDonationCamp = () => {
  const { user } = useContext(AuthContext);
  const [donationCamp, setDonationCamp] = useState([]);
  const [filteredDonationCamp, setFilteredDonationCamp] = useState([]);
  const axiosSecure = useAxiosSecure();

  useEffect(() => {
    // Use the correct endpoint to fetch only the campaigns created by the current user
    axiosSecure.get('/donations/user/my-campaigns')
      .then(response => {
        setDonationCamp(response.data.data || []);
      })
      .catch(error => {
        console.error('Error fetching donation:', error);
        setDonationCamp([]);
      });
  }, [axiosSecure]);

  // Set filteredDonationCamp directly from donationCamp since it's already filtered by the API
  useEffect(() => {
    setFilteredDonationCamp(donationCamp);
  }, [donationCamp]);

  const handleDelete = (campaignId, campaignTitle) => {
    Swal.fire({
      title: 'Are you sure?',
      text: `Do you really want to delete the campaign "${campaignTitle}"? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        axiosSecure.delete(`/donations/${campaignId}`)
          .then(response => {
            if (response.data.success) {
              // Remove the deleted campaign from the state
              setDonationCamp(prevCampaigns => 
                prevCampaigns.filter(campaign => campaign._id !== campaignId)
              );
              Swal.fire(
                'Deleted!',
                'Your campaign has been deleted.',
                'success'
              );
            }
          })
          .catch(error => {
            console.error('Error deleting campaign:', error);
            Swal.fire(
              'Error!',
              error.response?.data?.message || 'Failed to delete campaign. Please try again.',
              'error'
            );
          });
      }
    });
  };

  const handleViewDonators = (campaignId) => {
    // Fetch the full campaign details to get donor information
    axiosSecure.get(`/donations/${campaignId}`)
      .then(response => {
        if (response.data.success && response.data.data) {
          const campaign = response.data.data;
          const donors = campaign.donors || [];
          
          if (donors.length === 0) {
            Swal.fire({
              title: 'No Donators Yet',
              text: 'This campaign has not received any donations yet.',
              icon: 'info',
              confirmButtonText: 'OK',
              customClass: {
                confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
              }
            });
            return;
          }
          
          // Create HTML content for the donor list
          let donorListHTML = '<div class="text-left">';
          donorListHTML += `<h3 class="font-bold text-lg mb-3">${campaign.title}</h3>`;
          donorListHTML += '<div class="max-h-80 overflow-y-auto pr-2">';
          
          donors.forEach((donor, index) => {
            donorListHTML += `
              <div class="border-b border-gray-200 py-3 ${index === donors.length - 1 ? 'border-b-0' : ''}">
                <div class="flex justify-between items-center">
                  <div>
                    <span class="font-medium">${donor.anonymous ? 'Anonymous Donor' : (donor.donor?.name || 'Unknown Donor')}</span>
                    <div class="text-sm text-gray-600">₹${donor.amount}</div>
                  </div>
                  <div class="text-sm text-gray-500">${new Date(donor.date).toLocaleDateString()}</div>
                </div>
                ${donor.message ? `<div class="mt-2 text-sm italic text-gray-700">"${donor.message}"</div>` : ''}
              </div>
            `;
          });
          
          donorListHTML += '</div></div>';
          
          Swal.fire({
            title: 'Campaign Donators',
            html: donorListHTML,
            width: '600px',
            confirmButtonText: 'Close',
            customClass: {
              confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
            }
          });
        }
      })
      .catch(error => {
        console.error('Error fetching campaign details:', error);
        Swal.fire({
          title: 'Error',
          text: 'Failed to fetch donor information. Please try again.',
          icon: 'error',
          confirmButtonText: 'OK',
          customClass: {
            confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
          }
        });
      });
  };

  return (
    <div className="container mx-auto my-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">My Donation Campaigns</h2>
        <Link to="../createdonationcamp">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Create New Campaign
          </button>
        </Link>
      </div>
      
      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-3 px-4 border-b text-left">Campaign Title</th>
            <th className="py-3 px-4 border-b text-center">Target Amount</th>
            <th className="py-3 px-4 border-b text-center">Current Amount</th>
            <th className="py-3 px-4 border-b text-center">Status</th>
            <th className="py-3 px-4 border-b text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
        {filteredDonationCamp.map(donation => (
          <tr key={donation._id} className="hover:bg-gray-50">
            <td className="py-3 px-4 border-b font-medium">{donation.title}</td>
            <td className="py-3 px-4 border-b text-center">₹{donation.targetAmount}</td>
            <td className="py-3 px-4 border-b text-center">₹{donation.currentAmount}</td>
            <td className="py-3 px-4 border-b text-center">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                donation.status === 'active' ? 'bg-green-100 text-green-800' :
                donation.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                donation.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {donation.status}
              </span>
            </td>
            <td className="py-3 px-4 border-b text-center">
              <Link to={`../updatedonationcamp/${donation._id}`}>
                <button className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded mr-2 transition-colors">
                  Edit
                </button>
              </Link>
              <button 
                className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 rounded mr-2 transition-colors"
                onClick={() => handleViewDonators(donation._id)}
              >
                View Donators
              </button>
              <button 
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition-colors"
                onClick={() => handleDelete(donation._id, donation.title)}
                disabled={donation.donors && donation.donors.length > 0}
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
        </tbody>
      </table>

      {filteredDonationCamp.length === 0 && (
        <div className="text-center py-12">
          <div className="bg-white rounded-lg shadow p-8 max-w-md mx-auto">
            <div className="text-5xl mb-4">💰</div>
            <h3 className="text-xl font-semibold mb-2">No Donation Campaigns Yet</h3>
            <p className="text-gray-600 mb-4">
              You haven't created any donation campaigns. Start by creating your first campaign.
            </p>
            <Link to="../createdonationcamp">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Create Campaign
              </button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyDonationCamp;