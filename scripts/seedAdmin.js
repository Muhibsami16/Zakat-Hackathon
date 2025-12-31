import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected for seeding...');

        const adminExists = await User.findOne({ email: 'admin@gmail.com' });

        if (adminExists) {
            console.log('Admin already exists. Updating role to admin just in case...');
            adminExists.role = 'admin';
            await adminExists.save();
            console.log('Admin user updated.');
        } else {
            const admin = new User({
                name: 'System Admin',
                email: 'admin@gmail.com',
                phone: '0000000000',
                password: 'admin123',
                role: 'admin',
            });

            await admin.save();
            console.log('Admin user created successfully!');
            console.log('Email: admin@gmail.com');
            console.log('Password: admin123');
        }

        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

seedAdmin();
