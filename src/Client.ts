import { Connection, Model, Document, ConnectOptions } from 'mongoose';
import Base from './Base';
import Util from './util/util';
import QuickMongoSchema from './QuickMongoSchema';
import QuickMongoError from './util/QuickMongoError';
import { isEmpty } from 'lodash';

/**
 * A quick.db like wrapper for MongoDB.
 * @extends Base
 */
class MongoClient extends Base {
    schema: ReturnType<typeof QuickMongoSchema>;

    /**
     * Instantiates QuickMongo
     * @param {string} [mongodbURL] MongoDB Database URI/URL
     * @param {string} [name] Model Name
     * @param {ConnectionOptions} [connectionOptions] Mongoose Connection Options
     * @example
     * const { Database } = require("quickmongo");
     * const db = new Database("mongodb://localhost/quickmongo");
     *
     * db.set('someKey', "someValue").then(console.log)
     */
    constructor(mongodbURL: string, name: string | null = null, connectionOptions: ConnectOptions & { useUnique?: boolean } = {}) {
        super(mongodbURL ?? process.env.MONGODB_URL!, connectionOptions);

        /**
         * QuickMongo's Main Schema / Current Model
         * @type {MongooseDocument}
         */
        this.schema = QuickMongoSchema(this.connection, name!);
    }

    /**
     * Sets or Updates Existing Data
     * @param {string} key Key
     * @example db.set("foo", "bar").then(() => console.log("Updated/Set data"));
     * @returns {any}
     */
    public async set(key: string, value: any): Promise<any> {
        if (!Util.isKey(key)) throw new QuickMongoError('Invalid Key or No Key Specificed.', 'KeyError');
        if (!Util.isValue(value)) throw new QuickMongoError('Invalid Value or No Value Specificed.', 'ValueError');

        const parsed = Util.parseKey(key);
        let data = await this.schema.findOne({
            ID: parsed.key as string
        });

        if (!data) {
            data = await this.schema.create({
                ID: parsed.key,
                data: parsed.target ? Util.setData(key, {}, value) : value
            });
        } else {
            data.data = parsed.target ? Util.setData(key, data.data || {}, value) : value;
            data.markModified('data');
            await data.save();
        }

        return data.data;
    }

    /**
     * Fetches the data from database
     * @param {string} key Key
     * @example db.get("foo").then(console.log);
     * @returns {any}
     */
    public async get(key: string): Promise<any> {
        if (!Util.isKey(key)) throw new QuickMongoError('Invalid key specified!', 'KeyError');
        const parsed = Util.parseKey(key);

        let get = await this.schema.findOne({ ID: parsed.key as string }).catch((e: Error) => {
            this.emit('error', e);
            throw e;
        });

        if (!get || !('data' in (get as any))) return null;
        let item;

        if (parsed.target) {
            item = Util.getData(key, Object.assign({}, (get as any).data));
        } else {
            item = get.data;
        }

        return item || null;
    }

    /**
     * Fetch Multiple Documents
     * @param {string[]} keys Array Of Key's To Fetch
     * @returns {Array<object>}
     */
    public async getMultiple(keys: Array<string>) {
        const data = await this.schema.find({ ID: { $in: keys } });
        return data;
    }

    /**
     * Fetches the data from database
     * @param {string} key Key
     * @example db.fetch("foo").then(console.log);
     * @returns {Promise<any>}
     */
    async fetch(key: string) {
        return this.get(key);
    }

    /**
     * Removes/Delete's data from the database.
     * @param {string} key Key
     * @param {any} value Value
     * @example db.delete("foo").then(() => console.log("Deleted data"));
     * @returns {Promise<boolean>}
     */
    public async delete(key: string) {
        if (!Util.isKey(key)) throw new QuickMongoError('Invalid key specified!', 'KeyError');

        const parsed = Util.parseKey(key);
        const raw = await this.schema.findOne({ ID: parsed.key as string });
        if (!raw) return false;

        if (parsed.target) {
            let data = Util.unsetData(key, Object.assign({}, (raw as any).data));
            if (data === (raw as any).data) return false;

            await this.schema.findOneAndUpdate({ ID: { $eq: parsed.key } as unknown as string }, { data }).catch((e: Error) => this.emit('error', e));

            return true;
        }

        await this.schema.findOneAndDelete({ ID: { $eq: parsed.key } as unknown as string }).catch((e: Error) => this.emit('error', e));

        return true;
    }

