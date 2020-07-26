const { Database } = require("../index");
const db = new Database("mongodb://localhost/test");

db.on("ready", () => {
    console.log("Hey, im connected!");
});

db.on("error", console.error);
db.on("debug", console.log);

db.valueArray().then(console.log);