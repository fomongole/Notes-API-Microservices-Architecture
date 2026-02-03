import { Request, Response, NextFunction } from 'express';
import * as UserService from '../services/user.service';
import { AppError } from '../utils/AppError';
import {AUTH_SERVICE_URL} from "../config/env";
import axios from 'axios';

// INTERNAL HANDLER (Called by Auth Service)
export const createInternalUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // We expect { _id, email, username... } in body
        const user = await UserService.createProfile(req.body);

        res.status(201).json({
            status: 'success',
            data: { user }
        });
    } catch (error) {
        // If this fails, Auth Service will catch the 500/400 and Rollback
        next(error);
    }
};

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req.user as any)._id;
        const user = await UserService.getMe(userId);

        res.status(200).json({ status: 'success', data: { user } });
    } catch (error) { next(error); }
};

export const updateMe = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req.user as any)._id;

        if (req.body.password || req.body.passwordConfirm) {
            return next(new AppError('Password updates are not handled by User Service', 400));
        }

        const updatedUser = await UserService.updateMe(userId, req.body);

        res.status(200).json({ status: 'success', data: { user: updatedUser } });
    } catch (error) { next(error); }
};

// 1. SELF DELETE (Soft Delete -> Deactivate)
export const deleteMe = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req.user as any)._id;

        // A. Soft Delete in User Service
        await UserService.deleteMe(userId);

        // B. Sync Deactivation to Auth Service
        try {
            await axios.patch(`${AUTH_SERVICE_URL}/status`, {
                userId: userId,
                isActive: false
            });
            console.log(`✅ [User] Synced deactivation (Soft Delete) for ${userId}`);
        } catch (error: any) {
            console.error(`❌ [User] Failed to sync status: ${error.message}`);
        }

        res.status(204).json({ status: 'success', data: null });
    } catch (error) { next(error); }
};

// 2. ADMIN DELETE (Hard Delete -> Destroy)
export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.params.id;

        // A. Hard Delete in User Service
        await UserService.deleteUserById(userId as string);

        // B. Sync Permanent Delete to Auth Service
        try {
            // Note the change: axios.delete and passing ID in URL
            await axios.delete(`${AUTH_SERVICE_URL}/users/${userId}`);

            console.log(`✅ [User] Synced permanent deletion (Hard Delete) for ${userId}`);
        } catch (error: any) {
            console.error(`❌ [User] Failed to sync hard delete: ${error.message}`);
            // Even if sync fails, we already deleted the profile.
            // Will later implement Message Queues for robustness.
        }

        res.status(204).json({ status: 'success', data: null });
    } catch (error: any) {
        next(error);
    }
};

// --- ADMIN HANDLERS ---

export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const result = await UserService.getAllUsers(page, limit);

        res.status(200).json({
            status: 'success',
            results: result.users.length,
            data: {
                users: result.users,
                pagination: { total: result.total, page: result.page, pages: result.pages }
            }
        });
    } catch (error) { next(error); }
};

export const getUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await UserService.getUserById(req.params.id as string);
        res.status(200).json({ status: 'success', data: { user } });
    } catch (error: any) {
        next(error);
    }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await UserService.updateUserById(req.params.id as string, req.body);
        res.status(200).json({ status: 'success', data: { user } });
    } catch (error: any) {
        next(error);
    }
};