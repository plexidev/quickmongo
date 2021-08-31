module.exports = {
    Base: require("./src/Base"),
    DB: require("./src/Main"),
    QuickMongoError: require("./src/Error"),
    Schema: require("./src/Schema"),
    Util: require("./src/Util"),
    version: require("./package.json").version
};
