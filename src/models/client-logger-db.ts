import Dexie from "dexie";
import { ILog, ILogSaving } from "./log";

export class ClientLoggerDB extends Dexie {
    logs!: Dexie.Table<ILog, string>;
    uploads!: Dexie.Table<ILogSaving, string>;

    constructor() {
        super("client-logger");
        // Define tables and indexes
        this.version(1).stores({
            logs: "uuid,trace,timestamp",
            uploads: "uuid",
        });
    }
}
