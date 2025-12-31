import PDFDocument from 'pdfkit';
import Donation from '../models/Donation.js';

// @desc    Generate a PDF receipt for a verified donation
// @route   GET /api/receipts/:id/download
// @access  Private
export const downloadReceipt = async (req, res) => {
    try {
        const donation = await Donation.findById(req.params.id)
            .populate('user', 'name email')
            .populate('campaign', 'title');

        if (!donation) {
            return res.status(404).json({ message: 'Donation not found' });
        }

        // Role check: Only owner or admin can download
        if (donation.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to download this receipt' });
        }

        if (donation.status !== 'Verified') {
            return res.status(400).json({ message: 'Cannot generate receipt for unverified donation' });
        }

        const doc = new PDFDocument({ margin: 50 });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=receipt-${donation._id}.pdf`);

        doc.pipe(res);

        // Add content to PDF
        doc.fontSize(25).text('GRAVITY ZAKAT DONATION', { align: 'center' });
        doc.moveDown();
        doc.fontSize(16).text('Official Donation Receipt', { align: 'center', underline: true });
        doc.moveDown(2);

        doc.fontSize(12).text(`Receipt ID: ${donation._id}`);
        doc.text(`Date: ${new Date(donation.createdAt).toLocaleDateString()}`);
        doc.moveDown();

        doc.text('------------------------------------------------------------');
        doc.moveDown();

        doc.fontSize(14).text(`Donor Name: ${donation.user.name}`);
        doc.text(`Donor Email: ${donation.user.email}`);
        doc.moveDown();

        doc.text(`Amount: PKR ${donation.amount.toLocaleString()}`);
        doc.text(`Type: ${donation.donationType}`);
        doc.text(`Category: ${donation.category}`);
        doc.text(`Method: ${donation.paymentMethod}`);
        doc.moveDown();

        doc.text(`Purpose: ${donation.campaign ? donation.campaign.title : 'General Fund'}`);
        doc.moveDown(2);

        doc.fontSize(12).text('Thank you for your generous contribution!', { align: 'center', italic: true });
        doc.moveDown();
        doc.text('This is a computer-generated receipt.', { align: 'center', size: 10 });

        doc.end();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
