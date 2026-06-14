import express from 'express';
import {
  createInquiry,
  getInquiries,
  updateInquiryStatus,
  replyInquiry,
  getLoggedInUserInquiries,
} from '../controllers/inquiryController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { realtorOnly } from '../middleware/realtorOnly.js';

const router = express.Router();

// GET /api/inquiries/user-history
router.get('/user-history', authMiddleware, getLoggedInUserInquiries);

// POST /api/inquiries - Create inquiry (public)
router.post('/', createInquiry);

// GET /api/inquiries - Get all inquiries for realtor (Realtor only)
router.get('/', authMiddleware, realtorOnly, getInquiries);

// PUT /api/inquiries/:id/status - update inquiry status (Realtor only)
router.put('/:id/status', authMiddleware, realtorOnly, updateInquiryStatus);

// POST /api/inquiries/:id/reply - reply to inquiry (Realtor only)
router.post('/:id/reply', authMiddleware, realtorOnly, replyInquiry);

export default router;