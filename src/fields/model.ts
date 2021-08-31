import type { AnyField } from "./AnyField";
import type { ArrayField, ArrayFieldType } from "./ArrayField";
import type { BooleanField } from "./BooleanField";
import type { NullableField } from "./NullableField";
import type { NumberField } from "./NumberField";
import type { ObjectField, ObjectFieldType } from "./ObjectField";
import type { StringField } from "./StringField";

export interface FieldModelOptions<T> {
    defaultValue?: T;
}

export class FieldModel<T> {
    constructor(public readonly options?: FieldModelOptions<T>) {}

    create(value: T): T {
        this.validate(value);
        return value;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    validate(value: unknown): true | never {
        throw new Error("Unimplemented");
    }
}

export type FieldType<M extends FieldModel<unknown>> = M extends ArrayField<infer T>
    ? ArrayFieldType<T>
    : M extends BooleanField
    ? boolean
    : M extends NullableField<infer T>
    ? T | null
    : M extends NumberField
    ? number
    : M extends ObjectField<infer T>
    ? ObjectFieldType<T>
    : M extends StringField
    ? string
    : M extends AnyField
    ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
      any
    : never;
