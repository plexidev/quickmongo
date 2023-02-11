## ![QuickMongo Logo](https://www.plexidev.org/quickmongo.png)

QuickMongo is a beginner-friendly and feature-rich wrapper for MongoDB that allows you to use Quick.db's Key-Value based syntax.

# Installing

```bash
$ npm install --save quickmongo
```
OR
```bash
$ yarn add quickmongo
```

# Documentation
**[https://quickmongo.js.org](https://quickmongo.js.org)**

# Features
- Beginner friendly
- Asynchronous
- Dot notation support
- Key-Value like interface
- Easy to use
- TTL (temporary storage) supported
- Provides quick.db compatible API
- MongoDriver for quick.db

# Example

## QuickMongo

```js
import { Database } from "quickmongo";

const db = new Database("mongodb://localhost:27017/quickmongo");

db.on("ready", () => {
    console.log("Connected to the database");
    doStuff();
});

// top-level awaits
await db.connect(); 

async function doStuff() {
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

    // remove item
    await db.pull("userInfo.items", "Sword");
    // -> { difficulty: 'Easy', items: ['Watch'], balance: 1000 }

    // set the data and automatically delete it after 1 minute
    await db.set("foo", "bar", 60); // 60 seconds = 1 minute

    // fetch the temporary data after a minute
    setTimeout(async () => {
        await db.get("foo"); // null
    }, 60_000);
}
```

## Usage with quick.db

```js
const { QuickDB } = require("quick.db");
// get mongo driver
const { MongoDriver } = require("quickmongo");
const driver = new MongoDriver("mongodb://localhost/quickdb");

driver.connect().then(() => {
    console.log(`Connected to the database!`);
    init();
});

async function init() {
    // use quickdb with mongo driver
    // make sure this part runs after connecting to mongodb
    const db = new QuickDB({ driver });

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

    // disconnect from the database
    await driver.close();
}
```

**Maintained by Plexi Development**

# Discord Support
**[Plexi Development](https://discord.gg/plexidev)**

**Acquired from Archaeopteryx on 10/02/2022**
