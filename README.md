# QuickMongo
Quick mongodb wrapper for beginners.

# Documentation
**[QuickMongo](https://quickmongo.snowflakedev.xyz)**

# Example

```js
const { Database } = require("quickmongo");
const db = new Database("mongodb://localhost/quickmongo");

db.on("ready", () => {
    Console.log("Database connected!");
});

db.set("foo", "bar");

db.get("foo").then(console.log);
```

# Links
- **[Discord Support Server](https://discord.gg/2SUybzb)**
- **[Documentation](https://quickmongo.snowflakedev.xyz)**
- **[GitHub](https://github.com/Snowflake107/quickmongo)**