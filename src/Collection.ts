import dots from "dot-prop";
import type { Collection as MongoCollection, SortDirection } from "mongodb";
import { FieldModel, FieldType } from "./fields";
import { resolveField } from "./fields/util";

export type FieldToDocumentScheme<T extends FieldModel<unknown>> = {
    ID: string;
    data: FieldType<T>;
};

export interface CollectionSortOptions {
    by?: SortDirection;
    target?: string | string[];
}

export interface AllCollectionDocumentOptions {
    max?: number;
    sort?: CollectionSortOptions;
}

/**
 * The QuickMongo collection
 */
export class Collection<T extends FieldModel<unknown>> {

    /**
     * @property model
     * @type {FieldModel} 
     * Field model
     */
    public model: T;

    /**
     * Create new quickmongo collection instance
     * @param {MongoCollection} collection The MongoDB collection
     * @param {FieldModel} model Field model
     * @example const mongo = await MongoClient.connect("mongodb://127.0.0.1:61582");
     * const mongoCollection = mongo.db("quickmongo").collection("test");
     * const schema = new QuickMongo.Fields.ObjectField({...});
     * const db = new QuickMongo.Collection(collection, schema);
     */
    constructor(public collection: MongoCollection<FieldToDocumentScheme<T>>, model: T) {
        this.model = resolveField(model) as T;
    }

    /**
     * Returns if the collection has data with the specified key.
     * <warn>This method only checks if the data is **NOT** undefined.</warn>
     * @param {string} key The key
     * @param {string} path The path
     * @returns {Promise<boolean>}
     */
    async has(key: string, path?: string): Promise<boolean> {
        try {
            return typeof (await this.get(key, path)) !== "undefined";
        } catch {
            return false;
        }
    }

    /**
     * Get data from the collection
     * @param {string} key The key to retrieve data
     * @param {string} [path] The path to pick from the data
     * @returns {Promise<FieldType|any>}
     */
    async get(key: string): Promise<FieldType<T> | undefined>;
    async get<P = unknown>(key: string, path: string): Promise<P | undefined>;
    async get<P>(key: string, path?: string) {
        const { data } = (await this.collection.findOne({ ID: key })) || {};

        if (data) {
            this.model.validate(data);
            if (path) {
                if (typeof data !== "object") throw new Error("Received value must be an 'object'");
                return dots.get<P>(data, path);
            }

            return data;
        }
    }

    /**
     * Set data to the collection
     * @param {string} key The key to retrieve data
     * @param {FieldType} value The data to save
     * @param {string} [path] The path to save data
     * @returns {Promise<FieldType>}
     */
    async set(key: string, value: FieldType<T>): Promise<FieldType<T>>;
    async set<P = unknown>(key: string, value: P, path: string): Promise<FieldType<T>>;
    async set<P>(key: string, value: FieldType<T> | P, path?: string): Promise<FieldType<T>> {
        const nVal: FieldType<T> = path ? await this.get(key) : <FieldType<T>>value;

        if (path && nVal) {
            if (typeof nVal !== "object") throw new Error("Received value must be an 'object'");
            dots.set(nVal, path, value);
        }

        this.model.validate(nVal);
        const data = await this.collection.updateOne({ ID: key }, { $set: { data: nVal } }, { upsert: true });

        if (data.modifiedCount > 0 || data.upsertedCount > 0) return nVal;
    }

    /**
     * Delete a data from the collection
     * @param {string} key The key to remove
     * @param {string} [path] The path to remove
     * @returns {Promise<boolean>}
     */
    async delete(key: string): Promise<boolean>;
    async delete(key: string, path: string): Promise<boolean>;
    async delete(key: string, path?: string) {
        if (path) {
            const value = await this.get(key);
            if (value) {
                if (typeof value !== "object") throw new Error("Received value must be an 'object'");
                dots.set(value, path, null);
                await this.set(key, value);
                return true;
            }
        } else {
            const result = await this.collection.deleteOne({ ID: key });
            return result.deletedCount === 1;
        }
    }

    /**
     * Drops this collection
     * @returns {Promise<boolean>}
     */
    drop(): Promise<boolean> {
        return this.collection.drop().catch(() => false);
    }

    /**
     * Returns all data from this collection as array
     * @param {AllCollectionDocumentOptions} [options={}] The options
     * @returns {Promise<FieldToDocumentScheme[]>}
     */
    async all(options: AllCollectionDocumentOptions = {}): Promise<FieldToDocumentScheme<T>[]> {
        const data = await this.collection
            .find()
            .limit(options.max || 0)
            .sort(options.sort?.target, options.sort?.by || undefined)
            .toArray();

        return data;
    }

    /**
     * Pushes to the array inside a field
     * @param {string} key The key
     * @param {any|any[]} value The value to push
     * @param {string} path The path where it should push
     * @returns {Promise<FieldType|undefined>}
     */
    async push<P = unknown>(key: string, value: P, path?: string): Promise<FieldType<T> | undefined> {
        if (typeof value === "undefined") throw new Error("cannot push undefined");
        const data = await this.get(key, path);
        if (!Array.isArray(data)) throw new TypeError(`Cannot call push because target "${key}${path ? `.${path}` : ""}" is not array`);
        if (Array.isArray(value)) data.push(...value);
        else data.push(value);

        return this.set(key, data, path);
    }

    /**
     * Pulls from the array inside a field
     * @param {string} key The key
     * @param {any|any[]} value The value to pull
     * @param {string} path The path where it should push
     * @returns {Promise<FieldType|undefined>}
     */
    async pull<P = unknown>(key: string, value: P, path?: string): Promise<FieldType<T> | undefined> {
        if (typeof value === "undefined") throw new Error("cannot pull undefined");
        const data = await this.get(key, path);
        if (!Array.isArray(data)) throw new TypeError(`Cannot call pull because target "${key}${path ? `.${path}` : ""}" is not array`);
        const newData = data.filter(Array.isArray(value) ? (x) => !value.includes(x) : (x) => x !== value);
        return this.set(key, newData, path);
    }

    /**
     * Returns the db latency in ms
     * @returns {Promise<number>}
     */
    async latency(): Promise<number> {
        const start = Date.now();
        await this.all({ max: 1 });
        return Date.now() - start;
    }

    /**
     * Exports this collection to a json object
     * @returns {Promise<CollectionExport>}
     */
    async export() {
        const everything = await this.all();
        return {
            db: this.collection.dbName,
            name: this.collection.collectionName,
            namespace: this.collection.namespace,
            data: everything.map((m) => ({ ID: m.ID, data: m.data })) // Mapping is done here to exclude `__id` field.
        };
    }
}
