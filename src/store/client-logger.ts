import { create } from "zustand";
import { ClientLoggerDB } from "../models";
import { nanoid } from "nanoid";

interface IState {
    database: ClientLoggerDB;
    trace: string;
    isEnabled: boolean;
}

interface IActions {
    enable: () => void;
    disable: () => void;
}

export const useClientLoggerStore = create<IState & IActions>((set) => ({
    database: new ClientLoggerDB(),
    trace: nanoid(5),
    isEnabled: true,

    // Actions
    enable: () => set({ isEnabled: true }),
    disable: () => set({ isEnabled: false }),
}));
