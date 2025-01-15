import { nanoid } from "nanoid";
import { v7 as uuidV7, version as uuidVersion } from "uuid";

export interface ILog {
    uuid: string;
    /**
     * Session UUID
     */
    trace: string;
    /**
     * The level of the logger.
     */
    level: ELogLevel;
    /**
     * Message
     */
    message: string;
    /**
     * Dynamic logger content
     */
    content?: string;
    /**
     * Timestamp in milliseconds
     */
    timestamp?: number;
}

export enum ELogLevel {
    NOTSET = 0,
    DEBUG = 10,
    INFO = 20,
    WARNING = 30,
    ERROR = 40,
    CRITICAL = 50,
}

export interface ILogSaving extends Omit<ILog, "trace"> {
    /**
     * Breadcrumb trail
     * Get all logs with the same trace
     */
    breadcrumb: Omit<ILog, "trace">[];
}

// Class definition
export class Log implements ILog {
    uuid: string;
    trace: string;
    level: ELogLevel;
    message: string;
    content?: string;
    timestamp?: number;

    constructor(data?: Partial<Omit<ILog, "content">> & { content?: unknown }) {
        // Validate UUID
        let uuid = data?.uuid;
        if (uuid && uuidVersion(uuid) !== 7) {
            // Invalid UUID
            uuid = undefined;

            // Log warning
            if (console._warn) console._warn("Invalid UUID provided, generating new UUID");
            else console.warn("Invalid UUID provided, generating new UUID");
        }

        this.uuid = uuid ?? uuidV7();

        this.trace = data?.trace ?? nanoid(5);
        this.level = data?.level ?? ELogLevel.DEBUG;
        this.message = data?.message ?? "No message provided";

        // Serialize content
        let content: string | undefined = undefined;
        if (data?.content) content = typeof data?.content === "string" ? data.content : JSON.stringify(data?.content);

        this.content = content;

        this.timestamp = data?.timestamp ?? Date.now();
    }
}

export class LogSaving extends Log implements ILogSaving {
    breadcrumb: Omit<ILog, "trace">[];

    constructor(data?: Partial<Omit<ILogSaving, "content">> & { content?: unknown }) {
        super(data);
        this.breadcrumb = data?.breadcrumb ?? [];
    }
}
