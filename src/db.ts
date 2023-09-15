import Dexie, { Table } from "dexie";
import { ILog } from "./models";

class ClientLoggerDb extends Dexie {
    logs!: Table<ILog>;

    constructor() {
        super("client-logger");

        this.version(1).stores({
            logs: "uuid",
        });
    }
}

// Declare db as a global variable
export const db = new ClientLoggerDb();
db.open();
