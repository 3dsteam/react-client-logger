export interface ISyncLogConfig {
    /**
     * Enable sync of logs configurations
     * @default false
     */
    enabled: boolean;
    /**
     * Server endpoint to sync logs
     * @default /config-logs
     */
    endpoint: string;
    /**
     * Headers to send to server
     * @default {"Content-Type": "application/json"}
     */
    headers: Record<string, string>;
}
