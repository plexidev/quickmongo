import dots from "dot-prop";
import type { Collection as MongoCollection } from "mongodb";
import { FieldModel, FieldType } from "./fields";

export type FieldToDocumentScheme<T extends FieldModel<unknown>> = {
    key: string;
    value: FieldType<T>;
};

export class Collection<T extends FieldModel<unknown>> {
    constructor(public collection: MongoCollection<FieldToDocumentScheme<T>>, public model: T) {}

    async get(key: string): Promise<FieldType<T> | undefined>;
    async get<P = unknown>(key: string, path: string): Promise<P | undefined>;
    async get<P>(key: string, path?: string) {
        const { value } = await this.collection.findOne({
            key: key
        }) || {};

        if (value) {
            this.model.validate(value);

            if (path) {
                if (typeof value !== "object") {
                    throw new Error("Received value must be an 'object'");
                }

                return dots.get<P>(value, path);
            }
        }

        return value || undefined;
    }

    async set(key: string, value: FieldType<T>): Promise<void>;
    async set<P = unknown>(key: string, value: P, path: string): Promise<void>;
    async set<P>(key: string, value: FieldType<T> | P, path?: string) {
        const nVal: FieldType<T> = path ? await this.get(key) : <FieldType<T>>value;

        if (path && nVal) {
            if (typeof nVal !== "object") {
                throw new Error("Received value must be an 'object'");
            }

            dots.set(nVal, path, value);
        }

        this.model.validate(nVal);

        await this.collection.updateOne(
            {
                key: key
            },
            {
                $set: {
                    value: nVal
                }
            },
            {
                upsert: true
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
                if (typeof value !== "object") {
                    throw new Error("Received value must be an 'object'");
                }

                dots.set(value, path, null);
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
