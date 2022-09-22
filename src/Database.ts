import mongoose from "mongoose";
import modelSchema, { CollectionInterface } from "./collection";
import { TypedEmitter } from "tiny-typed-emitter";
import { Util } from "./Util";
import _ from "lodash";

export interface QuickMongoOptions extends mongoose.ConnectOptions {
    /**
     * Collection name to use
     */
    collectionName?: string;
    /**
     * If it should be created as a child db
     */
    child?: boolean;
    /**
     * Parent db
     */
    parent?: Database;
    /**
     * If it should share connection from parent db
     */
    shareConnectionFromParent?: boolean;
    /**
     * If it should connect automatically
     */
    autoConnect?: boolean;
}

export interface AllQueryOptions<T = unknown> {
    /**
     * The query limit
     */
    limit?: number;
    /**
     * Sort by
     */
    sort?: string;
    /**
     * Query filter
     */
    filter?: (data: AllData<T>) => boolean;
}

export interface AllData<T = unknown> {
    /**
     * The id
     */
    ID: string;
    /**
     * The data associated with a particular ID
     */
    data: T;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DocType<T = unknown> = mongoose.Document<any, any, CollectionInterface<T>> &
    CollectionInterface<T> & {
        _id: mongoose.Types.ObjectId;
    };

export interface QmEvents<V = unknown> {
    /**
     * The `ready` event
     */
    ready: (db: Database<V>) => unknown;
    /**
     * The `connecting` event
     */
    connecting: () => unknown;
    /**
     * The `connected` event
     */
    connected: () => unknown;
    /**
     * The `open` event
     */
    open: () => unknown;
    /**
     * The `disconnecting` event
     */
    disconnecting: () => unknown;
    /**
     * The `disconnected` event
     */
    disconnected: () => unknown;
    /**
     * The `close` event
     */
    close: () => unknown;
    /**
     * The `reconnected` event
     */
    reconnected: () => unknown;
    /**
     * The `error` event
     */
    error: (error: Error) => unknown;
    /**
     * The `fullsetup` event
     */
    fullsetup: () => unknown;
    /**
     * The `all` event
     */
    all: () => unknown;
    /**
     * The `reconnectFailed` event
     */
    reconnectFailed: () => unknown;
}

/**
 * The Database constructor
 * @extends {EventEmitter}
 */
export class Database<T = unknown, PAR = unknown> extends TypedEmitter<QmEvents<T>> {
    public connection: mongoose.Connection;
    public parent: Database<PAR> = null;
    private __child__ = false;
    // eslint-disable-next-line @typescript-eslint/ban-types
    public model: mongoose.Model<CollectionInterface<T>, {}, {}, {}> = null;

    /**
     * Creates new quickmongo instance
     * @param url The database url
     * @param options The database options
     */
    public constructor(public url: string, public options: QuickMongoOptions = {}) {
        super();

        Object.defineProperty(this, "__child__", {
            writable: true,
            enumerable: false,
            configurable: true
        });

        if (this.options.autoConnect) this.connect();
    }

    /**
     * If this is a child database
     */
    public isChild() {
        return !this.isParent();
    }

    /**
     * If this is a parent database
     */
    public isParent() {
        return !this.__child__;
    }

    /**
     * If the database is ready
     */
    public get ready() {
        return this.model && this.connection ? true : false;
    }

    /**
     * Database ready state
     */
    public get readyState() {
        return this.connection?.readyState ?? 0;
    }

    /**
     * Get raw document
     * @param key The key
     */
    public async getRaw(key: string): Promise<DocType<T>> {
        this.__readyCheck();
        const doc = await this.model.findOne({
            ID: Util.getKey(key)
        });

        // return null if the doc has expired
        // mongodb task runs every 60 seconds therefore expired docs may exist during that timeout
        // this check fixes that issue and returns null if the doc has expired
        // letting mongodb take care of data deletion in the background
        if (!doc || (doc.expireAt && doc.expireAt.getTime() - Date.now() <= 0)) {
            return null;
        }

        return doc;
    }

    /**
     * Get item from the database
     * @param key The key
     */
    public async get<V = T>(key: string): Promise<V> {
        const res = await this.getRaw(key);
        const formatted = this.__formatData(res);
        return Util.pick(formatted, key) as unknown as V;
    }

    /**
     * Get item from the database
     * @param key The key
     */
    public async fetch<V = T>(key: string): Promise<V> {
        return await this.get(key);
    }

