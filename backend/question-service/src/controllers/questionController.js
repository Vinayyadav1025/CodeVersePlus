// controllers/questionController.js
import Question from '../models/questionModel.js';
// Add a new question
export const addQuestion = async (req, res) => {
    const { topic, topicTag, complexity, shortHeading, shortDescription, detailedDescription, examples, customCode, functionCode, testCases, constraints } = req.body;

    try {
        const newQuestion = new Question({
            topic,
            topicTag,
            complexity,
            shortHeading,
            shortDescription,
            detailedDescription,
            examples,
            customCode,
            functionCode,
            testCases,
            constraints,
        });

        await newQuestion.save();
        res.status(201).json({ message: 'Question added successfully', question: newQuestion });
    } catch (error) {
        res.status(400).json({ message: 'Error adding question', error });
    }
};

// Get all questions with filters for topic, tag, and complexity
export const getQuestions = async (req, res) => {
    const { topic, topicTag, complexity } = req.query;

    const filter = {};
    if (topic) filter.topic = topic;
    if (topicTag) filter.topicTag = { $in: topicTag.split(',') };
    if (complexity) filter.complexity = complexity;

    try {
        const questions = await Question.find(filter);
        res.status(200).json({ questions });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching questions', error });
    }
};

// Get a specific question by ID
export const getQuestionById = async (req, res) => {
    const { id } = req.params;

    try {
        const question = await Question.findById(id);
        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }
        res.status(200).json({ question });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching question', error });
    }
};


