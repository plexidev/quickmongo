const Base = require("./Base");
const Schema = require("./Schema");
const Error = require("./Error");
const fs = require("fs");
const Util = require("./Util");

/**
 * Quick mongodb wrapper
 */
class Database extends Base {

    /**
     * Creates quickmongo instance
     * @param {string} [mongodbURL] Mongodb database url
     * @param {string} [name] Model name
     * @param {object} [connectionOptions] Mongoose connection options
     * @example const { Database } = require("quickmongo");
     * const db = new Database("mongodb://localhost/quickmongo");
     */
    constructor(mongodbURL, name, connectionOptions={}) {
        super(mongodbURL || process.env.MONGODB_URL, connectionOptions);

        /**
         * Current Model
         * @type {MongooseDocument}
         */
        this.schema = Schema(this.connection, name);
    }

    /**
     * Sets the value to the database
     * @param {string} key Key
     * @param {any} value Data
     * @example db.set("foo", "bar").then(() => console.log("Saved data"));
     * @returns {Promise<any>}
     */
    async set(key, value) {
        if (!Util.isKey(key)) throw new Error("Invalid key specified!", "KeyError");
        if (!Util.isValue(value)) throw new Error("Invalid value specified!", "ValueError");
        const parsed = Util.parseKey(key);
        let raw = await this.schema.findOne({
            ID: parsed.key
        });
        if (!raw) {
            let data = new this.schema({
                ID: parsed.key,
                data: parsed.target ? Util.setData(key, {}, value) : value
            });
            await data.save()
                .catch(e => {
                    return this.emit("error", e);
                });
            return data.data;
        } else {
            raw.data = parsed.target ? Util.setData(key, Object.assign({}, raw.data), value) : value;
            await raw.save()
                .catch(e => {
                    return this.emit("error", e);
                });
            return raw.data;
        }
    }

    /**
     * Deletes a data from the database
     * @param {string} key Key
     * @example db.delete("foo").then(() => console.log("Deleted data"));
     * @returns {Promise<boolean>}
     */
    async delete(key) {
        if (!Util.isKey(key)) throw new Error("Invalid key specified!", "KeyError");
        const parsed = Util.parseKey(key);
        const raw = await this.schema.findOne({ ID: parsed.key });
        if (!raw) return false;
        if (parsed.target) {
            let data = Util.unsetData(key, Object.assign({}, raw.data));
            if (data === raw.data) return false;
            raw.data = data;
            raw.save().catch(e => this.emit("error", e));
            return true;
        } else {
            await this.schema.findOneAndDelete({ ID: parsed.key })
                .catch(e => {
                    return this.emit("error", e);
                });
            return true;
        }
    }

    /**
     * Checks if there is a data stored with the given key
     * @param {string} key Key
     * @example db.exists("foo").then(console.log);
     * @returns {Promise<boolean>}
     */
    async exists(key) {
        if (!Util.isKey(key)) throw new Error("Invalid key specified!", "KeyError");
        const parsed = Util.parseKey(key);

        let get = await this.schema.findOne({ ID: parsed.key })
            .catch(e => {
                return this.emit("error", e);
            });
        if (!get) return null;
        let item;
        if (parsed.target) item = Util.getData(key, Object.assign({}, get.data));
        else item = get.data;
        return item === undefined ? false : true;
    }

    /**
     * Checks if there is a data stored with the given key
     * @param {string} key Key
     * @example db.has("foo").then(console.log);
     * @returns {Promise<boolean>}
     */
    async has(key) {
        return await this.exists(key);
    }

    /**
     * Fetches the data from database
     * @param {string} key Key
     * @example db.get("foo").then(console.log);
     * @returns {Promise<any>}
     */
    async get(key) {
        if (!Util.isKey(key)) throw new Error("Invalid key specified!", "KeyError");
        const parsed = Util.parseKey(key);

        let get = await this.schema.findOne({ ID: parsed.key })
            .catch(e => {
                return this.emit("error", e);
            });
        if (!get) return null;
        let item;
        if (parsed.target) item = Util.getData(key, Object.assign({}, get.data));
        else item = get.data;
        return item !== undefined ? item : null;
    }

    /**
     * Fetches the data from database
     * @param {string} key Key
     * @example db.fetch("foo").then(console.log);
     * @returns {Promise<any>}
     */
    async fetch(key) {
        return this.get(key);
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
        if (typeof limit !== "number" || limit < 1) limit = 0;
        let data = await this.schema.find().catch(e => {});
        if (!!limit) data = data.slice(0, limit);

        return data.map(m => ({
            ID: m.ID,
            data: m.data
        }));
    }

