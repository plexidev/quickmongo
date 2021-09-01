import { Fields } from "../src";

describe("test fields", () => {
    test("model field", () => {
        const field = new Fields.FieldModel();
        expect(field.create.bind(field)).toThrowError();
    });

    test("any field", () => {
        const any = new Fields.AnyField();
        expect(any.create(true)).toBe(true);
    });

    test("array field", () => {
        const array = new Fields.ArrayField(new Fields.StringField());
        expect(array.create(["a"])).toStrictEqual(["a"]);
        expect(array.create.bind(array, [1])).toThrow(TypeError);
        expect(array.create.bind(array, 1)).toThrow(TypeError);
    });

    test("boolean field", () => {
        const boolean = new Fields.BooleanField();
        expect(boolean.create(true)).toBe(true);
        expect(boolean.create.bind(boolean, 1)).toThrow(TypeError);
    });

    test("nullable field", () => {
        const nullable = new Fields.NullableField(new Fields.StringField());
        expect(nullable.create(null)).toBe(null);
        expect(nullable.create.bind(nullable, 2)).toThrow(TypeError);
    });

    test("number field", () => {
        const number = new Fields.NumberField();
        expect(number.create(1)).toBe(1);
        expect(number.create.bind(number, false)).toThrow(TypeError);
    });

    test("object field", () => {
        const object = new Fields.ObjectField({
            a: new Fields.BooleanField(),
            b: new Fields.NumberField()
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
        const string = new Fields.StringField();
        expect(string.create("a")).toBe("a");
        expect(string.create.bind(string, 1)).toThrow(TypeError);
    });
});