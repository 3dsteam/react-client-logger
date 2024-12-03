import { PropsWithChildren, useCallback, useEffect } from "react";
import { useAtomValue } from "jotai/index";
import { useLiveQuery } from "dexie-react-hooks";
import { DB, syncConfigAtom } from "../store";

export const ClientLoggerProvider = ({ children }: PropsWithChildren) => {
    const ClientLoggerDB = useAtomValue(DB);
    const SyncConfig = useAtomValue(syncConfigAtom);

    const logSaving = useLiveQuery(() => ClientLoggerDB.uploads.toArray());

    const sync = useCallback(async () => {
        if (!logSaving?.length) return;
        // Split logs into chunks
        const chunks = [];
        for (let i = 0; i < logSaving.length; i += SyncConfig.chunk) {
            chunks.push(logSaving.slice(i, i + SyncConfig.chunk));
        }
        // Sync each chunk
        for (const chunk of chunks) {
            try {
                // Send logs to server
                const res = await fetch(SyncConfig.endpoint, {
                    method: "POST",
                    headers: SyncConfig.headers,
                    body: JSON.stringify(chunk),
                });

                if (!res.ok) {
                    console._error("Log sync failed", res);
                    return;
                }

                // Remove synced logs
                await ClientLoggerDB.uploads.bulkDelete(chunk.map((log) => log.uuid));
            } catch (error) {
                console._error("Log sync failed", error);
            }
        }
    }, [SyncConfig, logSaving]);

    useEffect(() => {
        void sync();
        // Sync interval
        const interval = setInterval(() => void sync(), SyncConfig.interval);
        return () => clearInterval(interval);
    }, [sync, SyncConfig]);

    return children;
};
