import { Router } from 'express';
import {
    createNote,
    getAllNotes,
    getNote,
    updateNote,
    deleteNote
} from '../controllers/note.controller';
import { protect } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createNoteSchema, updateNoteSchema } from '../validators/note.validator';

const router = Router();

router.use(protect);

router.route('/')
    .get(getAllNotes)
    .post(validate(createNoteSchema), createNote);

router.route('/:id')
    .get(getNote)
    .patch(validate(updateNoteSchema), updateNote)
    .delete(deleteNote);

export default router;