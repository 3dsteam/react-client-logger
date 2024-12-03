import { atom } from "jotai";
import { ClientLoggerDB, ELogLevel, ILogConfig, ISyncerConfig } from "./models";
import { nanoid } from "nanoid";

// Main atoms
export const DB = atom(new ClientLoggerDB());
export const TRACE = atom(nanoid(10));

// Enable service
export const isEnabledAtom = atom(true);

// Log configuration
export const logConfigAtom = atom<ILogConfig>({
    logLevel: ELogLevel.ERROR,
    ignoreLevels: ELogLevel.DEBUG,
    breadcrumbs: 50,
});

// Sync configuration
export const syncConfigAtom = atom<ISyncerConfig>({
    endpoint: "/api/logs",
    headers: { "Content-Type": "application/json" },
    chunk: 10,
    interval: 60000,
});