    /**
     * Set item in the database
     * @param key The key
     * @param value The value
     * @param [expireAfterSeconds=-1] if specified, quickmongo deletes this data after specified seconds.
     * Leave it blank or set it to `-1` to make it permanent.
     * <warn>Data may still persist for a minute even after the data is supposed to be expired!</warn>
     * Data may persist for a minute even after expiration due to the nature of mongodb. QuickMongo makes sure to never return expired
     * documents even if it's not deleted.
     * @example // permanent
     * await db.set("foo", "bar");
     *
     * // delete the record after 1 minute
     * await db.set("foo", "bar", 60); // time in seconds (60 seconds = 1 minute)
     */
    public async set(key: string, value: T | unknown, expireAfterSeconds = -1): Promise<T> {
        this.__readyCheck();
        if (!key.includes(".")) {
            await this.model.findOneAndUpdate(
                {
                    ID: key
                },
                {
                    $set: Util.shouldExpire(expireAfterSeconds)
                        ? {
                              data: value,
                              expireAt: Util.createDuration(expireAfterSeconds * 1000)
                          }
                        : { data: value }
                },
                { upsert: true }
            );

            return await this.get(key);
        } else {
            const keyMetadata = Util.getKeyMetadata(key);
            const existing = await this.model.findOne({ ID: keyMetadata.master });
            if (!existing) {
                await this.model.create(
                    Util.shouldExpire(expireAfterSeconds)
                        ? {
                              ID: keyMetadata.master,
                              data: _.set({}, keyMetadata.target, value),
                              expireAt: Util.createDuration(expireAfterSeconds * 1000)
                          }
                        : {
                              ID: keyMetadata.master,
                              data: _.set({}, keyMetadata.target, value)
                          }
                );

                return await this.get(key);
            }

            if (existing.data !== null && typeof existing.data !== "object") throw new Error("CANNOT_TARGET_NON_OBJECT");

            const prev = Object.assign({}, existing.data);
            const newData = _.set(prev, keyMetadata.target, value);

            await existing.updateOne({
                $set: Util.shouldExpire(expireAfterSeconds)
                    ? {
                          data: newData,
                          expireAt: Util.createDuration(expireAfterSeconds * 1000)
                      }
                    : {
                          data: newData
                      }
            });

            return await this.get(keyMetadata.master);
        }
    }

    /**
     * Returns false if the value is nullish, else true
     * @param key The key
     */
    public async has(key: string) {
        const data = await this.get(key);
        // eslint-disable-next-line eqeqeq, no-eq-null
        return data != null;
    }

    /**
     * Deletes item from the database
     * @param key The key
     */
    public async delete(key: string) {
        this.__readyCheck();
        const keyMetadata = Util.getKeyMetadata(key);
        if (!keyMetadata.target) {
            const removed = await this.model.deleteOne({
                ID: keyMetadata.master
            });

            return removed.deletedCount > 0;
        }

        const existing = await this.model.findOne({ ID: keyMetadata.master });
        if (!existing) return false;
        if (existing.data !== null && typeof existing.data !== "object") throw new Error("CANNOT_TARGET_NON_OBJECT");
        const prev = Object.assign({}, existing.data);
        _.unset(prev, keyMetadata.target);
        await existing.updateOne({
            $set: {
                data: prev
            }
        });
        return true;
    }

    /**
     * Delete all data from this database
     */
    public async deleteAll() {
        const res = await this.model.deleteMany();
        return res.deletedCount > 0;
    }

    /**
     * Get the document count in this database
     */
    public async count() {
        return await this.model.estimatedDocumentCount();
    }

    /**
     * The database latency in ms
     */
    public async ping() {
        if (!this.model) return NaN;
        if (typeof performance !== "undefined") {
            const initial = performance.now();
            await this.get("SOME_RANDOM_KEY");
            return performance.now() - initial;
        } else {
            const initial = Date.now();
            await this.get("SOME_RANDOM_KEY");
            return Date.now() - initial;
        }
    }

    /**
     * Create a child database, either from new connection or current connection (similar to quick.db table)
     * @param collection The collection name (defaults to `JSON`)
     * @param url The database url (not needed if the child needs to share connection from parent)
     * @example const child = await db.instantiateChild("NewCollection");
     * console.log(child.all());
     */
    public async instantiateChild<K = unknown>(collection?: string, url?: string): Promise<Database<K>> {
        const childDb = new Database<K, T>(url || this.url, {
            ...this.options,
            child: true,
            // @ts-expect-error assign parent
            parent: this,
            collectionName: collection,
            shareConnectionFromParent: !!url || true
        });

        const ndb = await childDb.connect();
        return ndb;
    }

