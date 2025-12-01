import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../../components/providers/AuthWrapper';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import { Link } from 'react-router-dom';

const MyAdoptionRequests = () => {
  const { user } = useContext(AuthContext);
  const [adoptionRequests, setAdoptionRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const axiosSecure = useAxiosSecure();

  useEffect(() => {
    const fetchMyAdoptionRequests = async () => {
      try {
        if (user?.email) {
          const response = await axiosSecure.get(`/adoption-requests?userEmail=${user.email}`);
          setAdoptionRequests(response.data);
        }
      } catch (error) {
        console.error('Error fetching adoption requests:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyAdoptionRequests();
  }, [user, axiosSecure]);

  if (loading) {
    return (
      <div className="h-[60vh] flex justify-center items-center">
        <div className="rounded-md h-12 w-12 border-4 border-t-4 border-pink-600 animate-spin"></div>
      </div>
    );
  }

  // Status badge
  const getStatusBadge = (status, request) => {
    const baseClasses = "px-3 py-1 rounded-full text-sm font-semibold";
    
    switch(status) {
      case 'accepted':
        return <span className={`${baseClasses} bg-green-100 text-green-800`}>Accepted</span>;
      case 'rejected':
        return <span className={`${baseClasses} bg-red-100 text-red-800`}>Rejected</span>;
      default:
        return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>Pending</span>;
    }
  };
  
  // Health verification status badge
  const getHealthVerificationBadge = (request) => {
    if (request.status !== 'accepted') return null;
    
    const isFullyVerified = request.vaccinationVerified && request.neuteringVerified;
    const verifiedCount = (request.vaccinationVerified ? 1 : 0) + 
                         (request.neuteringVerified ? 1 : 0);
    
    if (isFullyVerified) {
      return <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">Health Verified</span>;
    } else if (verifiedCount > 0) {
      return <span className="px-3 py-1 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-800">Partially Verified</span>;
    } else {
      return <span className="px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-800">Verification Needed</span>;
    }
  };
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">My Adoption Requests (Sent)</h2>
        <Link to="/petlisting" className="btn btn-primary">
          Adopt More Pets
        </Link>
      </div>
      
      {adoptionRequests.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-gray-600 text-lg mb-4">You haven't sent any adoption requests yet.</p>
          <Link to="/petlisting" className="btn btn-primary">
            Browse Pets to Adopt
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {adoptionRequests.map((request) => (
            <div key={request._id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <img 
                  src={request.image || '/placeholder-pet.jpg'} 
                  alt={request.name}
                  className="w-16 h-16 rounded-full object-cover mr-4"
                />
                <div>
                  <h3 className="font-bold text-lg">{request.name}</h3>
                  <p className="text-gray-600 capitalize">{request.category}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-semibold">Request Date:</span>
                  <span>{new Date(request.adoptDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Pet Owner:</span>
                  <span className="text-sm truncate max-w-[120px]">{request.ownerEmail}</span>
                </div>
                
                {/* Status Display */}
                <div className="mt-4">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {getStatusBadge(request.status)}
                    {getHealthVerificationBadge(request)}
                  </div>
                  
                  {request.status === 'accepted' ? (
                    <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-4">
                      <div className="flex items-start">
                        <span className="text-green-500 mr-2 text-xl">✅</span>
                        <div>
                          <p className="font-bold text-lg">Request Accepted!</p>
                          <p className="text-sm mt-1">Congratulations! Your adoption request has been accepted.</p>
                          <div className="mt-3 p-3 bg-green-100 rounded-lg">
                            <p className="text-sm font-semibold">Next Steps:</p>
                            <ul className="list-disc pl-5 mt-1 text-sm space-y-1">
                              <li>The pet owner will contact you at <span className="font-semibold">{user?.email}</span> or <span className="font-semibold">{request.phone || 'the phone number you provided'}</span></li>
                              <li>They will arrange a meeting to complete the adoption process</li>
                              <li>Be prepared to provide identification and complete any required paperwork</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : request.status === 'rejected' ? (
                    <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
                      <div className="flex items-start">
                        <span className="text-red-500 mr-2 text-xl">❌</span>
                        <div>
                          <p className="font-bold text-lg">Request Rejected</p>
                          <p className="text-sm mt-1">Unfortunately, your request was not accepted.</p>
                          <p className="text-sm mt-2">If you have questions, you can contact the pet owner directly at <span className="font-semibold">{request.ownerEmail}</span>.</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-4">
                      <div className="flex items-start">
                        <span className="text-yellow-500 mr-2 text-xl">⏳</span>
                        <div>
                          <p className="font-bold text-lg">Request Pending</p>
                          <p className="text-sm mt-1">Waiting for the pet owner's response.</p>
                          <p className="text-sm mt-2">Please be patient. You'll receive an email notification when the status changes.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyAdoptionRequests;