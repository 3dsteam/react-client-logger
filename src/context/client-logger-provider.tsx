import { PropsWithChildren, useCallback, useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { useClientLoggerStore, useLogConfigStore, useUploadConfig } from "../store";
import { overrideConsole } from "../functions";
import { useSyncLogConfig } from "../store/sync-log-config";
import { ILogConfig, ISyncLogConfig, IUploadConfig } from "../models";

interface IClientLoggerProviderProps extends PropsWithChildren {
    /**
     * Override console methods
     * ATTETION: this function can't be undone once called
     * @default false
     */
    overrideConsole?: boolean;
    /**
     * Log configurations defaults
     * @default undefined
     * @see ILogConfig
     */
    logConfig?: ILogConfig;
    /**
     * Upload configurations defaults
     * @default undefined
     * @see IUploadConfig
     */
    uploadConfig?: IUploadConfig;
    /**
     * Sync log configurations defaults
     * If defined, the sync configuration will be set as enabled
     * @default undefined
     * @see ISyncLogConfig
     */
    syncLogConfig?: Omit<ISyncLogConfig, "enabled">;
}

export const ClientLoggerProvider = ({ children, ...props }: IClientLoggerProviderProps) => {
    const database = useClientLoggerStore((state) => state.database);
    const logSaving = useLiveQuery(() => database.uploads.toArray());

    // Override console
    useEffect(() => overrideConsole(props.overrideConsole), [props.overrideConsole]);

    const updateLogConfig = useLogConfigStore((state) => state.updateLogConfig);
    const updateUploadConfig = useUploadConfig((state) => state.updateUploadConfig);
    const updateSyncLogConfig = useSyncLogConfig((state) => state.updateSyncLogConfig);

    // Set default configurations
    useEffect(() => {
        if (!props.logConfig) return;
        // Update log configurations
        updateLogConfig(props.logConfig);
    }, [props.logConfig]);

    useEffect(() => {
        if (!props.uploadConfig) return;
        // Update upload configurations
        updateUploadConfig(props.uploadConfig);
    }, [props.uploadConfig]);

    useEffect(() => {
        if (!props.syncLogConfig) return;
        // Update sync configurations
        updateSyncLogConfig({ enabled: true, ...props.syncLogConfig });
    }, [props.syncLogConfig]);

    // Sync log configurations
    const syncLogEnabled = useSyncLogConfig((state) => state.enabled);
    const syncLogEndpoint = useSyncLogConfig((state) => state.endpoint);
    const syncLogHeaders = useSyncLogConfig((state) => state.headers);

    const syncLogConfigs = useCallback(async () => {
        if (!syncLogEnabled) return;
        try {
            const res = await fetch(syncLogEndpoint, { method: "GET", headers: syncLogHeaders });
            const json = await res.json();
            // Update log configurations
            updateLogConfig({
                logLevel: json.data.logLevel,
                ignoreLevels: json.data.ignoreLevels,
                breadcrumbs: json.data.breadcrumbs,
            });
            // Update sync configurations
            updateUploadConfig({
                chunk: json.data.chunkSize,
            });
        } catch (error) {
            console._error("Sync log configurations failed", error);
        }
    }, [syncLogEnabled, syncLogEndpoint, syncLogHeaders, updateLogConfig, updateUploadConfig]);

    useEffect(() => {
        void syncLogConfigs();
    }, [syncLogConfigs]);

    // Upload configurations
    const endpoint = useUploadConfig((state) => state.endpoint);
    const headers = useUploadConfig((state) => state.headers);
    const timeout = useUploadConfig((state) => state.interval);
    const chunk = useUploadConfig((state) => state.chunk);

    const syncLogs = useCallback(async () => {
        if (!logSaving?.length) return;
        // Split logs into chunks
        const chunks = [];
        for (let i = 0; i < logSaving.length; i += chunk) {
            chunks.push(logSaving.slice(i, i + chunk));
        }
        // Sync each chunk
        for (const chunk of chunks) {
            try {
                // Send logs to server
                const res = await fetch(endpoint, {
                    method: "POST",
                    headers,
                    body: JSON.stringify(chunk),
                });

                if (!res.ok) {
                    console._error("Log sync failed", res);
                    return;
                }

                // Remove synced logs
                await database.uploads.bulkDelete(chunk.map((log) => log.uuid));
            } catch (error) {
                console._error("Log sync failed", error);
            }
        }
    }, [logSaving, database.uploads, endpoint, headers, chunk]);

    useEffect(() => {
        void syncLogs();
        // Sync interval
        const interval = setInterval(() => void syncLogs(), timeout);
        return () => clearInterval(interval);
    }, [syncLogs, timeout]);

    return children;
};
