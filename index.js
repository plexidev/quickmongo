module.exports = {
    Base: require("./src/Base"),
    Database: require("./src/Main"),
    MemoryStorage: require("./src/Cache"),
    Schema: require("./src/Schema"),
    Util: require("./src/Util"),
    version: require("./package.json").version
};