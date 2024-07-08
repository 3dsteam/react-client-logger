import { nanoid } from "nanoid";

export interface ILog {
    uuid: string;
    /**
     * Session UUID
     */
    trace: string;
    /**
     * The level of the log.
     */
    level: ELogLevel;
    /**
     * Message
     */
    message: string;
    /**
     * Dynamic log content
     */
    content?: unknown;
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
    content?: unknown;
    timestamp?: number;

    constructor(data?: Partial<ILog>) {
        this.uuid = data?.uuid ?? nanoid(5);
        this.trace = data?.trace ?? nanoid(10);
        this.level = data?.level ?? ELogLevel.DEBUG;
        this.message = data?.message ?? "No message provided";
        this.content = data?.content ?? undefined;
        this.timestamp = data?.timestamp ?? Date.now();
    }
}

export class LogSaving extends Log implements ILogSaving {
    breadcrumb: Omit<ILog, "trace">[];

    constructor(data?: Partial<ILogSaving>) {
        super(data);
        this.breadcrumb = data?.breadcrumb ?? [];
    }
}
