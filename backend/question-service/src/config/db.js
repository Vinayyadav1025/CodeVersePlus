import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    //console.log("Error hai",process.env.MONGO_URI);
    const mongoURI = process.env.MONGO_URI || "mongodb+srv://vinayyadavfzd29:pBnkP8dIar6ZkcSN@microservices-cluster.ntsjf.mongodb.net/?";
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);  // Exit the process if DB connection fails
  }
};

export default connectDB;
