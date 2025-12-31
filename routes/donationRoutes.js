import express from 'express';
import {
    createDonation,
    getMyDonations,
    getAllDonations,
    verifyDonation,
} from '../controllers/donationController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, admin, getAllDonations).post(protect, createDonation);
router.get('/my', protect, getMyDonations);
router.put('/:id/verify', protect, admin, verifyDonation);

export default router;
