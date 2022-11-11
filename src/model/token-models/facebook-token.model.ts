import { Schema, model, Document } from 'mongoose';

export interface IFacebookTokenModel extends Document {
    name: string;
    accessToken: string;
    expiresIn: number;
}

const FacebookTokenSchema = new Schema<IFacebookTokenModel>({
    name: {
        type: String,
        required: true,
    },
    accessToken: {
        type: String,
        required: true,
    },
    expiresIn: {
        type: Number,
        required: true,
    },
}, {
    timestamps: true,
    versionKey: false,
});


export const FacebookTokenModel = model<IFacebookTokenModel>('FacebookTokenModel', FacebookTokenSchema, 'accessTokens');