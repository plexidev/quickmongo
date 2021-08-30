import { FieldModel, FieldModelOptions } from "./model";

export class ArrayField<T extends FieldModel<unknown>> extends FieldModel<ArrayFieldType<T>> {
    model: T;

    constructor(model: T, options?: FieldModelOptions<ArrayFieldType<T>>) {
        super(options);

        this.model = model;
    }

    override create(value: ArrayFieldType<T>): ArrayFieldType<T> {
        if (!this.validate(value)) {
            throw new TypeError();
        }

        return value;
    }

    override validate(value: unknown): value is ArrayFieldType<T> {
        return Array.isArray(value) && value.every((val) => this.model.validate(val));
    }
}

export type ArrayFieldType<M extends FieldModel<unknown>> = M extends FieldModel<infer T> ? T[] : never;
