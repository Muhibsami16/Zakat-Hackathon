import express from 'express';
import {
    registerUser,
    loginUser,
    getUserProfile,
    getUsers,
} from '../controllers/authController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);
router.get('/users', protect, admin, getUsers);

export default router;
