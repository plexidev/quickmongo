import {
    AnyField,
    ArrayField,
    BooleanField,
    NullableField,
    NumberField,
    ObjectField,
    StringField,
} from "../src/fields";

const any = new AnyField();
any.create(undefined);

const array = new ArrayField(new StringField());

array.create(["a"]);

// @ts-expect-error
array.create([null]);

// @ts-expect-error
array.create(1);

const boolean = new BooleanField();

boolean.create(true);

// @ts-expect-error
boolean.create(1);

const nullable = new NullableField(new StringField());

nullable.create(null);

// @ts-expect-error
nullable.create(2);

const number = new NumberField();

number.create(1);

// @ts-expect-error
number.create(false);

const object = new ObjectField({
    a: new BooleanField(),
    b: new NumberField(),
});

object.create({
    a: true,
    b: 1,
});

object.create({
    // @ts-expect-error
    c: "foo",
});

const string = new StringField();

string.create("a");

// @ts-expect-error
string.create(1);
