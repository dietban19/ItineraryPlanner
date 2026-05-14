import express from 'express';
import multer from 'multer';
import { verifyFirebaseToken } from '../middleware/verifyFirebaseToken.js';
import { uploadImage } from '../controllers/upload.controller.js';

const router = express.Router();

// Store file in memory (buffer), max 10 MB per file
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

// POST /api/upload  — requires auth
router.post(
  '/upload',
  verifyFirebaseToken,
  upload.single('image'),
  uploadImage,
);

export default router;
