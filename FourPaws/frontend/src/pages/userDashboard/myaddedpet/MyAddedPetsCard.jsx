/* eslint-disable react/prop-types */
import  { useContext } from 'react';
import Swal from 'sweetalert2';
import { AuthContext } from '../../../components/providers/AuthWrapper';
import { getDefaultPetImage } from '../../../utils/petImageDefaults';


const MyAddedPetsCard = ({ myPet, myAddedPets, setMyAddedPets }) => {
  // Destructure the pet's properties from the myPet prop.
  const { _id, name, category,image, addedDate, shortdesp,longdesp,age,location,adopted } = myPet;

  // Define the handleDelete function, which is called when the user clicks the delete button.
  const handleDelete = (_id, bookId) => {
  
    // Show a confirmation dialog to the user before deleting the pet.
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, return it!',
      cancelButtonText: 'Cancel',
      customClass: {
        confirmButton: 'bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2',
        cancelButton: 'bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded ml-2 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2'
      }
    }).then((result) => {
      // If the user confirms the deletion, send a DELETE request to the server.
      if (result.isConfirmed) {
  
     
                    fetch(`/pets/${_id}`, {
                      method: 'DELETE',
                    })
                      .then(res => res.json())
                      .then(data => {
                        if (data.deletedCount > 0) {
                          // If the pet is deleted successfully, update the state to remove the pet from the list.
                          const remaining = myAddedPets.filter(book => book._id !== _id);
                          setMyAddedPets(remaining);
                          Swal.fire({
                            title: 'Deleted!',
                            text: 'The pet has been deleted.',
                            icon: 'success',
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

  return (
    <div>
        <div className="overflow-x-auto">
  <table className="table">
    {/* head */}
    <thead>
      <tr>
        <th></th>
        <th>Index</th>
        <th>Name</th>
        <th>Category</th>
        <th>Adopt Status</th>
        <th>Button</th>
      </tr>
    </thead>
    <tbody>
      {/* row 1 */}
      <tr>
       
        <td>
          <div className="flex items-center gap-3">
            <div className="avatar">
              <div className="mask mask-squircle w-12 h-12">
                <img 
                  src={image || getDefaultPetImage(category)} 
                  alt="Avatar Tailwind CSS Component"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = getDefaultPetImage(category);
                  }}
                />
              </div>
            </div>
          </div>
        </td>
        <td>
            
        </td>
        <td>
          {name}
        </td>
        <td>{adopted}</td>
        <th>
          <button className="btn btn-info btn-xs text-white mr-2">Update</button>
          <button className="btn btn-error btn-xs text-white mr-2">Delete</button>
          <button className="btn btn-success btn-xs text-white">Adopt</button>
        </th>
      </tr>
  
      
    </tbody>
    {/* foot */}
    <tfoot>
      <tr>
        <th></th>
        <th>Name</th>
        <th>Job</th>
        <th>Favorite Color</th>
        <th></th>
      </tr>
    </tfoot>
    
  </table>
</div>
    </div>
  );
};



export default MyAddedPetsCard;