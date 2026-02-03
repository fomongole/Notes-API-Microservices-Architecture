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

    // Default: message is a simple string.
    let message: string = err.message || 'Internal Server Error';

    // 1. Handle Zod Errors (Validation)
    if (err instanceof ZodError) {
        statusCode = 400;
        message = err.issues[0].message;
    }

    // 2. Handle Mongoose Duplicate Key (e.g., duplicate email)
    if (err.code === 11000) {
        statusCode = 409;
        const field = Object.keys(err.keyValue || {})[0] || 'input';
        message = `${field} already exists`;
    }

    // 3. Handle Mongoose Cast Error (Invalid ID format)
    // Example: User sends "123" instead of a valid ObjectId
    if (err.name === 'CastError') {
        statusCode = 400;
        message = `Invalid ${err.path}: ${err.value}`;
    }

    // 3. Send Response
    res.status(statusCode).json({
        status: 'fail',
        message
    });
};