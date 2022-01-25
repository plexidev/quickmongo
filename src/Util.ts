import _ from "lodash";

/**
 * The util class
 * @extends {null}
 */
export class Util extends null {
    /**
     * This is a static class, do not instantiate
     */
    private constructor() {
        /* noop */
    }

    /* eslint-disable @typescript-eslint/no-explicit-any */

    /**
     * Validate
     * @param {any} k The source
     * @param {string} type The type
     * @param {?any} fallback The fallback value
     * @returns {any}
     */
    public static v(k: any, type: string, fallback?: any) {
        return typeof k === type && !!k ? k : fallback;
    }

    /**
     * Picks from nested object by dot notation
     * @param {any} holder The source
     * @param {?string} id The prop to get
     * @returns {any}
     */
    public static pick(holder: any, id?: string) {
        if (!holder || typeof holder !== "object") return holder;
        if (!id || typeof id !== "string" || !id.includes(".")) return holder;
        const keysMeta = Util.getKeyMetadata(id);
        return _.get(Object.assign({}, holder), keysMeta.target);
    }
    /* eslint-enable @typescript-eslint/no-explicit-any */

    /**
     * Returns master key
     * @param {string} key The key that may have dot notation
     * @returns {string}
     */
    public static getKey(key: string) {
        return key.split(".").shift();
    }

    /**
     * Returns key metadata
     * @param {string} key The key
     * @returns {KeyMetadata}
     */
    public static getKeyMetadata(key: string) {
        const [master, ...child] = key.split(".");
        return {
            master,
            child,
            target: child.join(".")
        };
    }

    /**
     * Utility to validate duration
     * @param {number} dur The duration
     * @returns {boolean}
     */
    public static shouldExpire(dur: number) {
        if (typeof dur !== "number") return false;
        if (dur > Infinity || dur <= 0 || Number.isNaN(dur)) return false;
        return true;
    }

    public static createDuration(dur: number) {
        if (!Util.shouldExpire(dur)) return null;
        const duration = new Date(Date.now() + dur);
        return duration;
    }
}

/**
 * @typedef {Object} KeyMetadata
 * @property {string} master The master key
 * @property {string[]} child The child keys
 * @property {string} target The child as target key
 */
