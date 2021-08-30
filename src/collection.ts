import dots from "dot-prop";
import type { Collection as MongoCollection } from "mongodb";
import { FieldModel, FieldType } from "./fields";

export class Collection<T extends FieldModel<unknown>> {
    constructor(public collection: MongoCollection, public model: T) {}

    async get(key: string): Promise<FieldType<T> | undefined>;
    async get<P = unknown>(key: string, path: string): Promise<P | undefined>;
    async get<P>(key: string, path?: string) {
        const value = await this.collection.findOne({
            key: key
        });

        if (!this.model.validate(value)) {
            throw new TypeError();
        }

        if (path) {
            return dots.get<P>(value, path);
        }

        return value ? (value as FieldType<T>) : undefined;
    }

    async set(key: string, value: FieldType<T>): Promise<void>;
    async set<P = unknown>(key: string, value: P, path: string): Promise<void>;
    async set<P>(key: string, value: FieldType<T> | P, path?: string) {
        const nVal: FieldType<T> = path ? await this.get(key) : <FieldType<T>>value;

        if (path) {
            dots.set<P>(nVal, path, value);
        }

        if (!this.model.validate(nVal)) {
            throw new TypeError();
        }

        await this.collection.updateOne(
            {
                key: key
            },
            {
                value: nVal
            }
        );
    }

    async delete(key: string): Promise<boolean>;
    async delete(key: string, path: string): Promise<boolean>;
    async delete(key: string, path?: string) {
        let deleted = false;

        if (path) {
            const value = await this.get(key);
            if (value) {
                dots.delete(value, path);
                await this.set(key, value);
                deleted = true;
            }
        } else {
           const result = await this.collection.deleteOne({
                key: key
            });
            deleted = result.deletedCount === 1;
        }

        return deleted;
    }
}
