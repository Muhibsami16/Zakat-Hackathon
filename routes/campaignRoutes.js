import express from 'express';
import {
    createCampaign,
    getCampaigns,
    getCampaignById,
    updateCampaign,
    deleteCampaign,
} from '../controllers/campaignController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/').get(getCampaigns).post(protect, admin, createCampaign);
router
    .route('/:id')
    .get(getCampaignById)
    .put(protect, admin, updateCampaign)
    .delete(protect, admin, deleteCampaign);

export default router;
