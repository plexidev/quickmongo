const EventEmitter = require("events").EventEmitter;
const mongoose = require("mongoose");
const Error = require("./Error");

class Base extends EventEmitter {

    /**
     * Instantiates the base database.
     * This class is implemented by the main Database class.
     * @param {string} mongodbURL Mongodb Database URL.
     * @param {object} connectionOptions Mongodb connection options
     * @example const db = new Base("mongodb://localhost/mydb");
     */
    constructor(mongodbURL, connectionOptions={}) {
        super();
        if (!mongodbURL || !mongodbURL.startsWith("mongodb")) throw new Error("No mongodb url was provided!");
        if (typeof mongodbURL !== "string") throw new Error(`Expected a string for mongodbURL, received ${typeof mongodbURL}`);
        if (connectionOptions && typeof connectionOptions !== "object") throw new Error(`Expected Object for connectionOptions, received ${typeof connectionOptions}`);

        /**
         * @typedef {string} dbURL
         * Current database url
         */
        Object.defineProperty(this, "dbURL", {
            value: mongodbURL
        });

        /**
         * Mongoose connection options
         * @type {ConnectionOptions}
         */
        this.options = connectionOptions;

        /**
         * Returns mongodb connection
         * @type {MongooseConnection}
         */
        this.connection = this._create();

        this.connection.on("error", (e) => {
            this.emit("error", e);
        });
        this.connection.on("open", () => {
            /**
             * Timestamp when database became ready
             * @type {Date}
             */
            this.readyAt = new Date();
            this.emit("ready");
        });
    }

    /**
     * Creates mongodb connection
     * @returns {MongooseConnection}
     * @ignore
     */
    _create(url) {
        this.emit("debug", "Creating database connection...");

        if (url && typeof url === "string") this.dbURL = url;
        if (!this.dbURL || typeof this.dbURL !== "string") throw new Error("Database url was not provided!", "MongoError");

        delete this.options["useUnique"];

        return mongoose.createConnection(this.dbURL, {
            ...this.options,
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true
        });
    }

    /**
     * Destroys database
     * @ignore
     */
    _destroyDatabase() {
        this.connection.close(true);
        this.readyAt = undefined;
        this.dbURL = null;
        this.emit("debug", "Database disconnected!");
    }
    
    /**
     * Current database url
     * @type {string}
     */
    get url() {
        return this.dbURL;
    }

    /**
     * Returns database connection state
     * @type {("DISCONNECTED"|"CONNECTED"|"CONNECTING"|"DISCONNECTING")}
     */
    get state() {
        if (!this.connection || typeof this.connection.readyState !== "number") return "DISCONNECTED";
        switch(this.connection.readyState) {
            case 0:
                return "DISCONNECTED";
            case 1:
                return "CONNECTED";
            case 2:
                return "CONNECTING";
            case 3:
                return "DISCONNECTING";
        }
    }
}

/**
 * Emitted when database creates connection
 * @event Base#ready
 * @example db.on("ready", () => {
 *     console.log("Successfully connected to the database!");
 * });
 */

/**
 * Emitted when database encounters error
 * @event Base#error
 * @param {Error} Error Error Message
 * @example db.on("error", console.error);
 */

 /**
  * Emitted on debug mode
  * @event Base#debug
  * @param {string} Message Debug message
  * @example db.on("debug", console.log);
  */

module.exports = Base;
