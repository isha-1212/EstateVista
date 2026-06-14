import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { getCurrentUser } from '../controllers/userController.js';
import {
  getUserInquiries,
  getUserInquiryById,
  getUserReplies,
  getUserStats,
  getRecommendedProperties,
} from '../controllers/inquiryController.js';

const router = express.Router();

// GET /api/users/me - Get current user profile (Protected)
router.get('/me', authMiddleware, getCurrentUser);

// Buyer dashboard APIs
// GET /api/users/inquiries - Current user's inquiries
router.get('/inquiries', authMiddleware, getUserInquiries);

// GET /api/users/inquiries/:id - Current user's inquiry details
router.get('/inquiries/:id', authMiddleware, getUserInquiryById);

// GET /api/users/replies - Replies (inquiry items) with reply present
router.get('/replies', authMiddleware, getUserReplies);

// GET /api/users/stats - Aggregated counts for dashboard
router.get('/stats', authMiddleware, getUserStats);

// GET /api/users/recommended-properties - Heuristic recommendations
router.get('/recommended-properties', authMiddleware, getRecommendedProperties);

export default router;


