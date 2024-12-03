import { DB, isEnabledAtom, logConfigAtom, syncConfigAtom, TRACE } from "./store";
import { ELogLevel, Log, LogSaving, ILogConfig, ILogMessage, ISyncerConfig } from "./models";
import { createStore } from "jotai/index";

const store = createStore();

export const log = async (args: ILogMessage) => {
    const LEVEL = args.level ?? ELogLevel.DEBUG;
    if (!store.get(isEnabledAtom) || LEVEL <= store.get(logConfigAtom).ignoreLevels) return; // Skip ignored levels

    // Upload logger if level is higher than or equal to the config level
    if (LEVEL >= store.get(logConfigAtom).logLevel) {
        // Get breadcrumb trail
        const breadcrumb = await store.get(DB).logs.where("trace").equals(store.get(TRACE)).toArray();
        // Save logger
        store.get(DB).uploads.add(
            new LogSaving({
                ...args,
                // Add breadcrumb trail
                breadcrumb,
            }),
        );
    }

    // Save logger
    await store.get(DB).logs.add(
        new Log({
            ...args,
            // Add breadcrumb trail
            trace: store.get(TRACE),
        }),
    );

    // Remove old logs
    const logsLength = await store.get(DB).logs.count();
    if (logsLength > store.get(logConfigAtom).breadcrumbs)
        await store.get(DB).logs.orderBy("timestamp").limit(1).delete();
};

export const overrideConsole = () => {
    // Override logger functions
    window.console = {
        ...window.console,
        debug: async (message: string, ...args: unknown[]) => {
            window.console.debug(message, ...args);
            // Log to indexedDB
            await log({ message, level: ELogLevel.DEBUG, content: args });
        },
        _debug: (...args: unknown[]) => {
            window.console.debug(args);
        },
        log: async (message: string, ...args: unknown[]) => {
            window.console.log(message, ...args);
            // Log to indexedDB
            await log({ message, level: ELogLevel.INFO, content: args });
        },
        _log: (...args: unknown[]) => {
            window.console.log(args);
        },
        warn: async (message: string, ...args: unknown[]) => {
            window.console.warn(message, ...args);
            // Log to indexedDB
            await log({ message, level: ELogLevel.WARNING, content: args });
        },
        _warn: (...args: unknown[]) => {
            window.console.warn(args);
        },
        error: async (message: string, ...args: unknown[]) => {
            window.console.error(message, ...args);
            // Log to indexedDB
            await log({ message, level: ELogLevel.ERROR, content: args });
        },
        _error: (...args: unknown[]) => {
            window.console.error(args);
        },
        critical: async (message: string, ...args: unknown[]) => {
            window.console.error(message, ...args);
            // Log to indexedDB
            await log({ message, level: ELogLevel.CRITICAL, content: args });
        },
    };
    // Catch uncaught errors
    window.onerror = async (message, source) => {
        await log({ message: "Uncaught error", level: ELogLevel.ERROR, content: { message, source } });
    };
    // Catch unhandled promise rejections
    window.onunhandledrejection = async (event) => {
        await log({ message: "Unhandled promise rejection", level: ELogLevel.ERROR, content: event.reason });
    };
};

export const setLogConfig = (args: Partial<ILogConfig>) => {
    store.set(logConfigAtom, (prev) => ({ ...prev, ...args }));
};

export const setSyncConfig = (args: Partial<ISyncerConfig>) => {
    store.set(syncConfigAtom, (prev) => ({ ...prev, ...args }));
};
