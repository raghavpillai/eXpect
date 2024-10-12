import { create } from "zustand";

interface ProfileState {
  handle: string;
  setHandle: (handle: string) => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  handle: "",
  setHandle: (handle) => set({ handle }),
}));
