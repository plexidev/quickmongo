class Util {

    constructor() {
        throw new Error(`Class ${this.constructor.name} may not be instantiated!`);
    }

    /**
     * Returns true if provided key is valid
     * @param {*} str Anything to test
     * @returns {Boolean}
     */
    static isKey(str) {
        return typeof str === "string";
    }

    /**
     * Returns true if the given data is valid
     * @param {*} data Any data
     * @returns {Boolean}
     */
    static isValue(data) {
        if (data === Infinity || data === -Infinity) return false;
        if (typeof data === "undefined") return false;
        return true;
    }

    /**
     * Returns target & key from the given string (quickdb style)
     * @param {String} key key to parse
     * @example Util.parseKey("myitem.items");
     * // -> { key: "myitems", target: "items" }
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
}

module.exports = Util;