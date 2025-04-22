import { ELogLevel, ILogMessage, Log, LogSaving } from "../models";
import { useClientLoggerStore, useLogConfigStore } from "../store";
import { usePayload } from "../store/payload";

export const log = async (args: ILogMessage) => {
    const { database, trace, isEnabled } = useClientLoggerStore.getState();
    const { logLevel, ignoreLevels, breadcrumbs } = useLogConfigStore.getState();
    const getPayload = usePayload.getState().getPayload;

    const LEVEL = args.level ?? ELogLevel.DEBUG;
    if (!isEnabled || LEVEL <= ignoreLevels) return; // Skip

    const payload = getPayload();

    // Upload logger if level is higher than or equal to the config level
    if (LEVEL >= logLevel) {
        // Get breadcrumb trail
        const breadcrumb = await database.logs.where("trace").equals(trace).toArray();
        // Save logger
        database.uploads.add(
            new LogSaving({
                ...args,
                trace,
                // Add payload
                content: {
                    data: args.content,
                    payload,
                },
                // Add breadcrumb trail
                breadcrumb,
            }),
        );
    }

    // Save logger
    await database.logs.add(
        new Log({
            ...args,
            trace,
            // Add payload
            content: {
                data: args.content,
                payload,
            },
        }),
    );

    // Remove old logs
    const logsLength = await database.logs.count();
    if (logsLength > breadcrumbs) await database.logs.orderBy("timestamp").limit(1).delete();
};
