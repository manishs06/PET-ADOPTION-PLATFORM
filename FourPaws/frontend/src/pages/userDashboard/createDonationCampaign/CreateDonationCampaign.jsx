import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { PulseLoader } from "react-spinners";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import { uploadImageToImgBB } from "../../../utils/cloudinary"; // This now uses ImgBB

const CreateDonationCampaign = () => {
  const [image, setImage] = useState(null);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const axiosSecure = useAxiosSecure();

  const saveImage = async () => {
    try {
      if (!image) {
        return toast.error("Please upload an image");
      }
  
      // Upload to ImgBB using our utility function
      const imageData = await uploadImageToImgBB(image);
      setUrl(imageData.url);
      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Image upload failed. Please try again.");
    }
  };

  const formik = useFormik({
    initialValues: {
      title: "",
      description: "",
      category: "",
      targetAmount: "",
      endDate: "",
      location: "",
    },
    validationSchema: Yup.object({
      title: Yup.string()
        .required("Title is required")
        .min(5, "Title must be at least 5 characters")
        .max(100, "Title cannot exceed 100 characters"),
      description: Yup.string()
        .required("Description is required")
        .min(20, "Description must be at least 20 characters")
        .max(2000, "Description cannot exceed 2000 characters"),
      category: Yup.string().required("Category is required"),
      targetAmount: Yup.number()
        .required("Target amount is required")
        .positive("Amount must be positive")
        .min(1, "Amount must be at least 1"),
      endDate: Yup.date()
        .required("End date is required")
        .min(new Date(new Date().setDate(new Date().getDate() + 1)), "End date must be in the future"),
      location: Yup.string().required("Location is required"),
    }),
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      setSubmitting(true);
      setLoading(true);
      try {
        if (!url) {
          toast.error("Please upload an image first");
          setSubmitting(false);
          setLoading(false);
          return;
        }

        const campaignData = {
          title: values.title,
          description: values.description,
          category: values.category,
          targetAmount: parseFloat(values.targetAmount),
          endDate: values.endDate,
          location: values.location,
          image: url,
        };

        const response = await axiosSecure.post("/donations", campaignData);
        
        if (response.data.success) {
          toast.success("Donation campaign created successfully!");
          resetForm();
          setUrl("");
          setImage(null);
          navigate("/donationcampaign");
        } else {
          toast.error(response.data.message || "Failed to create campaign");
        }
      } catch (error) {
        console.error("Error creating campaign:", error);
        if (error.response && error.response.data && error.response.data.errors) {
          // Display validation errors from backend
          error.response.data.errors.forEach(err => {
            toast.error(err.msg || "Validation error");
          });
        } else {
          toast.error("Failed to create donation campaign");
        }
      } finally {
        setSubmitting(false);
        setLoading(false);
      }
    },
  });

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
        Create Donation Campaign
      </h2>
      
      <div className="bg-white rounded-lg shadow-lg p-6">
        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Campaign Title
              </label>
              <input
                id="title"
                name="title"
                type="text"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.title}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter campaign title"
              />
              {formik.touched.title && formik.errors.title ? (
                <div className="text-red-500 text-sm mt-1">{formik.errors.title}</div>
              ) : null}
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                id="category"
                name="category"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.category}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select a category</option>
                <option value="medical">Medical</option>
                <option value="food">Food</option>
                <option value="shelter">Shelter</option>
                <option value="rescue">Rescue</option>
                <option value="education">Education</option>
                <option value="other">Other</option>
              </select>
              {formik.touched.category && formik.errors.category ? (
                <div className="text-red-500 text-sm mt-1">{formik.errors.category}</div>
              ) : null}
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.description}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter detailed campaign description (minimum 20 characters)"
            />
            {formik.touched.description && formik.errors.description ? (
              <div className="text-red-500 text-sm mt-1">{formik.errors.description}</div>
              ) : null}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="targetAmount" className="block text-sm font-medium text-gray-700 mb-1">
                Target Amount ($)
              </label>
              <input
                id="targetAmount"
                name="targetAmount"
                type="number"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.targetAmount}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter target amount"
              />
              {formik.touched.targetAmount && formik.errors.targetAmount ? (
                <div className="text-red-500 text-sm mt-1">{formik.errors.targetAmount}</div>
              ) : null}
            </div>

            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                id="endDate"
                name="endDate"
                type="date"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.endDate}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {formik.touched.endDate && formik.errors.endDate ? (
                <div className="text-red-500 text-sm mt-1">{formik.errors.endDate}</div>
              ) : null}
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                id="location"
                name="location"
                type="text"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.location}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter location"
              />
              {formik.touched.location && formik.errors.location ? (
                <div className="text-red-500 text-sm mt-1">{formik.errors.location}</div>
              ) : null}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Campaign Image
            </label>
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setImage(file);
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={saveImage}
                  disabled={!image || loading}
                  className="mt-2 px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary/90 disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center">
                      <PulseLoader color="#ffffff" size={8} className="mr-2" />
                      Uploading...
                    </span>
                  ) : (
                    "Upload Image"
                  )}
                </button>
              </div>
              {url && (
                <div className="mt-2 sm:mt-0">
                  <img 
                    src={url} 
                    alt="Preview" 
                    className="w-32 h-32 object-cover rounded-md border border-gray-300"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={formik.isSubmitting || loading}
              className="px-6 py-3 bg-primary text-white font-medium rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
            >
              {formik.isSubmitting || loading ? (
                <span className="flex items-center">
                  <PulseLoader color="#ffffff" size={8} className="mr-2" />
                  Creating...
                </span>
              ) : (
                "Create Campaign"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateDonationCampaign;