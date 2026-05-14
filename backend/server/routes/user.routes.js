import express from 'express';
import { verifyFirebaseToken } from '../middleware/verifyFirebaseToken.js';
import { getMe, syncUser, updateMe } from '../controllers/user.controller.js';

const router = express.Router();

// All user routes require a valid Firebase ID token
router.use(verifyFirebaseToken);

router.get('/users/me', getMe);
router.post('/users/sync', syncUser);
router.put('/users/me', updateMe);

export default router;
