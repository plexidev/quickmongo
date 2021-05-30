import { Connection, ConnectionOptions } from 'mongoose';
import { EventEmitter } from 'events';
import mongoose from 'mongoose';
import Error from './util/QuickMongoError';

/**
 * Base db
 * @extends EventEmitter
 */
class Base extends EventEmitter {
    connection!: Connection;
    readyAt!: Date | undefined;
    options!: ConnectionOptions;
    dbURL!: string | null;

    /**
     * Instantiates the base database.
     * This class is implemented by the main Database class.
     * @param {string} mongodbURL Mongodb Database URL.
     * @param {object} connectionOptions Mongodb connection options
     * @example const db = new Base("mongodb://localhost/mydb");
     */
    constructor(mongodbURL: string, connectionOptions: ConnectionOptions | null) {
        super();
        if (!mongodbURL || !mongodbURL.startsWith('mongodb')) throw new Error('An invalid or no connection URI was provided.');
        if (typeof mongodbURL !== 'string') throw new Error(`Expected a string for MongoDB Connection URI, received ${typeof mongodbURL}`);
        if (connectionOptions && typeof connectionOptions !== 'object') throw new Error(`Expected Object for connectionOptions, received ${typeof connectionOptions}`);

        /**
         * @name Base#dbURL
         * @type {string}
         * Current database url
         */
        Object.defineProperty(this, 'dbURL', { value: mongodbURL, writable: true, configurable: true, enumerable: false });

        /**
         * Mongoose connection options
         * @type {ConnectionOptions}
         */
        this.options = connectionOptions ?? {};

        /**
         * Returns mongodb connection
         * @type {MongooseConnection}
         */
        this.connection = this._create(mongodbURL);

        // Emitting Events on Connection ERROR and OPEN
        this.connection.on('error', (e: Error) => this.emit('error', e));
        this.connection.on('open', () => {
            /**
             * Timestamp when database became ready
             * @name Base#readyAt
             * @type {Date}
             */
            this.readyAt = new Date();
            this.emit('ready');
        });
    }

    /**
     * Creates database connection
     * @param {string} [url=this.dbURL] Database url
     * @returns {Connection}
     */
    _create(url: string): Connection {
        this.emit('debug', 'Creating database connection...');

        if ('useUnique' in this.options) delete (this.options as any)['useUnique'];

        return mongoose.createConnection(url ?? this.dbURL, {
            ...this.options,
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: false
        });
    }

    /**
     * Destroys database
     * @private
     */
    _destroyDatabase() {
        this.connection.close(true);
        this.readyAt = undefined;
        this.dbURL = null;
        this.emit('debug', 'Database connection ended.');
    }

    /**
     * Current database url
     * @type {string}
     */
    get url(): string {
        return this.dbURL!;
    }

    /**
     * Returns database connection state
     * @type {("DISCONNECTED"|"CONNECTED"|"CONNECTING"|"DISCONNECTING")}
     */
    get state() {
        if (!this.connection || typeof this.connection.readyState !== 'number') return 'DISCONNECTED';
        switch (this.connection.readyState) {
            case 0:
                return 'DISCONNECTED';
            case 1:
                return 'CONNECTED';
            case 2:
                return 'CONNECTING';
            case 3:
                return 'DISCONNECTING';
        }
    }
}

export default Base;
