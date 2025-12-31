import mongoose from 'mongoose';

const donationSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        campaign: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign' },
        amount: { type: Number, required: true },
        donationType: {
            type: String,
            enum: ['Zakat', 'Sadqah', 'Fitra', 'General'],
            required: true,
        },
        category: {
            type: String,
            enum: ['Food', 'Education', 'Medical', 'General'],
            required: true,
        },
        paymentMethod: {
            type: String,
            enum: ['Cash', 'Bank', 'Online'],
            required: true,
        },
        status: { type: String, enum: ['Pending', 'Verified'], default: 'Pending' },
    },
    { timestamps: true }
);

// Indexes for better performance on filters
donationSchema.index({ status: 1, createdAt: -1 });
donationSchema.index({ donationType: 1, createdAt: -1 });
donationSchema.index({ user: 1 });

const Donation = mongoose.model('Donation', donationSchema);
export default Donation;
