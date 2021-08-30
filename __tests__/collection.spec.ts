import { MongoClient, Collection as MongoCollection } from "mongodb";
import { Collection, Fields } from "../src";

describe("test collection", () => {
    const schema = new Fields.ObjectField({
        name: new Fields.StringField(),
        age: new Fields.NumberField(),
        isHuman: new Fields.BooleanField(),
        isJobless: new Fields.NullableField(new Fields.BooleanField()),
    });

    let mongo: MongoClient = null, collection: MongoCollection = null, db: Collection<typeof schema>;

    beforeAll(async () => {
        mongo = await MongoClient.connect(global.__MONGO_URI__);
        return mongo;
    }, 10_000);

    it("define mongo", () => {
        collection = mongo.db(global.__MONGO_DB_NAME__).collection("test");
        db = new Collection(collection, schema);

        expect(mongo).not.toBeNull();
        expect(collection).not.toBeNull();
    });

    it("get (non-exist)", async () => {
        const val = await db.get("user");
        expect(val).toBe(undefined);
    });

    it("delete (non-exist)", async () => {
        const val = await db.delete("user");
        expect(val).toBe(false);
    });

    
    const user: Fields.FieldType<typeof schema> = {
        name: "Mongoose",
        age: 69,
        isHuman: false,
        isJobless: true,
    };

    it("set (new)", async () => {
        const val = await db.set("user", user);
        expect(val).toBe(undefined);
    });

    it("get (exist)", async () => {
        const val = await db.get("user");
        expect(val).toStrictEqual(user);
    });

    it("set (dot-notation)", async () => {
        user.name = "Monkey";
        const val = await db.set<string>("user", user.name, "name");
        expect(val).toBe(undefined);
    });

    it("get (dot-notation)", async () => {
        const val = await db.get<string>("user", "name");
        expect(val).toBe(user.name);
    });

    it("get (exist)", async () => {
        const val = await db.get("user");
        expect(val).toStrictEqual(user);
    });

    it("delete (dot-notation)", async () => {
        const val = await db.delete("user", "isJobless");
        expect(val).toBe(true);
    });

    it("get (dot-notation)", async () => {
        const val = await db.get<boolean | null>("user", "isJobless");
        expect(val).toBe(null);
    });

    it("delete (exist)", async () => {
        const val = await db.delete("user");
        expect(val).toBe(true);
    });

    it("get (non-exist)", async () => {
        const val = await db.get("user");
        expect(val).toBe(undefined);
    });
});