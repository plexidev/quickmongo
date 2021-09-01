import type { AnyField } from "./AnyField";
import type { ArrayField, ArrayFieldType } from "./ArrayField";
import type { BooleanField } from "./BooleanField";
import type { NullableField } from "./NullableField";
import type { NumberField } from "./NumberField";
import type { ObjectField, ObjectFieldType } from "./ObjectField";
import type { StringField } from "./StringField";

/**{
    db: string;
    name: string;
    namespace: string;
    data: {
        ID: string;
        data: FieldType<T>;
    }[];
} */
/**
 * @typedef {object} CollectionExport
 * @property {string} db The database name
 * @property {string} name The collection name
 * @property {string} namespace The collection namespace
 * @property {FieldToDocumentScheme[]} data The data
 */
/**
 * @typedef {object} AllCollectionDocumentOptions
 * @property {number} [max] The max value
 * @property {CollectionSortOptions} [sort={}] Sort options
 */
/**
 * @typedef {object} FieldToDocumentScheme
 * @property {string} ID The key
 * @property {FieldType} data The value
 */
/**
 * @typedef {object} CollectionSortOptions
 * @property {ascending|asc|descending|desc} [by] Sort direction
 * @property {string|string[]} [target] The sort target
 */
/**
 * @typedef {object} FieldModelOptions
 * @property {any} [defaultValue] The default value
 */
export interface FieldModelOptions<T> {
    defaultValue?: T;
}

export class FieldModel<T> {
    /**
     * The field model
     * @param {FieldModelOptions} [options] Field model options
     */
    constructor(public readonly options?: FieldModelOptions<T>) {
        /**
         * The field model options
         * @name FieldModel#options
         * @readonly
         * @type {FieldModelOptions}
         */
    }

    /**
     * Creates value
     * @param {any} value The value
     * @returns {any}
     */
    create(value: T): T {
        this.validate(value);
        return value;
    }

    /**
     * Validates the data
     * @param {any} value The value to validate
     * @returns {boolean}
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    validate(value: unknown): true | never {
        throw new Error("Unimplemented");
    }
}

/**
 * The field type
 * @typedef {ArrayField|BooleanField|NullableField|NumberField|ObjectField|StringField} FieldType
 */
export type FieldType<M extends FieldModel<unknown>> = M extends ArrayField<infer T>
    ? ArrayFieldType<T>
    : M extends BooleanField
    ? boolean
    : M extends NullableField<infer T>
    ? T | null | undefined
    : M extends NumberField
    ? number
    : M extends ObjectField<infer T>
    ? ObjectFieldType<T>
    : M extends StringField
    ? string
    : M extends AnyField
    ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
      any
    : never;
