import { Schema, model, Document, Types } from 'mongoose';

export interface INote extends Document {
    title: string;
    content: string;
    author: Types.ObjectId;
    tags: string[];
    isPinned: boolean;
    isArchived: boolean;
    backgroundColor: string;
    createdAt: Date;
    updatedAt: Date;
}

const noteSchema = new Schema<INote>({
    title: {
        type: String,
        default: 'Untitled',
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters']
    },
    content: {
        type: String,
        required: true,
        trim: true,
    },
    author: {
        type: Schema.Types.ObjectId,
        required: true,
        index: true // Indexed for performance
    },
    tags: [{ type: String, trim: true }],
    isPinned: { type: Boolean, default: false },
    isArchived: { type: Boolean, default: false },
    backgroundColor: { type: String, default: '#ffffff' }
}, { timestamps: true });

export const Note = model<INote>('Note', noteSchema);