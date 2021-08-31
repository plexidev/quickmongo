/* eslint-disable @typescript-eslint/no-explicit-any */
import { FieldModel, FieldModelOptions } from "./model";

export class AnyField extends FieldModel<any> {
    constructor(options?: FieldModelOptions<any>) {
        super(options);
    }

    override validate(): true | never {
        return true;
    }
}
