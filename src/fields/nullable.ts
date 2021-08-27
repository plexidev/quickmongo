import { FieldModel, FieldModelOptions } from "./";

export class NullableField<T extends FieldModel<unknown>> extends FieldModel<NullableFieldType<T>> {
    model: T;

    constructor(model: T) {
        super(model.options as FieldModelOptions<NullableFieldType<T>>);

        this.model = model;
    }

    override validate(value: unknown): value is NullableFieldType<T> {
        return this.model.validate(value) || [null, undefined].includes(value);
    }
}

export type NullableFieldType<M extends FieldModel<unknown>> = M extends FieldModel<infer T> ? T | null | undefined : never;
