import { FieldModel, FieldModelOptions } from "./model";

export class BooleanField extends FieldModel<boolean> {
    constructor(options?: FieldModelOptions<boolean>) {
        super(options);
    }

    override validate(value: unknown): true | never {
        if (typeof value !== "boolean") {
            throw new TypeError("'value' must be a 'boolean'");
        }

        return true;
    }
}
