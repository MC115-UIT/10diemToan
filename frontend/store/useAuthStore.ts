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
    accessToken: typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null,
    isLoading: false,
    isInitialized: false,

    setAccessToken: (token) => {
        if (typeof window !== 'undefined') {
            if (token) localStorage.setItem('accessToken', token);
            else localStorage.removeItem('accessToken');
        }
        set({ accessToken: token });
    },

    fetchAuthCheck: async () => {
        try {
            set({ isLoading: true });
            const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
            if (token) {
                // Pre-set token so `api.ts` interceptor uses it immediately
                set({ accessToken: token });
            }

            const res = await api.get('/user/me');
            set({ user: res.data.user, isInitialized: true });
        } catch {
            if (typeof window !== 'undefined') localStorage.removeItem('accessToken');
            set({ user: null, accessToken: null, isInitialized: true });
        } finally {
            set({ isLoading: false });
        }
    },

    login: async (email, password) => {
        set({ isLoading: true });
        try {
            const res = await api.post('/auth/login', { email, password });
            const token = res.data.accessToken;
            if (typeof window !== 'undefined' && token) localStorage.setItem('accessToken', token);
            set({ user: res.data.user, accessToken: token });
        } finally {
            set({ isLoading: false });
        }
    },

    register: async (email, password, fullName) => {
        set({ isLoading: true });
        try {
            const res = await api.post('/auth/register', { email, password, fullName });
            const token = res.data.accessToken;
            if (typeof window !== 'undefined' && token) localStorage.setItem('accessToken', token);
            set({ user: res.data.user, accessToken: token });
        } finally {
            set({ isLoading: false });
        }
    },

    logout: async () => {
        set({ isLoading: true });
        try {
            await api.post('/auth/logout');
        } finally {
            if (typeof window !== 'undefined') localStorage.removeItem('accessToken');
            set({ isLoading: false, user: null, accessToken: null });
            if (typeof window !== 'undefined') {
                window.location.href = '/login';
            }
        }
    },
}));
