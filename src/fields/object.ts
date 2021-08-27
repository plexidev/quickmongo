import { FieldModel, FieldModelOptions, FieldType } from "./";

export type ObjectFieldModel = object & {
    [s: string]: FieldModel<any>;
};

export class ObjectField<T extends ObjectFieldModel> extends FieldModel<
    ObjectFieldType<T>
> {
    model: T;

    constructor(model: T, options?: FieldModelOptions<any>) {
        super(options);

        this.model = model;
    }

    override create(value: ObjectFieldType<T>): ObjectFieldType<T> {
        return value;
    }

    override validate(value: any): value is ObjectFieldType<T> {
        return (
            typeof value === "object" &&
            Object.entries(value).every(([key, val]) =>
                this.model[key as any as keyof T]?.validate(val)
            )
        );
    }
}

export type ObjectFieldType<T extends ObjectFieldModel> = {
    [K in keyof T]: FieldType<T[K]>;
};
