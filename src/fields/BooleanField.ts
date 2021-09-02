import { FieldModel, FieldModelOptions } from "./model";

/**
 * @extends FieldModel
 */
export class BooleanField extends FieldModel<boolean> {
    /**
     * Boolean field
     * @param {FieldModelOptions} [options] The options
     */
    constructor(options?: FieldModelOptions<boolean>) {
        super(options);
    }

    /**
     * Validates the data
     * @param {any} value The value to validate
     * @returns {boolean}
     */
    override validate(value: unknown): true | never {
        if (typeof value !== "boolean") throw new TypeError("'value' must be a 'boolean'");
        return true;
    }
}
