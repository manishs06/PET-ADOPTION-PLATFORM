import { useContext, useState } from 'react';
import Swal from 'sweetalert2';
import { AuthContext } from '../../../components/providers/AuthWrapper';
import { Link, useLoaderData } from 'react-router-dom';
import { getDefaultPetImage } from '../../../utils/petImageDefaults';

const AdoptPet = () => {
  const details = useLoaderData();
  const { user } = useContext(AuthContext);
  const [phone, setPhone] = useState("");
  const [userAddress, setUserAddress] = useState("");

  const { _id, name, location,
    category,
    image,
    images,
    age,
    description: longdesp,
    shortdesp,
    owner,
    adoptionFee } = details;
  
  // Extract owner email - handle both populated and non-populated owner
  const ownerEmail = typeof owner === 'object' ? owner.email : null;
  const ownerId = typeof owner === 'object' ? owner._id : owner;
    
  
  const handleAddToCart = async (e) => {
    e.preventDefault();
    
    // Validate required fields first
    if (!userAddress.trim()) {
      Swal.fire({
        title: 'Error!',
        text: 'Please enter your address.',
        icon: 'error',
        confirmButtonText: 'Ok',
        customClass: {
          confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
        }
      });
      return;
    }

    if (!phone.trim()) {
      Swal.fire({
        title: 'Error!',
        text: 'Please enter your phone number.',
        icon: 'error',
        confirmButtonText: 'Ok',
        customClass: {
          confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
        }
      });
      return;
    }

    // Get owner email from details
    const petOwnerEmail = ownerEmail || details.ownerEmail || '';

    // Get current date in YYYY-MM-DD format
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;

    // Ensure we have a valid pet ID
    const petId = _id || details._id || details.id || '';
    if (!petId) {
      Swal.fire({
        title: 'Error!',
        text: 'Pet information is incomplete. Please try again later.',
        icon: 'error',
        confirmButtonText: 'Ok',
        customClass: {
          confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
        }
      });
      return;
    }

    // Ensure we have a valid pet name
    const petName = name || details.name || '';
    if (!petName) {
      Swal.fire({
        title: 'Error!',
        text: 'Pet name is missing. Please try again later.',
        icon: 'error',
        confirmButtonText: 'Ok',
        customClass: {
          confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
        }
      });
      return;
    }

    // Ensure we have a valid pet category
    const petCategory = category || details.category || details.type || '';
    if (!petCategory) {
      Swal.fire({
        title: 'Error!',
        text: 'Pet category is missing. Please try again later.',
        icon: 'error',
        confirmButtonText: 'Ok',
        customClass: {
          confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
        }
      });
      return;
    }

    const addtoadopt = {
      userEmail: user?.email || '',
      userName: user?.displayName || user?.name || 'Anonymous User',
      adoptDate: formattedDate,
      userAddress: userAddress.trim(),
      phone: phone.trim(),
      ownerEmail: petOwnerEmail,
      petId: petId,
      name: petName,
      category: petCategory,
      image: images?.[0] || image || details.image || details.images?.[0] || getDefaultPetImage(petCategory),
      longdesp: longdesp || details.longdesp || details.description || '',
      shortdesp: shortdesp || details.shortdesp || details.description || '',
      adopt_Req: true,
    };

    // Log the adoption request data for debugging
    console.log('Adoption request data:', addtoadopt);

    // Close the modal before making the fetch request
    document.getElementById('my_modal_4').close();

    fetch(`${import.meta.env.VITE_API_BASE_URL}/adoption-requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(addtoadopt),
    })
      .then(async (res) => {
        const data = await res.json();
        console.log('Server response:', data);
        if (!res.ok) {
          console.error('Server validation error:', data);
          console.error('Validation errors:', data.errors);
          if (data.errors) {
            data.errors.forEach((error, index) => {
              console.error(`Error ${index + 1}:`, error);
            });
          }
          throw new Error(`Server error: ${data.message || 'Unknown error'}`);
        }
        return data;
      })
      .then((data) => {
        if (data.success) {
          Swal.fire({
            title: 'Success!',
            text: 'Adoption request sent successfully',
            icon: 'success',
            confirmButtonText: 'Ok',
            customClass: {
              confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
            }
          });
          // Reset form fields
          setPhone("");
          setUserAddress("");
        }
      })
      .catch((error) => {
        console.error('Adoption request error:', error);
        Swal.fire({
          title: 'Error!',
          text: error.message || 'Failed to send adoption request',
          icon: 'error',
          confirmButtonText: 'Ok',
          customClass: {
            confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
          }
        });
      });
  };

  return (
    <div className='mt-32'>
      <div className="card card-side bg-base-100 shadow-xl w-6/12 h-4/12 mx-auto my-20">
        <figure>
          <img 
            src={images?.[0] || image || getDefaultPetImage(category)} 
            alt={name} 
            className='w-12/12' 
            onError={(e) => {
              e.target.onerror = null;
              // Use our own default image instead of placeholder.com
              e.target.src = getDefaultPetImage(category);
            }} 
          />
        </figure>
        <div className="card-body">
          <h2 className="card-title">{name}</h2>
          <p>{shortdesp}</p>
          
          {/* Adoption Fee Display */}
          {adoptionFee && adoptionFee > 0 && (
            <p className="font-semibold text-lg text-green-600">
              Adoption Fee: ₹{parseFloat(adoptionFee).toFixed(2)}
            </p>
          )}
          
          <p><span className="font-semibold">Age:</span> {age}</p>
          <p><span className="font-semibold">Location:</span> {location}</p>
          
          {/* Vaccination Status */}
          {details.vaccinated !== undefined && (
            <p className={details.vaccinated ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
              Vaccinated: {details.vaccinated ? 'Yes' : 'No'}
            </p>
          )}
          
          {/* Neutering Status */}
          {details.spayedNeutered !== undefined && (
            <p className={details.spayedNeutered ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
              Spayed/Neutered: {details.spayedNeutered ? 'Yes' : 'No'}
            </p>
          )}
          
          <p>{longdesp}</p>
          <div className="p-6 pt-0 flex gap-4">
            {user?.email === (owner?.email || details.owner?.email) ? (
              <div className="block w-full select-none rounded-lg bg-gray-400 py-3 px-6 text-center align-middle font-sans text-xs font-bold uppercase text-white cursor-not-allowed">
                This is your pet
              </div>
            ) : (
              <>
                <button
                  onClick={() => document.getElementById('my_modal_4').showModal()}
                  className="block w-full select-none rounded-lg bg-blue-500 py-3 px-6 text-center align-middle font-sans text-xs font-bold uppercase text-blue-gray-900 transition-all hover:scale-105 focus:scale-105 focus:opacity-[0.85] active:scale-100 active:opacity-[0.85] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                  type="button"
                >
                  Send Request
                </button>
              </>
            )}
            <dialog id="my_modal_4" className="modal">
              <div className="modal-box w-11/12 max-w-2xl rounded-xl shadow-xl p-6">
                <h3 className="font-bold text-xl text-center mb-6 text-gray-800">Adoption Request Form</h3>
                
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      User Name
                    </label>
                    <input
                      type="text"
                      name="displayName"
                      id="displayName"
                      defaultValue={user?.displayName || user?.name || 'Not available'}
                      placeholder="Name"
                      readOnly
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">This field is automatically filled from your account and cannot be changed</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      User Email
                    </label>
                    <input
                      type="text"
                      name="userEmail"
                      id="userEmail"
                      defaultValue={user?.email}
                      placeholder="Email"
                      readOnly
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">This field is automatically filled from your account and cannot be changed</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      User Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Enter Your Phone Number"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      User Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      id="address"
                      value={userAddress}
                      onChange={(e) => setUserAddress(e.target.value)}
                      placeholder="Enter Your Address"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Health Requirements Agreement */}
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                    <div className="flex items-start mb-3">
                      <div className="flex items-center h-5">
                        <input
                          id="healthAgreement"
                          type="checkbox"
                          required
                          className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                        />
                      </div>
                      <label htmlFor="healthAgreement" className="ml-2 text-sm font-medium text-gray-900">
                        I agree to ensure the pet receives proper veterinary care, including vaccinations and (if applicable) spaying/neutering as recommended by veterinarians.
                      </label>
                    </div>
                    
                    {/* Display pet's current health status */}
                    <div className="mt-4 p-3 bg-white rounded-md border border-blue-200">
                      <h4 className="font-semibold text-blue-800 mb-2">Pet Health Information:</h4>
                      <ul className="space-y-2">
                        {details.vaccinated !== undefined && (
                          <li className="flex items-center">
                            <svg className={`w-5 h-5 mr-2 ${details.vaccinated ? 'text-green-500' : 'text-yellow-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm">Vaccination Status: 
                              <span className={`font-medium ml-1 ${details.vaccinated ? 'text-green-600' : 'text-yellow-600'}`}>
                                {details.vaccinated ? 'Up to date' : 'Pending'}
                              </span>
                            </span>
                          </li>
                        )}
                        {details.spayedNeutered !== undefined && (
                          <li className="flex items-center">
                            <svg className={`w-5 h-5 mr-2 ${details.spayedNeutered ? 'text-green-500' : 'text-yellow-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm">Spayed/Neutered: 
                              <span className={`font-medium ml-1 ${details.spayedNeutered ? 'text-green-600' : 'text-yellow-600'}`}>
                                {details.spayedNeutered ? 'Completed' : 'Pending'}
                              </span>
                            </span>
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="modal-action mt-6">
                  <form method="dialog" className="flex flex-col sm:flex-row gap-3 w-full">
                    <button
                      className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                      type="submit"
                      onClick={(e) => handleAddToCart(e)}
                    >
                      Submit Request
                    </button>
                    <button 
                      className="flex-1 px-4 py-3 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                      type="button"
                      onClick={() => document.getElementById('my_modal_4').close()}
                    >
                      Close
                    </button>
                  </form>
                </div>
              </div>
            </dialog>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AdoptPet;