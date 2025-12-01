// ImgBB utility functions
export const uploadImageToImgBB = async (file) => {
  if (!file) {
    throw new Error("No file provided");
  }

  // Validate file type
  if (!file.type.startsWith('image/')) {
    throw new Error("Please select a valid image file");
  }
  
  // Validate file size (max 32MB for ImgBB)
  if (file.size > 32 * 1024 * 1024) {
    throw new Error("Image size should be less than 32MB");
  }

  try {
    const formData = new FormData();
    formData.append("image", await toBase64(file));

    const response = await fetch(
      `https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMGBB_API_KEY}`,
      {
        method: "POST",
        body: formData
      }
    );

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.success || !data.data || !data.data.url) {
      throw new Error("Upload failed - no URL returned");
    }

    return {
      url: data.data.url,
      publicId: data.data.id,
      deleteUrl: data.data.delete_url,
      width: data.data.width,
      height: data.data.height
    };
  } catch (error) {
    console.error("ImgBB upload error:", error);
    throw error;
  }
};

// Helper function to convert file to base64
const toBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // Extract base64 data from data URL
      const base64Data = reader.result.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = error => reject(error);
  });
};

// Generate optimized image URL - ImgBB provides different sizes automatically
export const getOptimizedImageUrl = (url, options = {}) => {
  const {
    width = 800,
    height = 600
  } = options;

  // ImgBB URLs are already optimized, but we can append query parameters for sizing
  // This is a simple approach - in practice, you might want to use the thumbnail or medium URLs
  // that ImgBB provides in the response
  return `${url}?width=${width}&height=${height}`;
};