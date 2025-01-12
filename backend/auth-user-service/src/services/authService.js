import jwt from 'jsonwebtoken';

export const createAccessToken = (user) => {
    return jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRE });
};

export const createRefreshToken = (user) => {
    return jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRE });
};
