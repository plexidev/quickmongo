const { Schema, model } = require("mongoose");

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

module.exports = (name) => {
    return typeof name === "string" ? model(name, Default) : model("JSON", Default);
};