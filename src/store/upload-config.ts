import { create } from "zustand";
import { IUploadConfig } from "../models";
import { persist } from "zustand/middleware";

interface IActions {
    updateUploadConfig: (config: Partial<IUploadConfig>) => void;
}

export const useUploadConfig = create(
    persist<IUploadConfig & IActions>(
        (set) => ({
            endpoint: "/api/logs",
            headers: { "Content-Type": "application/json" },
            chunk: 10,
            interval: 60000,

            // Actions
            updateUploadConfig: (config) => set(config),
        }),
        { name: "client-logger-upload-config" },
    ),
);
