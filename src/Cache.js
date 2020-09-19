const Error = require("./Error");
const Util = require("./Util");
const fs = require("fs");

class MemoryStorage {

    /**
     * Creates temporary database
     * @example const { MemoryStorage } = require("quickmongo");
     * const db = new MemoryStorage();
     * 
     * db.set("foo", "bar");
     * console.log(db.get("foo"));
     */
    constructor() {
        console.warn("[QuickMongo] You are using MemoryStorage! Data will disappear on restart.");
        this.obj = [];
    }

    /**
     * Sets the data in cache
     * @param {string} key Key for the data
     * @param value Value
     * @example db.set("foo", "bar");
     */
    set(key, value) {
        if (!Util.isKey(key)) throw new Error("Invalid key specified!", "KeyError");
        if (!Util.isValue(value)) throw new Error("Invalid value specified!", "ValueError");

        if (this.has(key)) {
            this.obj.find(i => i.ID === key).data = value;
        } else {
            this.obj.push({ ID: key, data: value });
        }
        return this.get(key);
    }

    /**
     * deletes an item from the cache
     * @param {string} key Key
     * @example db.delete("foo");
     */
    delete(key) {
        if (!Util.isKey(key)) throw new Error("Invalid key specified!", "KeyError");
        if (!this.has(key)) return false;
        this.obj = this.obj.filter(r => !r.ID === key);
        return this.obj;
    }

    /**
     * Checks if the key exists in cache or not
     * @param {string} key Key
     * @returns {boolean}
     * @example db.exists("foo");
     */
    exists(key) {
        if (!Util.isKey(key)) throw new Error("Invalid key specified!", "KeyError");
        return !!(this.get(key));
    }

    /**
  * Checks if the key exists in cache or not
  * @param {string} key Key
  * @returns {boolean}
  * @example db.has("foo");
  */
    has(key) {
        return this.exists(key);
    }

    /**
     * Returns the data of the matching key
     * @param {string} key Key
     * @example db.get("foo");
     */
    get(key) {
        if (!Util.isKey(key)) throw new Error("Invalid key specified!", "KeyError");
        let data = this.obj.find(r => r.ID === key);
        if (!data) return null;
        return data.data;
    }

    /**
     * Returns the data of the matching key
     * @param {string} key Key
     * @example db.fetch("foo");
     */
    fetch(key) {
        return this.get(key);
    }


    /**
     * Returns everything from the cache
     * @example db.all();
     */
    all() {
        return this.obj;
    }

    /**
     * Deletes everything from the cache
     * @example db.deleteAll();
     */
    deleteAll() {
        this.obj = [];
        return this.obj;
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
            const filePath = `${path}${fileName}.json`;
            try {
                fs.writeFileSync(filePath, JSON.stringify(this.all()));
                resolve(filePath);
            } catch(e) {
                reject(e);
            }
        });
    }

    /**
     * Fetches everything and sorts by given target
     * @param {string} key Key
     * @param {object} ops Options
     * @example const data = await db.startsWith("money", { sort: ".data" });
     */
    startsWith(key, ops) {
        if (!key || typeof key !== "string") throw new Error(`Expected key to be a string, received ${typeof key}`);
        let all = this.all();
        return Util.sort(key, all, ops);
    }

}

module.exports = MemoryStorage;