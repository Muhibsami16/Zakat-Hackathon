import User from '../models/User.js';
import Donation from '../models/Donation.js';
import Campaign from '../models/Campaign.js';

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getAdminStats = async (req, res) => {
    try {
        const totalDonations = await Donation.aggregate([
            { $match: { status: 'Verified' } },
            { $group: { _id: null, total: { $sum: '$amount' } } },
        ]);

        const totalDonors = await User.countDocuments({ role: 'user' });
        const activeCampaigns = await Campaign.countDocuments({ status: 'Active' });
        const pendingDonations = await Donation.countDocuments({ status: 'Pending' });

        res.json({
            totalDonationAmount: totalDonations.length > 0 ? totalDonations[0].total : 0,
            totalDonors,
            activeCampaigns,
            pendingDonations,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
