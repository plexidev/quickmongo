let obj = {};
const Error = require("./Error");

class Cache {

    /**
     * Creates temporary database
     * @example const { MemoryStorage } = require("quickmongo");
     * const db = new MemoryStorage();
     * 
     * db.set("foo", "bar");
     * console.log(db.get("foo"));
     */
    constructor() {
        console.warn("You are using MemoryStorage! Data will disappear on restart.");
    }

    /**
     * Sets the data in cache
     * @param {String} key Key for the data
     * @param {any} value Value
     * @returns {Object}
     */
    set(key, value) {
        if (!key || !value) throw new Error("No key or value provided!");
        obj[String(key)] = value;
        return obj;
    }

    /**
     * deletes an item from the cache
     * @param {String} key Key
     * @returns {Object}
     */
    delete(key) {
        if (!key) throw new Error("No key was specified!");
        if (!!obj[String(key)]) delete obj[String(key)];
        return obj;
    }

    /**
     * Checks if the key exists in cache or not
     * @param {String} key Key
     * @returns {Boolean}
     */
    exists(key) {
        if (!key) throw new Error("No key was specified!");
        return !!obj[String(key)];
    }

     /**
     * Returns the data of the matching key
     * @param {String} key Key
     * @returns {any}
     */
    get(key) {
        if (!key) throw new Error("No key was specified!");
        return obj[String(key)];
    }

    /**
     * Returns everything from the cache
     * @returns {Object}
     */
    all() {
        return obj;
    }

    /**
     * Deletes everything from the cache
     * @returns {Object}
     */
    deleteAll() {
        obj = {};
        return obj;
    }

}

module.exports = Cache;