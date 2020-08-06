const Base = require("./Base");
const Schema = require("./Schema");
const Error = require("./Error");
const fs = require("fs");
const Util = require("./Util");
const _ = require("lodash");
/**
 * Quick mongodb wrapper
 */
class Database extends Base {

    /**
     * Creates quickmongo instance
     * @param {string} mongodbURL Mongodb database url
     * @param {string} name Schema name
     * @param {object} connectionOptions Mongoose connection options
     * @example const { Database } = require("quickmongo");
     * const db = new Database("mongodb://localhost/quickmongo");
     */
    constructor(mongodbURL, name, connectionOptions={}) {
        super(mongodbURL, connectionOptions);

        /**
         * Current Schema
         * @type {Schema}
         */
        this.schema = Schema(name);
    }

    /**
     * Sets the value to the database
     * @param {string} key Key
     * @param value Data
     * @example db.set("foo", "bar").then(() => console.log("Saved data"));
     */
    async set(key, value) {
        if (!Util.isKey(key)) throw new Error("Invalid key specified!", "KeyError");
        if (!Util.isValue(value)) throw new Error("Invalid value specified!", "ValueError");
        if(!key.includes('.')) {
        let raw = await this.schema.findOne({
            ID: key
        });
        if (!raw) {
            let data = new this.schema({
                ID: key,
                data: value
            });
            await data.save()
                .catch(e => {
                    return this.emit("error", e);
                });
            return data.data;
        } else {
            raw.data = value;
            await raw.save()
                .catch(e => {
                    return this.emit("error", e);
                });
            return raw.data;
        }
    } else {
        const subkey = key.split('.').shift();
        let raw = await this.schema.findOne({
            ID: subkey
        });
        if(!raw) {
            const setValue = _.set({}, key.split('.').slice(1).join('.'), value);
            let data = new this.schema({
                ID: subkey,
                data: setValue
            });
            await data.save()
                .catch(e => {
                    return this.emit("error", e);
                });
            return data.data;
        } else {
            const setValue = _.set(raw, key.split('.').slice(1).join('.'), value);
            raw.data = setValue;
            await raw.save()
                .catch(e => {
                    return this.emit("error", e);
                });
            return raw.data;
        }
    }
    }

    /**
     * Deletes a data from the database
     * @param {string} key Key
     * @example db.delete("foo").then(() => console.log("Deleted data"));
     */
    async delete(key) {
        if (!Util.isKey(key)) throw new Error("Invalid key specified!", "KeyError");
        let data = await this.schema.findOneAndDelete({ ID: key })
            .catch(e => {
                return this.emit("error", e);
            });
        return data;
    }

    /**
     * Checks if there is a data stored with the given key
     * @param {string} key Key
     * @example db.exists("foo").then(console.log);
     */
    async exists(key) {
        if (!Util.isKey(key)) throw new Error("Invalid key specified!", "KeyError");
        let get = await this.get(key);
        return !!get;
    }

    /**
     * Checks if there is a data stored with the given key
     * @param {string} key Key
     * @example db.has("foo").then(console.log);
     */
    async has(key) {
        return await this.exists(key);
    }

    /**
     * Fetches the data from database
     * @param {string} key Key
     * @example db.get("foo").then(console.log);
     */
    async get(key) {
        if (!Util.isKey(key)) throw new Error("Invalid key specified!", "KeyError");
        if(!key.includes('.')) {
        let get = await this.schema.findOne({ ID: key })
            .catch(e => {
                return this.emit("error", e);
            });
        if (!get) return null;
        return get.data;
        } else {
            const subkey = key.split('.').shift();
            let get = await this.schema.findOne({ ID: subkey })
            .catch(e => {
                return this.emit("error", e);
            });
             if (!get) return null;
             const data = key.split('.').slice(1).reduce((a, b) => a[b], get.data)
            if(!data) return null;
            return data;
        }
    }

    /**
     * Fetches the data from database
     * @param {string} key Key
     * @example db.fetch("foo").then(console.log);
     */
    async fetch(key) {
        return this.get(key);
    }