    /**
     * Delete Multiple Documents
     * @param {string[]} keys Key's To Delete
     */
    public async deleteMultiple(keys: Array<string>) {
        await this.schema.deleteMany({ ID: { $in: keys } });
        return true;
    }

    /**
     * Checks if there is a data stored with the given key
     * @param {string} key Key
     * @example db.exists("foo").then(console.log);
     * @returns {Promise<boolean>}
     */
    public async exists(key: string) {
        if (!Util.isKey(key)) throw new QuickMongoError('Invalid key specified!', 'KeyError');

        const parsed = Util.parseKey(key);
        let get = await this.schema.findOne({ ID: parsed.key as string }).catch((e: Error) => this.emit('error', e));
        if (!get) return false;

        let item;
        if (parsed.target) item = Util.getData(key, Object.assign({}, (get as any).data));

        item = (get as any).data;
        return item === undefined ? false : true;
    }

    /**
     * Checks if there is a data stored with the given key
     * @param {string} key Key
     * @example db.has("foo").then(console.log);
     * @returns {Promise<boolean>}
     */
    async has(key: string): Promise<boolean> {
        return await this.exists(key);
    }

    /**
     * @typedef {object} Data
     * @property {string} ID Data id
     * @property {any} data Data
     */

    /**
     * Returns everything from the database
     * @param {number} limit Data limit
     * @example let data = await db.all();
     * @returns {Promise<Data[]>}
     * @example console.log(`There are total ${data.length} entries.`);
     */
    async all(limit = 0) {
        if (typeof limit !== 'number' || limit < 1) limit = 0;
        let data = await this.schema.find().catch((e: Error) => {});
        if (!!limit) data = (data as any[]).slice(0, limit);

        return (data as any[]).map((m: any) => ({ ID: m.ID, data: m.data }));
    }

    /**
     * Returns everything from the database
     * @param {number} limit Data limit
     * @returns {Promise<Data[]>}
     * @example let data = await db.all();
     * console.log(`There are total ${data.length} entries.`);
     */
    async fetchAll(limit: number) {
        return await this.all(limit);
    }

    /**
     * Deletes the entire model
     * @example db.deleteAll().then(() => console.log("Deleted everything"));
     * @returns {Promise<boolean>}
     */
    async deleteAll() {
        this.emit('debug', 'Deleting everything from the database...');
        await this.schema.deleteMany().catch((e: Error) => {});
        return true;
    }

    /**
     * Math calculation
     * @param {string} key Key of the data
     * @param {string} operator One of +, -, *, / or %
     * @param {number} value Value
     * @example db.math("items", "+", 200).then(() => console.log("Added 200 items"));
     * @returns {Promise<any>}
     */
    async math(key: string, operator: string, value: number) {
        if (!Util.isKey(key)) throw new QuickMongoError('Invalid key specified!', 'KeyError');
        if (!operator) throw new Error('No operator provided!');
        if (!Util.isValue(value)) throw new QuickMongoError('Invalid value specified!', 'ValueError');

        switch (operator) {
            case 'add':
            case '+':
                let add = await this.get(key);
                if (!add) {
                    return this.set(key, value);
                } else {
                    if (typeof add !== 'number') throw new Error(`Expected existing data to be a number, received ${typeof add}!`);
                    return this.set(key, add + value);
                }

            case 'subtract':
            case 'sub':
            case '-':
                let less = await this.get(key);
                if (!less) {
                    return this.set(key, 0 - value);
                } else {
                    if (typeof less !== 'number') throw new Error(`Expected existing data to be a number, received ${typeof less}!`);
                    return this.set(key, less - value);
                }

            case 'multiply':
            case 'mul':
            case '*':
                let mul = await this.get(key);
                if (!mul) {
                    return this.set(key, 0 * value);
                } else {
                    if (typeof mul !== 'number') throw new Error(`Expected existing data to be a number, received ${typeof mul}!`);
                    return this.set(key, mul * value);
                }

            case 'divide':
            case 'div':
            case '/':
                let div = await this.get(key);
                if (!div) {
                    return this.set(key, 0 / value);
                } else {
                    if (typeof div !== 'number') throw new Error(`Expected existing data to be a number, received ${typeof div}!`);
                    return this.set(key, div / value);
                }

            case 'mod':
            case '%':
                let mod = await this.get(key);
                if (!mod) {
                    return this.set(key, 0 % value);
                } else {
                    if (typeof mod !== 'number') throw new Error(`Expected existing data to be a number, received ${typeof mod}!`);
                    return this.set(key, mod % value);
                }

            default:
                throw new Error('Unknown operator');
        }
    }

