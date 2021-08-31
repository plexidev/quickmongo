import { FieldModel, FieldModelOptions } from "./model";

export class ArrayField<T extends FieldModel<unknown>> extends FieldModel<ArrayFieldType<T>> {
    model: T;

    constructor(model: T, options?: FieldModelOptions<ArrayFieldType<T>>) {
        super(options);

        this.model = model;
    }

    override validate(value: unknown): true | never {
        if (!Array.isArray(value)) {
            throw new TypeError("'value' must be an 'array'");
        }

        value.forEach((val) => {
            this.model.validate(val);
        });

        return true;
    }
}

export type ArrayFieldType<M extends FieldModel<unknown>> = M extends FieldModel<infer T> ? T[] : never;