    /**
     * Identical to quick.db table constructor
     * @example const table = new db.table("table");
     * table.set("foo", "Bar");
     */
    public get table() {
        return new Proxy(
            function () {
                /* noop */
            } as unknown as TableConstructor,
            {
                construct: (_, args) => {
                    return this.useCollection(args[0]);
                },
                apply: (_, _thisArg, args) => {
                    return this.useCollection(args[0]);
                }
            }
        );
    }

    /**
     * Use specified collection. Alias of `db.table`
     * @param name The collection name
     */
    public useCollection(name: string) {
        if (!name || typeof name !== "string") throw new TypeError("Invalid collection name");
        const db = new Database(this.url, this.options);

        db.connection = this.connection;
        // @ts-expect-error assign collection
        db.model = modelSchema(this.connection, name);
        db.connect = () => Promise.resolve(db);

        return db;
    }

    /**
     * Returns everything from the database
     * @param options The request options
     */
    public async all(options?: AllQueryOptions) {
        this.__readyCheck();
        const everything = await this.model.find({});
        let arb = everything
            .filter((v) => options?.filter?.({ ID: v.ID, data: v.data }) ?? true)
            .map((m) => ({
                ID: m.ID,
                data: this.__formatData(m)
            })) as AllData<T>[];

        if (typeof options?.sort === "string") {
            if (options.sort.startsWith(".")) options.sort = options.sort.slice(1);
            const pref = options.sort.split(".");
            arb = _.sortBy(arb, pref).reverse();
        }

        return typeof options?.limit === "number" && options.limit > 0 ? arb.slice(0, options.limit) : arb;
    }

    /**
     * Drops this database
     */
    public async drop() {
        this.__readyCheck();
        return await this.model.collection.drop();
    }

    /**
     * Identical to quick.db push
     * @param key The key
     * @param value The value or array of values
     */
    public async push(key: string, value: unknown | unknown[]) {
        const data = await this.get(key);
        // eslint-disable-next-line eqeqeq, no-eq-null
        if (data == null) {
            if (!Array.isArray(value)) return await this.set(key, [value]);
            return await this.set(key, value);
        }
        if (!Array.isArray(data)) throw new Error("TARGET_EXPECTED_ARRAY");
        if (Array.isArray(value)) return await this.set(key, data.concat(value));
        data.push(value);
        return await this.set(key, data);
    }

    /**
     * Opposite of push, used to remove item
     * @param key The key
     * @param value The value or array of values
     */
    public async pull(key: string, value: unknown | unknown[] | ((data: unknown) => boolean), multiple = true): Promise<false | T> {
        let data = (await this.get(key)) as T[];
        // eslint-disable-next-line eqeqeq, no-eq-null
        if (data == null) return false;
        if (!Array.isArray(data)) throw new Error("TARGET_EXPECTED_ARRAY");
        if (typeof value === "function") {
            // @ts-expect-error apply fn
            data = data.filter(value);
            return await this.set(key, data);
        } else if (Array.isArray(value)) {
            data = data.filter((i) => !value.includes(i));
            return await this.set(key, data);
        } else {
            if (multiple) {
                data = data.filter((i) => i !== value);
                return await this.set(key, data);
            } else {
                const hasItem = data.some((x) => x === value);
                if (!hasItem) return false;
                const index = data.findIndex((x) => x === value);
                data = data.splice(index, 1);
                return await this.set(key, data);
            }
        }
    }

    /**
     * Identical to quick.db unshift
     * @param key The key
     * @param value The value
     */
    public async unshift(key: string, value: unknown | unknown[]) {
        let arr = await this.getArray(key);
        Array.isArray(value) ? (arr = value.concat(arr)) : arr.unshift(value as T);
        return await this.set(key, arr);
    }

    /**
     * Identical to quick.db shift
     * @param key The key
     */
    public async shift(key: string) {
        const arr = await this.getArray(key);
        const removed = arr.shift();
        await this.set(key, arr);
        return removed;
    }

    /**
     * Identical to quick.db pop
     * @param key The key
     */
    public async pop(key: string) {
        const arr = await this.getArray(key);
        const removed = arr.pop();
        await this.set(key, arr);
        return removed;
    }

    /**
     * Identical to quick.db startsWith
     * @param query The query
     */
    public async startsWith(query: string) {
        return this.all({
            filter(data) {
                return data.ID.startsWith(query);
            }
        });
    }

