import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import * as AuthService from '../services/auth.service';
import { User } from '../models/user.model';
import { AppError } from '../utils/AppError';
import generateToken from "../utils/generateToken";
import sendEmail from "../utils/sendEmail";
import { getPasswordResetTemplate } from '../utils/emailTemplates';
import { CLIENT_URL, USER_SERVICE_URL } from "../config/env";

export const register = async (req: Request, res: Response, next: NextFunction) => {
    let newUser;
    try {
        const safeRole = 'user';

        newUser = await AuthService.createUser({
            email: req.body.email,
            password: req.body.password,
            role: safeRole
        });

        console.log(`✅ [Auth] Identity created for ${newUser.email}. Syncing with User Service...`);

        try {
            await axios.post(USER_SERVICE_URL, {
                _id: newUser._id,
                email: newUser.email,
                username: req.body.username,
                bio: req.body.bio,
                avatar: req.body.avatar
            });
            console.log(`✅ [Auth] Synced with User Service successfully.`);
        } catch (microserviceError: any) {
            // ROLLBACK
            await User.findByIdAndDelete(newUser._id);
            // Here we DO throw a specific error because this is a specific logic failure
            throw new AppError('Failed to create user profile. Please check server logs.', 500);
        }

        const token = generateToken(newUser._id.toString());
        res.status(201).json({ status: 'success', token });
    } catch (error: any) {
        next(error);
    }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await AuthService.validateUser(req.body.email, req.body.password);
        const token = generateToken(user._id.toString());

        res.json({ status: 'success', token });
    } catch (error: any) {
        next(error);
    }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const resetToken = await AuthService.getResetToken(req.body.email);
        const resetUrl = `${CLIENT_URL}/reset-password/${resetToken}`;

        console.log("-------------------------------------------------------");
        console.log("🔑 PASSWORD RESET TOKEN (Dev Mode):");
        console.log(resetToken);
        console.log("-------------------------------------------------------");

        try {
            await sendEmail({
                email: req.body.email,
                subject: 'Your Password Reset Token',
                message: `Reset your password here: ${resetUrl}`,
                html: getPasswordResetTemplate(resetUrl)
            });

            res.status(200).json({ status: 'success', message: 'Token sent to email!' });
        } catch (emailError) {
            await AuthService.clearResetToken(req.body.email);
            return next(new AppError('Error sending email. Try again later!', 500));
        }
    } catch (error: any) {
        next(error);
    }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await AuthService.resetPassword(req.params.token as string, req.body.password);
        const token = generateToken(user._id.toString());
        res.status(200).json({ status: 'success', token });
    } catch (error: any) {
        next(error);
    }
};

export const updatePassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await AuthService.updatePassword(
            (req as any).user._id,
            req.body.currentPassword,
            req.body.newPassword
        );
        const token = generateToken(user._id.toString());
        res.status(200).json({ status: 'success', token });
    } catch (error: any) {
        next(error);
    }
};