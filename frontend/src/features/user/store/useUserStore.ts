import { create } from 'zustand';
import { User } from '../types';

interface UserState {
    user: User | null;
    setUser: (user: User) => void;
    clearUser: () => void;
}

export const useUserStore = create<UserState>((set) => ({
    user: null,

    // Action to set user data
    setUser: (user) => set({ user }),

    // Action to clear user data
    clearUser: () => set({ user: null }),
}));
