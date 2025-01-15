import { log } from "./log";
import { ELogLevel } from "../models";

export const overrideConsole = () => {
    const ORIGINAL = window.console;
    // Override logger functions
    window.console = {
        ...ORIGINAL,
        debug: async (message: string, ...args: unknown[]) => {
            void ORIGINAL.debug(message, ...args);
            // Log to indexedDB
            await log({ message, level: ELogLevel.DEBUG, content: args });
        },
        _debug: (...args: unknown[]) => {
            ORIGINAL.debug(args);
        },
        log: async (message: string, ...args: unknown[]) => {
            void ORIGINAL.log(message, ...args);
            // Log to indexedDB
            await log({ message, level: ELogLevel.INFO, content: args });
        },
        _log: (...args: unknown[]) => {
            ORIGINAL.log(args);
        },
        warn: async (message: string, ...args: unknown[]) => {
            void ORIGINAL.warn(message, ...args);
            // Log to indexedDB
            await log({ message, level: ELogLevel.WARNING, content: args });
        },
        _warn: (...args: unknown[]) => {
            ORIGINAL.warn(args);
        },
        error: async (message: string, ...args: unknown[]) => {
            void ORIGINAL.error(message, ...args);
            // Log to indexedDB
            await log({ message, level: ELogLevel.ERROR, content: args });
        },
        _error: (...args: unknown[]) => {
            ORIGINAL.error(args);
        },
        critical: async (message: string, ...args: unknown[]) => {
            void ORIGINAL.error(message, ...args);
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
