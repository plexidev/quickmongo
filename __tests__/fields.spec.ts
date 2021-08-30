import { AnyField, ArrayField, BooleanField, FieldModel, NullableField, NumberField, ObjectField, StringField } from "../src/fields";

describe("test fields", () => {
    test("model field", () => {
        const field = new FieldModel();
        expect(field.create.bind(field)).toThrowError();
    });

    test("any field", () => {
        const any = new AnyField();
        expect(any.create(true)).toBe(true);
    });

    test("array field", () => {
        const array = new ArrayField(new StringField());
        expect(array.create(["a"])).toStrictEqual(["a"]);
        expect(array.create.bind(array, [1])).toThrow(TypeError);
        expect(array.create.bind(array, 1)).toThrow(TypeError);
    });

    test("boolean field", () => {
        const boolean = new BooleanField();
        expect(boolean.create(true)).toBe(true);
        expect(boolean.create.bind(boolean, 1)).toThrow(TypeError);
    });

    test("nullable field", () => {
        const nullable = new NullableField(new StringField());
        expect(nullable.create(null)).toBe(null);
        expect(nullable.create.bind(nullable, 2)).toThrow(TypeError);
    });

    test("number field", () => {
        const number = new NumberField();
        expect(number.create(1)).toBe(1);
        expect(number.create.bind(number, false)).toThrow(TypeError);
    });

    test("object field", () => {
        const object = new ObjectField({
            a: new BooleanField(),
            b: new NumberField()
        });
    
        expect(object.create({
            a: true,
            b: 1
        })).toStrictEqual({
            a: true,
            b: 1
        });
    
        expect(object.create.bind(object, {
            c: "foo"
        })).toThrow(TypeError);
    });

    test("string field", () => {
        const string = new StringField();
        expect(string.create("a")).toBe("a");
        expect(string.create.bind(string, 1)).toThrow(TypeError);
    });
});