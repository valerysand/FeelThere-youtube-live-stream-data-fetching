import { Schema, model, Document } from 'mongoose';

export interface IFbAccessTokenModel extends Document {
    accessToken: string;
    expiresIn: number;
}

const fbAccessTokenSchema = new Schema<IFbAccessTokenModel>({
    accessToken: {
        type: String,
        // required: true,
    },
    expiresIn: {
        type: Number,
        // required: true,
    },
}, {
    timestamps: true,
    versionKey: false,
});

export const FbAccessTokenModel = model<IFbAccessTokenModel>('FbAccessTokenModel', fbAccessTokenSchema, 'fbAccessToken');