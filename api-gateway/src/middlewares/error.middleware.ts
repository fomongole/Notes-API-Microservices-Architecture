import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { ZodError } from 'zod';

/**
 * Middleware to handle 404 Not Found errors for undefined routes.
 */
export const notFound = (req: Request, res: Response, next: NextFunction) => {
    next(new AppError(`Resource Not Found: ${req.originalUrl}`, 404));
};

/**
 * Global Error Handler Middleware.
 * Standardizes error responses across the application.
 */
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    let statusCode = err.statusCode || 500;

    let message: string = err.message || 'Internal Server Error';

    // 1. Handles Zod Errors (Validation)
    if (err instanceof ZodError) {
        statusCode = 400;
        // Taking only the FIRST error message from the issues array.
        message = err.issues[0].message;
    }

    // 2. Handles Mongoose Duplicate Key (e.g., duplicate email registration)
    if (err.code === 11000) {
        statusCode = 409;
        const field = Object.keys(err.keyValue || {})[0] || 'input';

        message = `${field} already exists`;
    }

    res.status(statusCode).json({
        status: 'fail',
        message
    });
};
