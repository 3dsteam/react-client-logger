import { ELogLevel } from "./log";

export interface ILogConfig {
    /**
     * Minimum logger level to save
     * @default ELogLevel.ERROR
     */
    logLevel: ELogLevel;
    /**
     * Logs with level under or equal this will be ignored
     * @see ELogLevel
     * @default ELogLevel.DEBUG
     */
    ignoreLevels: ELogLevel;
    /**
     * Maximum breadcrumbs to save
     * @default 50
     */
    breadcrumbs: number;
}
