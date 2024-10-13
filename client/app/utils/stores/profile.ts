import { create } from "zustand";

interface ProfileState {
  handle: string;
  name: string;
  profilePicture: string;
  setHandle: (handle: string) => void;
  setName: (name: string) => void;
  setProfilePicture: (profilePicture: string) => void;
  loadHandle: () => string | null;
  loadName: () => string | null;
  loadProfilePicture: () => string | null;
}

export const useProfileStore = create<ProfileState>((set) => ({
  handle: "",
  name: "",
  profilePicture: "",
  setHandle: (handle) => {
    localStorage.setItem("handle", handle);
    set({ handle });
  },
  setName: (name) => {
    localStorage.setItem("name", name);
    set({ name });
  },
  setProfilePicture: (profilePicture) => {
    localStorage.setItem("profilePicture", profilePicture);
    set({ profilePicture });
  },
  loadHandle: () => {
    const handle = localStorage.getItem("handle");
    if (handle) {
      set({ handle });
    }
    return handle || "";
  },
  loadName: () => {
    const name = localStorage.getItem("name");
    if (name) {
      set({ name });
    }
    return name || "";
  },
  loadProfilePicture: () => {
    const profilePicture = localStorage.getItem("profilePicture");
    if (profilePicture) {
      set({ profilePicture });
    }
    return profilePicture || "";
  },
}));