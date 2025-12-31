import Donation from '../models/Donation.js';
import Campaign from '../models/Campaign.js';

// @desc    Create a new donation
// @route   POST /api/donations
// @access  Private
export const createDonation = async (req, res) => {
    const { amount, donationType, category, paymentMethod, campaignId } = req.body;

    try {
        if (campaignId) {
            const campaign = await Campaign.findById(campaignId);
            if (!campaign) {
                return res.status(404).json({ message: 'Campaign not found' });
            }
            if (campaign.status !== 'Active') {
                return res.status(400).json({ message: 'Cannot donate to an inactive campaign' });
            }
            if (new Date(campaign.deadline) < new Date()) {
                return res.status(400).json({ message: 'Campaign has ended' });
            }
        }

        const donation = new Donation({
            user: req.user._id,
            campaign: campaignId || null,
            amount,
            donationType,
            category,
            paymentMethod,
        });

        const createdDonation = await donation.save();
        res.status(201).json(createdDonation);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get user donations
// @route   GET /api/donations/my
// @access  Private
export const getMyDonations = async (req, res) => {
    try {
        const donations = await Donation.find({ user: req.user._id }).populate(
            'campaign',
            'title'
        );
        res.json(donations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all donations (admin)
// @route   GET /api/donations
// @access  Private/Admin
import User from '../models/User.js'; // Import User model

// ... (existing imports)

// ... (existing createDonation)

// ... (existing getMyDonations)

// @desc    Get all donations (admin)
// @route   GET /api/donations
// @access  Private/Admin
export const getAllDonations = async (req, res) => {
    const { type, status, startDate, endDate, search } = req.query;
    let query = {};

    if (type) query.donationType = type;
    if (status) query.status = status;
    if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    try {
        if (search) {
            const users = await User.find({
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
                ],
            }).select('_id');
            const userIds = users.map((user) => user._id);
            query.user = { $in: userIds };
        }

        const donations = await Donation.find(query)
            .sort({ createdAt: -1 })
            .populate('user', 'name email')
            .populate('campaign', 'title');
        res.json(donations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify donation and update campaign progress
// @route   PUT /api/donations/:id/verify
// @access  Private/Admin
export const verifyDonation = async (req, res) => {
    try {
        const donation = await Donation.findById(req.params.id);

        if (donation) {
            if (donation.status === 'Verified') {
                return res.status(400).json({ message: 'Donation already verified' });
            }

            donation.status = 'Verified';
            const updatedDonation = await donation.save();
            console.log(`Donation ${donation._id} verified.`);

            // If linked to a campaign, update campaign collected amount
            if (donation.campaign) {
                const campaign = await Campaign.findById(donation.campaign);
                if (campaign) {
                    console.log(`Updating campaign ${campaign.title}. Previous: ${campaign.collectedAmount}, Adding: ${donation.amount}`);
                    campaign.collectedAmount += donation.amount;
                    await campaign.save();
                    console.log(`New total for ${campaign.title}: ${campaign.collectedAmount}`);
                }
            }

            res.json(updatedDonation);
        } else {
            res.status(404).json({ message: 'Donation not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
