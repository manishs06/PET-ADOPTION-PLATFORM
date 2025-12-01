import React from 'react';
import { useState } from 'react';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAxiosSecure from '../../../../hooks/useAxiosSecure';
import Swal from 'sweetalert2';

const AllDonationCampAdmin = () => {
    const[allCamps,setAllCamps]=useState([])
   
    const axiosSecure = useAxiosSecure();
    useEffect(() => {
        axiosSecure.get('/donations')
          .then((response) => {
            console.log('Fetched donation campaigns:', response.data);
            setAllCamps(response.data.data || []);
          })
          .catch((error) =>
            console.error('Error fetching donation campaigns:', error)
          );
      }, [axiosSecure]);

      const deletePet = (_id) => {
        Swal.fire({
          title: 'Are you sure?',
          text: "You won't be able to revert this! Campaigns with donations cannot be deleted.",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Yes, Delete it!',
          cancelButtonText: 'Cancel',
          customClass: {
            confirmButton: 'bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2',
            cancelButton: 'bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded ml-2 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2'
          }
        }).then((result) => {
          if (result.isConfirmed) {
            axiosSecure.delete(`/donations/${_id}`)
              .then(response => {
                console.log('Donation deleted successfully:', response.data);
                setAllCamps(prevCamps => prevCamps.filter(camp => camp._id !== _id));
                Swal.fire({
                  title: 'Deleted!',
                  text: 'Donation campaign has been deleted.',
                  icon: 'success',
                  confirmButtonText: 'OK',
                  customClass: {
                    confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                  }
                });
              })
              .catch(error => {
                console.error('Error deleting donation camp:', error);
                // Check if it's a specific error about donations
                if (error.response && error.response.status === 400) {
                  Swal.fire({
                    title: 'Cannot Delete!',
                    text: 'Campaigns with existing donations cannot be deleted. You can mark it as cancelled instead.',
                    icon: 'info',
                    confirmButtonText: 'OK',
                    customClass: {
                      confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                    }
                  });
                } else {
                  Swal.fire({
                    title: 'Error!',
                    text: 'Failed to delete donation campaign.',
                    icon: 'error',
                    confirmButtonText: 'OK',
                    customClass: {
                      confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                    }
                  });
                }
              });
          }
        });
      };
      const updateCampStatusLocally = (campId, newStatus) => {
        setAllCamps((prevCamps) =>
          prevCamps.map((camp) =>
            camp._id === campId ? { ...camp, status: newStatus } : camp
          )
        );
      };
      
      const handlePause = (camp) => {
        const campId = camp._id;
    
        // Optimistically update the local state
        updateCampStatusLocally(campId, 'paused');
    
        axiosSecure
          .put(`/donations/${campId}`, { status: 'paused' })
          .then((res) => {
            console.log(res.data);
            if (res.data.success) {
              Swal.fire({
                position: 'top-end',
                icon: 'success',
                title: 'Donation campaign paused successfully',
                showConfirmButton: false,
                timer: 1500,
              });
            } else {
              // Revert the local state if the request fails
              updateCampStatusLocally(campId, camp.status);
              console.error('Failed to pause donation campaign.');
            }
          })
          .catch((error) => {
            // Revert the local state if the request fails
            updateCampStatusLocally(campId, camp.status);
            console.error('Error updating pause status:', error);
          });
      };
    
      const handleResume = (camp) => {
        const campId = camp._id;
    
        // Optimistically update the local state
        updateCampStatusLocally(campId, 'active');
    
        axiosSecure
          .put(`/donations/${campId}`, { status: 'active' })
          .then((res) => {
            console.log(res.data);
            if (res.data.success) {
              Swal.fire({
                position: 'top-end',
                icon: 'success',
                title: 'Donation campaign resumed successfully',
                showConfirmButton: false,
                timer: 1500,
              });
            } else {
              // Revert the local state if the request fails
              updateCampStatusLocally(campId, camp.status);
              console.error('Failed to resume donation campaign.');
            }
          })
          .catch((error) => {
            // Revert the local state if the request fails
            updateCampStatusLocally(campId, camp.status);
            console.error('Error updating resume status:', error);
          });
      };
    return (
        <div>
        <div>

        </div>
        <div className="overflow-x-auto">
<table className="table">
{/* head */}
<thead>
  <tr>
  <th>Pet Image</th>
    <th>Max Donation</th>
    <th>Added By</th>
     <th>Last Donation Date</th>
    <th></th>
    <th></th>
  </tr>
</thead>
<tbody>
  {/* row 1 */}
  {allCamps.map(allCamp => (
          <tr key={allCamp._id}>
 
   
    <td>
      <div className="flex items-center gap-3">
        <div className="avatar">
          <div className="mask mask-squircle w-12 h-12">
            <img src={allCamp.image} />
          </div>
        </div>
        
      </div>
    </td>
    <td>
    <p> {allCamp.targetAmount}₹</p>
      
    </td>
    <td className='text-blue-400'>{allCamp.organizer?.email || 'N/A'}</td>
    <td>{new Date(allCamp.endDate).toLocaleDateString()}</td>
    
    <th>
      <button
        onClick={() => handlePause(allCamp)}
        className='btn btn-xs btn-success mx-4'
        disabled={allCamp.status === 'paused'}
      >
        Pause
      </button>
      <button
        onClick={() => handleResume(allCamp)}
        className='btn btn-xs btn-success mx-4'
        disabled={allCamp.status === 'active'}
      >
        Resume
      </button>
      
    </th>
    <th>
    <Link to={`../updatedonationcamp/${allCamp._id}`}> <button  className='btn  btn-xs btn-warning text-white mx-4'>Edit</button></Link>
        <button  onClick={() => deletePet(allCamp._id)} className='btn btn-xs  btn-accent text-white'>Delete</button>
    </th>
  </tr>

))}

  
</tbody>
{/* foot */}


</table>
</div>
    </div>
    );
};

export default AllDonationCampAdmin;
