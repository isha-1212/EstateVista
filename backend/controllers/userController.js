import { db } from '../config/firebase.js';

// GET /api/users/me - Get current user profile (Protected)
export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.uid;

    const snapshot = await db.ref(`users/${userId}`).get();

    if (!snapshot.exists()) {
      return res.status(404).json({
        error: true,
        message: 'User not found',
      });
    }

    const userData = snapshot.val();

    res.status(200).json({
      success: true,
      data: {
        id: userId,
        ...userData,
      },
    });
  } catch (error) {
    console.error('Get user error:', error.message);
    res.status(500).json({
      error: true,
      message: 'Failed to fetch user: ' + error.message,
    });
  }
};