    /**
     * Returns everything from the database
     * @param {number} limit Data limit
     * @returns {Promise<Data[]>}
     * @example let data = await db.all();
     * console.log(`There are total ${data.length} entries.`);
     */
    async fetchAll(limit) {
        return await this.all(limit);
    }

    /**
     * Deletes the entire model
     * @example db.deleteAll().then(() => console.log("Deleted everything"));
     * @returns {Promise<boolean>}
     */
    async deleteAll() {
        this.emit("debug", "Deleting everything from the database...");
        await this.schema.deleteMany().catch(e => {});
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
    async math(key, operator, value) {
        if (!Util.isKey(key)) throw new Error("Invalid key specified!", "KeyError");
        if (!operator) throw new Error("No operator provided!");
        if (!Util.isValue(value)) throw new Error("Invalid value specified!", "ValueError");

        switch(operator) {
            case "add":
            case "+":
                let add = await this.get(key);
                if (!add) {
                    return this.set(key, value);
                } else {
                    if (typeof add !== "number") throw new Error(`Expected existing data to be a number, received ${typeof add}!`);
                    return this.set(key, add + value);
                }

            case "subtract":
            case "sub":
            case "-":
                let less = await this.get(key);
                if (!less) {
                    return this.set(key, 0 - value);
                } else {
                    if (typeof less !== "number") throw new Error(`Expected existing data to be a number, received ${typeof less}!`);
                    return this.set(key, less - value);
                }

            case "multiply":
            case "mul":
            case "*":
                let mul = await this.get(key);
                if (!mul) {
                    return this.set(key, 0 * value);
                } else {
                    if (typeof mul !== "number") throw new Error(`Expected existing data to be a number, received ${typeof mul}!`);
                    return this.set(key, mul * value);
                }

            case "divide":
            case "div":
            case "/":
                let div = await this.get(key);
                if (!div) {
                    return this.set(key, 0 / value);
                } else {
                    if (typeof div !== "number") throw new Error(`Expected existing data to be a number, received ${typeof div}!`);
                    return this.set(key, div / value);
                }

            case "mod":
            case "%":
                let mod = await this.get(key);
                if (!mod) {
                    return this.set(key, 0 % value);
                } else {
                    if (typeof mod !== "number") throw new Error(`Expected existing data to be a number, received ${typeof mod}!`);
                    return this.set(key, mod % value);
                }

            default:
                throw new Error("Unknown operator");
        }
    }

    /**
     * Add
     * @param {string} key key
     * @param {number} value value
     * @example db.add("items", 200).then(() => console.log("Added 200 items"));
     * @returns {Promise<any>}
     */
    async add(key, value) {
        return await this.math(key, "+", value);
    }

    /**
     * Subtract
     * @param {string} key Key
     * @param {number} value Value     
     * @example db.subtract("items", 100).then(() => console.log("Removed 100 items"));
     * @returns {Promise<any>}
     */
    async subtract(key, value) {
        return await this.math(key, "-", value);
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
     * Exports the data to json file
     * @param {string} fileName File name.
     * @param {string} path File path
     * @returns {Promise<string>}
     * @example db.export("database.json", "./").then(path => {
     *     console.log(`File exported to ${path}`);
     * });
     */
    export(fileName="database", path="./") {
        return new Promise((resolve, reject) => {
            this.emit("debug", `Exporting database entries to ${path || ""}${fileName}`);
            this.all().then((data) => {
                const strData = JSON.stringify(data);
                if (fileName) {
                    fs.writeFileSync(`${path || ""}${fileName}`, strData);
                    this.emit("debug", `Exported all data!`);
                    return resolve(`${path || ""}${fileName}`);
                }
                return resolve(strData);
            }).catch(reject);
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
    import(data=[], ops = { unique: false, validate: false }) {
        return new Promise(async (resolve, reject) => {
            if (!Array.isArray(data)) return reject(new Error(`Data type must be Array, received ${typeof data}!`, "DataTypeError"));
            if (data.length < 1) return resolve(false);
            if (!ops.unique) {
                this.schema.insertMany(data, { ordered: !ops.validate }, (error) => {
                    if (error) return reject(new Error(`${error}`, "DataImportError"));
                    return resolve(true);
                });
            } else {
                data.forEach((x, i) => {
                    if (!ops.validate && (!x.ID || !x.data)) return;
                    else if (!!ops.validate && (!x.ID || !x.data)) return reject(new Error(`Data is missing ${!x.ID ? "ID" : "data"} path!`, "DataImportError"));
                    setTimeout(() => {
                        this.set(x.ID, x.data);
                    }, 150 * (i + 1));
                });
                return resolve(true);
            }
        });
    }

    /**
     * Disconnects the database
     * @example db.disconnect();
     * @returns {void}
     */
    disconnect() {
        this.emit("debug", "'database.disconnect()' was called, destroying the process...");
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
    connect(url) {
        return this._create(url);
    }

    /**
     * Returns current model name
     * @type {string}
     * @readonly
     */
    get name() {
        return this.schema.modelName;
    }

    /**
     * Read latency
     * @ignore
     * @private
     * @returns {Promise<number>}
     */
    async _read() {
        let start = Date.now();
        await this.get("LQ==");
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
        await this.set("LQ==", Buffer.from(start.toString()).toString("base64"));
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
        this.delete("LQ==").catch(e => {});
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
    async startsWith(key, ops) {
        if (!key || typeof key !== "string") throw new Error(`Expected key to be a string, received ${typeof key}`);
        let all = await this.all(ops && ops.limit);
        return Util.sort(key, all, ops);
    }

    /**
     * Resolves data type
     * @param {string} key key
     * @example console.log(await db.type("foo"));
     * @returns {Promise<"string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function" | "array">}
     */
    async type(key) {
        if (!Util.isKey(key)) throw new Error("Invalid Key!", "KeyError");
        let fetched = await this.get(key);
        if (Array.isArray(fetched)) return "array";
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
        return data.map(m => m.ID);
    }

    /**
     * Returns array of the values
     * @example const data = await db.valueArray();
     * console.log(data);
     * @returns {Promise<any[]>}
     */
    async valueArray() {
        const data = await this.all();
        return data.map(m => m.data);
    }

    /**
     * Pushes an item into array
     * @param {string} key key
     * @param {any|any[]} value Value to push
     * @example db.push("users", "John"); // -> ["John"]
     * db.push("users", ["Milo", "Simon", "Kyle"]); // -> ["John", "Milo", "Simon", "Kyle"]
     * @returns {Promise<any>}
     */
    async push(key, value) {
        const data = await this.get(key);
        if (data == null) {
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
    async pull(key, value, multiple = true) {
        let data = await this.get(key);
        if (data === null) return false;
        if (!Array.isArray(data)) throw new Error(`Expected target type to be Array, received ${typeof data}!`);
        if (Array.isArray(value)) {
            data = data.filter(i => !value.includes(i));
            return await this.set(key, data);
        } else {
            if (!!multiple) {
                data = data.filter(i => i !== value);
                return await this.set(key, data);
            } else {
                const hasItem = data.some(x => x === value);
                if (!hasItem) return false;
                const index = data.findIndex(x => x === value);
                data = data.splice(index, 1);
                return await this.set(key, data);
            }
        }
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
    async raw(params) {
        return await this.schema.find(params); 
    }

    /**
     * Returns random entry from the database
     * @param {number} n Number entries to return
     * @returns {Promise<any[]>}
     * @example const random = await db.random();
     * console.log(random);
     */
    async random(n = 1) {
        if (typeof n !== "number" || n < 1) n = 1;
        const data = await this.all();
        if (n > data.length) throw new Error("Random value length may not exceed total length.", "RangeError");
        const shuffled = data.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, n);
    }

    /**
     * This method acts like `quick.db#table`. It will return new instance of itself.
     * @param {string} name Model name 
     * @returns {Database}
     */
    createModel(name) {
        if (!name || typeof name !== "string") throw new Error("Invalid model name");
        const CustomModel = new Database(this.dbURL, name, this.options);
        return CustomModel;
    }

    /**
     * This method exports **QuickMongo** data to **Quick.db**
     * @param {any} quickdb Quick.db instance
     * @returns {Promise<any[]>}
     * @example const data = await db.exportToQuickDB(quickdb);
     */
    async exportToQuickDB(quickdb) {
        if (!quickdb) throw new Error("Quick.db instance was not provided!");
        const data = await this.all();
        data.forEach(item => {
            quickdb.set(item.ID, item.data);
        });
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
     * @param {string} name model name to use 
     * @returns {MongooseDocument}
     */
    updateModel(name) {
        this.schema = Schema(name);
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
    _eval(code) {
        return eval(code);
    }

}

module.exports = Database;