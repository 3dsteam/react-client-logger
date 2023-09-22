import { ReactElement, useCallback, useEffect, useMemo, useState } from "react";
import ClientLoggerContext from "./context";
import { db } from "../db";
import { ELogLevel, IClientLoggerConfig, ILog } from "../models";
import { v4 as uuidV4 } from "uuid";

interface Props extends Partial<IClientLoggerConfig> {
    /**
     * Config for sync configuration from server
     * @default false
     */
    syncConfigs?:
        | {
              /**
               * Server endpoint to sync configs
               * @default /api/logs/config
               */
              endpoint?: string;
              /**
               * Headers to send to server
               * @default {}
               */
              headers?: Record<string, string>;
              /**
               * Enable sync
               * @default true
               */
              enableSync?: boolean;
              /**
               * Sync interval in minutes
               * @default 10
               */
              syncInterval?: number;
              /**
               * Custom response parser
               * @param data API response
               * @returns IClientLoggerConfig
               */
              syncResponseParser?: (data: any) => IClientLoggerConfig;
          }
        | boolean;
    /**
     * Enable debug mode
     * @default false
     */
    debugMode?: boolean;
    children: ReactElement;
}

const SessionUUID = uuidV4();

export default function ClientLoggerProvider({
    endpoint = "/api/logs",
    headers = {},
    logLevel = ELogLevel.ERROR,
    enableSync = true,
    syncInterval = 5,
    liveSync = true,
    syncConfigs = true,
    debugMode = false,
    children,
}: Props) {
    const [ready, setReady] = useState(false);

    // Configuration
    const [config, setConfig] = useState<IClientLoggerConfig>({
        endpoint,
        headers,
        logLevel,
        enableSync,
        syncInterval,
        liveSync,
    });

    // Sync configuration
    const [syncConfigObject, setSyncConfigObject] = useState({
        endpoint: typeof syncConfigs === "object" && syncConfigs.endpoint ? syncConfigs.endpoint : "/api/logs/config",
        headers: typeof syncConfigs === "object" && syncConfigs.headers ? syncConfigs.headers : {},
        enableSync: syncConfigs === true || (typeof syncConfigs === "object" && syncConfigs.enableSync !== false),
        syncInterval: typeof syncConfigs === "object" && syncConfigs.syncInterval ? syncConfigs.syncInterval : 10,
    });

    /**
     * Create new log
     * @param data
     */
    const log = (data: ILog | string) => {
        if (!ready) {
            if (debugMode) {
                console.warn("%c[CLIENT LOG]: %cDatabase not ready", "font-weight: bold", "font-weight: 400");
            }
            return;
        }

        // Parse data to ILog object
        const content: ILog = typeof data === "string" ? { message: data } : data;
        const log: ILog = {
            ...content,
            // Set default values
            uuid: content.uuid || uuidV4(),
            session: content.session || SessionUUID,
            timestamp: content.timestamp || Date.now(),
            level: content.level || ELogLevel.INFO,
        };

        // Check log level
        if (log.level! < config.logLevel) {
            if (debugMode) {
                console.debug("%c[CLIENT LOG]: %cLog level not saved", "font-weight: bold", "font-weight: 400");
            }
            return;
        }

        // Save log
        addLog(log).then(() => {
            if (debugMode) {
                console.groupCollapsed(
                    "%c[CLIENT LOG]: %cNew record",
                    "font-weight: 700",
                    "color: rgb(37 99 235); font-weight: 400",
                );
                console.table(log);
                console.groupEnd();
            }
            // Sync logs to server in real time
            if (config.liveSync) void sync();
        });
    };

    /**
     * Sync logs
     */
    const sync = useCallback(async () => {
        if (!ready) {
            if (debugMode) {
                console.warn("%c[CLIENT LOG]: %cDatabase not ready", "font-weight: bold", "font-weight: 400");
            }
            return;
        } else if (!config.enableSync) {
            if (debugMode) {
                console.warn("%c[CLIENT LOG]: %cSync disabled", "font-weight: bold", "font-weight: 400");
            }
            return;
        }
        // Get logs from database
        const logs = await db.logs.toArray();
        if (logs.length === 0) return;
        // Sync logs to server
        const res = await syncLogsToServer(logs, config.endpoint, config.headers);
        if (res?.ok) {
            if (debugMode) {
                console.groupCollapsed(
                    "%c[CLIENT LOG]: %cLogs synced",
                    "font-weight: 700",
                    "color: rgb(37 99 235); font-weight: 400",
                );
                console.table(log);
                console.groupEnd();
            }
            // Delete synced logs
            void db.logs.bulkDelete(logs.map((log) => log.uuid!));
        }
    }, [config.endpoint, config.headers, config.enableSync, ready]);

    /**
     * Update configuration
     * @param newConfig
     */
    const updateConfig = (newConfig: Partial<IClientLoggerConfig>) => {
        if (debugMode) {
            console.groupCollapsed(
                "%c[CLIENT LOG]: %cUpdate config",
                "font-weight: 700",
                "color: rgb(37 99 235); font-weight: 400",
            );
            console.table({ ...config, ...newConfig });
            console.groupEnd();
        }
        // Update configuration
        setConfig((prev) => ({ ...prev, ...newConfig }));
    };

    /**
     * Sync configuration
     */
    const syncConfig = useCallback(async () => {
        if (!syncConfigObject.enableSync) return;
        // Get new configs from server
        const res = await syncConfigsFromServer(syncConfigObject.endpoint, syncConfigObject.headers);
        if (res?.ok) {
            const data = await res.json();
            let newConfig: Partial<IClientLoggerConfig> = {};
            // Check if there is a custom parser
            if (typeof syncConfigs === "object" && syncConfigs.syncResponseParser) {
                // Parse data with custom parser
                newConfig = { ...syncConfigs.syncResponseParser(data) };
            } else {
                // Parse data
                if (data.endpoint) newConfig.endpoint = data.endpoint;
                if (data.headers) newConfig.headers = data.headers;
                if (data.logLevel) newConfig.logLevel = data.logLevel;
                if (data.enableSync) newConfig.enableSync = data.enableSync;
                if (data.syncInterval) newConfig.syncInterval = data.syncInterval;
                if (typeof data.liveSync === "boolean") newConfig.liveSync = data.liveSync;
            }

            if (debugMode) {
                console.groupCollapsed(
                    "%c[CLIENT LOG]: %cSynced config",
                    "font-weight: 700",
                    "color: rgb(37 99 235); font-weight: 400",
                );
                console.table(newConfig);
                console.groupEnd();
            }

            // Update configuration
            updateConfig(newConfig);
        }
    }, [syncConfigObject.enableSync, syncConfigObject.endpoint, syncConfigObject.headers]);

    // Wait for database ready
    useEffect(() => void db.on("ready", () => void setReady(true)), []);

    // Sync interval
    useEffect(() => {
        if (!ready || !config.enableSync) return;
        // Sync logs to server
        void sync();
        // Sync interval
        const interval = setInterval(() => void sync(), 1000 * 60 * config.syncInterval);
        return () => clearInterval(interval);
    }, [ready, config.enableSync, config.syncInterval, sync]);

    // Sync configs interval
    useEffect(() => {
        if (!syncConfigObject.enableSync) return;
        // Sync configs from server
        void syncConfig();
        // Sync interval
        const interval = setInterval(() => void syncConfig(), 1000 * 60 * syncConfigObject.syncInterval);
        return () => clearInterval(interval);
    }, [syncConfigObject.enableSync, syncConfigObject.syncInterval, syncConfig]);

    // Prevent re-render on config change
    const Children = useMemo(() => children, [children]);

    return (
        <ClientLoggerContext.Provider value={{ log, sync, updateConfig, syncConfig }}>
            {Children}
        </ClientLoggerContext.Provider>
    );
}

