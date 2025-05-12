import mongoose from 'mongoose';

// MongoDB connection
const connectDB = async () => {
    try {
      await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('MongoDB Atlas connected');
    } catch (err) {
      console.error('MongoDB connection error:', err);
      process.exit(1); // Exit the process with failure
    }
  };
  
export default connectDB;
  