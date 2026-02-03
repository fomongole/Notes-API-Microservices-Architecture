import { Router } from 'express';
import { syncUserStatus, hardDeleteUser } from '../controllers/internal.controller';

const router = Router();

// PATCH /internal/status (For Soft Delete)
router.patch('/status', syncUserStatus);

// DELETE /internal/users/:id (For Hard Delete)
router.delete('/users/:id', hardDeleteUser);

export default router;