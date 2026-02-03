import { prisma } from '../config/db';
import { AppError } from '../utils/AppError';
import { Prisma } from "@prisma/client";

export const createNote = async (userId: string, noteData: any) => {
    return await prisma.note.create({
        data: {
            ...noteData,
            author: userId
        }
    });
};

export const getNotes = async (userId: string, query: any) => {
    // 1. Build the "Where" clause dynamically
    const where: Prisma.NoteWhereInput = {
        author: userId,
        isArchived: query.isArchived === 'true' // defaults to false if undefined
    };

    // Filter by Tag (Postgres Array containment)
    if (query.tag) {
        where.tags = {
            has: query.tag
        };
    }

    // Search (Case insensitive partial match)
    if (query.search) {
        where.OR = [
            { title: { contains: query.search, mode: 'insensitive' } },
            { content: { contains: query.search, mode: 'insensitive' } }
        ];
    }

    // 2. Pagination
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    // 3. Execute Queries (Parallelly for speed)
    const [notes, total] = await Promise.all([
        prisma.note.findMany({
            where,
            orderBy: [
                { isPinned: 'desc' },
                { updatedAt: 'desc' }
            ],
            skip,
            take: limit
        }),
        prisma.note.count({ where })
    ]);

    return { notes, total, page, pages: Math.ceil(total / limit) };
};

export const getNoteById = async (userId: string, noteId: string) => {
    const note = await prisma.note.findFirst({
        where: {
            id: noteId,
            author: userId
        }
    });

    if (!note) throw new AppError('Note not found or access denied', 404);
    return note;
};

export const updateNote = async (userId: string, noteId: string, updateData: any) => {
    // Check ownership first
    const exists = await prisma.note.findFirst({ where: { id: noteId, author: userId }});
    if(!exists) throw new AppError('Note not found or access denied', 404);

    const note = await prisma.note.update({
        where: { id: noteId },
        data: updateData
    });

    return note;
};

export const deleteNote = async (userId: string, noteId: string) => {
    // Check ownership first
    const exists = await prisma.note.findFirst({ where: { id: noteId, author: userId }});
    if(!exists) throw new AppError('Note not found or access denied', 404);

    await prisma.note.delete({
        where: { id: noteId }
    });
};