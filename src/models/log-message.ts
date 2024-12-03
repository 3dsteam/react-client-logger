import { ELogLevel } from "./log";

export interface ILogMessage {
    /**
     * Log message content
     */
    message: string;
    /**
     * Log level
     * @default ELogLevel.DEBUG
     */
    level?: ELogLevel;
    /**
     * Dynamic logger content
     * @default undefined
     */
    content?: unknown;
}
