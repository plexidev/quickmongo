const _ = require("lodash");
const Error = require("./Error");

class Util {

    /**
     * **You _cannot instantiate_ Util class. Every methods of this class are `static` methods.**
     */
    constructor() {
        throw new Error(`Class ${this.constructor.name} may not be instantiated!`);
    }

    /**
     * Returns true if provided key is valid
     * @param {any} str Anything to test
     * @returns {boolean}
     */
    static isKey(str) {
        return typeof str === "string";
    }

    /**
     * Returns true if the given data is valid
     * @param {any} data Any data
     * @returns {boolean}
     */
    static isValue(data) {
        if (data === Infinity || data === -Infinity) return false;
        if (typeof data === "undefined") return false;
        return true;
    }

    /**
     * @typedef {object} KEY
     * @property {string | undefined} key Parsed Key
     * @property {string | undefined} target Parsed target
     */

    /**
     * Returns target & key from the given string (quickdb style)
     * @param {string} key key to parse
     * @example Util.parseKey("myitem.items");
     * // -> { key: "myitems", target: "items" }
     * @returns {KEY}
     */
    static parseKey(key) {
        if (!key || typeof key !== "string") return { key: undefined, target: undefined };
        if (key.includes(".")) {
            let spl = key.split(".");
            let parsed = spl.shift();
            let target = spl.join(".");
            return { key: parsed, target };
        }
        return { key, target: undefined };
    }

    /**
     * Sort data
     * @param {string} key Key
     * @param {Array} data Data
     * @param {object} ops options
     * @example Util.sort("user_", {...}, { sort: ".data" });
     * @returns {any[]}
     */
    static sort(key, data, ops) {
        if (!key || !data || !Array.isArray(data)) return [];
        let arb = data.filter(i => i.ID.startsWith(key));
        if (ops && ops.sort && typeof ops.sort === 'string') {
            if (ops.sort.startsWith('.')) ops.sort = ops.sort.slice(1);
            ops.sort = ops.sort.split('.');
            arb = _.sortBy(arb, ops.sort).reverse();
        }
        return arb;
    }

    /**
     * Data resolver
     * @param {string} key Data key
     * @param {any} data Data
     * @param {any} value value
     * @example Util.setData("user.items", {...}, ["pen"]);
     * @returns {any}
     */
    static setData(key, data, value) {
        let parsed = this.parseKey(key);
        if (typeof data === "object" && parsed.target) {
            return _.set(data, parsed.target, value);
        } else if (parsed.target) throw new Error("Cannot target non-object.", "TargetError");
        return data;
    }

    /**
     * Data resolver
     * @param {string} key Data key
     * @param {any} data Data
     * @param {any} value value
     * @example Util.unsetData("user.items", {...});
     * @returns {any}
     */
    static unsetData(key, data) {
        let parsed = this.parseKey(key);
        let item = data;
        if (typeof data === "object" && parsed.target) {
            _.unset(item, parsed.target);
        } else if (parsed.target) throw new Error("Cannot target non-object.", "TargetError");
        return item;
    }

    /**
     * Data resolver
     * @param {string} key Key
     * @param {any} data Data
     * @example Util.getData("user.items", {...});
     * @returns {any}
     */
    static getData(key, data) {
        let parsed = this.parseKey(key);
        if (parsed.target) data = _.get(data, parsed.target);
        return data;
    }
}

module.exports = Util;