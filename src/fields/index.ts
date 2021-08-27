import { AnyField } from "./any";
import { ArrayField, ArrayFieldType } from "./array";
import { BooleanField } from "./boolean";
import { NullableField } from "./nullable";
import { NumberField } from "./number";
import { ObjectField, ObjectFieldType } from "./object";
import { StringField } from "./string";

export * from "./any";
export * from "./array";
export * from "./boolean";
export * from "./nullable";
export * from "./number";
export * from "./object";
export * from "./string";

export interface FieldModelOptions<T> {
    defaultValue?: T;
}

export class FieldModel<T> {
    options?: FieldModelOptions<T>;

    constructor(options?: FieldModelOptions<T>) {
        this.options = options;
    }

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
