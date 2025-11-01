import { create } from "zustand";

export const useSidebarStore = create((set) => ({
  sidebarMode: "chat", 
  setSidebarMode: (mode) => set({ sidebarMode: mode }),
}));
