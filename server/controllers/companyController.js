import Company from "../models/Company.js";
import bcrypt from 'bcrypt'
import { v2 as cloudinary } from 'cloudinary'
import generateToken from "../utils/generateToken.js";
import Job from "../models/Job.js";
import JobApplication from "../models/JobApplication.js";
import { uploadToCloudinary } from '../utils/cloudinary.js'

// Register a new company
export const registerCompany = async (req, res) => {

    const { name, email, password } = req.body

    const imageFile = req.file;

    if (!name || !email || !password || !imageFile) {
        return res.json({ success: false, message: "Missing Details" })
    }

    try {

        const companyExists = await Company.findOne({ email })

        if (companyExists) {
            return res.json({ success: false, message: 'Company already registered' })
        }

        const salt = await bcrypt.genSalt(10)
        const hashPassword = await bcrypt.hash(password, salt)

        const imageUpload = await cloudinary.uploader.upload(imageFile.path)

        const company = await Company.create({
            name,
            email,
            password: hashPassword,
            image: imageUpload.secure_url
        })

        res.json({
            success: true,
            company: {
                _id: company._id,
                name: company.name,
                email: company.email,
                image: company.image
            },
            token: generateToken(company._id)
        })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Login Company
export const loginCompany = async (req, res) => {

    const { email, password } = req.body

    try {

        const company = await Company.findOne({ email })

        if (await bcrypt.compare(password, company.password)) {

            res.json({
                success: true,
                company: {
                    _id: company._id,
                    name: company.name,
                    email: company.email,
                    image: company.image
                },
                token: generateToken(company._id)
            })

        }
        else {
            res.json({ success: false, message: 'Invalid email or password' })
        }

    } catch (error) {
        res.json({ success: false, message: error.message })
    }

}

// Get Company Data
export const getCompanyData = async (req, res) => {

    try {

        const company = req.company

        res.json({ success: true, company })

    } catch (error) {
        res.json({
            success: false, message: error.message
        })
    }

}

// Post New Job
export const postJob = async (req, res) => {

    const { title, description, location, salary, level, category } = req.body

    const companyId = req.company._id

    try {

        const newJob = new Job({
            title,
            description,
            location,
            salary,
            companyId,
            date: Date.now(),
            level,
            category
        })

        await newJob.save()

        res.json({ success: true, newJob })

    } catch (error) {

        res.json({ success: false, message: error.message })

    }


}

// Get Company Job Applicants
export const getCompanyJobApplicants = async (req, res) => {
    try {

        const companyId = req.company._id

        // Find job applications for the user and populate related data
        const applications = await JobApplication.find({ companyId })
            .populate('userId', 'name image resume')
            .populate('jobId', 'title location category level salary')
            .exec()

        return res.json({ success: true, applications })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Get Company Posted Jobs
export const getCompanyPostedJobs = async (req, res) => {
    try {

        const companyId = req.company._id

        const jobs = await Job.find({ companyId })

        // Adding No. of applicants info in data
        const jobsData = await Promise.all(jobs.map(async (job) => {
            const applicants = await JobApplication.find({ jobId: job._id });
            return { ...job.toObject(), applicants: applicants.length }
        }))

        res.json({ success: true, jobsData })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Change Job Application Status
export const ChangeJobApplicationsStatus = async (req, res) => {

    try {

        const { id, status } = req.body

        // Find Job application and update status
        await JobApplication.findOneAndUpdate({ _id: id }, { status })

        res.json({ success: true, message: 'Status Changed' })

    } catch (error) {

        res.json({ success: false, message: error.message })

    }
}

// Change Job Visiblity
export const changeVisiblity = async (req, res) => {
    try {

        const { id } = req.body

        const companyId = req.company._id

        const job = await Job.findById(id)

        if (companyId.toString() === job.companyId.toString()) {
            job.visible = !job.visible
        }

        await job.save()

        res.json({ success: true, job })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Controller for handling company-related operations

// Company login and token generation
export const login = async (req, res) => {
    try {
        const { email, password } = req.body

        // Find company by email
        const company = await Company.findOne({ email })

        // Verify password (in production, use proper password hashing)
        if (!company || company.password !== password) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            })
        }

        // Generate token (in production, use JWT or similar)
        const token = Math.random().toString(36).substring(2)

        // Update company token in database
        company.token = token
        await company.save()

        // Return success response with token
        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            company
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// Create new job listing
export const postJob = async (req, res) => {
    try {
        const { title, description, location, salary, category, level } = req.body
        const companyId = req.company._id // Get company ID from auth middleware

        // Create new job in database
        const job = await Job.create({
            title,
            description,
            location,
            salary,
            category,
            level,
            companyId
        })

        // Return success response
        res.status(201).json({
            success: true,
            message: "Job posted successfully",
            job
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// Update existing job listing
export const updateJob = async (req, res) => {
    try {
        const { id } = req.params
        const { title, description, location, salary, category, level } = req.body
        const companyId = req.company._id

        // Find and update job
        const job = await Job.findOneAndUpdate(
            { _id: id, companyId },
            { title, description, location, salary, category, level },
            { new: true }
        )

        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Job not found"
            })
        }

        res.status(200).json({
            success: true,
            message: "Job updated successfully",
            job
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// Get all job applications for company
export const getApplicants = async (req, res) => {
    try {
        const companyId = req.company._id

        // Find all applications for company's jobs
        const applications = await JobApplication.find({ companyId })
            .populate('jobId')
            .populate('userId')

        res.status(200).json({
            success: true,
            applications
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// Update application status
export const changeApplicationStatus = async (req, res) => {
    try {
        const { id, status } = req.body
        const companyId = req.company._id

        // Find and update application status
        const application = await JobApplication.findOneAndUpdate(
            { _id: id, companyId },
            { status },
            { new: true }
        )

        if (!application) {
            return res.status(404).json({
                success: false,
                message: "Application not found"
            })
        }

        res.status(200).json({
            success: true,
            message: "Application status updated successfully",
            application
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// Update company profile
export const updateCompany = async (req, res) => {
    try {
        const { name, email } = req.body
        const companyId = req.company._id

        // Update company information
        const company = await Company.findByIdAndUpdate(
            companyId,
            { name, email },
            { new: true }
        )

        res.status(200).json({
            success: true,
            message: "Company updated successfully",
            company
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// Upload company logo
export const uploadLogo = async (req, res) => {
    try {
        const companyId = req.company._id
        const logo = req.files.logo

        // Upload logo to Cloudinary
        const logoUrl = await uploadToCloudinary(logo)

        // Update company logo URL
        const company = await Company.findByIdAndUpdate(
            companyId,
            { image: logoUrl },
            { new: true }
        )

        res.status(200).json({
            success: true,
            message: "Logo uploaded successfully",
            company
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// Get company profile
export const getCompany = async (req, res) => {
    try {
        const companyId = req.company._id

        // Find company by ID
        const company = await Company.findById(companyId)

        res.status(200).json({
            success: true,
            company
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}