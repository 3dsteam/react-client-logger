import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ISyncLogConfig } from "../models";

interface IActions {
    updateSyncLogConfig: (config: Partial<ISyncLogConfig>) => void;
}

export const useSyncLogConfig = create(
    persist<ISyncLogConfig & IActions>(
        (set) => ({
            enabled: false,
            endpoint: "/config-logs",
            headers: { "Content-Type": "application/json" },

            // Actions
            updateSyncLogConfig: (config) => set(config),
        }),
        { name: "client-logger-sync-log-config" },
    ),
);
