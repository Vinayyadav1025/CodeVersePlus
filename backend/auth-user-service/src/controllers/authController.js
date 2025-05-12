import bcrypt from 'bcryptjs';
import User from '../models/user.js';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { sendOTP } from '../services/emailService.js';
import { generateOTP } from '../utils/generateOTP.js';
import { createAccessToken, createRefreshToken } from '../services/authService.js';


// Helper function for rate limiting OTP requests
const rateLimitOtpRequest = async (email) => {
    const user = await User.findOne({ email });
    if (user) {
        const currentTime = Date.now();
        if (user.otpRequestCount >= 3 && currentTime < user.lastOtpRequestTime + 3600000) {
            throw new ApiError(429, 'Too many OTP requests. Please try again later.');
        }
        user.otpRequestCount = (user.otpRequestCount || 0) + 1;
        user.lastOtpRequestTime = currentTime;
        await user.save();
    }
};

// Register user
export const signup = asyncHandler(async (req, res) => {
    const { email, username, fullName, collegeName, course, password } = req.body;

    if ([email, fullName, password].some((field) => field.trim() === "")) {
        throw new ApiError(400, 'All fields are required');
    }

    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) throw new ApiError(400, 'User already exists');

    const otp = generateOTP().toString();
    console.log('OTP:', otp);

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = new User({
        email,
        username,
        fullName,
        collegeName,
        course,
        password: hashedPassword,
        otp: crypto.createHash('sha256').update(otp).digest('hex'), // Hash OTP before saving
        otpExpiration: Date.now() + 3600000, // OTP expires in 1 hour
        otpRequestCount: 1,
        lastOtpRequestTime: Date.now()
    });

    await rateLimitOtpRequest(email); // Rate limiting OTP requests

    await user.save();
    await sendOTP(user.email, otp);

    return res.status(201).json(
        new ApiResponse(200, user, "User created successfully")
    );
});

// Verify OTP
export const verifyOTP = asyncHandler( async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        throw new ApiError(400, 'Email and OTP are required');
    }

    const user = await User.findOne({ email });
    if (!user) throw new ApiError(400, 'User not found');

    const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');
    if (hashedOtp !== user.otp) throw new ApiError(400, 'Invalid OTP');
    if (user.otpExpiration < Date.now()) throw new ApiError(400, 'OTP expired');

    user.otp = null;
    user.otpExpiration = null;
    user.isVerified = true;  // Mark user as verified
    await user.save();

    return res.status(200).json(
        new ApiResponse(200, {}, "Email verified successfully")
    );
});

// Sign in user
export const signin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError(400, 'Email and Password are required');
    }

    const user = await User.findOne({ email });
    if (!user) throw new ApiError(400, 'User not found');
    
    if (!user.isVerified) {
        throw new ApiError(400, 'Please verify your email before logging in');
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) throw new ApiError(400, 'Invalid user credentials');

    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);
    user.refreshToken = refreshToken;
    await user.save();

    const loggedInUser = await User.findById(user._id).select
    ('-otp -otpExpiration -isVerified -otpRequestCount -lastOtpRequestTime -password -refreshToken');

    const options = { httpOnly: true, secure: false, sameSite: 'Strict' };

    return res.status(200)
        .cookie('accessToken', accessToken, options)
        .cookie('refreshToken', refreshToken, options)
        .json(new ApiResponse(200, { user: loggedInUser, accessToken }, 'Signed in successfully'));
});

// Logout user
export const logout = asyncHandler(async (req, res) => {
    
    
    if (!req.user) {
        throw new ApiError(401,{}, 'Unauthorized request');
    }
    
    
    await User.findByIdAndUpdate(req.user._id, { $unset: { refreshToken: 1 } });

    const options = { httpOnly: true, secure: false, sameSite: 'Strict' };

    return res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out successfully"));
});


// Refresh Token
export const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request: No refresh token provided");
    }

    try {
        // Verify the incoming refresh token
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

        // Fetch the user and validate the refresh token
        const user = await User.findById(decodedToken.id);
        if (!user || incomingRefreshToken !== user.refreshToken) {
            throw new ApiError(401, "Refresh token is invalid or expired");
        }

        // Create new tokens
        const accessToken = createAccessToken(user);
        const refreshToken = createRefreshToken(user);

        // Update the user's refresh token
        user.refreshToken = refreshToken;
        await user.save();

        // Set secure cookie options
        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Secure in production
            sameSite: 'Strict',
        };

        // Respond with new tokens
        return res.status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(new ApiResponse(200, { accessToken, refreshToken }, "Access token refreshed"));
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new ApiError(401, "Refresh token has expired");
        } else if (error.name === 'JsonWebTokenError') {
            throw new ApiError(401, "Invalid refresh token");
        } else {
            throw new ApiError(500, error?.message || "Internal Server Error");
        }
    }
});


// Forgot Password
export const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    
    
    // Check if the email exists in the database
    const user = await User.findOne({ email });
    
    
    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    // Generate a random reset token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash the token before saving it to the database
    const hashedResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Save the hashed token and expiry time in the database
    user.resetToken = hashedResetToken;
    user.resetTokenExpire = Date.now() + 10 * 60 * 1000; // Token expires in 10 minutes
    await user.save({ validateBeforeSave: false });

    // Construct the reset URL
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/reset-password/${resetToken}`;

    // Email content
    const message = `
        You are receiving this email because you (or someone else) have requested a password reset.
        Please use the following link to reset your password:
        ${resetUrl}
        If you did not request this, please ignore this email.
    `;

    try {
        // Send the email
        await sendEmail({
            to: user.email,
            subject: 'Password Reset Request',
            text: message,
        });

        // Respond to the client
        return res.status(200).json(
            new ApiResponse(200, {}, 'Reset token sent to email')
        );
    } catch (error) {
        // Remove resetToken fields if email fails
        user.resetToken = undefined;
        user.resetTokenExpire = undefined;
        await user.save({ validateBeforeSave: false });

        throw new ApiError(500, 'There was an error sending the email. Try again later.');
    }
});
