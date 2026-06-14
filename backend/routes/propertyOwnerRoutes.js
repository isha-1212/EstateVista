import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { realtorOnly } from '../middleware/realtorOnly.js';
import {
  updatePropertyStatus,
  getPropertyInquiries,
  getPropertyStats,
} from '../controllers/propertyOwnerController.js';

const router = express.Router();

// PUT /api/property-owner/properties/:id/status
router.put('/properties/:id/status', authMiddleware, realtorOnly, updatePropertyStatus);

// GET /api/property-owner/properties/:id/inquiries
router.get('/properties/:id/inquiries', authMiddleware, realtorOnly, getPropertyInquiries);

// GET /api/property-owner/properties/:id/stats
router.get('/properties/:id/stats', authMiddleware, realtorOnly, getPropertyStats);

export default router;

