import { useState, useEffect, type ReactNode } from 'react';
import { AuthContext } from './AuthContext';
import { supabase } from '../lib/supabaseClient';
import type { Session, User } from '@supabase/supabase-js';

export function AuthProvider({children}: {children: ReactNode}) {
    const [session, setSession] = useState<Session| null>(null);
    const [loading, setLoading] = useState(true);

    // get existing auth session with data about currently authenticated user
    const fetchSession = async() => {
        const result = await supabase?.auth.getSession();
        console.log(result);
        if (result?.data)
            setSession(result.data.session)
    }

    useEffect(() => {
        if (!supabase) {
            setLoading(false);
            return;
        }

        fetchSession();

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
        console.log("SIGNING OUT NOW");
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