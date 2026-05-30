import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { queryClient } from '@/queryClient';
import { authApi } from '@/api/authApi';
import type { LoginRequest, LoginResponse, User } from '@/types/auth';
import { STORAGE_KEYS } from '@/utils/constants';

interface AuthContextValue {
    user: User | null;
    loading: boolean;
    login: (input: LoginRequest) => Promise<User>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const readUser = (): User | null => {
    const value = localStorage.getItem(STORAGE_KEYS.user);
    return value ? (JSON.parse(value) as User) : null;
};

const storeSession = (response: LoginResponse, user: User) => {
    localStorage.setItem(STORAGE_KEYS.accessToken, response.access);
    localStorage.setItem(STORAGE_KEYS.refreshToken, response.refresh);
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
};

const clearSession = () => {
    localStorage.removeItem(STORAGE_KEYS.accessToken);
    localStorage.removeItem(STORAGE_KEYS.refreshToken);
    localStorage.removeItem(STORAGE_KEYS.user);
};

export function AuthProvider({ children }: PropsWithChildren) {
    const [user, setUser] = useState<User | null>(() => readUser());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const bootstrap = async () => {
            const accessToken = localStorage.getItem(STORAGE_KEYS.accessToken);
            const storedUser = readUser();

            if (storedUser) {
                setUser(storedUser);
            }

            if (!accessToken) {
                setLoading(false);
                return;
            }

            try {
                const currentUser = storedUser ?? (await authApi.me(accessToken));
                setUser(currentUser);
                localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(currentUser));
            } catch {
                clearSession();
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        void bootstrap();

        const handleSessionExpired = () => {
            clearSession();
            setUser(null);
        };

        window.addEventListener('ems:logout', handleSessionExpired);
        return () => window.removeEventListener('ems:logout', handleSessionExpired);
    }, []);

    const login = async (input: LoginRequest) => {
        const response = await authApi.login(input);
        const currentUser = await authApi.me(response.access);
        storeSession(response, currentUser);
        setUser(currentUser);
        return currentUser;
    };

    const logout = () => {
        clearSession();
        setUser(null);
        queryClient.clear();
    };

    const value = useMemo<AuthContextValue>(() => ({
        user,
        loading,
        login,
        logout,
    }), [loading, user]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}
