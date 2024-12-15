import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

/**
 * Uploads a media file to Cloudinary.
 * @param {string} file - The file path to be uploaded.
 * @returns {Promise<Object>} The upload response from Cloudinary.
 */
export const uploadMedia = async (file) => {
  try {
    const uploadResponse = await cloudinary.uploader.upload(file, {
      resource_type: "auto", // Corrected spelling
    });
    return uploadResponse;
  } catch (error) {
    console.error("Error uploading media:", error.message);
    throw error; // Re-throw error for upstream handling
  }
};

/**
 * Deletes a media file from Cloudinary.
 * @param {string} publicId - The public ID of the media to delete.
 */
export const deleteMediaFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Error deleting media:", error.message);
    throw error;
  }
};

/**
 * Deletes a video file from Cloudinary.
 * @param {string} publicId - The public ID of the video to delete.
 */
export const deleteVideoFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: "video" }); // Corrected spelling
  } catch (error) {
    console.error("Error deleting video:", error.message);
    throw error;
  }
};
