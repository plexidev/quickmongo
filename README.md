# QuickMongo

Quick Mongodb wrapper for beginners.

![](https://camo.githubusercontent.com/ee0b303561b8c04223d4f469633e2088968cf514f0f6901c729331c462a32f10/68747470733a2f2f63646e2e646973636f72646170702e636f6d2f6174746163686d656e74732f3739333638393539323431343939343436362f3833323039343438363834353834393631302f6c6f676f2e37393539646231325f35302e706e67)

# Installing

```bash
$ npm install --save quickmongo
```

# Documentation
**[https://quickmongo.js.org](https://quickmongo.js.org)**

# Features
- Beginner friendly
- Strongly typed
- Asynchronous
- Dot notation support
- Key-Value like interface
- Easy to use

# Example

```js
const MongoDB = require("mongodb");
const { Fields, Collection } = require("quickmongo");

const mongo = await MongoDB.MongoClient.connect("mongodb://127.0.0.1:61582");
const collection = mongo.db("quickmongo").collection("demo");
const schema = new Fields.ObjectField({
    name: new Fields.StringField(),
    age: new Fields.NumberField(),
    isHuman: new Fields.BooleanField()
});
const db = new Collection(collection, schema);

// set data
await db.set("Josh", {
    name: "Josh",
    age: 24,
    isHuman: true
});

// get data
await db.get("Josh"); // { name: "Josh", age: 24, isHuman: true }

// get age
await db.get("Josh", "age"); // 24

// set age to 23
await db.set("Josh", 23, "age");

// get all data
await db.all(); // [{ key: "Josh", value: { name: "Josh", age: 23, isHuman: true } }]

// delete
await db.delete("Josh");
```

# Discord Support
**[SnowflakeDev Community ❄️](https://snowflakedev.org/discord)**