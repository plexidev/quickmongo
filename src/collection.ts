import type { Collection as MongoCollection } from "mongodb";
import { FieldModel, FieldType } from "./fields";

export class Collection<T extends FieldModel<unknown>> {
    collection: MongoCollection;
    model: T;

    constructor(collection: MongoCollection, model: T) {
        this.collection = collection;
        this.model = model;
    }

    async get(key: string): Promise<FieldType<T> | undefined> {
        // TODO: dot notations
        const value = await this.collection.findOne({
            key: key
        });

        if (!this.model.validate(value)) {
            // TODO: should we throw error?
            throw new TypeError();
        }

        return value ? (value as FieldType<T>) : undefined;
    }

    async set(key: string, value: FieldType<T>): Promise<void> {
        if (!this.model.validate(value)) {
            throw new TypeError();
        }

        // TODO: dot notations
        await this.collection.updateOne(
            {
                key: key
            },
            {
                value: value
            }
        );
    }

    async delete(key: string): Promise<boolean> {
        // TODO: dot notations
        const result = await this.collection.deleteOne({
            key: key
        });

        return result.deletedCount === 1;
    }
}
