import { FieldModel, FieldModelOptions } from "./model";

/**
 * @extends FieldModel
 */
export class StringField extends FieldModel<string> {
    /**
     * The string field
     * @param {FieldModelOptions} [options] The field model options
     */
    constructor(options?: FieldModelOptions<string>) {
        super(options);
    }

    /**
     * Validates the data
     * @param {any} value The value to validate
     * @returns {boolean}
     */
    override validate(value: unknown): true | never {
        if (typeof value !== "string") throw new TypeError("'value' must be an 'string'");
        return true;
    }
}
