import { auth } from '../config/firebase.js';

// Middleware to verify Firebase token
export const authMiddleware = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        error: true,
        message: 'No authorization token provided',
      });
    }

    // Extract token (format: "Bearer token")
    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        error: true,
        message: 'Invalid authorization header format',
      });
    }

    // Verify token with Firebase
    const decodedToken = await auth.verifyIdToken(token);

    // Attach user info to request object
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    return res.status(401).json({
      error: true,
      message: 'Invalid or expired token',
    });
  }
};
