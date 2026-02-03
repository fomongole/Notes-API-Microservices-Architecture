import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model';
import { JWT_SECRET } from '../config/env';

interface JwtPayload {
    userId: string;
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

            req.user = await User.findById(decoded.userId).select('-password') || undefined;

            if (!req.user) {
                return res.status(401).json({ status: 'fail', message: 'User not found' });
            }

            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ status: 'fail', message: 'Not authorized' });
        }
    }

    if (!token) {
        res.status(401).json({ status: 'fail', message: 'Not authorized, no token' });
    }
};