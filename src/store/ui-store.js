import { create } from "zustand";

export const useUIStore = create((set) => ({
  memberSidebarOpen: true,
  toggleMemberSidebar: () =>
    set((s) => ({ memberSidebarOpen: !s.memberSidebarOpen })),
  mobileOpen: false,
  setMobileOpen: (v) => set({ mobileOpen: v }),
}));