    /**
     * Add
     * @param {string} key key
     * @param {number} value value
     * @example db.add("items", 200).then(() => console.log("Added 200 items"));
     * @returns {Promise<any>}
     */
    async add(key: string, value: number) {
        return await this.math(key, '+', value);
    }

    /**
     * Subtract
     * @param {string} key Key
     * @param {number} value Value
     * @example db.subtract("items", 100).then(() => console.log("Removed 100 items"));
     * @returns {Promise<any>}
     */
    async subtract(key: string, value: number) {
        return await this.math(key, '-', value);
    }

    /**
     * Returns database connection uptime
     * @type {number}
     * @example console.log(`Database is up for ${db.uptime} ms.`);
     */
    get uptime() {
        if (!this.readyAt) return 0;
        const timestamp = this.readyAt.getTime();
        return Date.now() - timestamp;
    }

    /**
     * Exports current document data to json object
     * @returns {Promise<string>}
     * @example db.export().then(data => {
     *     console.log(data);
     * });
     */
    export() {
        return new Promise((resolve, reject) => {
            this.all()
                .then((data) => {
                    const strData = JSON.stringify(data);
                    return resolve(strData);
                })
                .catch(reject);
        });
    }

    /**
     * <warn>You should set `useUnique` to `true` in order to avoid duplicate documents.</warn>
     *
     * Imports data from other source to quickmongo.
     *
     * Data type should be Array containing `ID` and `data` fields.
     * Example:
     * ```js
     * [{ ID: "foo", data: "bar" }, { ID: "hi", data: "hello" }]
     * ```
     * @param {Array} data Array of data
     * @param {object} ops Import options
     * @param {boolean} [ops.validate=false] If set to true, it will insert valid documents only
     * @param {boolean} [ops.unique=false] If it should import unique data only (slow)
     * @example const data = QuickDB.all(); // imports data from quick.db to quickmongo
     * QuickMongo.import(data);
     * @returns {Promise<boolean>}
     */
    import(data: any[] = [], ops: object | any = { unique: false, validate: false }) {
        return new Promise(async (resolve, reject) => {
            if (!Array.isArray(data)) return reject(new QuickMongoError(`Data type must be Array, received ${typeof data}!`, 'DataTypeError'));
            if (data.length < 1) return resolve(false);

            if (!ops.unique) {
                this.schema.insertMany(data, { ordered: !ops.validate }, (error: any) => {
                    if (error) return reject(new QuickMongoError(`${error}`, 'DataImportError'));
                    return resolve(true);
                });
            }

            data.forEach((x: never | any, i: never | any) => {
                if (!ops.validate && (!x.ID || !x.data)) return;
                else if (!!ops.validate && (!x.ID || !x.data)) return reject(new QuickMongoError(`Data is missing ${!x.ID ? 'ID' : 'data'} path!`, 'DataImportError'));
                setTimeout(() => this.set(x.ID, x.data), 150 * (i + 1));
            });

            return resolve(true);
        });
    }

    /**
     * Disconnects the database
     * @example db.disconnect();
     * @returns {void}
     */
    disconnect(): void {
        this.emit('debug', "'database.disconnect()' was called, destroying the process...");
        return this._destroyDatabase();
    }

    /**
     * Creates database connection.
     *
     * You don't need to call this method because it is automatically called by database manager.
     *
     * @param {string} url Database url
     * @returns {void}
     */
    connect(url: string): Connection {
        return this._create(url);
    }

