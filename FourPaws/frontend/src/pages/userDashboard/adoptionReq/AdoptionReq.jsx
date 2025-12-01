import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../../components/providers/AuthWrapper';
import Swal from 'sweetalert2';
import useAxiosSecure from '../../../hooks/useAxiosSecure';

const AdoptionReq = () => {
  const [pets, setPets] = useState([]);
  const { user } = useContext(AuthContext);
  const [filteredCard, setFilteredCard] = useState([]);
  const [allCamps, setAllCamps] = useState([])

  const axiosSecure = useAxiosSecure();

  useEffect(() => {
    if (user && user.email) {
      // Fetch adoption requests for the current user (owner)
      console.log('Fetching adoption requests for:', user.email);
      fetch(`${import.meta.env.VITE_API_BASE_URL}/adoption-requests/owner/${encodeURIComponent(user.email)}`)
        .then(res => {
          console.log('API response status:', res.status);
          return res.json();
        })
        .then(data => {
          console.log('API response data:', data);
          if (data.success) {
            setPets(data.data);
            console.log('Set pets to:', data.data);
          } else {
            console.error('Failed to fetch adoption requests:', data.message);
            setPets([]);
          }
        })
        .catch(error => {
          console.error('Error fetching adoption requests:', error);
          setPets([]);
        });
    }
  }, [user]);

  useEffect(() => {
    if (user && user.email) {
      setFilteredCard(pets.filter(pet => pet.ownerEmail === user.email && pet.adopt_Req===true))
    }
  }, [pets, user]);

  console.log('request pet',pets);
  console.log('filtered card', filteredCard);
  // //////
  const updatePetStatusLocally = (petId, newStatus) => {
    setAllCamps((prevPets) =>
      prevPets.map((pet) =>
        pet._id === petId ? { ...pet, adopted: newStatus } : pet
      )
    );
  };
  const handleAccept = (pet) => {
    const petId = pet._id;

    console.log('Accepting adoption request for pet:', pet);
    console.log('Pet ID being sent:', pet.petId);
    console.log('Request ID being sent:', pet._id);
    
    axiosSecure
      .patch(`/adoption-requests/admin/accept/${petId}`,{petId:pet.petId,id:pet._id})
      .then((res) => {
        console.log('Adoption request response:', res.data);
        if (res.data.modifiedCount > 0) {
          // Remove the accepted request from the list
          setPets(prevPets => prevPets.filter(p => p._id !== petId));
          Swal.fire({
            position: 'top-end',
            icon: 'success',
            title: 'Adoption Request Accepted Successfully',
            showConfirmButton: false,
            timer: 1500,
          });

        } else {
          console.error('Failed to update adoption status.');
        }
      })
      .catch((error) => {
        console.error('Error updating adoption status:', error);
        Swal.fire({
          position: 'top-end',
          icon: 'error',
          title: 'Failed to accept adoption request',
          showConfirmButton: false,
          timer: 1500,
        });

      });
  };

  const handleReject = (pet) => {
    const petId = pet._id;

    console.log('Rejecting adoption request for pet:', pet);

    axiosSecure
      .patch(`/adoption-requests/admin/reject/${petId}`,{petId:pet.petId,id:pet._id})
      .then((res) => {
        console.log('Rejection response:', res.data);
        if (res.data.modifiedCount > 0) {
          // Remove the rejected request from the list
          setPets(prevPets => prevPets.filter(p => p._id !== petId));
          Swal.fire({
            position: 'top-end',
            icon: 'success',
            title: 'Adoption Request Rejected Successfully',
            showConfirmButton: false,
            timer: 1500,
          });

        } else {
          console.error('Failed to update rejection status.');
        }
      })
      .catch((error) => {
        console.error('Error updating adoption status:', error);
        Swal.fire({
          position: 'top-end',
          icon: 'error',
          title: 'Failed to reject adoption request',
          showConfirmButton: false,
          timer: 1500,
        });

      });
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6">Adoption Requests for Your Pets (Received)</h2>
      {filteredCard.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-white rounded-lg shadow p-8 max-w-md mx-auto">
            <div className="text-5xl mb-4">📭</div>
            <h3 className="text-xl font-semibold mb-2">No Adoption Requests Yet</h3>
            <p className="text-gray-600">
              When someone requests to adopt your pets, they'll appear here.
            </p>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="table w-full">
            {/* head */}
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left">Pet Information</th>
                <th className="text-left">Requested By</th>
                <th className="text-left">Contact</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCard.map((card) => (
                <tr key={card._id || card.id} className="border-b hover:bg-gray-50">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="avatar">
                        <div className="mask mask-squircle w-16 h-16">
                          <img src={card.image} alt={card.name} className="object-cover" />
                        </div>
                      </div>
                      <div>
                        <div className="font-bold text-lg">{card.name}</div>
                        <div className="text-sm text-gray-500">{card.category}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4">
                    <div>
                      <div className="font-bold">{card.userName}</div>
                      <div className="text-sm text-gray-500">{card.userAddress}</div>
                    </div>
                  </td>
                  <td className="py-4">
                    <div>
                      <p className="font-medium">{card.phone}</p>
                      <p className="text-sm text-gray-500">{card.userEmail}</p>
                    </div>
                  </td>
                  <td className="py-4 text-right">
                    <button 
                      onClick={() => handleAccept(card)} 
                      className="btn btn-success btn-sm mr-2"
                    >
                      Accept
                    </button>
                    <button 
                      onClick={() => handleReject(card)} 
                      className="btn btn-error btn-sm"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdoptionReq;