import { FieldModel } from "./";

export class NullableField<T extends FieldModel<any>> extends FieldModel<
    NullableFieldType<T>
> {
    model: T;

    constructor(model: T) {
        super(model.options);

        this.model = model;
    }

    override validate(value: any): value is NullableFieldType<T> {
        return this.model.validate(value) || [null, undefined].includes(value);
    }
}

export type NullableFieldType<M extends FieldModel<any>> = M extends FieldModel<
    infer T
>
    ? T | null | undefined
    : never;
