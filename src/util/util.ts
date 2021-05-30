import _ from 'lodash';
import Error from './QuickMongoError';

class Util {
    /**
     * **You _cannot instantiate_ Util class. Every methods of this class are `static` methods.**
     */
    constructor() {
        throw new Error(`Class ${this.constructor.name} may not be instantiated!`, 'InstantiationError');
    }

    static isKey(str: any): boolean {
        return typeof str === 'string';
    }

    static isValue(data: any): boolean {
        if (data === Infinity || data === -Infinity) return false;
        if (typeof data === 'undefined') return false;
        return true;
    }

    static parseKey(key: string): any {
        if (!key || typeof key !== 'string') return { key: undefined, target: undefined };
        if (key.includes('.')) {
            let spl = key.split('.');
            let parsed = spl.shift();
            let target = spl.join('.');
            return { key: parsed, target };
        }
        return { key, target: undefined };
    }

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

    static setData(key: string, data: any, value: any): any {
        let parsed = this.parseKey(key);
        if (typeof data === 'object' && parsed.target) {
            return _.set(data, parsed.target, value);
        } else if (parsed.target) throw new Error('Cannot target non-object.', 'TargetError');
        return data;
    }

    static unsetData(key: string, data: any): any {
        let parsed = this.parseKey(key);
        let item = data;
        if (typeof data === 'object' && parsed.target) {
            _.unset(item, parsed.target);
        } else if (parsed.target) throw new Error('Cannot target non-object.', 'TargetError');
        return item;
    }

    static getData(key: string, data: any): any {
        let parsed = this.parseKey(key);
        if (parsed.target) data = _.get(data, parsed.target);
        return data;
    }
}

export default Util;
