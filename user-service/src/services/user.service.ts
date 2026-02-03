import { User, IUser } from '../models/user.model';
import { Types } from 'mongoose';
import {AppError} from "../utils/AppError";

/**
 * Helper: Generates a unique username based on email.
 * Recursive logic to handle edge-case collisions.
 * moved up to be accessible by createProfile
 */
const generateUniqueUsername = async (email: string): Promise<string> => {
    // 1. Extract base: "alice@test.com" -> "alice"
    const baseName = email.split('@')[0];

    // 2. Add random suffix: "alice_8492"
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const candidateUsername = `${baseName}_${randomSuffix}`;

    // 3. Check DB for collision
    const existingUser = await User.findOne({ username: candidateUsername });

    // 4. If exists, try again (Recursive call)
    if (existingUser) {
        return generateUniqueUsername(email);
    }

    return candidateUsername;
};

/**
 * INTERNAL: Creates a user profile.
 * CALLED BY: Auth Service (via Internal Route)
 */
export const createProfile = async (data: Partial<IUser> & { _id: string }) => {
    // Ensure email exists before using it
    if (!data.email) {
        throw new Error("Email is required to create a profile.");
    }

    // 1. Generate Username if missing
    if (!data.username) {
        data.username = await generateUniqueUsername(data.email);
    }

    // 2. Create User
    return await User.create({
        ...data,
        _id: new Types.ObjectId(data._id)
    });
};

export const getMe = async (userId: string) => {
    return await User.findById(userId);
};

export const updateMe = async (userId: string, updateData: Partial<IUser>) => {
    // Whitelisted fields
    const allowedFields = {
        username: updateData.username,
        bio: updateData.bio,
        avatar: updateData.avatar
    };

    // Remove undefined keys
    Object.keys(allowedFields).forEach(key =>
        (allowedFields as any)[key] === undefined && delete (allowedFields as any)[key]
    );

    return await User.findByIdAndUpdate(userId, allowedFields, {
        new: true,
        runValidators: true
    });
};

export const deleteMe = async (userId: string) => {
    await User.findByIdAndUpdate(userId, { isActive: false });
};

// --- ADMIN SERVICES ---

export const getAllUsers = async (page: number = 1, limit: number = 10) => {
    const skip = (page - 1) * limit;

    const users = await User.find()
        .setOptions({ skipInactive: true })
        .skip(skip)
        .limit(limit)
        .select('+isActive');

    const total = await User.countDocuments().setOptions({ skipInactive: true });

    return {
        users,
        total,
        page,
        pages: Math.ceil(total / limit)
    };
};

export const getUserById = async (id: string) => {
    const user = await User.findById(id).setOptions({ skipInactive: true });
    if (!user) throw new AppError('No user found with that ID', 404);
    return user;
};

export const updateUserById = async (id: string, updateData: Partial<IUser>) => {
    const user = await User.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true
    });
    if (!user) throw new AppError('No user found with that ID', 404);
    return user;
};

export const deleteUserById = async (id: string) => {
    const user = await User.findByIdAndDelete(id);
    if (!user) throw new AppError('No user found with that ID', 404);
    return user;
};