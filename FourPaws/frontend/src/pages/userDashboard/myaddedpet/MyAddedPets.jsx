import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../../components/providers/AuthWrapper';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import ReactPaginate from 'react-paginate';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import './MyAddedPets.css'; // You can create a CSS file for styling pagination
import { usePetCount } from '../../../contexts/PetCountContext';

const MyAddedPets = () => {
  const { user } = useContext(AuthContext);
  const { updatePetCount } = usePetCount();
  const axiosSecure = useAxiosSecure();

  const [pets, setPets] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalPets, setTotalPets] = useState(0);

  const petsPerPage = 10;

  useEffect(() => {
    const fetchMyPets = async () => {
      try {
        const response = await axiosSecure.get(`/pets/user/my-pets?page=${currentPage + 1}&limit=${petsPerPage}`);
        setPets(response.data.data || []);
        setTotalPages(response.data.pagination?.pages || 0);
        setTotalPets(response.data.pagination?.total || 0);
      } catch (error) {
        console.error('Error fetching my added pets:', error);
        setPets([]);
      }
    };

    if (user) {
      fetchMyPets();
    }
  }, [user, axiosSecure, currentPage]);

  const deletePet = async (petId) => {
    const result = await Swal.fire({
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
    });

    if (result.isConfirmed) {
      try {
        // Find the pet before deleting to get its category
        const petToDelete = pets.find(pet => pet._id === petId);
        const category = petToDelete?.category || 'other';
        
        const response = await axiosSecure.delete(`/pets/${petId}`);
        if (response.data.success) {
          // Remove the deleted pet from the local state
          setPets(prevPets => prevPets.filter(pet => pet._id !== petId));
          
          // Update pet count for the deleted category
          updatePetCount(category, -1);
          
          Swal.fire({
            title: 'Deleted!',
            text: 'The pet has been deleted.',
            icon: 'success',
            confirmButtonText: 'OK',
            customClass: {
              confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
            }
          });
        } else {
          throw new Error(response.data.message || 'Failed to delete pet');
        }
      } catch (error) {
        console.error('Error deleting pet:', error);
        Swal.fire({
          title: 'Error!',
          text: error.message || 'Failed to delete pet. Please try again.',
          icon: 'error',
          confirmButtonText: 'OK',
          customClass: {
            confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
          }
        });
      }
    }
  };

  const adoptPet = async (petId) => {
    const pet = pets.find(p => p._id === petId);

    if (!pet) {
      Swal.fire({
        title: 'Error!',
        text: 'Pet not found.',
        icon: 'error',
        confirmButtonText: 'OK',
        customClass: {
          confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
        }
      });
      return;
    }

    if (pet.isAdopted) {
      Swal.fire({
        title: 'Info',
        text: 'This pet is already marked as adopted.',
        icon: 'info',
        confirmButtonText: 'OK',
        customClass: {
          confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
        }
      });
      return;
    }

    try {
      const response = await axiosSecure.put(`/pets/${petId}`, { 
        status: 'adopted',
        isAdopted: true 
      });
      
      if (response.data.success) {
        setPets(prevPets =>
          prevPets.map(p =>
            p._id === petId ? { ...p, isAdopted: true, status: 'adopted' } : p
          )
        );
        
        Swal.fire({
          title: 'Success!',
          text: 'Pet has been marked as adopted.',
          icon: 'success',
          confirmButtonText: 'OK',
          customClass: {
            confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
          }
        });

      } else {
        throw new Error(response.data.message || 'Failed to update pet status');
      }
    } catch (error) {
      console.error('Error updating pet status:', error);
      Swal.fire({
        title: 'Error!',
        text: error.message || 'Failed to update pet status. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK',
        customClass: {
          confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
        }
      });

    }
  };

  const handlePageChange = ({ selected }) => {
    setCurrentPage(selected);
  };

  if (!pets || pets.length === 0 && currentPage === 0) {
    return (
      <div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
          }}
        >
          <h2 className='text-center text-3xl font-bold'>
            You have not added any pet
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className='flex flex-col lg:flex-row justify-between border-b pb-8 m-20 '>
        <h1 className='font-semibold text-2xl'>My Added Pets</h1>
        <h2 className='font-semibold text-2xl'>
          {totalPets} Added Pets
        </h2>
      </div>
      {pets.length > 0 ? (
        <div>
          <div className='overflow-x-auto'>
            <table className='table w-11/12 mx-auto'>
              <thead>
                <tr>
                  <th>Index</th>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Adopt Status</th>
                  <th>Button</th>
                </tr>
              </thead>
              <tbody>
                {pets.map((pet, index) => (
                  <tr key={pet._id}>
                    <td>{currentPage * petsPerPage + index + 1}</td>
                    <td>
                      <div className='flex items-center gap-3'>
                        <div className='avatar'>
                          <div className='mask mask-squircle w-12 h-12'>
                            <img src={pet.images?.[0] || pet.image || 'https://via.placeholder.com/150'} alt='Pet Image' />
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>{pet.name}</td>
                    <td>{pet.category}</td>
                    <td>
                      {pet.isAdopted ? (
                        <span className="badge badge-success">Adopted</span>
                      ) : (
                        <span className="badge badge-warning">Not Adopted</span>
                      )}
                    </td>
                    <td>
                      <Link to={`../updatepet/${pet._id}`}>
                        <button className='btn btn-warning btn-xs mr-5 text-white'>
                          Update
                        </button>
                      </Link>
                      <button
                        className='btn btn-error btn-xs mr-5'
                        onClick={() => deletePet(pet._id)}
                      >
                        Delete
                      </button>
                      {!pet.isAdopted && (
                        <button
                          className='btn btn-primary btn-xs'
                          onClick={() => adoptPet(pet._id)}
                        >
                          Mark as Adopted
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <ReactPaginate
              previousLabel={'Previous'}
              nextLabel={'Next'}
              pageCount={totalPages}
              onPageChange={handlePageChange}
              containerClassName={'pagination flex justify-center mt-4'}
              previousLinkClassName={'pagination__link'}
              nextLinkClassName={'pagination__link'}
              disabledClassName={'pagination__link--disabled'}
              activeClassName={'pagination__link--active'}
            />
          )}
        </div>
      ) : (
        <div className='text-center m-10'>
          <p>You Don't Have Added Any pet.</p>
        </div>
      )}
    </div>
  );
};

export default MyAddedPets;