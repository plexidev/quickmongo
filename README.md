# QuickMongo
Quick mongodb wrapper for beginners.

![QuickMongo](https://nodei.co/npm/quickmongo.png)

# Documentation
**[QuickMongo](https://quickmongo.js.org)**

# Features
- Easy
- Simple
- Fast
- Import & export support
- Key value based
- More than 25 methods
- Beginner friendly

> Btw, `quick.db` users can easily export their data to `quickmongo`.

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

# Exporting data from quick.db to quickmongo

```js
const db = require("quick.db");
const { Database } = require("quickmongo");
const mongo = new Database("mongodb://localhost/quickmongo");

function exportData() {
    const data = db.all();
    mongo.import(data).then(() => {
        console.log("Successfully exported quick.db data to quickmongo!");
    });    
}

exportData();
```

# Exporting data from quick.db tables (and custom schema names)

```js
const db = require("quick.db");
const table = new db.table("mytable");

const { Database } = require("quickmongo");
const mongo = new Database("mongodb://localhost/quickmongo", "mytable"); // custom schema name (acts like quickdb table)

function exportData() {
    const data = table.all();
    mongo.import(data).then(() => {
        console.log("Successfully exported quick.db data to quickmongo!");
    });    
}

exportData();
```

# Links
- **[Discord Support Server](https://discord.gg/2SUybzb)**
- **[Documentation](https://quickmongo.js.org)**
- **[GitHub](https://github.com/Snowflake107/quickmongo)**

# Examples

```js
const { Database } = require("quickmongo");
const db = new Database("mongodb://localhost/quickmongo");

// set
db.set("money", 200).then(i => {
    console.log(`Set balance to $${i}`); // 200
});

// add
db.add("money", 100).then(i => {
    console.log(`Added money! now you have $${i}`); // 300
});

// fetch
db.get("money").then(i => {
    console.log(`Your balance: ${i}`); // 300
});

// fetch all
db.all().then(console.log); // [{ ID: "money", data: 300 }]

// delete all
db.deleteAll().then(() => console.log("done!"));

// export your data to json file
db.export("rawdata").then(path => {
    console.log(`Data exported to ${path}...`);
});

// import data from quick.db (listen to "debug" event for details)
db.import(quickdb.all()).then(() => {
    console.log("Data imported!");
});
```

# Value Targets (Path)
Value target (Like `key.target` of `quick.db`) support is not yet available in this package. It will be available soon :)

But you can still use it like this:

```js
const { Database } = require("quickmongo");
const db = new Database("mongodb://localhost/quickmongo");

// set data
db.set("user", { items: [] });

// update items
let data = await db.get("user");
data.items = ["keyboard"];
db.set("user", data); // { items: ["keyboard"] }
```