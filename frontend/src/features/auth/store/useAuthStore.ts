import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AuthState {
    token: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    setLoginData: (token: string, refreshToken: string) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            token: null,
            refreshToken: null,
            isAuthenticated: false,

            // Action to save the token after a successful login
            setLoginData: (token, refreshToken) =>
                set({
                    token,
                    refreshToken,
                    isAuthenticated: true,
                }),

            // Action to clear the session
            logout: () =>
                set({
                    token: null,
                    refreshToken: null,
                    isAuthenticated: false,
                }),
        }),
        {
            name: 'auth-storage', // Name of the key in localStorage
            storage: createJSONStorage(() => localStorage),
        }
    )
);
