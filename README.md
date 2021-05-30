<p align="center">
  <img src="https://cdn.discordapp.com/attachments/793689592414994466/832094486845849610/logo.7959db12_50.png" />
</p>

## Download & Installation

```shell
$ npm i quickmongo
```

# Features
- Beginner friendly
- Very similar to **[quick.db](https://npmjs.com/package/quick.db)**
- Dot notation support
- Import & export support
- Key value based
- Asynchronous
- Multiple model support
<h3>-> <a href="https://quickmongo.js.org">Documentation</a></h3>
<h3>-> <a href="https://github.com/DevSnowflake/quickmongo">Github Repository</a></h3>
<h3>-> <a href="https://discord.gg/uqB8kxh">Support Server (Discord)</a></h3>
<br>

# Quick Example

```js
const { Database } = require("quickmongo");
const db = new Database("mongodb://localhost/quickmongo");

db.on("ready", () => {
    console.log("Database connected!");
});

db.set("foo", "bar");

db.get("foo").then(console.log);
```

# Import Existing Data From quick.db

```js
const db = require("quick.db");
const { Database } = require("quickmongo");
const mongo = new Database("mongodb://localhost/quickmongo");

function importData() {
    const data = db.all();
    mongo.import(data).then(() => {
        console.log("Done!");
    });    
}

mongo.on("ready", () => importData());
```

# Example

```js
const { Database } = require("quickmongo");
const db = new Database("mongodb://localhost/quickmongo");

// Setting an object in the database:
db.set("userInfo", { difficulty: "Easy" }).then(console.log);
// -> { difficulty: 'Easy' }

db.push("userInfo.items", "Sword").then(console.log);
// -> { difficulty: 'Easy', items: ['Sword'] }

db.add("userInfo.balance", 500).then(console.log);
// -> { difficulty: 'Easy', items: ['Sword'], balance: 500 }

// Repeating previous examples:
db.push("userInfo.items", "Watch").then(console.log);
// -> { difficulty: 'Easy', items: ['Sword', 'Watch'], balance: 500 }

db.add("userInfo.balance", 500).then(console.log);
// -> { difficulty: 'Easy', items: ['Sword', 'Watch'], balance: 1000 }

// Fetching individual properties
db.get("userInfo.balance").then(console.log);
// -> 1000
db.get("userInfo.items").then(console.log);
// -> ['Sword', 'Watch']
```
