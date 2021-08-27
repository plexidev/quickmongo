import { FieldModel, FieldModelOptions } from "./";

export class ArrayField<T extends FieldModel<any>> extends FieldModel<
    ArrayFieldType<T>
> {
    model: T;

    constructor(model: T, options?: FieldModelOptions<any>) {
        super(options);

        this.model = model;
    }

    override create(value: ArrayFieldType<T>): ArrayFieldType<T> {
        return value;
    }

    override validate(value: any): value is ArrayFieldType<T> {
        return (
            Array.isArray(value) &&
            value.every((val) => this.model.validate(val))
        );
    }
}

export type ArrayFieldType<M extends FieldModel<any>> = M extends FieldModel<
    infer T
>
    ? T[]
    : never;
