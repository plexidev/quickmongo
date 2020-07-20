module.exports = {
    Database: require("./src/Main"),
    version: require("./package.json").version,
    MemoryStorage: require("./src/Cache")
};