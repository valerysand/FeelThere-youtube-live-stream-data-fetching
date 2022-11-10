import { Schema, model, Document } from 'mongoose';

export interface IFacebookStreamModel extends Document {
    streamId: string;
    title: string;
    description: string;
    reactions: number;
    views: number;
    comments: string[];
}

const FacebookStreamSchema = new Schema<IFacebookStreamModel>({
    streamId: {
        type: String,
        required: true,
    },
    title:
    {
        type: String,
    },
    description: {
        type: String,
    },
    reactions: {
        type: Number,
    },
    views: {
        type: Number,
    },
    comments: {
        type: [String],
    },
}, {
    versionKey: false,
    timestamps: true,

});

export const FacebookStreamModel = model<IFacebookStreamModel>('FacebookStreamModel', FacebookStreamSchema, 'facebook-streams');