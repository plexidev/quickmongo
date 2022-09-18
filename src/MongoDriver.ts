import mongoose from "mongoose";
import modelSchema from "./collection";

export interface IDriver {
    prepare(table: string): Promise<void>;
    getAllRows(table: string): Promise<{ id: string; value: any }[]>;
    getRowByKey<T>(table: string, key: string): Promise<[T | null, boolean]>;
    setRowByKey<T>(table: string, key: string, value: any, update: boolean): Promise<T>;
    deleteAllRows(table: string): Promise<number>;
    deleteRowByKey(table: string, key: string): Promise<number>;
}

/**
 * Quick.db compatible mongo driver
 * @example // require quickdb
 * const { QuickDB } = require("quick.db");
 * // require mongo driver from quickmongo
 * const { MongoDriver } = require("quickmongo");
 * // create mongo driver
 * const driver = new MongoDriver("mongodb://localhost/quickdb");
 *
 * // connect to mongodb
 * await driver.connect();
 *
 * // create quickdb instance with mongo driver
 * const db = new QuickDB({ driver });
 *
 * // set something
 * await db.set("foo", "bar");
 *
 * // get something
 * console.log(await db.get("foo")); // -> foo
 */
export class MongoDriver implements IDriver {
    public connection: mongoose.Connection;
    private models = new Map<string, ReturnType<typeof modelSchema>>();

    public constructor(public url: string, public options: mongoose.ConnectOptions = {}) {}

    public connect(): Promise<MongoDriver> {
        // eslint-disable-next-line
        return new Promise(async (resolve, reject) => {
            mongoose.createConnection(this.url, this.options, (err, connection) => {
                if (err) return reject(err);
                this.connection = connection;
                resolve(this);
            });
        });
    }

    public close(force?: boolean) {
        return this.connection?.close(force);
    }

    private checkConnection() {
        // eslint-disable-next-line
        if (this.connection == null) throw new Error(`MongoDriver is not connected to the database`);
    }

    public async prepare(table: string) {
        this.checkConnection();
        if (!this.models.has(table)) this.models.set(table, modelSchema(this.connection, table));
    }

    private async getModel(name: string) {
        await this.prepare(name);
        return this.models.get(name);
    }

    async getAllRows(table: string): Promise<{ id: string; value: any }[]> {
        this.checkConnection();
        const model = await this.getModel(table);
        return (await model.find()).map((row: any) => ({
            id: row.ID,
            value: row.data
        }));
    }

    async getRowByKey<T>(table: string, key: string): Promise<[T | null, boolean]> {
        this.checkConnection();
        const model: any = await this.getModel(table);
        // wtf quickdb?
        const res = await model.find({ ID: key });
        return res.map((m: any) => m.data);
    }

    async setRowByKey<T>(table: string, key: string, value: any, update: boolean): Promise<T> {
        this.checkConnection();
        const model = await this.getModel(table);
        void update;
        await model.findOneAndUpdate(
            {
                ID: key
            },
            {
                $set: { data: value }
            },
            { upsert: true }
        );

        return value;
    }

    async deleteAllRows(table: string): Promise<number> {
        this.checkConnection();
        const model = await this.getModel(table);
        const res = await model.deleteMany();
        return res.deletedCount;
    }

    async deleteRowByKey(table: string, key: string): Promise<number> {
        this.checkConnection();
        const model = await this.getModel(table);

        const res = await model.deleteMany({
            ID: key
        });
        return res.deletedCount;
    }
}
