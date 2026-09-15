import { useState, useEffect, type ReactNode } from 'react';
import { AuthContext } from './AuthContext';
import { supabase } from '../lib/supabaseClient';
import type { Session } from '@supabase/supabase-js';

export function AuthProvider({children}: {children: ReactNode}) {
    const [session, setSession] = useState<Session| null>(null);
    const [loading, setLoading] = useState(Boolean(supabase));

    // get existing auth session with data about currently authenticated user
    const fetchSession = async() => {
        if (!supabase) return;

        try {
            const result = await supabase.auth.getSession();
            if (result.data)
                setSession(result.data.session)
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (!supabase) return;

        void fetchSession();

        // listen for login/logout/session changes
        const { data:  {subscription}, } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setSession(session)
            })

        // clean up function
        return () => {
            subscription.unsubscribe()
        }
    }, [])

    const user = session?.user ?? null;

    async function signOut() {
        await supabase?.auth.signOut();
    }

    const isAdmin = user?.app_metadata?.role === 'admin'


    return (
        <AuthContext.Provider
            value={{
                session,
                user,
                loading,
                isAdmin,
                signOut
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}