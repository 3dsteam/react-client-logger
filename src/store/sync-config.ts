import { create } from "zustand";
import { ISyncerConfig } from "../models";
import { persist } from "zustand/middleware";

interface IActions {
    updateSyncConfig: (config: Partial<ISyncerConfig>) => void;
}

export const userSyncConfigStore = create(
    persist<ISyncerConfig & IActions>(
        (set) => ({
            endpoint: "/api/logs",
            headers: { "Content-Type": "application/json" },
            chunk: 10,
            interval: 60000,

            // Actions
            updateSyncConfig: (config) => set(config),
        }),
        { name: "client-logger-sync-config" },
    ),
);
