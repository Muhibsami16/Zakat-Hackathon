import Campaign from '../models/Campaign.js';

// @desc    Create a new campaign
// @route   POST /api/campaigns
// @access  Private/Admin
export const createCampaign = async (req, res) => {
    const { title, description, goalAmount, deadline } = req.body;

    try {
        const campaign = new Campaign({
            title,
            description,
            goalAmount,
            deadline,
        });

        const createdCampaign = await campaign.save();
        res.status(201).json(createdCampaign);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get all campaigns
// @route   GET /api/campaigns
// @access  Public
export const getCampaigns = async (req, res) => {
    try {
        // Auto-complete expired campaigns
        await Campaign.updateMany(
            { status: 'Active', deadline: { $lt: new Date() } },
            { $set: { status: 'Completed' } }
        );

        const campaigns = await Campaign.find({});
        res.json(campaigns);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single campaign by ID
// @route   GET /api/campaigns/:id
// @access  Public
export const getCampaignById = async (req, res) => {
    try {
        const campaign = await Campaign.findById(req.params.id);

        if (campaign) {
            res.json(campaign);
        } else {
            res.status(404).json({ message: 'Campaign not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a campaign
// @route   PUT /api/campaigns/:id
// @access  Private/Admin
export const updateCampaign = async (req, res) => {
    const { title, description, goalAmount, deadline, status } = req.body;

    try {
        const campaign = await Campaign.findById(req.params.id);

        if (campaign) {
            campaign.title = title || campaign.title;
            campaign.description = description || campaign.description;
            campaign.goalAmount = goalAmount || campaign.goalAmount;
            campaign.deadline = deadline || campaign.deadline;
            campaign.status = status || campaign.status;

            const updatedCampaign = await campaign.save();
            res.json(updatedCampaign);
        } else {
            res.status(404).json({ message: 'Campaign not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a campaign
// @route   DELETE /api/campaigns/:id
// @access  Private/Admin
export const deleteCampaign = async (req, res) => {
    try {
        const campaign = await Campaign.findById(req.params.id);

        if (campaign) {
            await Campaign.deleteOne({ _id: req.params.id });
            res.json({ message: 'Campaign removed' });
        } else {
            res.status(404).json({ message: 'Campaign not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
