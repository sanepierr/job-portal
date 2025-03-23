import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary with credentials from environment variables
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

// Upload file to Cloudinary
export const uploadToCloudinary = async (file) => {
    try {
        // Check if file exists
        if (!file) {
            throw new Error('No file provided')
        }

        // Upload file to Cloudinary
        const result = await cloudinary.uploader.upload(file.tempFilePath, {
            folder: 'job-portal', // Store in specific folder
            resource_type: 'auto', // Automatically detect file type
            allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'], // Allowed file formats
            max_file_size: 10 * 1024 * 1024 // Max file size: 10MB
        })

        // Return uploaded file URL
        return result.secure_url

    } catch (error) {
        console.error('Cloudinary upload error:', error)
        throw new Error('Error uploading file to Cloudinary')
    }
}

// Delete file from Cloudinary
export const deleteFromCloudinary = async (publicId) => {
    try {
        // Check if public ID exists
        if (!publicId) {
            throw new Error('No public ID provided')
        }

        // Delete file from Cloudinary
        const result = await cloudinary.uploader.destroy(publicId)

        // Return deletion result
        return result

    } catch (error) {
        console.error('Cloudinary deletion error:', error)
        throw new Error('Error deleting file from Cloudinary')
    }
}