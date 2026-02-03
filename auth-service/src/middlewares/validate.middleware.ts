import { Request, Response, NextFunction } from 'express';
import { z, ZodObject } from 'zod';

// Defines a local type alias to replace the removed AnyZodObject
type AnyZodObject = ZodObject<{ [key: string]: z.ZodTypeAny }>;

export const validate = (schema: AnyZodObject) =>
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params
            });
            next();
        } catch (error) {
            // Passing the error to the Global Error Handler!
            next(error);
        }
    };