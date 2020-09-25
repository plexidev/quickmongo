const { Schema, model } = require("mongoose");

module.exports = (name) => {
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

    return typeof name === "string" ? model(name, Default) : model("JSON", Default);
};