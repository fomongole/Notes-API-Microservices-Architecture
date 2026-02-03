import { User, IAuthUser } from '../models/user.model';
import crypto from 'crypto';
import { AppError } from '../utils/AppError';

export const createUser = async (userData: Partial<IAuthUser>) => {
    return await User.create(userData);
};

export const validateUser = async (email: string, pass: string) => {
    const user = await User.findOne({ email }).select('+password +isActive');

    if (!user || !(await user.comparePassword(pass))) {
        throw new AppError('Invalid email or password', 401);
    }

    if (user.isActive === false) {
        throw new AppError('This account has been deactivated.', 403);
    }

    return user;
};

export const updateUserStatus = async (userId: string, isActive: boolean) => {
    const user = await User.findByIdAndUpdate(userId, { isActive });
    if (!user) throw new AppError('User not found in Auth DB', 404);
    return user;
};

export const deleteUserPermanently = async (userId: string) => {
    const user = await User.findByIdAndDelete(userId);
    if (!user) throw new AppError('User not found in Auth DB', 404);
    return user;
};

export const getResetToken = async (email: string) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw new AppError('User not found', 404);
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    return resetToken;
};

export const resetPassword = async (token: string, newPass: string) => {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
        throw new AppError('Token is invalid or has expired', 400);
    }

    user.password = newPass;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();
    return user;
};

export const updatePassword = async (userId: string, currentPass: string, newPass: string) => {
    const user = await User.findById(userId).select('+password');

    if (!user) throw new AppError('User not found', 404);

    if (!(await user.comparePassword(currentPass))) {
        throw new AppError('Incorrect current password', 401);
    }

    user.password = newPass;
    await user.save();

    return user;
};

export const clearResetToken = async (email: string) => {
    await User.updateOne(
        { email },
        {
            $unset: {
                passwordResetToken: 1,
                passwordResetExpires: 1
            }
        }
    );
};