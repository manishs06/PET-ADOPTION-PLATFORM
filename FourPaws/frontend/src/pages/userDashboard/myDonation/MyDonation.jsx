import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../../components/providers/AuthWrapper';
import Swal from 'sweetalert2';

const MyDonation = () => {
const {user}=useContext(AuthContext);
    const [mydonations, setMyDonations] = useState([]);




    const [filteredPets, setFilteredPets] = useState([]);
    const [pets, setPets] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
  
    const petsPerPage = 10;
    const pagesVisited = currentPage * petsPerPage;
  
    // useEffect(() => {
    //   fetch(`https://serversite-pet-adoption.vercel.app/pets`)
    //     .then(response => response.json())
    //     .then(data => {
    //       console.log('Fetched pets:', data);
    //       setPets(data);
    //     })
    //     .catch(error => console.error('Error fetching my added pets:', error));
    // }, []);
  
   

    useEffect(() => {
      // Payments endpoint doesn't exist, set empty array
      setMyDonations([]);
    }, []);
    
      useEffect(() => {
        user &&
          user?.email &&
          setFilteredPets(mydonations.filter(pet => pet.email === user?.email));
      }, [mydonations, user]);

      const deletePet = (_id) => {
        Swal.fire({
          title: 'Are you sure?',
          text: "You won't be able to revert this!",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Yes, Remove it!',
          cancelButtonText: 'Cancel',
          customClass: {
            confirmButton: 'bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2',
            cancelButton: 'bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded ml-2 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2'
          }
        }).then((result) => {
          if (result.isConfirmed) {
            fetch(`/api/payments/${_id}`, {
              method: 'DELETE',
            })
              .then(response => response.json())
              .then(data => {
                console.log('Pet deleted successfully:', data);
                setPets(prevPets => prevPets.filter(pet => pet._id !== _id));
                Swal.fire({
                  title: 'Removed!',
                  text: 'Your donation has been removed.',
                  icon: 'success',
                  confirmButtonText: 'OK',
                  customClass: {
                    confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                  }
                });
              })
              .catch(error => {
                console.error('Error deleting pet:', error);
                Swal.fire({
                  title: 'Error!',
                  text: 'Failed to remove donation. Please try again.',
                  icon: 'error',
                  confirmButtonText: 'OK',
                  customClass: {
                    confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                  }
                });
              });
          }
        });
      };



    return (
      <div className=''>
      
      <div className="overflow-x-auto bg-white m-10 rounded-md">
<table className="table">
{/* head */}
<thead className=''>
<tr>
<th>Pet Image</th>
  <th>Name</th>
 
  <th>Donation Amount</th>
   
  <th></th>
</tr>
</thead>
<tbody>
{/* row 1 */}
{filteredPets.map(donation => (
        <tr key={donation._id}>

 
  <td>
    <div className="flex items-center gap-3">
      <div className="avatar">
        <div className="mask mask-circle w-12 h-12">
          <img src={donation.image} />
        </div>
      </div>
      
    </div>
  </td>
  <td>
   {donation.name}
    
  </td>
  
  <td>
   {donation.donationAmount}₹
    
  </td>
  <td><button className='btn btn-sm  bg-gradient-to-r from-pink-700  to-pink-200 text-white' onClick={() => deletePet(donation._id)}>Ask for Refund</button></td>
  {/* <th>
      {user.role === 'Admin'?'Admin':<button onClick={()=>handleMakeAdmin(user)} className="btn btn-primary btn-sm">Make Admin</button>}
    
  </th> */}
</tr>

))}


</tbody>
{/* foot */}


</table>
</div>
  </div>
    );
};

export default MyDonation;
