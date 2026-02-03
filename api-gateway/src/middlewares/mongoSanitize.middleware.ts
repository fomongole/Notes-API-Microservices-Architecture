import { Request, Response, NextFunction } from 'express';

/**
 * recursively walks through an object and removes any keys starting with "$"
 * or containing "." to prevent NoSQL injection.
 */
const sanitize = (obj: any) => {
    if (obj instanceof Object) {
        for (const key in obj) {
            // Remove dangerous keys
            if (/^\$/.test(key) || key.includes('.')) {
                delete obj[key];
            } else {
                // Recursively clean nested objects
                sanitize(obj[key]);
            }
        }
    }
};

export const mongoSanitize = (req: Request, res: Response, next: NextFunction) => {
    // Sanitize all input sources "in-place"
    if (req.body) sanitize(req.body);
    if (req.params) sanitize(req.params);
    if (req.query) sanitize(req.query); // Modifying keys is OK, replacing req.query is NOT

    next();
};