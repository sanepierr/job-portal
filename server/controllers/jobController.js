import Job from "../models/Job.js"
import JobApplication from "../models/JobApplication.js"

// Controller for handling job-related operations

// Get all job listings with optional filters
export const getJobs = async (req, res) => {
    try {
        const { category, level, location, search } = req.query

        // Build query object based on filters
        const query = {}
        if (category) query.category = category
        if (level) query.level = level
        if (location) query.location = location
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ]
        }

        // Find jobs matching query
        const jobs = await Job.find(query)
            .populate('companyId', 'name image')
            .sort({ date: -1 })

        res.status(200).json({
            success: true,
            jobs
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// Get single job by ID
export const getJob = async (req, res) => {
    try {
        const { id } = req.params

        // Find job and populate company details
        const job = await Job.findById(id)
            .populate('companyId', 'name image')

        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Job not found"
            })
        }

        res.status(200).json({
            success: true,
            job
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// Apply for a job
export const applyJob = async (req, res) => {
    try {
        const { jobId } = req.params
        const userId = req.user._id // Get user ID from auth middleware

        // Check if job exists
        const job = await Job.findById(jobId)
        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Job not found"
            })
        }

        // Check if user has already applied
        const existingApplication = await JobApplication.findOne({
            jobId,
            userId
        })

        if (existingApplication) {
            return res.status(400).json({
                success: false,
                message: "You have already applied for this job"
            })
        }

        // Create new application
        const application = await JobApplication.create({
            jobId,
            userId,
            companyId: job.companyId,
            status: 'pending'
        })

        // Add application to job's applicants array
        job.applicants.push(userId)
        await job.save()

        res.status(201).json({
            success: true,
            message: "Application submitted successfully",
            application
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// Get user's job applications
export const getUserApplications = async (req, res) => {
    try {
        const userId = req.user._id

        // Find all applications for user
        const applications = await JobApplication.find({ userId })
            .populate('jobId')
            .populate('companyId', 'name image')
            .sort({ date: -1 })

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