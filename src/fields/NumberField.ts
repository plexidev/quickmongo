import { FieldModel, FieldModelOptions } from "./model";

export class NumberField extends FieldModel<number> {
    constructor(options?: FieldModelOptions<number>) {
        super(options);
    }

    override validate(value: unknown): true | never {
        if (typeof value !== "number") {
            throw new TypeError("'value' must be a 'number'");
        }

        return true;
    }
}
