const Base = require("./Base");
const Schema = require("./Schema");
const Error = require("./Error");
const fs = require("fs");

/**
 * Quick mongodb wrapper
 */
class db extends Base {

    /**
     * Creates quickmongo instance
     * @param {String} mongodbURL Mongodb database url
     * @param {String} name Schema name
     * @example const { Database } = require("quickmongo");
     * const db = new Database("mongodb://localhost/quickmongo");
     */
    constructor(mongodbURL, name) {
        super(mongodbURL);

        /**
         * Current Schema
         * @type {Schema}
         */
        this.schema = Schema(name);
    }

    /**
     * Sets the value to the database
     * @param {String} key Key
     * @param {*} value Data
     * @example db.set("foo", "bar").then(() => console.log("Saved data"));
     */
    async set(key, value) {
        if (!key) throw new Error("No key specified!", "KeyError");
        if (typeof key !== "string") throw new Error("Key must be a string.", "SyntaxError");
        if (value === Infinity || value === -Infinity) throw new Error("Value may not be Infinity.");
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
    }

    /**
     * Deletes a data from the database
     * @param {String} key Key
     * @example db.delete("foo").then(() => console.log("Deleted data"));
     */
    async delete(key) {
        if (!key) throw new Error("No key specified!", "KeyError");
        if (typeof key !== "string") throw new Error("Key must be a string.", "SyntaxError");
        let data = await this.schema.findOneAndDelete({ ID: key })
            .catch(e => {
                return this.emit("error", e);
            });
        return data;
    }

    /**
     * Checks if there is a data stored with the given key
     * @param {String} key Key
     * @example db.exists("foo").then(console.log);
     */
    async exists(key) {
        if (!key) throw new Error("No key specified!", "KeyError");
        if (typeof key !== "string") throw new Error("Key must be a string.", "SyntaxError");
        let get = await this.get(key);
        return !!get;
    }

    /**
     * Checks if there is a data stored with the given key
     * @param {String} key Key
     * @example db.has("foo").then(console.log);
     */
    async has(key) {
        return await this.exists(key);
    }

    /**
     * Fetches the data from database
     * @param {String} key Key
     * @example db.get("foo").then(console.log);
     */
    async get(key) {
        if (!key) throw new Error("No key specified!", "KeyError");
        if (typeof key !== "string") throw new Error("Key must be a string.", "SyntaxError");
        let get = await this.schema.findOne({ ID: key })
            .catch(e => {
                return this.emit("error", e);
            });
        if (!get) return null;
        return get.data;
    }

    /**
     * Fetches the data from database
     * @param {String} key Key
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
     * @param {String} key Key of the data
     * @param {String} operator One of +, -, * or /
     * @param {Number} value Value
     * @example db.math("items", "+", 200).then(() => console.log("Added 200 items"));
     */
    async math(key, operator, value) {
        if (!key) throw new Error("No key specified!", "KeyError");
        if (typeof key !== "string") throw new Error("Key must be a string.", "SyntaxError");
        if (!operator) throw new Error("No operator was provided!");
        if (!value) throw new Error("No value was provided!");
        if (typeof value !== "number") throw new Error("Value must be a number.", "SyntaxError");

        switch(operator) {
            case "add":
            case "+":
                let add = await this.schema.findOne({ ID: key });
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
                let less = await this.schema.findOne({ ID: key });
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
                let mul = await this.schema.findOne({ ID: key });
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
                let div = await this.schema.findOne({ ID: key });
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
     * @param {String} key key
     * @param {Number} value value
     * @example db.add("items", 200).then(() => console.log("Added 200 items"));
     */
    async add(key, value) {
        return await this.math(key, "+", value);
    }

    /**
     * Subtract
     * @param {String} key Key
     * @param {Number} value Value     
     * @example db.subtract("items", 100).then(() => console.log("Removed 100 items"));
     */
    async subtract(key, value) {
        return await this.math(key, "-", value);
    }

    /**
     * Returns database uptime
     * @type {Number}
     * @example console.log(`Database is up for ${db.uptime} ms.`);
     */
    get uptime() {
        if (!this.readyAt) return 0;
        const timestamp = this.readyAt.getTime();
        return Date.now() - timestamp;
    }

    /**
     * Exports the data to json file
     * @param {String} fileName File name
     * @param {String} path File path
     * @returns {Promise<String>}
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
        if (!Array.isArray(data)) throw new Error("Data type must be Array.");
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
        this.emit("debug", `Successfully migrated ${data.length} entries to mongodb! Took ${Date.now() - start}ms!`);
        return true;
    }

    /**
     * Disconnects the database
     * @example db.disconnect();
     */
    disconnect() {
        this.emit("debug", "'database.disconnect()' was called, destroying the process...");
        return this._destroyDatabase();
    }

}

module.exports = db;