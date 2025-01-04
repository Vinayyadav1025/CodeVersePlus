import jwt from 'jsonwebtoken';

export const protect = (req, res, next) => {
  // Extract the token from the Authorization header
  const authHeader = req.headers.authorization;
  console.log("authHeader:", authHeader);
  
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: 'Authorization header missing or invalid' });
  }

  const token = authHeader.split(" ")[1]; // Extract the token part

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user information (e.g., userId) to the request object
    req.user = decoded.userId;

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