/**
 * Add log to database
 * @param log
 */
const addLog = async (log: ILog) => {
    try {
        // Save log to database
        return await db.logs.add(log);
    } catch (e) {
        // Log to console
        console.groupCollapsed(
            "%c[CLIENT LOG]: %cError record creation",
            "font-weight: bold",
            "color: rgb(220 38 38); font-weight: 400",
        );
        console.log(log);
        console.error(e);
        console.groupEnd();
    }
};

/**
 * Sync logs to server
 * @param logs Logs to sync
 * @param endpoint Server endpoint
 * @param headers Headers to send to server
 */
const syncLogsToServer = async (logs: ILog[], endpoint: string, headers: Record<string, string>) => {
    try {
        return await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...headers,
            },
            body: JSON.stringify(logs),
        });
    } catch (e) {
        // Log to console
        console.groupCollapsed(
            "%c[CLIENT LOG]: %cError sync logs",
            "font-weight: bold",
            "color: rgb(220 38 38); font-weight: 400",
        );
        console.log(logs);
        console.error(e);
        console.groupEnd();
    }
};

/**
 * Sync configs from server
 * @param endpoint Server endpoint
 * @param headers Headers to send to server
 */
const syncConfigsFromServer = async (endpoint: string, headers: Record<string, string>) => {
    try {
        return await fetch(endpoint, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                ...headers,
            },
        });
    } catch (e) {
        // Log to console
        console.groupCollapsed(
            "%c[CLIENT LOG]: %cError sync configs",
            "font-weight: bold",
            "color: rgb(220 38 38); font-weight: 400",
        );
        console.error(e);
        console.groupEnd();
    }
};
