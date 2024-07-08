import { ELogLevel, ILogSaving } from "./log";

export interface IClientLoggerConfig {
    /**
     * Minimum log level to save
     * @default ELogLevel.ERROR
     */
    logLevel?: ELogLevel;
    /**
     * Logs with level under or equal this will be ignored
     * @see ELogLevel
     * @default ELogLevel.DEBUG
     */
    ignoreLevels?: ELogLevel;
    /**
     * Maximum breadcrumbs to save
     * @default 50
     */
    breadcrumbs?: number;
}

export interface ILogSyncerConfig {
    /**
     * Server endpoint to sync logs
     * @default /api/logs
     */
    endpoint?: string;
    /**
     * Headers to send to server
     * @default {"Content-Type": "application/json"}
     */
    headers?: Record<string, string>;
    /**
     * Maximum logs to sync
     * @default 10
     */
    chunk?: number;
    /**
     * Interval in milliseconds to sync logs
     * @default 60000
     */
    interval?: number;
    /**
     * Custom parser to sync logs
     * @default undefined
     */
    parser?: (logs: ILogSaving[]) => unknown;
}
