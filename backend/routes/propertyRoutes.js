import express from 'express';
import {
  getAllProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
} from '../controllers/propertyController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { realtorOnly } from '../middleware/realtorOnly.js';

const router = express.Router();


// GET /api/properties - Get all properties (public)
router.get('/', getAllProperties);

// GET /api/properties/:id - Get single property (public)
router.get('/:id', getPropertyById);

// POST /api/properties - Create property (Realtor only)
router.post('/', authMiddleware, realtorOnly, createProperty);

// PUT /api/properties/:id - Update property (Realtor only)
router.put('/:id', authMiddleware, realtorOnly, updateProperty);

// DELETE /api/properties/:id - Delete property (Realtor only)
router.delete('/:id', authMiddleware, realtorOnly, deleteProperty);


export default router;

