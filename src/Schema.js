const { Schema } = require("mongoose");

const Default = new Schema({
    ID: {
        type: Schema.Types.String,
        required: true
    },
    data: {
        type: Schema.Types.Mixed,
        required: true
    }
});

module.exports = (name, conn) => {
    return typeof name === "string" ? conn.model(name, Default) : conn.model("JSON", Default);
};