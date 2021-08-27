import { FieldModel, FieldModelOptions } from "./";

export class BooleanField extends FieldModel<boolean> {
    constructor(options?: FieldModelOptions<boolean>) {
        super(options);
    }

    override validate(value: any): value is boolean {
        return typeof value === "boolean";
    }
}
