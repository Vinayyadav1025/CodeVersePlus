import User from '../models/user.js';  // Import your User model

// Get User Profile
export const getUserProfile = async (req, res) => {
    const userId = req.user.id; // Get the userId from the JWT token (assumes authentication middleware is in place)
    try {
        // Find the user from your User service
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Fetch solved questions from the Question microservice
        const solvedQuestions = await getSolvedQuestions(user.solvedQuestions);

        const userProfile = {
            fullName: user.fullName,
            collegeName: user.collegeName,
            course: user.course,
            profileImage: user.profileImage,
            solvedQuestions: solvedQuestions, // Return the fetched questions
        };

        res.status(200).json(userProfile);
    } catch (err) {
        console.error('Error fetching user profile:', err.message); // Log error for debugging
        res.status(500).json({ message: 'Error fetching user profile', error: err.message });
    }
};

// Helper function to fetch solved questions from the Question microservice using fetch API
const getSolvedQuestions = async (questionIds) => {
    try {
        const response = await fetch('http://localhost:5002/api/questions', {
            method: 'POST',  // Using POST method
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ids: questionIds }),  // Send the question IDs in the request body
        });

        // Check if the response is okay
        if (!response.ok) {
            throw new Error('Failed to fetch questions');
        }

        const questions = await response.json();  // Parse the JSON response
        return questions;  // Return the questions from the Question microservice
    } catch (err) {
        console.error('Error fetching questions:', err.message);
        throw new Error('Error fetching questions');
    }
};
