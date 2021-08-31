import { FieldModel, FieldModelOptions } from "./model";

export class StringField extends FieldModel<string> {
    constructor(options?: FieldModelOptions<string>) {
        super(options);
    }

    override validate(value: unknown): true | never {
        if (typeof value !== "string") {
            throw new TypeError("'value' must be an 'string'");
        }

        return true;
    }
}
