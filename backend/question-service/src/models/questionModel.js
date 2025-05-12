// models/Question.js
import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
    topic: {
        type: String,
        required: true,  // E.g., 'Arrays', 'Strings'
    },
    topicTag: {
        type: [String],  // Array of tags (e.g., ['searching', 'sorting'])
        required: true,
    },
    complexity: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard'],
        required: true,
    },
    shortHeading: {
        type: String,
        required: true,  // E.g., 'Find Maximum Element in an Array'
    },
    shortDescription: {
        type: String,
        required: true,  // A brief description
    },
    detailedDescription: {
        type: String,
        required: true,  // A detailed explanation
    },
    examples: [{
        input: {
            type: String,
            required: true,
        },
        output: {
            type: String,
            required: true,
        },
    }],
    customCode:{
        type: String,
        required: true,
    },
    functionCode:{
        type: String,
        required: true,
    },
    testCases:[
        {
            input: {
                type: String,
                required: true,
            },
            output: {
                type: String,
                required: true,
            },
        }
    ],
    constraints: {
        type: String,  // E.g., 'Array length is between 1 and 10^5'
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Question = mongoose.model('Question', questionSchema);

export default Question;
