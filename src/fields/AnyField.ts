/* eslint-disable @typescript-eslint/no-explicit-any */
import { FieldModel, FieldModelOptions } from "./model";

/**
 * @extends FieldModel
 */
export class AnyField extends FieldModel<any> {
    /**
     * Any field
     * @param {FieldModelOptions} [options] The Field Model Options
     */
    constructor(options?: FieldModelOptions<any>) {
        super(options);
    }

    /**
     * Validates the data
     * @returns {boolean}
     */
    override validate(): true | never {
        return true;
    }
}
