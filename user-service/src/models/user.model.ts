import { Schema, model, Document, Types } from 'mongoose';

export interface IUser extends Document {
    email: string;
    username?: string;
    bio?: string;
    avatar?: string;
    role: 'user' | 'admin';
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const userSchema = new Schema<IUser>({
    email: { type: String, required: true, unique: true, lowercase: true },
    username: {
        type: String,
        trim: true,
        unique: true,  // Enforces uniqueness
        sparse: true   // Allows multiple users to have 'undefined' username if needed
    },
    bio: { type: String, maxlength: 250, default: null },
    avatar: { type: String, default: null },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    isActive: { type: Boolean, default: true, select: false }
}, {
    timestamps: true
});

userSchema.pre(/^find/, function(this: any, next) {
    if (!this.getOptions().skipInactive) {
        this.find({ isActive: { $ne: false } });
    }
});

export const User = model<IUser>('User', userSchema);