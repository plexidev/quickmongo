import _ from 'lodash';
import Error from './QuickMongoError';

class Util {
    /**
     * **You _cannot instantiate_ Util class. Every methods of this class are `static` methods.**
     */
    constructor() {
        throw new Error(`Class ${this.constructor.name} may not be instantiated!`, 'InstantiationError');
    }

    /**
     * Returns true if provided key is valid
     * @param {any} str Anything to test
     * @returns {boolean}
     */
    static isKey(str: any): boolean {
        return typeof str === 'string';
    }

    /**
     * Returns true if the given data is valid
     * @param {any} data Any data
     * @returns {boolean}
     */
    static isValue(data: any): boolean {
        if (data === Infinity || data === -Infinity) return false;
        if (typeof data === 'undefined') return false;
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
    static parseKey(key: string): {
        key?: string;
        target?: string;
    } {
        if (typeof key !== 'string') return { key: undefined, target: undefined };

        const [parsed, ...targets] = key.split(".");
        return { key: parsed, target: targets.length ? targets.join(".") : undefined };
    }

    /**
     * Sort data
     * @param {string} key Key
     * @param {Array} data Data
     * @param {object} ops options
     * @example Util.sort("user_", {...}, { sort: ".data" });
     * @returns {any[]}
     */
    static sort(key: string, data: Array<any>, ops: object | any): any[] {
        if (!key || !data || !Array.isArray(data)) return [];
        let arb = data.filter((i) => i.ID.startsWith(key));
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
    static setData(key: string, data: any, value: any): any {
        let parsed = this.parseKey(key);
 
        if (parsed.target) {
            if (typeof data !== 'object') throw new Error('Cannot target non-object.', 'TargetError');
            data = _.set(data, parsed.target, value);
        }

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
    static unsetData(key: string, data: any): any {
        let parsed = this.parseKey(key);
        let item = data;
        if (typeof data === 'object' && parsed.target) {
            _.unset(item, parsed.target);
        } else if (parsed.target) throw new Error('Cannot target non-object.', 'TargetError');
        return item;
    }

    /**
     * Data resolver
     * @param {string} key Key
     * @param {any} data Data
     * @example Util.getData("user.items", {...});
     * @returns {any}
     */
    static getData(key: string, data: any): any {
        let parsed = this.parseKey(key);
        if (parsed.target) data = _.get(data, parsed.target);
        return data;
    }
}

export default Util;
