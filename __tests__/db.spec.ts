import { Database } from "../src";

describe("test database", () => {
    const db = new Database<{
        difficulty: string;
        items: string[];
        balance: number;
    }>("mongodb://127.0.0.1:27017/quickmongo");

    beforeAll(async () => {
        await db.connect();
    }, 10000);

    afterAll(async () => {
        await db.deleteAll();
        await db.close();
    }, 10000);

    test("it should pass quick.db test", async () => {
        // Setting an object in the database:
        await db.set("userInfo", { difficulty: "Easy" });
        // -> { difficulty: 'Easy' }

        // Pushing an element to an array (that doesn't exist yet) in an object:
        await db.push("userInfo.items", "Sword");
        // -> { difficulty: 'Easy', items: ['Sword'] }

        // Adding to a number (that doesn't exist yet) in an object:
        await db.add("userInfo.balance", 500);
        // -> { difficulty: 'Easy', items: ['Sword'], balance: 500 }

        // Repeating previous examples:
        await db.push("userInfo.items", "Watch");
        // -> { difficulty: 'Easy', items: ['Sword', 'Watch'], balance: 500 }
        await db.add("userInfo.balance", 500);
        // -> { difficulty: 'Easy', items: ['Sword', 'Watch'], balance: 1000 }

        // Fetching individual properties
        await db.get("userInfo.balance"); // -> 1000
        await db.get("userInfo.items"); // -> ['Sword', 'Watch']

        const res = await db.get("userInfo");
        expect(res).toStrictEqual({ difficulty: "Easy", items: ["Sword", "Watch"], balance: 1000 });
    });

    it("should pull item", async () => {
        const res = (await db.pull("userInfo.items", "Watch")) as {
            difficulty: string;
            items: string[];
            balance: number;
        };

        expect(res.items).toStrictEqual(["Sword"]);
    });
});
