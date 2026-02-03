import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/env';

interface JwtPayload {
    userId: string;
    role?: string;
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];

            // 1. Verify Token
            const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

            // 2. Set User from Token (Stateless)
            // We don't check the DB because the User DB is in another service!
            req.user = { _id: decoded.userId, role: decoded.role };

            next();
        } catch (error) {
            res.status(401).json({ status: 'fail', message: 'Not authorized, invalid token' });
        }
    } else {
        res.status(401).json({ status: 'fail', message: 'Not authorized, no token' });
    }
};