const { Database } = require("../index");
const db = new Database("mongodb://localhost/testing");

db.on("ready", () => {
    console.log("Hey, im connected!");
});

db.on("error", console.error);
db.on("debug", console.log);

db.set("foo", "bar").then(() => db.export());