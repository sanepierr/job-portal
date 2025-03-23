import mongoose from "mongoose";

// Database configuration and connection setup

// Connect to MongoDB database
const connectDB = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in environment variables');
        }

        mongoose.connection.on('connected', () => console.log('Database Connected'));
        mongoose.connection.on('error', (err) => console.error('MongoDB connection error:', err));
        mongoose.connection.on('disconnected', () => console.log('MongoDB disconnected'));

        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            writeConcern: {
                w: 'majority',
                wtimeout: 1000
            }
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
}

// Handle database connection errors
mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});

// Handle database disconnection
mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
});

// Handle application termination
process.on('SIGINT', async () => {
    try {
        await mongoose.connection.close();
        console.log('MongoDB connection closed through app termination');
        process.exit(0);
    } catch (err) {
        console.error('Error during MongoDB connection closure:', err);
        process.exit(1);
    }
});

export default connectDB;