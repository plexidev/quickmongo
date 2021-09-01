import { FieldModel, FieldModelOptions } from "./model";

/**
 * @extends FieldModel
 */
export class NumberField extends FieldModel<number> {
    /**
     * The number field
     * @param {FieldModelOptions} [options] Field model options
     */
    constructor(options?: FieldModelOptions<number>) {
        super(options);
    }

    /**
     * Validates the data
     * @param {any} value The value to validate
     * @returns {boolean}
     */
    override validate(value: unknown): true | never {
        if (typeof value !== "number") {
            throw new TypeError("'value' must be a 'number'");
        }

        return true;
    }
}
