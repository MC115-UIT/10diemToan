import { create } from 'zustand';
import api from '@/lib/api';
import { User } from '@/types';

interface AuthState {
    user: User | null;
    accessToken: string | null;
    isLoading: boolean;
    isInitialized: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, fullName: string) => Promise<void>;
    logout: () => Promise<void>;
    fetchAuthCheck: () => Promise<void>;
    setAccessToken: (token: string | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    accessToken: null,
    isLoading: false,
    isInitialized: false,

    setAccessToken: (token) => set({ accessToken: token }),

    fetchAuthCheck: async () => {
        try {
            set({ isLoading: true });
            // /me needs the access token, which might be missing on hard reload.
            // If missing, api.ts interceptor will attempt a refresh.
            const res = await api.get('/auth/me');
            set({ user: res.data.user, isInitialized: true });
        } catch {
            set({ user: null, accessToken: null, isInitialized: true });
        } finally {
            set({ isLoading: false });
        }
    },

    login: async (email, password) => {
        set({ isLoading: true });
        try {
            const res = await api.post('/auth/login', { email, password });
            set({ user: res.data.user, accessToken: res.data.accessToken });
        } finally {
            set({ isLoading: false });
        }
    },

    register: async (email, password, fullName) => {
        set({ isLoading: true });
        try {
            const res = await api.post('/auth/register', { email, password, fullName });
            set({ user: res.data.user, accessToken: res.data.accessToken });
        } finally {
            set({ isLoading: false });
        }
    },

    logout: async () => {
        set({ isLoading: true });
        try {
            await api.post('/auth/logout');
            set({ user: null, accessToken: null });
        } finally {
            set({ isLoading: false, user: null, accessToken: null });
            if (typeof window !== 'undefined') {
                window.location.href = '/login';
            }
        }
    },
}));
