import { createContext, useCallback, useContext } from "react";
import { IClientLoggerConfig, ILog } from "../models";

interface Context {
    log: (log: ILog | string) => void;
    sync: () => Promise<void>;
    updateConfig: (config: IClientLoggerConfig) => void;
    syncConfig: () => Promise<void>;
}

const ClientLoggerContext = createContext<Context>({
    log: () => console.warn("ClientLoggerContext not implemented"),
    sync: () => {
        console.warn("ClientLoggerContext not implemented");
        return Promise.resolve();
    },
    updateConfig: () => console.warn("ClientLoggerContext not implemented"),
    syncConfig: () => {
        console.warn("ClientLoggerContext not implemented");
        return Promise.resolve();
    },
});

export default ClientLoggerContext;
export const useClientLogger = () => useContext(ClientLoggerContext);
