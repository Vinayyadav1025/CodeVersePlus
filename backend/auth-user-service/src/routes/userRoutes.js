import express from 'express';
import { getUserProfile } from '../controllers/userController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import multer from 'multer'; // For handling file uploads

const router = express.Router();

// Setup multer for file handling (e.g., profile image upload)
const upload = multer({ dest: 'uploads/' }); // Change 'uploads/' to wherever you want to store temp files

// Routes for user profile
router.get('/profile', authenticateToken, getUserProfile);
//router.put('/updateProfile', authenticateToken, upload.single('profileImage'), updateUserProfile);

export default router;
