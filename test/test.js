const { Database } = require("../index");
const db = new Database("mongodb://localhost/test");

db.on("ready", () => {
    console.log("Hey, im connected!");
    db.set("foo", "bar").then(() => db.export("./database.json"))
});

db.on("error", console.error);
db.on("debug", console.log);