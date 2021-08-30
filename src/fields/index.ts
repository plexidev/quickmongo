import { AnyField } from "./AnyField";
import { ArrayField, ArrayFieldType } from "./ArrayField";
import { BooleanField } from "./BooleanField";
import { NullableField } from "./NullableField";
import { NumberField } from "./NumberField";
import { ObjectField, ObjectFieldType } from "./ObjectField";
import { StringField } from "./StringField";

export * from "./AnyField";
export * from "./ArrayField";
export * from "./BooleanField";
export * from "./NullableField";
export * from "./NumberField";
export * from "./ObjectField";
export * from "./StringField";

export interface FieldModelOptions<T> {
    defaultValue?: T;
}

export class FieldModel<T> {
    constructor(public readonly options?: FieldModelOptions<T>) {}

    create(value: T): T {
        return value;
    }

    validate(value: unknown): value is T {
        throw new Error("Unimplemented");
    }
}

export type FieldType<M extends FieldModel<unknown>> = M extends AnyField
    ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
      any
    : M extends ArrayField<infer T>
    ? ArrayFieldType<T>
    : M extends BooleanField
    ? boolean
    : M extends NullableField<infer T>
    ? T
    : M extends NumberField
    ? number
    : M extends ObjectField<infer T>
    ? ObjectFieldType<T>
    : M extends StringField
    ? string
    : never;
