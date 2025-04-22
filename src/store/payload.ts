import { Device, DeviceInfo } from "@capacitor/device";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type PayloadDevice = Pick<DeviceInfo, "name" | "model" | "platform" | "osVersion" | "manufacturer">;

interface IState {
    appId: string;
    appVersion: string | null;
    userId: string | null;
    device: PayloadDevice | null;
}

interface IActions {
    setAppId: (appId: string) => void;

    setAppVersion: (appVersion: string) => void;
    clearAppVersion: () => void;

    setUserId: (userId: string) => void;
    clearUserId: () => void;

    setDeviceInformation: () => Promise<void>;

    getPayload: () => { appId: string; appVersion: string | null; userId: string | null; device: PayloadDevice | null };
}

export const usePayload = create<IState & IActions>()(
    persist(
        (set, get) => ({
            appId: "none",
            appVersion: null,
            userId: null,
            device: null,

            setAppId: (appId) => set({ appId }),

            setAppVersion: (appVersion) => set({ appVersion }),
            clearAppVersion: () => set({ appVersion: null }),

            setUserId: (userId) => set({ userId }),
            clearUserId: () => set({ userId: null }),

            setDeviceInformation: async () => {
                const { name, model, platform, osVersion, manufacturer } = await Device.getInfo();
                set({ device: { name, model, platform, osVersion, manufacturer } });
            },

            getPayload: () => {
                const { appId, appVersion, userId, device } = get();
                return { appId, appVersion, userId, device };
            },
        }),
        { name: "client-logger-payload" },
    ),
);
