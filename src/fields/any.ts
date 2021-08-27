/* eslint-disable @typescript-eslint/no-explicit-any */
import { FieldModel, FieldModelOptions } from "./";

export class AnyField extends FieldModel<any> {
    constructor(options?: FieldModelOptions<any>) {
        super(options);
    }

    override validate(value: any): value is any {
        return true;
    }
}
