import { AnyField, ArrayField, BooleanField, NullableField, NumberField, ObjectField, StringField } from "../src/fields";

describe("Fields Type Check", () => {
    test("AnyField", () => {
        const any = new AnyField();

        expect(any.create(undefined)).toBe(undefined);
    });

    test("ArrayField", () => {
        const array = new ArrayField(new StringField());

        expect(array.create(["a"])).toBe(["a"]);

        // TODO: add multiple test case
        // // @ts-expect-error Must be an array of strings
        // expect(array.create([1])).toThrowError();

        // // @ts-expect-error Must be an array of strings
        // expect(array.create(1)).toThrowError();
    });
});

// const boolean = new BooleanField();

// boolean.create(true);

// // @ts-expect-error Must be a boolean
// boolean.create(1);

// const nullable = new NullableField(new StringField());

// nullable.create(null);

// // @ts-expect-error Must be a string or null
// nullable.create(2);

// const number = new NumberField();

// number.create(1);

// // @ts-expect-error Must be a number
// number.create(false);

// const object = new ObjectField({
//     a: new BooleanField(),
//     b: new NumberField()
// });

// object.create({
//     a: true,
//     b: 1
// });

// object.create({
//     // @ts-expect-error Key does not exist
//     c: "foo"
// });

// const string = new StringField();

// string.create("a");

// // @ts-expect-error Must be a string
// string.create(1);
