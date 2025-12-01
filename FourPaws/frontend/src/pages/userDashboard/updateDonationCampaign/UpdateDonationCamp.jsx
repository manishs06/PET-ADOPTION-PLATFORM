import { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { PulseLoader } from "react-spinners";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import { uploadImageToImgBB } from "../../../utils/cloudinary"; // This now uses ImgBB

const UpdateDonationCamp = () => {
  const [image, setImage] = useState(null);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { donationCampaignId } = useParams();
  const axiosSecure = useAxiosSecure();

  useEffect(() => {
    // Fetch existing campaign data
    const fetchCampaign = async () => {
      try {
        const response = await axiosSecure.get(`/donations/${donationCampaignId}`);
        const campaign = response.data.data;
        
        // Format the date properly, with a fallback if endDate is not available
        const formattedDate = campaign.endDate ? new Date(campaign.endDate).toISOString().split('T')[0] : "";
        
        formik.setValues({
          title: campaign.title || "",
          description: campaign.description || "",
          category: campaign.category || "",
          targetAmount: campaign.targetAmount || "",
          endDate: formattedDate,
        });
        
        setUrl(campaign.image || "");
      } catch (error) {
        console.error("Error fetching campaign:", error);
        toast.error("Failed to load campaign data");
      }
    };

    if (donationCampaignId) {
      fetchCampaign();
    }
  }, [donationCampaignId, axiosSecure]);

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
    },
    validationSchema: Yup.object({
      title: Yup.string().required("Title is required"),
      description: Yup.string().required("Description is required"),
      category: Yup.string().required("Category is required"),
      targetAmount: Yup.number()
        .required("Target amount is required")
        .positive("Amount must be positive"),
      endDate: Yup.date()
        .required("End date is required")
        .min(new Date(), "End date must be in the future"),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitting(true);
      setLoading(true);
      try {
        const campaignData = {
          ...values,
          targetAmount: parseFloat(values.targetAmount),
          image: url || undefined, // Only include image if it's been updated
          endDate: new Date(values.endDate).toISOString(), // Convert to ISO string
        };

        const response = await axiosSecure.put(`/donations/${donationCampaignId}`, campaignData);
        
        if (response.data.success) {
          toast.success("Donation campaign updated successfully!");
          navigate("/donationcampaign");
        } else {
          toast.error(response.data.message || "Failed to update campaign");
        }
      } catch (error) {
        console.error("Error updating campaign:", error);
        toast.error("Failed to update donation campaign");
      } finally {
        setSubmitting(false);
        setLoading(false);
      }
    },
  });

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
        Update Donation Campaign
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
              placeholder="Enter campaign description"
            />
            {formik.touched.description && formik.errors.description ? (
              <div className="text-red-500 text-sm mt-1">{formik.errors.description}</div>
              ) : null}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="targetAmount" className="block text-sm font-medium text-gray-700 mb-1">
                Target Amount
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
                    "Upload New Image"
                  )}
                </button>
              </div>
              {(url || formik.initialValues.image) && (
                <div className="mt-2 sm:mt-0">
                  <img 
                    src={url || formik.initialValues.image} 
                    alt="Preview" 
                    className="w-32 h-32 object-cover rounded-md border border-gray-300"
                  />
                  <p className="text-xs text-gray-500 mt-1">Current image</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-3 bg-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formik.isSubmitting || loading}
              className="px-6 py-3 bg-primary text-white font-medium rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
            >
              {formik.isSubmitting || loading ? (
                <span className="flex items-center">
                  <PulseLoader color="#ffffff" size={8} className="mr-2" />
                  Updating...
                </span>
              ) : (
                "Update Campaign"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateDonationCamp;