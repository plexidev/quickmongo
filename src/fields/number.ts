import { FieldModel, FieldModelOptions } from "./";

export class NumberField extends FieldModel<number> {
    constructor(options?: FieldModelOptions<number>) {
        super(options);
    }

    override validate(value: any): value is number {
        return typeof value === "number";
    }
}
