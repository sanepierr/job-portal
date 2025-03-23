// Import required dependencies and configurations
import './config/instrument.js'  // Sentry instrumentation for error tracking
import express from 'express'    // Web framework
import cors from 'cors'         // Cross-origin resource sharing
import 'dotenv/config'          // Environment variables
import connectDB from './config/db.js'  // Database connection
import * as Sentry from "@sentry/node"; // Error tracking service
import { clerkWebhooks } from './controllers/webhooks.js'  // Clerk authentication webhooks
import companyRoutes from './routes/companyRoutes.js'      // Company-related routes
import connectCloudinary from './config/cloudinary.js'     // Cloud storage for files
import jobRoutes from './routes/jobRoutes.js'             // Job-related routes
import userRoutes from './routes/userRoutes.js'           // User-related routes
import { clerkMiddleware } from '@clerk/express'          // Clerk authentication middleware

// Initialize Express application
const app = express()

// Connect to MongoDB database
connectDB()
// Connect to Cloudinary for file storage
await connectCloudinary()

// Middleware Configuration
app.use(cors())              // Enable CORS for all routes
app.use(express.json())      // Parse JSON request bodies

// Public Routes (No authentication required)
app.get('/', (req, res) => res.send("API Working"))  // Health check endpoint
app.get("/debug-sentry", function mainHandler(req, res) {
  throw new Error("My first Sentry error!");  // Test Sentry error tracking
});
app.post('/webhooks', clerkWebhooks)  // Handle Clerk authentication webhooks

// Apply Clerk authentication middleware for protected routes
app.use(clerkMiddleware())

// Protected Routes (Require authentication)
app.use('/api/company', companyRoutes)  // Company dashboard routes
app.use('/api/jobs', jobRoutes)         // Job management routes
app.use('/api/users', userRoutes)       // User profile routes

// Server Configuration
const PORT = process.env.PORT || 5000    // Use environment port or default to 5000

// Setup Sentry error handling
Sentry.setupExpressErrorHandler(app);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
})