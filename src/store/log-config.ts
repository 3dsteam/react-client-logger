import { create } from "zustand";
import { ELogLevel, ILogConfig } from "../models";

interface IActions {
    updateLogConfig: (config: Partial<ILogConfig>) => void;
}

export const useLogConfigStore = create<ILogConfig & IActions>((set) => ({
    logLevel: ELogLevel.ERROR,
    ignoreLevels: ELogLevel.DEBUG,
    breadcrumbs: 50,

    // Actions
    updateLogConfig: (config) => set(config),
}));
