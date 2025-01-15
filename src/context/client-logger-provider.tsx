import { PropsWithChildren, useCallback, useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { useClientLoggerStore, userSyncConfigStore } from "../store";
import { overrideConsole } from "../functions";

interface IClientLoggerProviderProps extends PropsWithChildren {
    /**
     * Override console methods
     * ATTETION: this function can't be undone once called
     * @default false
     */
    overrideConsole?: boolean;
}

export const ClientLoggerProvider = ({ children, ...props }: IClientLoggerProviderProps) => {
    const database = useClientLoggerStore((state) => state.database);
    const logSaving = useLiveQuery(() => database.uploads.toArray());

    // Override console
    useEffect(() => {
        if (props.overrideConsole) overrideConsole();
    }, [props.overrideConsole]);

    // Sync configurations
    const endpoint = userSyncConfigStore((state) => state.endpoint);
    const headers = userSyncConfigStore((state) => state.headers);
    const timeout = userSyncConfigStore((state) => state.interval);
    const chunk = userSyncConfigStore((state) => state.chunk);

    const sync = useCallback(async () => {
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
        void sync();
        // Sync interval
        const interval = setInterval(() => void sync(), timeout);
        return () => clearInterval(interval);
    }, [sync, timeout]);

    return children;
};
