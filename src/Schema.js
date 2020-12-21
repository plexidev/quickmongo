const { Schema } = require("mongoose");

const Default = new Schema({
    ID: {
        type: Schema.Types.String,
        required: true,
        unique: true
    },
    data: {
        type: Schema.Types.Mixed,
        required: true
    }
});

module.exports = (connection, name) => {
    return typeof name === "string" ? connection.model(name, Default) : connection.model("JSON", Default);
};