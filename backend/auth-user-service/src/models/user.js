import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is required'], // Added custom error message for better validation feedback
        unique: true,
        lowercase: true,
        trim: true,
        validate: {
            validator: (value) => /^\S+@\S+\.\S+$/.test(value), // Basic email regex validation
            message: 'Please provide a valid email address',
        },
    },
    username: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true,
        sparse: true, // Ensures indexing for optional unique fields
    },
    fullName: {
        type: String,
        required: [true, 'Full name is required'], // Added custom error message
        trim: true,
    },
    collegeName: {
        type: String,
        trim: true,
    },
    course: {
        type: String,
        trim: true,
    },
    password: {
        type: String,
        required: [true, 'Password is required'], // Added custom error message
        minlength: [6, 'Password must be at least 6 characters'], // Added password length validation
    },
    profileImage: {
        type: String,
        default: '', // Ensures field is initialized with an empty string if not provided
    },
    otp: {
        type: String,
        default: null, // Added default value to prevent schema mismatch
    },
    otpExpiration: {
        type: Date,
        default: null, // Added default value for consistency
    },
    isVerified: { 
        type: Boolean,
        default: false
    },
    otpRequestCount: {
        type: Number,
        default: 0,
    },
    lastOtpRequestTime: {
        type: Date,
        default: null,
    },
    resetToken: {
        type: String,
        default: null, // Added default value
    },
    resetTokenExpire: {
        type: Date,
        default: null, // Added default value
    },
    solvedQuestions: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Question',
        },
    ],
    refreshToken: {
        type: String,
        default: null, // Added default value for consistency
    },
}, { 
    timestamps: true, // Automatically adds createdAt and updatedAt fields
});

const User = mongoose.model('User', userSchema);

export default User;