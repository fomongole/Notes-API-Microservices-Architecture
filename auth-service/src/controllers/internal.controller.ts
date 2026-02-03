import { Request, Response, NextFunction } from 'express';
import * as AuthService from '../services/auth.service';

// Used for Soft Delete (User deletes self)
export const syncUserStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId, isActive } = req.body;
        await AuthService.updateUserStatus(userId, isActive);
        res.status(200).json({ status: 'success' });
    } catch (error) {
        next(error);
    }
};

// Used for Hard Delete (Admin deletes user)
export const hardDeleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await AuthService.deleteUserPermanently(req.params.id as string);
        res.status(204).json({ status: 'success', data: null });
    } catch (error) {
        next(error);
    }
};