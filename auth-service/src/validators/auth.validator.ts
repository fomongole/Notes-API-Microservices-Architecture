import { z } from 'zod';

export const loginSchema = z.object({
    body: z.object({
        email: z
            .string({ message: "Email is required" })
            .email("Invalid email address"),

        password: z
            .string({ message: "Password is required" })
            .min(1, "Password cannot be empty")
    })
});

export const registerSchema = z.object({
    body: z.object({
        email: z
            .string({ message: "Email is required" })
            .email("Invalid email format"),
        password: z
            .string({ message: "Password is required" })
            .min(8, "Password must be at least 8 characters"),
        // Username is optional; if missing, we auto-generate it in the controller
        username: z.string().min(3).optional()
    })
});

export const forgotPasswordSchema = z.object({
    body: z.object({
        email: z.string({ message: "Email is required" }).email("Invalid email format")
    })
});

export const resetPasswordSchema = z.object({
    body: z.object({
        password: z.string({ message: "New password is required" }).min(8, "Password must be 8+ chars")
    })
});

export const updatePasswordSchema = z.object({
    body: z.object({
        currentPassword: z.string({ message: "Current password is required" }),
        newPassword: z.string({ message: "New password is required" }).min(8, "Password must be 8+ chars")
    })
});