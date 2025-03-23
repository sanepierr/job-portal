import Job from "../models/Job.js"
import JobApplication from "../models/JobApplication.js"
import User from "../models/User.js"
import { v2 as cloudinary } from "cloudinary"
import { uploadToCloudinary } from '../utils/cloudinary.js'
import { toast } from 'react-toastify'

// Get User Data
export const getUserData = async (req, res) => {
    const userId = req.auth.userId
    const userEmail = req.auth.email
    const userName = req.auth.name
    const userImage = req.auth.imageUrl

    try {
        let user = await User.findById(userId)

        if (!user) {
            // Create new user if doesn't exist
            user = await User.create({
                _id: userId,
                name: userName,
                email: userEmail,
                image: userImage,
                resume: ""
            })
        }

        res.json({ success: true, user })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}


// Apply For Job
export const applyForJob = async (req, res) => {

    const { jobId } = req.body

    const userId = req.auth.userId

    try {

        const isAlreadyApplied = await JobApplication.find({ jobId, userId })

        if (isAlreadyApplied.length > 0) {
            return res.json({ success: false, message: 'Already Applied' })
        }

        const jobData = await Job.findById(jobId)

        if (!jobData) {
            return res.json({ success: false, message: 'Job Not Found' })
        }

        await JobApplication.create({
            companyId: jobData.companyId,
            userId,
            jobId,
            date: Date.now()
        })

        res.json({ success: true, message: 'Applied Successfully' })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }

}

// Get User Applied Applications Data
export const getUserJobApplications = async (req, res) => {

    try {

        const userId = req.auth.userId

        const applications = await JobApplication.find({ userId })
            .populate('companyId', 'name email image')
            .populate('jobId', 'title description location category level salary')
            .exec()

        if (!applications) {
            return res.json({ success: false, message: 'No job applications found for this user.' })
        }

        return res.json({ success: true, applications })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }

}

// Update User Resume
export const updateUserResume = async (req, res) => {
    try {

        const userId = req.auth.userId

        const resumeFile = req.file

        const userData = await User.findById(userId)

        if (resumeFile) {
            const resumeUpload = await cloudinary.uploader.upload(resumeFile.path)
            userData.resume = resumeUpload.secure_url
        }

        await userData.save()

        return res.json({ success: true, message: 'Resume Updated' })

    } catch (error) {

        res.json({ success: false, message: error.message })

    }
}

// Controller for handling user-related operations

// Update user profile information
export const updateUser = async (req, res) => {
    try {
        // Extract user data from request
        const { name, email } = req.body
        const userId = req.auth.userId // Get user ID from Clerk authentication

        // Find and update user in database
        const user = await User.findOneAndUpdate(
            { clerkId: userId },
            { name, email },
            { new: true, runValidators: true }
        )

        // Return success response with updated user data
        res.status(200).json({
            success: true,
            message: "User updated successfully",
            user
        })

    } catch (error) {
        // Handle errors and return error response
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// Handle resume upload and storage
export const updateResume = async (req, res) => {
    try {
        const userId = req.auth.userId // Get user ID from Clerk authentication
        const resume = req.files.resume // Get resume file from request

        // Upload resume to Cloudinary
        const resumeUrl = await uploadToCloudinary(resume)

        // Update user's resume URL in database
        const user = await User.findOneAndUpdate(
            { clerkId: userId },
            { resume: resumeUrl },
            { new: true }
        )

        // Return success response
        res.status(200).json({
            success: true,
            message: "Resume updated successfully",
            user
        })

    } catch (error) {
        // Handle errors and return error response
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// Get user profile information
export const getUser = async (req, res) => {
    try {
        const userId = req.auth.userId // Get user ID from Clerk authentication

        // Find user in database
        const user = await User.findOne({ clerkId: userId })

        // Return user data
        res.status(200).json({
            success: true,
            user
        })

    } catch (error) {
        // Handle errors and return error response
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// Get all job applications for a user
export const getUserApplications = async (req, res) => {
    try {
        const userId = req.auth.userId // Get user ID from Clerk authentication

        // Find user's applications with populated job and company data
        const applications = await JobApplication.find({ userId })
            .populate('jobId')
            .populate('companyId')

        // Return applications data
        res.status(200).json({
            success: true,
            applications
        })

    } catch (error) {
        // Handle errors and return error response
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// Handle Clerk webhook events for user management
export const handleUserCreated = async (data) => {
    try {
        // Create new user in database when signed up with Clerk
        const user = await User.create({
            name: data.data.first_name + " " + data.data.last_name,
            email: data.data.email_addresses[0].email_address,
            image: data.data.image_url,
            clerkId: data.data.id
        })

        // Log success
        console.log("User created successfully", user)

    } catch (error) {
        // Log error
        console.error("Error creating user:", error)
    }
}

// Update user data when Clerk profile is updated
export const handleUserUpdated = async (data) => {
    try {
        // Update user in database with new Clerk data
        const user = await User.findOneAndUpdate(
            { clerkId: data.data.id },
            {
                name: data.data.first_name + " " + data.data.last_name,
                email: data.data.email_addresses[0].email_address,
                image: data.data.image_url
            },
            { new: true }
        )

        // Log success
        console.log("User updated successfully", user)

    } catch (error) {
        // Log error
        console.error("Error updating user:", error)
    }
}

// Remove user data when deleted from Clerk
export const handleUserDeleted = async (data) => {
    try {
        // Delete user from database
        await User.findOneAndDelete({ clerkId: data.data.id })

        // Log success
        console.log("User deleted successfully")

    } catch (error) {
        // Log error
        console.error("Error deleting user:", error)
    }
}