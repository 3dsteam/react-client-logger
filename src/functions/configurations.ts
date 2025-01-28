import { useLogConfigStore, useUploadConfig } from "../store";
import { ILogConfig, ISyncLogConfig, IUploadConfig } from "../models";
import { useSyncLogConfig } from "../store/sync-log-config";

/**
 * Update the log configurations
 * Use this function to update the logLevel, the ignoreLevels, and the breadcrumbs
 * to use for saving logs in the local database
 *
 * @param args
 */
export const updateLogConfig = (args: Partial<ILogConfig>) => {
    useLogConfigStore.getState().updateLogConfig(args);
};

/**
 * Update the upload configurations
 * Use this function to update the endpoint, the headers, the chunk size, and the interval of the upload process
 *
 * @param args
 */
export const updateUploadConfig = (args: Partial<IUploadConfig>) => {
    useUploadConfig.getState().updateUploadConfig(args);
};

/**
 * Update the sync log configurations
 * The log configs can be updated by fetching the configurations from the server.
 * Use this function to enable the process and set the endpoint, and the headers of the request
 *
 * @param args
 */
export const updateSyncLogConfig = (args: Partial<ISyncLogConfig>) => {
    useSyncLogConfig.getState().updateSyncLogConfig(args);
};
