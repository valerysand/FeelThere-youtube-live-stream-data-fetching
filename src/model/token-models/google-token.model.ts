import { Schema, model, Document } from 'mongoose';

export interface IGooogleTokenModel extends Document {
    name: string;
    accessToken: string;
    refreshToken: string;
    expiryDate: Date;
}

const GoogleTokenSchema = new Schema<IGooogleTokenModel>({
    name: {
        type: String,
        required: true,
    },
    accessToken: {
        type: String,
        required: true,
    },
    refreshToken: {
        type: String,
        required: true,
    },
    expiryDate: {
        type: Date,
        required: true,
    },

}, {
    timestamps: true,
    versionKey: false,
});

export const GoogleTokenModel = model<IGooogleTokenModel>('GoogleTokenModel', GoogleTokenSchema, 'accessTokens');