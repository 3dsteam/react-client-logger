import { createContext, PropsWithChildren, useCallback, useEffect, useMemo } from "react";
import { ClientLoggerDB } from "../models/client-logger-db";
import { ELogLevel, Log, LogSaving } from "../models/log";
import { nanoid } from "nanoid";
import { LogSyncerProvider } from "./log-syncer";
import { IClientLoggerConfig, ILogSyncerConfig } from "../models/configs";

export const ClientLoggerContext = createContext<{
    log: (message: string, level: ELogLevel) => void;
}>({
    log: () => {},
});

interface IClientLoggerProviderProps extends PropsWithChildren {
    /**
     * Enable log saving
     * @default !import.meta.env.DEV
     */
    enabled?: boolean;
    /**
     * Override console functions
     * @default true
     */
    overrideConsoleFunctions?: boolean;
    config?: IClientLoggerConfig;
    syncConfig?: ILogSyncerConfig;
}

export const ClientLoggerProvider = (props: IClientLoggerProviderProps) => {
    const db = useMemo(() => new ClientLoggerDB(), []);
    const trace = useMemo(() => nanoid(10), []);

    const isEnabled = useMemo(() => props.enabled ?? true, [props.enabled]);
    const config = useMemo(
        () => ({
            level: props.config?.logLevel ?? ELogLevel.ERROR,
            ignoreLevels: props.config?.ignoreLevels ?? ELogLevel.DEBUG,
            breadcrumbs: props.config?.breadcrumbs ?? 50,
        }),
        [props.config],
    );

    useEffect(() => {
        // Config alarm
        if (config.level <= config.ignoreLevels) {
            console.warn("logLevel is lower than ignoreLevels. Some logs will not be saved.");
        }
    }, [config]);

    const handleOnLog = useCallback(
        async (message: string | undefined, level: ELogLevel) => {
            // Skip ignored levels
            if (!isEnabled || level <= config.ignoreLevels) return;

            // Check log level
            if (level >= config.level) {
                // Get breadcrumb trail
                const breadcrumb = await db.logs
                    .where("trace")
                    .equals(trace)
                    .reverse()
                    .limit(config.breadcrumbs)
                    .toArray();
                // Save log to indexedDB
                await db.uploads.add(
                    new LogSaving({
                        message,
                        level,
                        // Add breadcrumb trail
                        breadcrumb,
                    }),
                );
            }

            // Save log to indexedDB
            await db.logs.add(
                new Log({
                    trace,
                    message,
                    level,
                }),
            );

            // Check current logs length
            const logsLength = await db.logs.count();
            if (logsLength > config.breadcrumbs) {
                // Remove old logs
                await db.logs.orderBy("timestamp").limit(1).delete();
            }
        },
        [db, config, trace, isEnabled],
    );

    const myConsole = useCallback(
        (console: Console) => {
            // Override console functions
            return {
                ...console,
                debug: async (message: string, ...args: unknown[]) => {
                    console.debug(message, ...args);
                    // Log to indexedDB
                    await handleOnLog(message, ELogLevel.DEBUG);
                },
                _debug: (...args: unknown[]) => {
                    console.debug(args);
                },
                log: async (message: string, ...args: unknown[]) => {
                    console.log(message, ...args);
                    // Log to indexedDB
                    await handleOnLog(message, ELogLevel.INFO);
                },
                _log: (...args: unknown[]) => {
                    console.debug(args);
                },
                warn: async (message: string, ...args: unknown[]) => {
                    console.warn(message, ...args);
                    // Log to indexedDB
                    await handleOnLog(message, ELogLevel.WARNING);
                },
                _warn: (...args: unknown[]) => {
                    console.debug(args);
                },
                error: async (message: string, ...args: unknown[]) => {
                    console.error(message, ...args);
                    // Log to indexedDB
                    await handleOnLog(message, ELogLevel.ERROR);
                },
                _error: (...args: unknown[]) => {
                    console.error(args);
                },
                critical: async (message: string, ...args: unknown[]) => {
                    console.error(message, ...args);
                    // Log to indexedDB
                    await handleOnLog(message, ELogLevel.CRITICAL);
                },
            };
        },
        [db, handleOnLog],
    );

    useEffect(() => {
        if (props.overrideConsoleFunctions === false) return;
        // Override console functions
        window.console = myConsole(window.console);
        // Catch uncaught errors
        window.onerror = async (message, source, lineno, colno, error) => {
            console.error("Uncaught error", { message, source, lineno, colno, error });
        };
        // Catch unhandled promise rejections
        window.onunhandledrejection = async (event) => {
            console.error("Unhandled promise rejection", event);
        };
    }, [props.overrideConsoleFunctions, myConsole]);

    return (
        <ClientLoggerContext.Provider value={{ log: handleOnLog }}>
            <LogSyncerProvider db={db} config={props.syncConfig}>
                {props.children}
            </LogSyncerProvider>
        </ClientLoggerContext.Provider>
    );
};
