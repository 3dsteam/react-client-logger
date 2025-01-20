import { PropsWithChildren, useCallback, useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { useClientLoggerStore, useLogConfigStore, userSyncConfigStore } from "../store";
import { overrideConsole } from "../functions";

interface IClientLoggerProviderProps extends PropsWithChildren {
    /**
     * Override console methods
     * ATTETION: this function can't be undone once called
     * @default false
     */
    overrideConsole?: boolean;

    /**
     * Sync the ClientLogger configurations
     */
    syncConfigurations?: {
        /**
         * Sync endpoint
         */
        endpoint: string;
        /**
         * Sync headers
         */
        headers: Record<string, string>;
    };
}

export const ClientLoggerProvider = ({ children, ...props }: IClientLoggerProviderProps) => {
    const database = useClientLoggerStore((state) => state.database);
    const logSaving = useLiveQuery(() => database.uploads.toArray());

    const updateLogConfig = useLogConfigStore((state) => state.updateLogConfig);
    const updateSyncConfig = userSyncConfigStore((state) => state.updateSyncConfig);

    // Override console
    useEffect(() => overrideConsole(props.overrideConsole), [props.overrideConsole]);

    // Sync configurations
    const endpoint = userSyncConfigStore((state) => state.endpoint);
    const headers = userSyncConfigStore((state) => state.headers);
    const timeout = userSyncConfigStore((state) => state.interval);
    const chunk = userSyncConfigStore((state) => state.chunk);

    const syncConfigurations = useCallback(async () => {
        if (!props.syncConfigurations) return; // No configurations sync
        // Load configurations
        try {
            const res = await fetch(props.syncConfigurations.endpoint, {
                method: "GET",
                headers: props.syncConfigurations.headers,
            });
            const json = await res.json();
            // Update log configurations
            updateLogConfig({
                logLevel: json.data.logLevel,
                ignoreLevels: json.data.ignoreLevels,
                breadcrumbs: json.data.breadcrumbs,
            });
            // Update sync configurations
            updateSyncConfig({
                chunk: json.data.chunkSize,
            });
        } catch (error) {
            console._error("Sync configurations failed", error);
        }
    }, [props.syncConfigurations]);

    useEffect(() => {
        void syncConfigurations();
    }, [syncConfigurations]);

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
