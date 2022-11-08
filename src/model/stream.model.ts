import { Schema, model, Document } from 'mongoose';

export interface IYoutubeStreamModel extends Document {
    streamId: string;
    title: string;
    description: string;
    likes: number;
    dislikes: number;
    views: number;
    comments: number;
    chatMessages: any;
}

const StreamSchema = new Schema<IYoutubeStreamModel>({
    streamId: {
        type: String,
        required: true,
    },
    title:
    {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    likes: {
        type: Number,
        required: true
    },
    dislikes: {
        type: Number,
        required: true
    },
    views: {
        type: Number,
        required: true
    },
    comments: {
        type: Number,
        required: true
    },
    chatMessages: {
        type: Array,
        required: true
    }
}, {
    versionKey: false,
    timestamps: true,

});

export const YoutubeStreamModel = model<IYoutubeStreamModel>('YoutubeStreamModel', StreamSchema, 'youtube-streams');
