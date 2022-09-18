/* eslint-disable */

const { QuickDB } = require("quick.db");
const { MongoDriver } = require("quickmongo");
const driver = new MongoDriver("mongodb://localhost/quickdb");

driver.connect().then(() => {
    console.log(`Connected to the database!`);
    init();
});

async function init() {
    const db = new QuickDB({ driver });
    
    await db.deleteAll();

    // self calling async function just to get async
    // Setting an object in the database:
    console.log(await db.set("userInfo", { difficulty: "Easy" }));
    // -> { difficulty: 'Easy' }

    // Getting an object from the database:
    console.log(await db.get("userInfo"));
    // -> { difficulty: 'Easy' }

    // Getting an object property from the database:
    console.log(await db.get("userInfo.difficulty"));
    // -> 'Easy'

    // Pushing an element to an array (that doesn't exist yet) in an object:
    console.log(await db.push("userInfo.items", "Sword"));
    // -> { difficulty: 'Easy', items: ['Sword'] }

    // Adding to a number (that doesn't exist yet) in an object:
    console.log(await db.add("userInfo.balance", 500));
    // -> { difficulty: 'Easy', items: ['Sword'], balance: 500 }

    // Repeating previous examples:
    console.log(await db.push("userInfo.items", "Watch"));
    // -> { difficulty: 'Easy', items: ['Sword', 'Watch'], balance: 500 }
    console.log(await db.add("userInfo.balance", 500));
    // -> { difficulty: 'Easy', items: ['Sword', 'Watch'], balance: 1000 }

    // Fetching individual properties
    console.log(await db.get("userInfo.balance")); // -> 1000
    console.log(await db.get("userInfo.items")); // ['Sword', 'Watch']

    await driver.close();
}