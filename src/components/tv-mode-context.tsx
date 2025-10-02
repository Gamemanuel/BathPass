// components/tv-mode-context.tsx

"use client";

import * as React from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface TvModeContextType {
    isTvMode: boolean;
    isLoading: boolean;
    toggleTvMode: (currentUserId: string) => Promise<void>;
    updateTvModeState: (enabled: boolean) => void;
}

const TvModeContext = React.createContext<TvModeContextType | undefined>(undefined);

export function useTvMode() {
    const context = React.useContext(TvModeContext);
    if (context === undefined) {
        throw new Error('useTvMode must be used within a TvModeProvider');
    }
    return context;
}

export function TvModeProvider({ children }: { children: React.ReactNode }) {
    const [isTvMode, setIsTvMode] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(true);
    const supabase = createClient();

    const updateTvModeState = React.useCallback((enabled: boolean) => {
        setIsTvMode(enabled);
    }, []);

    React.useEffect(() => {
        const fetchStatus = async () => {
            setIsLoading(true);
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const { data } = await supabase
                    .from('user_profiles')
                    .select('is_tv_mode_enabled')
                    .eq('id', user.id)
                    .single();

                if (data) {
                    setIsTvMode(data.is_tv_mode_enabled);
                } else {
                    setIsTvMode(false);
                }
            }
            setIsLoading(false);
        };

        fetchStatus();
    }, [supabase]);

    const toggleTvMode = React.useCallback(async (currentUserId: string) => {
        const newState = !isTvMode;
        setIsLoading(true);

        const { error } = await supabase
            .from('user_profiles')
            .upsert({ id: currentUserId, is_tv_mode_enabled: newState })
            .select();

        setIsLoading(false);

        if (error) {
            toast.error("Failed to update TV Mode: " + error.message);
            setIsTvMode(!newState);
        } else {
            setIsTvMode(newState);
            toast.success(`TV Mode ${newState ? 'Enabled' : 'Disabled'}`);
        }
    }, [isTvMode, supabase]);


    const value = React.useMemo(() => ({
        isTvMode,
        isLoading,
        toggleTvMode,
        updateTvModeState
    }), [isTvMode, isLoading, toggleTvMode, updateTvModeState]);

    return (
        <TvModeContext.Provider value={value}>
            {children}
        </TvModeContext.Provider>
    );
}