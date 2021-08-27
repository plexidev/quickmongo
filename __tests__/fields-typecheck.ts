import { AnyField, ArrayField, BooleanField, NullableField, NumberField, ObjectField, StringField } from "../src/fields";

const any = new AnyField();

any.create(undefined);

const array = new ArrayField(new StringField());

array.create(["a"]);

// @ts-expect-error Must be an array of strings
array.create([1]);

// @ts-expect-error Must be an array of strings
array.create(1);

const boolean = new BooleanField();

boolean.create(true);

// @ts-expect-error Must be a boolean
boolean.create(1);

const nullable = new NullableField(new StringField());

nullable.create(null);

// @ts-expect-error Must be a string or null
nullable.create(2);

const number = new NumberField();

number.create(1);

// @ts-expect-error Must be a number
number.create(false);

const object = new ObjectField({
    a: new BooleanField(),
    b: new NumberField()
});

object.create({
    a: true,
    b: 1
});

object.create({
    // @ts-expect-error Key does not exist
    c: "foo"
});

const string = new StringField();

string.create("a");

// @ts-expect-error Must be a string
string.create(1);
