import { PropsWithChildren, useCallback, useEffect, useMemo } from "react";
import { ClientLoggerDB } from "../models/client-logger-db";
import { useLiveQuery } from "dexie-react-hooks";
import { ILogSaving } from "../models/log";
import { ILogSyncerConfig } from "../models/configs";

interface ILogSyncerProviderProps extends PropsWithChildren {
    db: ClientLoggerDB;
    config?: ILogSyncerConfig;
}

export const LogSyncerProvider = (props: ILogSyncerProviderProps) => {
    const logSaving = useLiveQuery(() => props.db.uploads.toArray());

    const config = useMemo(
        () => ({
            endpoint: props.config?.endpoint ?? "/api/logs",
            headers: props.config?.headers ?? { "Content-Type": "application/json" },
            limit: props.config?.chunk ?? 10,
            interval: props.config?.interval ?? 60000,
            parser: props.config?.parser ?? ((logs: ILogSaving[]) => ({ logs })),
        }),
        [props.config],
    );

    const sync = useCallback(async () => {
        if (!logSaving?.length) return;
        // Split logs into chunks
        const chunks = [];
        for (let i = 0; i < logSaving.length; i += config.limit) {
            chunks.push(logSaving.slice(i, i + config.limit));
        }
        // Sync each chunk
        for (const chunk of chunks) {
            try {
                // Send logs to server
                const res = await fetch(config.endpoint, {
                    method: "POST",
                    headers: config.headers,
                    body: JSON.stringify(config.parser(chunk)),
                });

                if (!res.ok) {
                    console._error("Log sync failed", res);
                    return;
                }

                // Remove synced logs
                await props.db.uploads.bulkDelete(chunk.map((log) => log.uuid));
            } catch (error) {
                console._error("Log sync failed", error);
            }
        }
    }, [props.db, config, logSaving]);

    useEffect(() => {
        void sync();
        // Sync interval
        const interval = setInterval(() => void sync(), config.interval);
        return () => clearInterval(interval);
    }, [sync, config]);

    return <>{props.children}</>;
};
