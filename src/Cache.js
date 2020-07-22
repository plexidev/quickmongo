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
     * @param {String} key Key for the data
     * @param {any} value Value
     * @returns {any}
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
     * @param {String} key Key
     * @returns {any}
     */
    delete(key) {
        if (!Util.isKey(key)) throw new Error("Invalid key specified!", "KeyError");
        if (!this.has(key)) return false;
        this.obj = this.obj.filter(r => !r.ID === key);
        return this.obj;
    }

    /**
     * Checks if the key exists in cache or not
     * @param {String} key Key
     * @returns {Boolean}
     */
    exists(key) {
        if (!Util.isKey(key)) throw new Error("Invalid key specified!", "KeyError");
        return !!(this.get(key));
    }

    /**
  * Checks if the key exists in cache or not
  * @param {String} key Key
  * @returns {Boolean}
  */
    has(key) {
        return this.exists(key);
    }

    /**
     * Returns the data of the matching key
     * @param {String} key Key
     * @returns {any}
     */
    get(key) {
        if (!Util.isKey(key)) throw new Error("Invalid key specified!", "KeyError");
        let data = this.obj.find(r => r.ID === key);
        if (!data) return null;
        return data.data;
    }

    /**
     * Returns the data of the matching key
     * @param {String} key Key
     * @returns {any}
     */
    fetch(key) {
        return this.get(key);
    }


    /**
     * Returns everything from the cache
     * @returns {any}
     */
    all() {
        return this.obj;
    }

    /**
     * Deletes everything from the cache
     * @returns {any}
     */
    deleteAll() {
        this.obj = [];
        return this.obj;
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
            const filePath = `${path}${fileName}.json`;
            try {
                fs.writeFileSync(filePath, JSON.stringify(this.all()));
                resolve(filePath);
            } catch(e) {
                reject(e);
            }
        });
    }

}

module.exports = MemoryStorage;