import { FieldModel, FieldModelOptions } from "./model";

export class BooleanField extends FieldModel<boolean> {
    constructor(options?: FieldModelOptions<boolean>) {
        super(options);
    }

    override validate(value: unknown): value is boolean {
        return typeof value === "boolean";
    }
}
