import { create } from "zustand";

interface ProfileState {
  handle: string;
  setHandle: (handle: string) => void;
  loadHandle: () => string | null;
}

export const useProfileStore = create<ProfileState>((set) => ({
  handle: "",
  setHandle: (handle) => {
    localStorage.setItem("handle", handle);
    set({ handle });
  },
  loadHandle: () => {
    const handle = localStorage.getItem("handle");
    if (handle) {
      set({ handle });
    }
    return handle || "";
  },
}));
