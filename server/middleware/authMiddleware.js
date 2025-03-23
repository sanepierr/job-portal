import { auth } from '@clerk/nextjs'
import User from '../models/User.js'
import Company from '../models/Company.js'

// Middleware for protecting routes that require user authentication
export const protectUser = async (req, res, next) => {
    try {
        // Get user ID from Clerk auth
        const { userId } = auth()

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Please login to access this resource"
            })
        }

        // Find user in database
        const user = await User.findOne({ clerkId: userId })

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found"
            })
        }

        // Add user to request object
        req.user = user
        next()

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// Middleware for protecting routes that require company authentication
export const protectCompany = async (req, res, next) => {
    try {
        // Get organization ID from Clerk auth
        const { orgId } = auth()

        if (!orgId) {
            return res.status(401).json({
                success: false,
                message: "Please login as a company to access this resource"
            })
        }

        // Find company in database
        const company = await Company.findOne({ clerkId: orgId })

        if (!company) {
            return res.status(401).json({
                success: false,
                message: "Company not found"
            })
        }

        // Add company to request object
        req.company = company
        next()

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}