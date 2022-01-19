import mongoose from "mongoose";

export interface CollectionInterface<T = unknown> {
    ID: string;
    data: T;
    createdAt: Date;
    updatedAt: Date;
}

export const docSchema = new mongoose.Schema<CollectionInterface>(
    {
        ID: {
            type: mongoose.SchemaTypes.String,
            required: true,
            unique: true
        },
        data: {
            type: mongoose.SchemaTypes.Mixed,
            required: false
        }
    },
    {
        timestamps: true
    }
);

export default function modelSchema<T = unknown>(connection: mongoose.Connection, modelName = "JSON") {
    const model = connection.model<CollectionInterface<T>>(modelName, docSchema);
    return model;
}
