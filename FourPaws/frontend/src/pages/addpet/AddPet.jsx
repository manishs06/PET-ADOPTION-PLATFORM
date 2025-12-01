import { useFormik } from "formik";
import { useContext, useRef } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import Swal from "sweetalert2";
import { AuthContext } from '../../components/providers/AuthWrapper';
import { toast } from "react-toastify";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import { usePetCount } from "../../contexts/PetCountContext";

const AddPet = () => {
  const { user } = useContext(AuthContext);
  const { updatePetCount } = usePetCount();
  const [imageUrl, setImageUrl] = useState('');
  const [category, setCategory] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const axiosSecure = useAxiosSecure();
  const axiosPublic = useAxiosPublic();

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    
    try {
      setUploading(true);
      const response = await axiosPublic.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data.success) {
        const imageUrl = response.data.data.url;
        setImageUrl(imageUrl);
        toast.success('Image uploaded successfully!');
      } else {
        throw new Error('Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };
  
  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const initialValues = {
    name: "",
    age: "",
    category: "",
    breed: "",
    gender: "",
    size: "",
    color: "",
    location: "",
    shortdesp: "",
    longdesp: "",
    adoptionFee: "",
    photo: "",
    // Added health status fields
    vaccinated: false,
    spayedNeutered: false
  };

  const handleCategorySelectChange = (selectedOption) => {
    setFieldValue("category", selectedOption);
    setCategory(selectedOption);
  };

  const categoryOptions = [
    { value: "dogs", label: "Dog" },
    { value: "cats", label: "Cat" },
    { value: "birds", label: "Bird" },
    { value: "rabbits", label: "Rabbit" },
    { value: "hamsters", label: "Hamster" },
    { value: "fish", label: "Fish" }, // Note: "fish" is the same for both category and type
    { value: "other", label: "Other" }
  ];

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFormSubmit = async (formValues) => {
    try {
      if (!imageUrl) {
        toast.error("Please upload an image first");
        return;
      }
      
      setIsSubmitting(true);
      
      const currentDate = new Date();
      const formattedDate = currentDate.toLocaleDateString("en-US");
      const formattedTime = currentDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: true,
      });

      // Prepare pet data for the API
      const petData = {
        name: formValues.name,
        type: formValues.category?.value === 'fish' ? 'fish' : 
              formValues.category?.value === 'birds' ? 'bird' : 
              formValues.category?.value === 'other' ? 'other' : 
              (formValues.category?.value?.slice(0, -1) || 'other'), // Special handling for fish, birds, and other
        breed: formValues.breed || 'Mixed',
        age: parseInt(formValues.age) || 0,
        gender: formValues.gender || 'male',
        size: formValues.size || 'medium',
        color: formValues.color || 'Various',
        description: formValues.longdesp || formValues.shortdesp || 'No detailed description provided for this pet.',
        images: imageUrl ? [imageUrl] : [],
        location: formValues.location || 'Unknown',
        adoptionFee: parseFloat(formValues.adoptionFee) || 0,
        status: 'available',
        isAdopted: false,
        addedDate: new Date().toISOString(),
        category: formValues.category?.value || 'other',
        // Added health status fields
        vaccinated: formValues.vaccinated || false,
        spayedNeutered: formValues.spayedNeutered || false
      };
  
        
        const response = await axiosSecure.post('/pets/legacy', petData);
        
        if (response.data.success) {
          // Update pet count for the added category
          // Use the category value directly from petData
          const categoryValue = petData.category || 'other';
          updatePetCount(categoryValue, 1);
          
          Swal.fire({
            title: "Success!",
            text: "Pet Added Successfully",
            icon: "success",
            confirmButtonText: "Ok",
            customClass: {
              confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
            }
          });
          navigate('/');
        } else {
          toast.error(response.data.message || "Failed to add pet. Please try again.");
        }
      } catch (error) {
        console.error("Error adding pet:", error);
        // Show more detailed error message
        const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || "Failed to add pet. Please try again.";
        toast.error(`Error: ${errorMessage}`);
      } finally {
        setIsSubmitting(false);
      }
    };

  const formik = useFormik({
    initialValues,
    onSubmit: handleFormSubmit,
  });
  

  const { values, errors, touched, handleChange, handleBlur, handleSubmit, setFieldValue } = formik;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Add New Pet</h1>
      <form onSubmit={(e) => {
        e.preventDefault();
        handleFormSubmit(values);
      }} className="space-y-4">
        <div className="mb-4">
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text">Pet Photo</span>
            </label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
            />
            <div 
              className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={handleImageClick}
            >
              {imageUrl ? (
                <div className="relative">
                  <img 
                    src={imageUrl} 
                    alt="Preview" 
                    className="max-h-48 mx-auto rounded-lg"
                  />
                  <div className="mt-2 text-sm text-gray-500">
                    Click to change image
                  </div>
                </div>
              ) : (
                <div className="py-8">
                  <div className="text-gray-500 mb-2">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-12 w-12 mx-auto" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={1} 
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                      />
                    </svg>
                  </div>
                  <div className="text-sm text-gray-500">
                    {uploading ? 'Uploading...' : 'Click to upload an image'}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    JPG, PNG up to 5MB
                  </div>
                </div>
              )}
            </div>
          </div>
        </div> 
        {!imageUrl && (
            <p className="text-red-500 text-sm mt-1">Please upload an image</p>
          )}
        <div className="mb-5">
          <label className="mb-3 block text-base font-medium text-[#07074D]">
            Add the Pet Name
          </label>
          <input
            type="text"
            name="name"
            id="name"
            placeholder="Name"
            value={values.name}
            onChange={handleChange}
            onBlur={handleBlur}
            min="0"
            autoComplete="off"
            className="w-full appearance-none rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
          />
          {errors.name && touched.name? (<p className=" text-error">{errors.name}</p>):null}
        </div>
        <div className="mb-5">
          <label htmlFor="pet_location" className="mb-3 block text-base font-medium text-[#07074D]">
            Add the Pet Location
          </label>
          <input
            type="text"
            name="location"
            id="location"
            placeholder="pet location"
            value={values.location}
            onChange={handleChange}
            onBlur={handleBlur}
            min="0"
            className="w-full appearance-none rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
          />
          {errors.location && touched.location? (<p className=" text-error">{errors.location}</p>):null}
        </div>
        <div className="mb-5">
          <label htmlFor="pet_category" className="mb-3 block text-base font-medium text-[#07074D]">
            Pet Category
          </label>
          <Select
            name="pet_category"
            id="pet_category"
            value={category}
            required
            options={categoryOptions}
            onChange={handleCategorySelectChange}
            className="w-full rounded-md border border-[#e0e0e0] bg-white text-base font-medium text-[#6B7280] focus:border-[#6A64F1] focus:shadow-md"
          />
          {errors.category && touched.category? (<p className=" text-error">{errors.category}</p>):null}
        </div>
        <div className="-mx-3 flex flex-wrap">
          <div className="w-full px-3 sm:w-1/2">
            <div className="mb-5">
              <label htmlFor="age" className="mb-3 block text-base font-medium text-[#07074D]">
                Pet Age
              </label>
              <input
                type="number"
                name="age"
                id="age"
                autoComplete="off"
                placeholder="Pet Age"
                value={values.age}
                onChange={handleChange}
                onBlur={handleBlur}
                className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
              />
              {errors.age && touched.age? (<p className=" text-error">{errors.age}</p>):null}
            </div>
          </div>
          <div className="w-full px-3 sm:w-1/2">
            <div className="mb-5">
              <label htmlFor="breed" className="mb-3 block text-base font-medium text-[#07074D]">
                Pet Breed
              </label>
              <input
                type="text"
                name="breed"
                id="breed"
                autoComplete="off"
                placeholder="e.g., Golden Retriever, Persian, Mixed"
                value={values.breed}
                onChange={handleChange}
                onBlur={handleBlur}
                className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
              />
              {errors.breed && touched.breed? (<p className=" text-error">{errors.breed}</p>):null}
            </div>
          </div>
        </div>
        
        <div className="-mx-3 flex flex-wrap">
          <div className="w-full px-3 sm:w-1/3">
            <div className="mb-5">
              <label htmlFor="gender" className="mb-3 block text-base font-medium text-[#07074D]">
                Gender
              </label>
              <select
                name="gender"
                id="gender"
                value={values.gender}
                onChange={handleChange}
                onBlur={handleBlur}
                className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
              {errors.gender && touched.gender? (<p className=" text-error">{errors.gender}</p>):null}
            </div>
          </div>
          <div className="w-full px-3 sm:w-1/3">
            <div className="mb-5">
              <label htmlFor="size" className="mb-3 block text-base font-medium text-[#07074D]">
                Size
              </label>
              <select
                name="size"
                id="size"
                value={values.size}
                onChange={handleChange}
                onBlur={handleBlur}
                className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
              >
                <option value="">Select Size</option>
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
              {errors.size && touched.size? (<p className=" text-error">{errors.size}</p>):null}
            </div>
          </div>
          <div className="w-full px-3 sm:w-1/3">
            <div className="mb-5">
              <label htmlFor="color" className="mb-3 block text-base font-medium text-[#07074D]">
                Color
              </label>
              <input
                type="text"
                name="color"
                id="color"
                autoComplete="off"
                placeholder="e.g., Brown, Black, White"
                value={values.color}
                onChange={handleChange}
                onBlur={handleBlur}
                className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
              />
              {errors.color && touched.color? (<p className=" text-error">{errors.color}</p>):null}
            </div>
          </div>
        </div>
              {/* <div className="mb-5">
                <label htmlFor="pet_category" className="mb-3 block text-base font-medium text-[#07074D]">
                  Pet Category
                </label>
                <select
                  name="pet_category"
                  id="pet_category"
                  value={category_name}
                  autoComplete="off"
                  onChange={handleCategorySelectChange}
                  className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
                >
                  <option value="">Select</option>
                  <option value="Novel">Dog</option>
                  <option value="History">Cat</option>
                  <option value="Drama">Bird</option>
                  <option value="Mystery">Rabbit</option>
                  <option value="Mystery">Lion</option>
                </select>
              </div> */}
        <div className="mb-5">
          <label htmlFor="shortdesp" className="mb-3 block text-base font-medium text-[#07074D]">
            Add Short Description
          </label>
          <input
            type="text"
            name="shortdesp"
            id="shortdesp"
            placeholder="Short Description"
            value={values.shortdesp}
            onChange={handleChange}
            onBlur={handleBlur}
            min="0"
            autoComplete="off"
            className="w-full appearance-none rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
          />
          {errors.shortdesp && touched.shortdesp? (<p className=" text-error">{errors.shortdesp}</p>):null}
        </div>
        <div className="mb-5">
          <label htmlFor="longdesp" className="mb-3 block text-base font-medium text-[#07074D]">
            Add Long Description
          </label>
          <textarea
            name="longdesp"
            id="longdesp"
            placeholder="Long Description"
            value={values.longdesp}
            onChange={handleChange}
            onBlur={handleBlur}
            min="0"
            autoComplete="off"
            rows="4"
            className="w-full appearance-none rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md resize-none"
          />
          {errors.longdesp && touched.longdesp? (<p className=" text-error">{errors.longdesp}</p>):null}
        </div>
        <div className="mb-5">
          <label htmlFor="adoptionFee" className="mb-3 block text-base font-medium text-[#07074D]">
            Adoption Fee (Optional)
          </label>
          <input
            type="number"
            name="adoptionFee"
            id="adoptionFee"
            placeholder="0.00"
            value={values.adoptionFee}
            onChange={handleChange}
            onBlur={handleBlur}
            min="0"
            step="0.01"
            autoComplete="off"
            className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
          />
          {errors.adoptionFee && touched.adoptionFee? (<p className=" text-error">{errors.adoptionFee}</p>):null}
        </div>
        
        {/* Health Status Section */}
        <div className="mb-5">
          <label className="mb-3 block text-base font-medium text-[#07074D]">
            Health Status
          </label>
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                name="vaccinated"
                id="vaccinated"
                checked={values.vaccinated}
                onChange={handleChange}
                className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <label htmlFor="vaccinated" className="ml-2 text-base font-medium text-[#07074D]">
                Is the pet vaccinated?
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                name="spayedNeutered"
                id="spayedNeutered"
                checked={values.spayedNeutered}
                onChange={handleChange}
                className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <label htmlFor="spayedNeutered" className="ml-2 text-base font-medium text-[#07074D]">
                Is the pet spayed/neutered?
              </label>
            </div>
          </div>
        </div>
        
        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="hover:shadow-form rounded-md hover:bg-blue-400 py-3 px-8 text-center text-base font-semibold text-white outline-none w-full bg-[#ff0000] disabled:opacity-50"
          >
            {isSubmitting ? 'Adding Pet...' : 'Add Pet'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddPet;