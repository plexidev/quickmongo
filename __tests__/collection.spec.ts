import { MongoClient, Collection as MongoCollection } from "mongodb";
import { Collection, Fields, FieldToDocumentScheme } from "../src";

describe("test collection", () => {
    const schema = new Fields.ObjectField({
        name: new Fields.StringField(),
        age: new Fields.NumberField(),
        isHuman: new Fields.BooleanField(),
        isJobless: new Fields.NullableField(new Fields.BooleanField()),
        friends: new Fields.ArrayField(new Fields.StringField())
    });

    let mongo: MongoClient = null,
        collection: MongoCollection<FieldToDocumentScheme<typeof schema>> = null,
        db: Collection<typeof schema>;

    beforeAll(async () => {
        mongo = await MongoClient.connect(global.__MONGO_URI__);
        collection = mongo.db(global.__MONGO_DB_NAME__).collection("test");
        db = new Collection(collection, schema);
        return mongo;
    }, 10000);

    afterAll(async () => {
        await db.drop();
        await mongo.close();
    }, 10000);

    test("get (non-exist)", async () => {
        const val = await db.get("user");
        expect(val).toBe(undefined);
    });

    test("delete (non-exist)", async () => {
        const val = await db.delete("user");
        expect(val).toBe(false);
    });

    
    const user: Fields.FieldType<typeof schema> = {
        name: "Mongoose",
        age: 69,
        isHuman: false,
        isJobless: true,
        friends: []
    };

    test("set (fails)", async () => {
        const val = {
            ...user,
            age: `${user.age}`,
        };
        expect.assertions(1);
        expect(db.set.call(db, "user", val)).rejects.toThrow(TypeError);
    });

    test("set (new)", async () => {
        const val = await db.set("user", user);
        expect(val).toBe(user);
    });

    test("get (exist)", async () => {
        const val = await db.get("user");
        expect(val).toStrictEqual(user);
    });

    test("set (dot-notation)", async () => {
        user.name = "Monkey";
        const val = await db.set<string>("user", user.name, "name");
        expect(val.name).toBe(user.name);
    });

    test("get (dot-notation)", async () => {
        const val = await db.get<string>("user", "name");
        expect(val).toBe(user.name);
    });

    test("get (exist)", async () => {
        const val = await db.get("user");
        expect(val).toStrictEqual(user);
    });

    test("delete (dot-notation)", async () => {
        const val = await db.delete("user", "isJobless");
        expect(val).toBe(true);
    });

    test("get (dot-notation)", async () => {
        const val = await db.get<boolean | null>("user", "isJobless");
        expect(val).toBe(null);
    });

    test("delete (exist)", async () => {
        const val = await db.delete("user");
        expect(val).toBe(true);
    });

    test("get (non-exist)", async () => {
        const val = await db.get("user");
        expect(val).toBe(undefined);
    });

    test("all (non-empty)", async () => {
        for (let i = 0; i < 10; i++) {
            const user = {
                name: `Mongoose_${i}`,
                age: 5 * (i + 1), // 5-50
                isHuman: i % 2 === 0,
                isJobless: null,
                friends: []
            };

            await db.set(`target_${i}`, user);
        }

        const everything = await db.all();
        expect(everything.length).toBe(10);
    });

    test("all (ascending)", async () => {
        const everything = await db.all({
            sort: {
                by: "ascending",
                target: "value.age"
            }
        });

        expect(everything[everything.length - 1].value.age).toBe(50);
    });

    test("all (descending)", async () => {
        const everything = await db.all({
            sort: {
                by: "descending",
                target: "value.age"
            }
        });

        expect(everything[everything.length - 1].value.age).toBe(5);
    });

    test("all (limit)", async () => {
        const everything = await db.all({
            max: 5
        });

        expect(everything.length).toBe(5);
    });

    test("drop collection (existing)", async () => {
        const success = await db.drop();
        expect(success).toBe(true);
    });

    test("all (empty)", async () => {
        const everything = await db.all();
        expect(everything.length).toBe(0);
    });

    test("drop collection (non-existing)", async () => {
        const success = await db.drop();
        expect(success).toBe(false);
    });

    test("push (non-existing/non-array)", async () => {
        expect(db.push("Simon", "Kyle", "friends")).rejects.toThrow(TypeError);
    });

    test("push (existing/array)", async () => {
        const simon = {
            name: "Simon",
            age: 21,
            isHuman: true,
            isJobless: null,
            friends: []
        };

        await db.set("simon", simon);

        const dat = await db.get("simon");
        expect(dat.friends.length).toBe(0);

        await db.push("simon", "Kyle", "friends");

        const newFri = await db.get("simon");

        expect(newFri.friends.length).toBe(1);
        expect(newFri.friends).toStrictEqual(["Kyle"]);

        await db.push("simon", ["Samrid", "Baun", "Santosh"], "friends");

        expect((await db.get<string[]>("simon", "friends"))).toStrictEqual(["Kyle", "Samrid", "Baun", "Santosh"]);
    });

    test("pull (existing)", async () => {
        await db.pull("simon", "Kyle", "friends");
        
        const data = await db.get("simon");
        
        expect(data.friends).toStrictEqual(["Samrid", "Baun", "Santosh"]);
    });

    test("pull (multiple/existing)", async () => {
        await db.pull("simon", ["Baun", "Santosh"], "friends");
        expect((await db.get<string[]>("simon", "friends"))).toStrictEqual(["Samrid"]);
    });

    test("pull (non-existing)", async () => {
        expect(db.pull("samrid", "test", "friends")).rejects.toThrow(TypeError);
    });

    test("latency", async () => {
        const latency = await db.latency();
        expect(typeof latency).toBe("number");
        expect(latency).toBeGreaterThanOrEqual(0);
    });
});