    /**
     * Read latency
     * @ignore
     * @private
     * @returns {Promise<number>}
     */
    async _read() {
        let start = Date.now();
        await this.get('LQ==');
        return Date.now() - start;
    }

    /**
     * Write latency
     * @ignore
     * @private
     * @returns {Promise<number>}
     */
    async _write() {
        let start = Date.now();
        await this.set('LQ==', Buffer.from(start.toString()).toString('base64'));
        return Date.now() - start;
    }

    /**
     * @typedef {object} DatabaseLatency
     * @property {number} read Read latency
     * @property {number} write Write latency
     * @property {number} average Average latency
     */

    /**
     * Fetches read and write latency of the database in ms
     * @example const ping = await db.fetchLatency();
     * console.log("Read: ", ping.read);
     * console.log("Write: ", ping.write);
     * console.log("Average: ", ping.average);
     * @returns {Promise<DatabaseLatency>}
     */
    async fetchLatency() {
        let read = await this._read();
        let write = await this._write();
        let average = (read + write) / 2;
        this.delete('LQ==').catch((e) => {});
        return { read, write, average };
    }

    /**
     * Fetches read and write latency of the database in ms
     * @example const ping = await db.ping();
     * console.log("Read: ", ping.read);
     * console.log("Write: ", ping.write);
     * console.log("Average: ", ping.average);
     * @returns {Promise<DatabaseLatency>}
     */
    async ping() {
        return await this.fetchLatency();
    }

    /**
     * Fetches everything and sorts by given target
     * @param {string} key Key
     * @param {object} ops Options
     * @example const data = await db.startsWith("money", { sort: ".data", limit: 10 });
     * @returns {Promise<Data[]>}
     */
    async startsWith(key: string, ops: any) {
        if (!key || typeof key !== 'string') throw new QuickMongoError(`Expected key to be a string, received ${typeof key}`);
        let all = await this.all(ops && ops.limit);
        return Util.sort(key, all, ops);
    }

    /**
     * Resolves data type
     * @param {string} key key
     * @example console.log(await db.type("foo"));
     * @returns {Promise<("string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function" | "array")>}
     */
    async type(key: string) {
        if (!Util.isKey(key)) throw new QuickMongoError('Invalid Key!', 'KeyError');
        let fetched = await this.get(key);
        if (Array.isArray(fetched)) return 'array';
        return typeof fetched;
    }

    /**
     * Returns array of the keys
     * @example const keys = await db.keyarray();
     * console.log(keys);
     * @returns {Promise<string[]>}
     */
    async keyArray() {
        const data = await this.all();
        return data.map((m: any) => m.ID);
    }

    /**
     * Returns array of the values
     * @example const data = await db.valueArray();
     * console.log(data);
     * @returns {Promise<any[]>}
     */
    async valueArray() {
        const data = await this.all();
        return data.map((m: any) => m.data);
    }

    /**
     * Pushes an item into array
     * @param {string} key key
     * @param {any|any[]} value Value to push
     * @example db.push("users", "John"); // -> ["John"]
     * db.push("users", ["Milo", "Simon", "Kyle"]); // -> ["John", "Milo", "Simon", "Kyle"]
     * @returns {Promise<any>}
     */
    async push(key: string, value: any | any[]) {
        const data = await this.get(key);
        if (data === null || isEmpty(data)) {
            if (!Array.isArray(value)) return await this.set(key, [value]);
            return await this.set(key, value);
        }
        if (!Array.isArray(data)) throw new Error(`Expected target type to be Array, received ${typeof data}!`);
        if (Array.isArray(value)) return await this.set(key, data.concat(value));
        data.push(value);
        return await this.set(key, data);
    }

