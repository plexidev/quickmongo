import { FieldModel, FieldModelOptions } from "./model";

export class NullableField<T extends FieldModel<unknown>> extends FieldModel<NullableFieldType<T>> {
    model: T;

    constructor(model: T) {
        super(model.options as FieldModelOptions<NullableFieldType<T>>);

        this.model = model;
    }

    override validate(value: unknown): true | never {
        if (value) {
            return this.model.validate(value);
        }
        
        if (![null, undefined].includes(value)) {
            throw new TypeError("'value' otherwise must be 'null' or 'undefined'");
        }
    }
}

export type NullableFieldType<M extends FieldModel<unknown>> = M extends FieldModel<infer T> ? T | null | undefined : never;