    /**
     * Returns everything from the database
     * @returns {Promise<Array>}
     * @example let data = await db.all();
     * console.log(`There are total ${data.length} entries.`);
     */
    async all() {
        let data = await this.schema.find().catch(e => {});
        let comp = [];
        data.forEach(c => {
            comp.push({
                ID: c.ID,
                data: c.data
            });
        });
        return comp;
    }

    /**
     * Deletes the entire schema
     * @example db.deleteAll().then(() => console.log("Deleted everything"));
     */
    async deleteAll() {
        this.emit("debug", "Deleting everything from the database...");
        await this.schema.deleteMany().catch(e => {});
        return true;
    }

    /**
     * Math calculation
     * @param {string} key Key of the data
     * @param {string} operator One of +, -, * or /
     * @param {number} value Value
     * @example db.math("items", "+", 200).then(() => console.log("Added 200 items"));
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
                    if (typeof add.data !== "number") throw new Error("Target is not a number!");
                    return this.set(key, add.data + value);
                }
                break;

            case "subtract":
            case "sub":
            case "-":
                let less = await this.get(key);
                if (!less) {
                    return this.set(key, value);
                } else {
                    if (typeof less.data !== "number") throw new Error("Target is not a number!");
                    return this.set(key, less.data - value);
                }
                break;

            case "multiply":
            case "mul":
            case "*":
                let mul = await this.get(key);
                if (!mul) {
                    return this.set(key, value);
                } else {
                    if (typeof mul.data !== "number") throw new Error("Target is not a number!");
                    return this.set(key, mul.data * value);
                }
                break;

            case "divide":
            case "div":
            case "/":
                let div = await this.get(key);
                if (!div) {
                    return this.set(key, value);
                } else {
                    if (typeof div.data !== "number") throw new Error("Target is not a number!");
                    return this.set(key, div.data / value);
                }
                break;
            default:
                throw new Error("Unknown operator");
        }
    }

    /**
     * Add
     * @param {string} key key
     * @param {number} value value
     * @example db.add("items", 200).then(() => console.log("Added 200 items"));
     */
    async add(key, value) {
        return await this.math(key, "+", value);
    }

    /**
     * Subtract
     * @param {string} key Key
     * @param {number} value Value     
     * @example db.subtract("items", 100).then(() => console.log("Removed 100 items"));
     */
    async subtract(key, value) {
        return await this.math(key, "-", value);
    }

    /**
     * Returns database uptime
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
     * @param {string} fileName File name
     * @param {string} path File path
     * @returns {Promise<string>}
     * @example db.export("database", "./").then(path => {
     *     console.log(`File exported to ${path}`);
     * });
     */
    export(fileName="database", path="./") {
        if (typeof fileName !== "string") throw new Error("File name must be a string!");
        if (typeof path !== "string") throw new Error("File path must be a string!");

        return new Promise((resolve, reject) => {
            this.emit("debug", `Exporting database entries to ${path}${fileName}.json`);
            this.all().then((data) => {
                fs.writeFileSync(`${path}${fileName}.json`, JSON.stringify(data));
                this.emit("debug", `Exported all data!`);
                resolve(`${path}${fileName}.json`);
            }).catch(reject);
        });
    }

    /**
     * Imports data from other source to quickmongo. 
     * 
     * Data type should be Array containing `ID` and `data` fields.
     * Example: 
     * ```js
     * [{ ID: "foo", data: "bar" }, { ID: "hi", data: "hello" }]
     * ```
     * @param {Array} data Array of data
     * @example const data = QuickDB.all(); // imports data from quick.db to quickmongo
     * QuickMongo.import(data);
     * @returns {Promise<Boolean>}
     */
    async import(data=[]) {
        if (!Array.isArray(data)) throw new Error("Data type must be Array.", "DataTypeError");
        if (data.length < 1) return [];
        let start = Date.now();
        this.emit("debug", `Queued ${data.length} entries!`);
        data.forEach((item, index) => {
            if (!item.ID || typeof item.ID !== "string") {
                this.emit("debug", `Found invalid entry at position ${index}, ignoring...`);
                return;
            };
            if (typeof item.data === "undefined") {
                this.emit("debug", `Found entry with data type "undefined", setting the value to "null"...`);
                item.data = null;
            };
            this.set(item.ID, item.data);
            this.emit("debug", `Successfully migrated ${item.ID} @${index}!`);      
        });
        this.emit("debug", `Successfully migrated ${data.length}. Took ${Date.now() - start}ms!`);
        return;
    }

