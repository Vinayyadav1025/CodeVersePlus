import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './src/config/db.js';
import questionRoutes from './src/routes/questionRoutes.js';
import cors from 'cors';

// Create __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({
  path: path.resolve(__dirname, '../.env'),
});

// Initialize Express app
const app = express();

// Middleware for find complixity 
app.use(
  cors({
    origin: 'http://localhost:3000', // explicitly allow only frontend from localhost:3000
    credentials: true, // allow cookies and other credentials
  })
);

app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));

// Connect to the database
connectDB().catch((err) => {
  console.error('Failed to connect to MongoDB:', err.message);
  process.exit(1);
});

// Routes
app.use('/api/questions', questionRoutes);

// Start the server
const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`Question Service running on port ${PORT}`);
});
