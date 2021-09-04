/* eslint-disable eqeqeq */
import { AnyField } from "./AnyField";
import { ArrayField } from "./ArrayField";
import { BooleanField } from "./BooleanField";
import { NullableField } from "./NullableField";
import { NumberField } from "./NumberField";
import { ObjectField } from "./ObjectField";
import { StringField } from "./StringField";
import { FieldModel } from "./model";

export function resolveField(value: unknown): FieldModel<unknown> {
    if (!value) return new NullableField(new AnyField());
    else if (value instanceof FieldModel) return value;
    else if (value == String) return new StringField();
    else if (value == Boolean) return new BooleanField();
    else if (value == Number) return new NumberField();
    else if (Array.isArray(value) && value[0]) return new ArrayField(resolveField(value[0]));
    else if (typeof value == "object") new ObjectField(Object.fromEntries(Object.entries(value).map(([key, value]) => [key, resolveField(value)])));
    else return new AnyField();
}