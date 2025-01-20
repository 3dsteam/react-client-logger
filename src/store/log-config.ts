import { create } from "zustand";
import { ELogLevel, ILogConfig } from "../models";
import { persist } from "zustand/middleware";

interface IActions {
    updateLogConfig: (config: Partial<ILogConfig>) => void;
}

export const useLogConfigStore = create(
    persist<ILogConfig & IActions>(
        (set) => ({
            logLevel: ELogLevel.ERROR,
            ignoreLevels: ELogLevel.DEBUG,
            breadcrumbs: 50,

            // Actions
            updateLogConfig: (config) => set(config),
        }),
        { name: "client-logger-log-config" },
    ),
);
