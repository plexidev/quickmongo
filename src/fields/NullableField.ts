import { FieldModel, FieldModelOptions } from "./model";

/**
 * @extends FieldModel
 */
export class NullableField<T extends FieldModel<unknown>> extends FieldModel<NullableFieldType<T>> {
    model: T;

    /**
     * The nullable field
     * @param {FieldModel} model the field model
     */
    constructor(model: T) {
        super(model.options as FieldModelOptions<NullableFieldType<T>>);

        this.model = model;
    }

    /**
     * Validates the data
     * @param {any} value The value to validate
     * @returns {boolean}
     */
    override validate(value: unknown): true | never {
        if (value) {
            return this.model.validate(value);
        }

        if (![null, undefined].includes(value)) {
            throw new TypeError(`value '${value}' is not 'null' or 'undefined'`);
        }
    }
}

export type NullableFieldType<M extends FieldModel<unknown>> = M extends FieldModel<infer T> ? T | null | undefined : never;
