import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParse from 'cookie-parser';
import connectDB from './src/config/connectDB.js'; // Ensure this is correctly pointing to the DB connection file
import authRoutes from './src/routes/authRoutes.js'; // Ensure this is correctly pointing to the route file
import userRoutes from './src/routes/userRoutes.js'; // Ensure this is correctly pointing to the route file

const app = express();

dotenv.config({
  path : './.env'
})

// Middleware
app.use(express.json());
// Middleware for find complixity 
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}));

app.use(express.json({limit:"16kb"}));

app.use(express.urlencoded({extended:true,limit:"16kb"}));

app.use(express.static("public"));

app.use(cookieParse());


//Connect to DB
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