    /**
     * Identical to startsWith but checks the ending
     * @param query The query
     */
    public async endsWith(query: string) {
        return this.all({
            filter(data) {
                return data.ID.endsWith(query);
            }
        });
    }

    /**
     * Identical to quick.db add
     * @param key The key
     * @param value The value
     */
    public async add(key: string, value: number) {
        if (typeof value !== "number") throw new TypeError("VALUE_MUST_BE_NUMBER");
        const val = await this.get(key);
        return await this.set(key, (typeof val === "number" ? val : 0) + value);
    }

    /**
     * Identical to quick.db subtract
     * @param key The key
     * @param value The value
     */
    public async subtract(key: string, value: number) {
        if (typeof value !== "number") throw new TypeError("VALUE_MUST_BE_NUMBER");
        const val = await this.get(key);
        return await this.set(key, (typeof val === "number" ? val : 0) - value);
    }

    /**
     * Identical to quick.db sub
     * @param key The key
     * @param value The value
     */
    public async sub(key: string, value: number) {
        return this.subtract(key, value);
    }

    /**
     * Identical to quick.db addSubtract
     * @param key The key
     * @param value The value
     * @param [sub=false] If the operation should be subtraction
     */
    public async addSubtract(key: string, value: number, sub = false) {
        if (sub) return this.subtract(key, value);
        return this.add(key, value);
    }

    /**
     * Identical to quick.db getArray
     * @param key The key
     */
    public async getArray<Rt = T>(key: string): Promise<Rt[]> {
        const data = await this.get(key);
        if (!Array.isArray(data)) {
            throw new TypeError(`Data type of key "${key}" is not array`);
        }

        return data;
    }

    /**
     * Connects to the database.
     */
    public connect(): Promise<Database<T>> {
        return new Promise<Database<T>>((resolve, reject) => {
            if (typeof this.url !== "string" || !this.url) return reject(new Error("MISSING_MONGODB_URL"));

            this.__child__ = Boolean(this.options.child);
            this.parent = (this.options.parent as Database<PAR>) || null;
            const collectionName = this.options.collectionName;
            const shareConnectionFromParent = !!this.options.shareConnectionFromParent;

            delete this.options["collectionName"];
            delete this.options["child"];
            delete this.options["parent"];
            delete this.options["shareConnectionFromParent"];
            delete this.options["autoConnect"];

            if (shareConnectionFromParent && this.__child__ && this.parent) {
                if (!this.parent.connection) return reject(new Error("PARENT_HAS_NO_CONNECTION"));
                this.connection = this.parent.connection;
                // @ts-expect-error assign model
                this.model = modelSchema<T>(this.connection, Util.v(collectionName, "string", "JSON"));
                return resolve(this);
            }

            mongoose.createConnection(this.url, this.options, (err, connection) => {
                if (err) return reject(err);
                this.connection = connection;
                // @ts-expect-error assign model
                this.model = modelSchema<T>(this.connection, Util.v(collectionName, "string", "JSON"));
                this.emit("ready", this);
                this.__applyEventsBinding();
                resolve(this);
            });
        });
    }

    /**
     * Watch collection changes
     */
    public watch() {
        this.__readyCheck();
        const stream = this.model.watch();
        return stream;
    }

    /**
     * The db metadata
     */
    public get metadata() {
        if (!this.model) return null;
        return {
            name: this.model.collection.name,
            db: this.model.collection.dbName,
            namespace: this.model.collection.namespace
        };
    }

    /**
     * Returns database statistics
     */
    public async stats() {
        this.__readyCheck();
        const stats = await this.model.collection.stats();
        return stats;
    }

    /**
     * Close the database connection
     * @param force Close forcefully
     */
    public async close(force = false) {
        return await this.connection.close(force);
    }

    private __applyEventsBinding() {
        this.__readyCheck();
        const events = ["connecting", "connected", "open", "disconnecting", "disconnected", "close", "reconnected", "error", "fullsetup", "all", "reconnectFailed", "reconnectTries"];

        for (const event of events) {
            this.connection.on(event, (...args) => {
                // @ts-expect-error event forwarder
                this.emit(event, ...args);
            });
        }
    }

    /**
     * Formats document data
     * @param doc The document
     */
    private __formatData(doc: DocType<T>) {
        return doc?.data ?? null;
    }

    /**
     * Checks if the database is ready
     */
    private __readyCheck() {
        if (!this.model) throw new Error("[DATABASE_NOT_READY] Use db.connect()");
    }
}

export interface TableConstructor<V = unknown> {
    new (name: string): Database<V>;
}
