import bcrypt from 'bcryptjs';
import User from '../models/user.js';
import crypto from 'crypto';
import { sendOTP } from '../services/emailService.js';
import { generateOTP } from '../utils/generateOTP.js';
import { createToken, createRefreshToken } from '../services/authService.js';

export const signup = async (req, res) => {
    const { email, username, fullName, collegeName, course, password } = req.body;
    try {
        const userExists = await User.findOne({ $or: [{ email }, { username }] });
        if (userExists) return res.status(400).json({ message: 'Email or Username already exists' });

        const otp = generateOTP();
        console.log('OTP:', otp);

        const hashedPassword = await bcrypt.hash(password, 12);
        console.log('Hashed password');

        const user = new User({
            email,
            username,
            fullName,
            collegeName,
            course,
            password: hashedPassword,
            otp,
            otpExpiration: Date.now() + 3600000, // OTP expires in 1 hour
        });

        await user.save();

        await sendOTP(user.email, otp);

        res.status(201).json({ message: 'Signup successful. Please verify your OTP.' });
    } catch (err) {
        res.status(500).json({ message: 'Error signing up user', error: err.message });
    }
};

export const verifyOTP = async (req, res) => {
    const { email, otp } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (user.otp !== otp) return res.status(400).json({ message: 'Invalid OTP' });
        if (user.otpExpiration < Date.now()) return res.status(400).json({ message: 'OTP expired' });

        user.otp = null;
        user.otpExpiration = null;
        await user.save();
        
        res.status(200).json({ message: 'Email verified successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error verifying OTP', error: err.message });
    }
};


export const signin = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) return res.status(400).json({ message: 'Incorrect password' });

        const accessToken = createToken(user);
        const refreshToken = createRefreshToken(user);
        console.log("Signed in successfully");
        
        res.status(200).json({ accessToken, refreshToken });
    } catch (err) {
        res.status(500).json({ message: 'Error signing in user', error: err.message });
    }
};

// Forgot Password
export const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate reset token and hash it
        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        // Store the hashed reset token and its expiry time
        user.resetToken = hashedResetToken;
        user.resetTokenExpire = Date.now() + 10 * 60 * 1000; // 10 minutes expiry

        console.log('Generated Reset Token:', resetToken);
        console.log('Hashed Reset Token:', hashedResetToken);
        console.log('Reset Token Expiry:', user.resetTokenExpire);

        await user.save();

        res.json({ message: 'Password reset token sent', token: resetToken });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: error.message });
    }
};


// Reset Password
export const resetPassword = async (req, res) => {
    const { token, password } = req.body;
    try {
        // Hash the incoming token to compare with the stored hashed token
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        console.log('Hashed Token:', hashedToken);

        const user = await User.findOne({
            resetToken: hashedToken,
            resetTokenExpire: { $gt: Date.now() } // Ensure the token hasn't expired
        });

        if (!user) {
            console.log('No user found with the token or token expired');
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        // Hash the new password before saving it
        const hashedPassword = await bcrypt.hash(password, 12);
        user.password = hashedPassword;

        // Clear reset token and expiry
        user.resetToken = undefined;
        user.resetTokenExpire = undefined;

        await user.save();

        res.json({ message: 'Password reset successful' });
    } catch (error) {
        console.log('Error:', error);
        res.status(500).json({ message: error.message });
    }
};
