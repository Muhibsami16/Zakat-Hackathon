import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
    const { name, email, phone, password } = req.body;

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            name,
            email,
            phone,
            password,
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

// @desc    Get all users with donation statistics (admin)
// @route   GET /api/auth/users
// @access  Private/Admin
export const getUsers = async (req, res) => {
    const keyword = req.query.keyword || '';

    try {
        console.log('Fetching users with statistics. Keyword:', keyword);

        const users = await User.aggregate([
            // 1. Filter by keyword if provided
            {
                $match: {
                    $or: [
                        { name: { $regex: keyword, $options: 'i' } },
                        { email: { $regex: keyword, $options: 'i' } },
                    ]
                }
            },
            // 2. Hide passwords
            {
                $project: {
                    password: 0
                }
            },
            // 3. Lookup donations for each user
            {
                $lookup: {
                    from: 'donations',
                    localField: '_id',
                    foreignField: 'user',
                    as: 'donations'
                }
            },
            // 4. Calculate statistics
            {
                $addFields: {
                    totalDonations: { $size: '$donations' },
                    totalAmount: { $sum: '$donations.amount' },
                    verifiedAmount: {
                        $sum: {
                            $map: {
                                input: {
                                    $filter: {
                                        input: '$donations',
                                        as: 'd',
                                        cond: { $eq: ['$$d.status', 'Verified'] }
                                    }
                                },
                                as: 'vd',
                                in: '$$vd.amount'
                            }
                        }
                    }
                }
            },
            // 5. Remove the detailed donations array to keep response small
            {
                $project: {
                    donations: 0
                }
            },
            // 6. Sort by newest users first
            {
                $sort: { createdAt: -1 }
            }
        ]);

        console.log(`Found ${users.length} users with statistics`);
        res.json(users);
    } catch (error) {
        console.error('Error in getUsers with statistics:', error);
        res.status(500).json({ message: error.message });
    }
};
