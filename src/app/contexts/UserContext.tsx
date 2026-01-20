"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getMyProfile, type UserResponse, logout as apiLogout } from "@/lib/api";

interface UserContextType {
    user: UserResponse | null;
    loading: boolean;
    error: Error | null;
    refreshProfile: () => Promise<void>;
    logout: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<UserResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const loadProfile = useCallback(async (isBackground = false) => {
        try {
            const token = localStorage.getItem('accessToken');
            console.log('[UserContext] Loading profile... Token exists:', !!token);

            if (!token) {
                console.log('[UserContext] No token found, stopping load.');
                setLoading(false);
                return;
            }

            if (!isBackground) {
                setLoading(true);
            }
            setError(null);
            console.log('[UserContext] Calling getMyProfile...');
            const data = await getMyProfile();
            console.log('[UserContext] Profile loaded:', data?.username);
            setUser(data);
        } catch (err: any) {
            console.error("UserContext: Failed to load profile", err);
            setError(err);
            if (err.message?.includes('401') || err.message?.includes('Unauthorized')) {
                console.log('[UserContext] 401 Error detected, clearing user.');
                setUser(null);
            }
        } finally {
            if (!isBackground) {
                setLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        loadProfile();
    }, [loadProfile]);

    const refreshProfile = async () => {
        await loadProfile(true);
    };

    const logout = async () => {
        try {
            await apiLogout();
        } catch (err) {
            console.error("UserContext: Logout failed", err);
        } finally {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            setUser(null);
            // Optional: Navigate to login is handled by the component verifying auth
        }
    };

    return (
        <UserContext.Provider value={{ user, loading, error, refreshProfile, logout }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
}
