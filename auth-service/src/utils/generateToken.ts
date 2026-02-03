import jwt from 'jsonwebtoken';
import { JWT_EXPIRES_IN, JWT_SECRET } from "../config/env";

const generateToken = (userId: string) => {
    return jwt.sign(
        { userId },
        JWT_SECRET,
        {
            // Cast to 'any' to satisfy the strict type definition
            expiresIn: JWT_EXPIRES_IN as any
        }
    );
};

export default generateToken;