import { FieldModel, FieldModelOptions } from "./model";

/**
 * @extends FieldModel
 */
export class ArrayField<T extends FieldModel<unknown>> extends FieldModel<ArrayFieldType<T>> {
    model: T;

    /**
     * Array field
     * @param {FieldModelOptions} [options] The Field Model Options
     */
    constructor(model: T, options?: FieldModelOptions<ArrayFieldType<T>>) {
        super(options);

        this.model = model;
    }

    /**
     * Validates the data
     * @param {any} value The value to validate
     * @returns {boolean}
     */
    override validate(value: unknown): true | never {
        if (!Array.isArray(value)) throw new TypeError("'value' must be an 'array'");
        value.forEach(this.model.validate);
        return true;
    }
}

export type ArrayFieldType<M extends FieldModel<unknown>> = M extends FieldModel<infer T> ? T[] : never;