    /**
     * Disconnects the database
     * @example db.disconnect();
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
     */
    connect(url) {
        return this._create(url);
    }

    /**
     * Returns current schema name
     * @readonly
     */
    get name() {
        return this.schema.modelName;
    }

    /**
     * Read latency
     * @ignore
     */
    async _read() {
        let start = Date.now();
        await this.get("LQ==");
        return Date.now() - start;
    }

    /**
     * Write latency
     * @ignore
     */
    async _write() {
        let start = Date.now();
        await this.set("LQ==", Buffer.from(start.toString()).toString("base64"));
        return Date.now() - start;
    }

    /**
     * Fetches read and write latency of the database in ms
     * @example const ping = await db.fetchLatency();
     * console.log("Read: ", ping.read);
     * console.log("Write: ", ping.write);
     * console.log("Average: ", ping.average);
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
     */
    async ping() {
        return await this.fetchLatency();
    }

    /**
     * Fetches everything and sorts by given target
     * @param {string} key Key
     * @param {object} ops Options
     * @example const data = await db.startsWith("money", { sort: ".data" });
     */
    async startsWith(key, ops) {
        if (!key || typeof key !== "string") throw new Error(`Expected key to be a string, received ${typeof key}`);
        let all = await this.all();
        return Util.sort(key, all, ops);
    }

    /**
     * Resolves data type
     * @param {string} key key
     */
    async type(key) {
        if (!Util.isKey(key)) throw new Error("Invalid Key!", "KeyError");
        let fetched = await this.get(key);
        if (fetched === null) return null;
        if (Array.isArray(fetched)) return "array";
        return typeof fetched;
    }

    /**
     * Returns array of the keys
     * @example const keys = await db.keyarray();
     * console.log(keys);
     */
    async keyArray() {
        const data = await this.all();
        return data.map(m => m.ID);
    }

    /**
     * Returns array of the values
     * @example const data = await db.valueArray();
     * console.log(data);
     */
    async valueArray() {
        const data = await this.all();
        return data.map(m => m.data);
    }

    /**
     * Pushes an item into array
     * @param {string} key key
     * @param {any|Array} value Value to push
     * @example db.push("users", "John"); // -> ["John"]
     * db.push("users", ["Milo", "Simon", "Kyle"]); // -> ["John", "Milo", "Simon", "Kyle"]
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
     * @param {any|Array} value item to remove
     * @example db.pull("users", "John"); // -> ["Milo", "Simon", "Kyle"]
     * db.pull("users", ["Milo", "Simon"]); // -> ["Kyle"]
     */
    async pull(key, value) {
        let data = await this.get(key);
        if (data === null) return false;
        if (!Array.isArray(data)) throw new Error(`Expected target type to be Array, received ${typeof data}!`);
        if (Array.isArray(value)) {
            data = data.filter(i => !value.includes(i));
            return await this.set(key, data);
        } else {
            data = data.filter(i => i !== value);
            return await this.set(key, data);
        }
    }

    /**
     * String representation of the database
     * @example console.log(`Current database: ${db}`);
     */
    toString() {
        return `${this.name}`;
    }

    /**
     * Allows you to eval code using `this` keyword.
     * @param {string} code code to eval
     * @example
     * db._eval("this.all().then(console.log)"); // -> [{ ID: "...", data: ... }, ...]
     */
    _eval(code) {
        return eval(code);
    }

}

module.exports = Database;