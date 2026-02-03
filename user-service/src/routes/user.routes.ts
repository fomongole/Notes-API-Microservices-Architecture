import { Router } from 'express';
import {
    getMe,
    updateMe,
    deleteMe,
    getAllUsers,
    getUser,
    updateUser,
    deleteUser
} from '../controllers/user.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { updateMeSchema } from '../validators/user.validator';

const router = Router();

router.use(protect);

// User Operations
router.get('/me', getMe);
router.patch('/update-me', validate(updateMeSchema), updateMe);
router.delete('/delete-me', deleteMe);

// Admin Operations
router.use(restrictTo('admin'));

router.route('/')
    .get(getAllUsers);

router.route('/:id')
    .get(getUser)
    .patch(updateUser)
    .delete(deleteUser);

export default router;