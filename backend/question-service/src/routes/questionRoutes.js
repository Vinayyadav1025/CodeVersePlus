// src/routes/questionRoutes.js
import express from 'express';  // Import express
import { addQuestion, getQuestions, getQuestionById } from '../controllers/questionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();  // Create the router instance

// Route to add a new question
router.post('/add', addQuestion);

// Route to get a filtered list of questions
router.get('/', getQuestions);

// Route to get a specific question by ID
router.get('/:id', getQuestionById);

export default router;  // Export the router
