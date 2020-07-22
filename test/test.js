const { Database } = require("../index");
const db = new Database("mongodb://localhost/test");

db.on("ready", () => {
    console.log("Hey, im connected!");
    console.log("pinging...")
    setTimeout(() => {
        db.fetchLatency().then(ping => {
            console.log(ping.read, "r");
            console.log(ping.write, "w");
            console.log(ping.average, "avg");
        });
    }, 3000);
});

db.on("error", console.error);
db.on("debug", console.log);