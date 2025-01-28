export interface IUploadConfig {
    /**
     * Server endpoint to sync logs
     * @default /api/logs
     */
    endpoint: string;
    /**
     * Headers to send to server
     * @default {"Content-Type": "application/json"}
     */
    headers: Record<string, string>;
    /**
     * Maximum logs to sync
     * @default 10
     */
    chunk: number;
    /**
     * Interval in milliseconds to sync logs
     * @default 60000
     */
    interval: number;
}
