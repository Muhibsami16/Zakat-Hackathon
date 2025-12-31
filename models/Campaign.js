import mongoose from 'mongoose';

const campaignSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        description: { type: String, required: true },
        goalAmount: { type: Number, required: true },
        collectedAmount: { type: Number, default: 0 },
        deadline: { type: Date, required: true },
        status: { type: String, enum: ['Active', 'Completed'], default: 'Active' },
    },
    { timestamps: true }
);

const Campaign = mongoose.model('Campaign', campaignSchema);
export default Campaign;
