import express from 'express';
import { downloadReceipt } from '../controllers/receiptController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/:id/download', protect, downloadReceipt);

export default router;
