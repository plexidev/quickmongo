import { FieldModel, FieldModelOptions } from "./";

export class StringField extends FieldModel<string> {
    constructor(options?: FieldModelOptions<string>) {
        super(options);
    }

    override validate(value: any): value is string {
        return typeof value === "string";
    }
}
