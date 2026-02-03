import { Note, INote } from '../models/note.model';
import { AppError } from '../utils/AppError';

export const createNote = async (userId: string, noteData: Partial<INote>) => {
    return await Note.create({ ...noteData, author: userId });
};

export const getNotes = async (userId: string, query: any) => {
    const filter: any = { author: userId };

    if (query.isArchived) filter.isArchived = query.isArchived === 'true';
    else filter.isArchived = false; // Default to showing active notes

    if (query.tag) filter.tags = { $in: [query.tag] };

    if (query.search) {
        filter.$or = [
            { title: { $regex: query.search, $options: 'i' } },
            { content: { $regex: query.search, $options: 'i' } }
        ];
    }

    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const notes = await Note.find(filter)
        .sort({ isPinned: -1, updatedAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await Note.countDocuments(filter);

    return { notes, total, page, pages: Math.ceil(total / limit) };
};

export const getNoteById = async (userId: string, noteId: string) => {
    const note = await Note.findOne({ _id: noteId, author: userId });
    if (!note) throw new AppError('Note not found or access denied', 404);
    return note;
};

export const updateNote = async (userId: string, noteId: string, updateData: Partial<INote>) => {
    const note = await Note.findOneAndUpdate(
        { _id: noteId, author: userId },
        updateData,
        { new: true, runValidators: true }
    );
    if (!note) throw new AppError('Note not found or access denied', 404);
    return note;
};

export const deleteNote = async (userId: string, noteId: string) => {
    const note = await Note.findOneAndDelete({ _id: noteId, author: userId });
    if (!note) throw new AppError('Note not found or access denied', 404);
    return note;
};