import { create } from 'zustand';

import { User } from "firebase/auth";

interface StoreType {
  currentUser: undefined | null | User;
  setCurrentUser: (user: User | null) => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useStore = create<StoreType>((set: any) => ({
  currentUser: undefined,
  setCurrentUser: (user) => set({ currentUser: user }),
}));
