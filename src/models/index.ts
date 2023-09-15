export interface ILog {
    uuid?: string;
    /**
     * The trace is string to group logs together.
     */
    trace?: string;
    /**
     * Session UUID
     */
    session?: string;
    /**
     * The level of the log.
     * @see ELogLevel
     */
    level?: ELogLevel;
    /**
     * Message
     */
    message: string;
    /**
     * Dynamic log content
     */
    content?: any;
    /**
     * Timestamp in milliseconds
     */
    timestamp?: number;
    /**
     * User reference
     */
    user?: string;
    /**
     * Device details
     */
    device?: any;
}

export enum ELogLevel {
    NOTSET = 0,
    DEBUG = 10,
    INFO = 20,
    WARNING = 30,
    ERROR = 40,
    CRITICAL = 50,
}

export interface IClientLoggerConfig {
    /**
     * Server endpoint to sync logs
     * @default /api/logs
     */
    endpoint: string;
    /**
     * Headers to send to server
     * @default {}
     */
    headers: Record<string, string>;
    /**
     * Minimum log level to save
     * @default ELogLevel.ERROR
     * @see ELogLevel
     */
    logLevel: ELogLevel;
    /**
     * Enable sync logs to server
     * @default true
     */
    enableSync: boolean;
    /**
     * Interval to sync logs to server (in minutes)
     * @default 5
     */
    syncInterval: number;
    /**
     * Sync logs to server in real time when new log is added
     * @default true
     */
    liveSync: boolean;
}
