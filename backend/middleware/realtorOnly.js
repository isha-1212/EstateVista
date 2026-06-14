import { db } from '../config/firebase.js';

// Realtor-only middleware
// Requires req.user.uid from authMiddleware
export const realtorOnly = async (req, res, next) => {
  try {
    const uid = req.user?.uid;
    if (!uid) {
      return res.status(401).json({
        error: true,
        message: 'Unauthorized',
      });
    }

    const snapshot = await db.ref(`users/${uid}/role`).get();
    const role = snapshot.exists() ? snapshot.val() : null;

    if (role !== 'realtor') {
      return res.status(403).json({
        error: true,
        message: 'Access Denied',
      });
    }

    next();
  } catch (error) {
    console.error('realtorOnly middleware error:', error.message);
    res.status(500).json({
      error: true,
      message: 'Internal server error',
    });
  }
};