    /**
     * Removes an item from array
     * @param {string} key key
     * @param {any|any[]} value item to remove
     * @param {boolean} [multiple=true] if it should pull multiple items. Defaults to `true`.
     * <warn>Currently, you can use `multiple` with `non array` pulls only.</warn>
     * @example db.pull("users", "John"); // -> ["Milo", "Simon", "Kyle"]
     * db.pull("users", ["Milo", "Simon"]); // -> ["Kyle"]
     * @returns {Promise<any>}
     */
    async pull(key: string, value: any | any[], multiple: boolean = true) {
        let data = await this.get(key);
        if (data === null) return false;
        if (!Array.isArray(data)) throw new Error(`Expected target type to be Array, received ${typeof data}!`);
        if (Array.isArray(value)) {
            data = data.filter((i) => !value.includes(i));
            return await this.set(key, data);
        }

        if (!!multiple) {
            data = data.filter((i) => i !== value);
            return await this.set(key, data);
        }

        const hasItem = data.some((x) => x === value);
        if (!hasItem) return false;
        const index = data.findIndex((x) => x === value);
        data = data.splice(index, 1);
        return await this.set(key, data);
    }

    /**
     * Returns entries count of current model
     * @returns {Promise<number>}
     * @example const entries = await db.entries();
     * console.log(`There are total ${entries} entries!`);
     */
    async entries() {
        return await this.schema.estimatedDocumentCount();
    }

    /**
     * Returns raw data from current model
     * @param {object} params Search params
     * @returns {Promise<MongooseDocument>}
     * @example const raw = await db.raw();
     * console.log(raw);
     */
    async raw(params: object) {
        return await this.schema.find(params);
    }

    /**
     * Returns random entry from the database
     * @param {number} n Number entries to return
     * @returns {Promise<any[]>}
     * @example const random = await db.random();
     * console.log(random);
     */
    async random(n: number = 1) {
        if (typeof n !== 'number' || n < 1) n = 1;
        const data = await this.all();
        if (n > data.length) throw new QuickMongoError('Random value length may not exceed total length.', 'RangeError');
        const shuffled = data.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, n);
    }

    /**
     * This method acts like `quick.db#table`. It will return new instance of itself.
     * @param {string} name Model name
     * @returns {Database}
     */
    createModel(name: string) {
        if (!name || typeof name !== 'string') throw new Error('Invalid model name');
        const CustomModel = new MongoClient(this.dbURL!, name, this.options);
        return CustomModel;
    }

    /**
     * This method exports **QuickMongo** data to **Quick.db**
     * @param {any} quickdb Quick.db instance
     * @returns {Promise<any[]>}
     * @example const data = await db.exportToQuickDB(quickdb);
     */
    async exportToQuickDB(quickdb: any) {
        if (!quickdb) throw new Error('Quick.DB Instance Was Not Provided.');

        const data = await this.all();
        data.forEach((item: any) => quickdb.set(item.ID, item.data));

        return quickdb.all();
    }

    /**
     * Returns **QuickMongo Util**
     * @example const parsed = db.utils.parseKey("foo.bar");
     * console.log(parsed);
     * @type {Util}
     */
    get utils() {
        return Util;
    }

    /**
     * Updates current model and uses new one
     * @param {string} name Model Name
     * @returns {MongooseDocument}
     */
    updateModel(name: string) {
        this.schema = QuickMongoSchema(this.connection, name);
        return this.schema;
    }

    /**
     * String representation of the database
     * @example console.log(db.toString());
     * @returns {string}
     */
    toString() {
        return `QuickMongo<{${this.schema.modelName}}>`;
    }

    /**
     * Current model name
     * @type {string}
     * @readonly
     */
    get currentModelName() {
        return this.schema.modelName;
    }

    /**
     * Allows you to eval code using `this` keyword.
     * @param {string} code code to eval
     * @example
     * db._eval("this.all().then(console.log)"); // -> [{ ID: "...", data: ... }, ...]
     * @returns {any}
     */
    _eval(code: string) {
        return eval(code);
    }
}

/**
 * Emitted when database creates connection
 * @event MongoClient#ready
 * @example db.on("ready", () => {
 *     console.log("Successfully connected to the database!");
 * });
 */

/**
 * Emitted when database encounters error
 * @event MongoClient#error
 * @param {Error} Error Error Message
 * @example db.on("error", console.error);
 */

/**
 * Emitted on debug mode
 * @event MongoClient#debug
 * @param {string} Message Debug message
 * @example db.on("debug", console.log);
 */

export default MongoClient;
