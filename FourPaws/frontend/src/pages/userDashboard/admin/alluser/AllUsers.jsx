import { useEffect } from 'react';
import { useState } from 'react';

import Swal from 'sweetalert2';
import useAxiosSecure from '../../../../hooks/useAxiosSecure';

const AllUsers = () => {

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const axiosSecure =useAxiosSecure();
    
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await axiosSecure.get('/users');
        console.log('Fetched users:', response.data);
        setUsers(response.data.data || response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
        Swal.fire({
          title: "Error!",
          text: "Failed to fetch users. Please try again.",
          icon: "error",
          confirmButtonText: 'OK',
          customClass: {
            confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
          }
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, [axiosSecure]);

    const handleMakeAdmin = user => {
        Swal.fire({
            title: "Are you sure?",
            text: `Do you want to make ${user.name} an admin?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, make admin!",
            cancelButtonText: "Cancel",
            customClass: {
              confirmButton: 'bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2',
              cancelButton: 'bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded ml-2 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                axiosSecure.patch(`/users/${user._id}/role`, { role: 'admin' })
                .then(res => {
                    console.log(res.data);
                    if(res.data.success){
                        // Re-fetch users to ensure consistency
                        fetchUsers();
                        
                        Swal.fire({
                            title: "Success!",
                            text: `${user.name} is now an Admin`,
                            icon: "success",
                            confirmButtonText: 'OK',
                            customClass: {
                              confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                            }
                        });
                    }
                })
                .catch(error => {
                    console.error('Error making user admin:', error);
                    Swal.fire({
                        title: "Error!",
                        text: "Failed to make user admin",
                        icon: "error",
                        confirmButtonText: 'OK',
                        customClass: {
                          confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                        }
                    });
                });
            }
        });
    }

    const handleRemoveAdmin = user => {
        // Prevent removal of the main admin
        if (user.email === 'admin@example.com') {
            Swal.fire({
                title: "Not Allowed!",
                text: "The main admin cannot be removed from admin role",
                icon: "error",
                confirmButtonText: 'OK',
                customClass: {
                  confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                }
            });
            return;
        }
        
        Swal.fire({
            title: "Are you sure?",
            text: `Do you want to remove ${user.name} as an admin?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, remove admin!",
            cancelButtonText: "Cancel",
            customClass: {
              confirmButton: 'bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2',
              cancelButton: 'bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded ml-2 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                axiosSecure.patch(`/users/${user._id}/role`, { role: 'user' })
                .then(res => {
                    console.log(res.data);
                    if(res.data.success){
                        // Re-fetch users to ensure consistency
                        fetchUsers();
                        
                        Swal.fire({
                            title: "Success!",
                            text: `${user.name} is no longer an Admin`,
                            icon: "success",
                            confirmButtonText: 'OK',
                            customClass: {
                              confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                            }
                        });
                    }
                })
                .catch(error => {
                    console.error('Error removing admin:', error);
                    Swal.fire({
                        title: "Error!",
                        text: "Failed to remove admin privileges",
                        icon: "error",
                        confirmButtonText: 'OK',
                        customClass: {
                          confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                        }
                    });
                });
            }
        });
    }
    
    // Function to fetch users (to be called after updates)
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await axiosSecure.get('/users');
        console.log('Fetched users:', response.data);
        setUsers(response.data.data || response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
        Swal.fire({
          title: "Error!",
          text: "Failed to fetch users. Please try again.",
          icon: "error",
          confirmButtonText: 'OK',
          customClass: {
            confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
          }
        });
      } finally {
        setLoading(false);
      }
    }

    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        </div>
      );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">All Users</h2>
              <p className="text-lg">Total Users: {users.length}</p>
            </div>
            <div className="overflow-x-auto">
  <table className="table">
    {/* head */}
    <thead>
      <tr>
      <th>Profile Image</th>
        <th>Name</th>
        <th>Email</th>
         <th>Role</th>
        <th>Change Role</th>
      </tr>
    </thead>
    <tbody>
      {/* row 1 */}
      {users.map(user => (
              <tr key={user._id}>
     
       
        <td>
          <div className="flex items-center gap-3">
            <div className="avatar">
              <div className="mask mask-squircle w-12 h-12">
                <img 
                  src={user.photoURL} 
                  alt={user.name}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://placehold.co/150x150/e2e8f0/64748b?text=User';
                  }}
                />
              </div>
            </div>
            
          </div>
        </td>
        <td>
         {user.name}
          
        </td>
        <td>{user.email}</td>
        <td>{user.role}</td>
        <th>
            {user.role === 'admin' ? 
                user.email === 'admin@example.com' ? 
                    <span className="badge badge-primary">Main Admin</span> :
                    <button 
                        onClick={() => handleRemoveAdmin(user)} 
                        className="btn btn-warning btn-sm"
                    >
                        Remove Admin
                    </button> : 
                <button 
                    onClick={() => handleMakeAdmin(user)} 
                    className="btn btn-primary btn-sm"
                >
                    Make Admin
                </button>
            }
          
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

export default AllUsers;