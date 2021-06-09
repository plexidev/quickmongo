import { Connection, Schema } from 'mongoose';

export interface QuickMongoSchemaEntity {
    ID: string;
    data: any;
}

const Default = new Schema<QuickMongoSchemaEntity>(
    {
        ID: {
            type: Schema.Types.String,
            required: true,
            unique: true
        },
        data: {
            type: Schema.Types.Mixed,
            required: true
        }
    },
    { versionKey: false, id: false }
);

export default (connection: Connection, name: string) => (typeof name === 'string' ? connection.model(name, Default) : connection.model('JSON', Default));
