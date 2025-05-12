import express from 'express';
import { signup, signin, verifyOTP , forgotPassword, refreshAccessToken, logout} from '../controllers/authController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
const router = express.Router();

router.post('/register', signup);
router.post('/verify-otp', verifyOTP);
router.post('/login', signin);
router.post('/logout',authenticateToken, logout);
router.post('/refresh-token', refreshAccessToken);
router.post('/forget-password', forgotPassword);


export default router;