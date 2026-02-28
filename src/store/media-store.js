import { create } from "zustand";

export const useMediaStore = create((set) => ({
  isMuted: false,
  isDeafened: false,
  isVideoOff: false,
  toggleMute: () =>
    set((state) => {
      // If we are unmuting and we are deafened, we must undeafen as well.
      if (state.isMuted && state.isDeafened) {
        return { isMuted: false, isDeafened: false };
      }
      return { isMuted: !state.isMuted };
    }),
  toggleDeafen: () =>
    set((state) => {
      // If we are deafening, we must also mute.
      if (!state.isDeafened) {
        return { isDeafened: true, isMuted: true };
      }
      // If we are undeafening, we stay muted just like Discord does.
      return { isDeafened: false };
    }),
  toggleVideo: () => set((state) => ({ isVideoOff: !state.isVideoOff })),
}));
