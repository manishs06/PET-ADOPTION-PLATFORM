import { useState } from 'react';
import useAxiosSecure from '../../../../hooks/useAxiosSecure';
import { useEffect } from 'react';
import { MdArrowDropDown } from 'react-icons/md';
import Swal from 'sweetalert2';
import { Link } from 'react-router-dom';
import ReactPaginate from 'react-paginate';

const AllPetsAdmin = () => {
    const [pets, setPets] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalPets, setTotalPets] = useState(0);
    const axiosSecure = useAxiosSecure();
    
    const petsPerPage = 10;
  
  useEffect(() => {
    const fetchPets = async () => {
      try {
        const response = await axiosSecure.get(`/pets?page=${currentPage + 1}&limit=${petsPerPage}`);
        console.log('Fetched pets:', response.data);
        setPets(response.data.data || []);
        setTotalPages(response.data.pagination?.pages || 0);
        setTotalPets(response.data.pagination?.total || 0);
      } catch (error) {
        console.error('Error fetching pets:', error);
      }
    };
    
    fetchPets();
  }, [axiosSecure, currentPage]);
  
    const updatePetStatusLocally = (petId, isAdopted) => {
      setPets((prevPets) =>
        prevPets.map((pet) =>
          pet._id === petId ? { ...pet, isAdopted: isAdopted } : pet
        )
      );
    };
  
    const handleChangeAdopted = (pet) => {
      const petId = pet._id;
  
      // Optimistically update the local state
      updatePetStatusLocally(petId, true);
  
      axiosSecure
        .patch(`/pets/admin/adopted/${petId}`)
        .then((res) => {
          console.log(res.data);
          if (res.data.modifiedCount === 0) {
            // Revert the local state if the request fails
            updatePetStatusLocally(petId, false);
            console.error('Failed to update adoption status.');
          } else {
            Swal.fire({
              position: 'top-end',
              icon: 'success',
              title: 'Pet marked as adopted successfully',
              showConfirmButton: false,
              timer: 1500,
            });

          }
        })
        .catch((error) => {
          // Revert the local state if the request fails
          updatePetStatusLocally(petId, false);
          console.error('Error updating adoption status:', error);
          Swal.fire({
            position: 'top-end',
            icon: 'error',
            title: 'Failed to mark pet as adopted',
            showConfirmButton: false,
            timer: 1500,
          });

        });
    };
  
    const handleChangeNotAdopted = (pet) => {
      const petId = pet._id;
  
      // Optimistically update the local state
      updatePetStatusLocally(petId, false);
  
      axiosSecure
        .patch(`/pets/admin/notadopted/${petId}`)
        .then((res) => {
          console.log(res.data);
          if (res.data.modifiedCount === 0) {
            // Revert the local state if the request fails
            updatePetStatusLocally(petId, true);
            console.error('Failed to update adoption status.');
          } else {
            Swal.fire({
              position: 'top-end',
              icon: 'success',
              title: 'Pet marked as not adopted successfully',
              showConfirmButton: false,
              timer: 1500,
            });

          }
        })
        .catch((error) => {
          // Revert the local state if the request fails
          updatePetStatusLocally(petId, true);
          console.error('Error updating adoption status:', error);
          Swal.fire({
            position: 'top-end',
            icon: 'error',
            title: 'Failed to mark pet as not adopted',
            showConfirmButton: false,
            timer: 1500,
          });

        });
    };
    
    const deletePet = (_id) => {
        Swal.fire({
          title: 'Are you sure?',
          text: "You won't be able to revert this!",
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
            fetch(`${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}/api/pets/${_id}`, {
              method: 'DELETE',
            })
              .then(response => response.json())
              .then(data => {
                console.log('Pet deleted successfully:', data);
                setPets(prevPets => prevPets.filter(pet => pet._id !== _id));
                Swal.fire({
                  title: 'Deleted!',
                  text: 'Pet has been deleted.',
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
                  text: 'Failed to delete pet. Please try again.',
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
      
    // Function to get the pet image URL
    const getPetImageUrl = (pet) => {
      // First try to get image from images array
      if (pet.images && Array.isArray(pet.images) && pet.images.length > 0) {
        return pet.images[0];
      }
      // Fallback to single image field if it exists
      if (pet.image) {
        return pet.image;
      }
      // Default placeholder image
      return 'https://placehold.co/150x150/e2e8f0/64748b?text=Pet';
    };
    
    const handlePageClick = ({ selected }) => {
      setCurrentPage(selected);
    };
    
    return (
        <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">All Pets</h2>
          <p className="text-lg">Total Pets: {totalPets}</p>
        </div>
        <div className="overflow-x-auto">
<table className="table">
{/* head */}
<thead>
  <tr>
  <th>Pet Image</th>
    <th>Category</th>
    <th>Name</th>
     <th>Adoption Status</th>
    <th>Change Status</th>
    <th></th>
  </tr>
</thead>
<tbody>
  {/* row 1 */}
  {pets.map(pet => (
          <tr key={pet._id}>
 
   
    <td>
      <div className="flex items-center gap-3">
        <div className="avatar">
          <div className="mask mask-squircle w-12 h-12">
            <img src={getPetImageUrl(pet)} alt={pet.name || 'Pet'} />
          </div>
        </div>
      </div>
    </td>
    <td>{pet.category}</td>
    <td>{pet.name}</td>
    <td>
      {pet.isAdopted ? (
        <span className="badge badge-success">Adopted</span>
      ) : (
        <span className="badge badge-warning">Not Adopted</span>
      )}
    </td>
    <th>
      <button
        onClick={() => handleChangeAdopted(pet)}
        className='btn btn-xs btn-success mx-4'
        disabled={pet.isAdopted === true}
      >
        Adopted
      </button>
      <button
        onClick={() => handleChangeNotAdopted(pet)}
        className='btn btn-xs btn-info'
        disabled={pet.isAdopted === false}
      >
        Not Adopted
      </button>
    </th>
    <th>
      <Link to={`../updatepet/${pet._id}`}> 
        <button className='btn btn-xs btn-warning text-white mx-4'>Update</button>
      </Link>
      <button onClick={() => deletePet(pet._id)} className='btn btn-xs btn-accent text-white'>Delete</button>
    </th>
  </tr>

))}

  
</tbody>
{/* foot */}


</table>
</div>
{totalPages > 1 && (
  <div className="mt-6 flex justify-center">
    <ReactPaginate
      previousLabel={'Previous'}
      nextLabel={'Next'}
      pageCount={totalPages}
      onPageChange={handlePageClick}
      containerClassName={'pagination flex items-center gap-2'}
      previousLinkClassName={'px-3 py-1 rounded bg-gray-200 hover:bg-gray-300'}
      nextLinkClassName={'px-3 py-1 rounded bg-gray-200 hover:bg-gray-300'}
      pageLinkClassName={'px-3 py-1 rounded hover:bg-gray-200'}
      activeClassName={'bg-blue-500 text-white'}
      disabledClassName={'opacity-50 cursor-not-allowed'}
    />
  </div>
)}
    </div>
    );
};

export default AllPetsAdmin;