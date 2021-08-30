import { FieldModel, FieldModelOptions } from "./model";

export class StringField extends FieldModel<string> {
    constructor(options?: FieldModelOptions<string>) {
        super(options);
    }

    override validate(value: unknown): value is string {
        return typeof value === "string";
    }
}
