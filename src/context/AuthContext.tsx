import React, { createContext, useContext, useEffect, useState } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface AuthContextType {
    session: Session | null
    user: User | null
    loading: boolean
    signOut: () => Promise<void>
    selectedChild: any | null
    selectChild: (child: any) => void
}

const AuthContext = createContext<AuthContextType>({
    session: null,
    user: null,
    loading: true,
    signOut: async () => { },
    selectedChild: null,
    selectChild: () => { },
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [session, setSession] = useState<Session | null>(null)
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    const [selectedChild, setSelectedChild] = useState<any | null>(null) // Replace 'any' with ChildProfile type if available

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
            setUser(session?.user ?? null)
            setLoading(false)
        })

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            console.log('Auth state change:', _event)
            setSession(session)
            setUser(session?.user ?? null)
            setLoading(false)
            if (!session) setSelectedChild(null)
        })

        return () => subscription.unsubscribe()
    }, [])

    const signOut = async () => {
        setSelectedChild(null)
        await supabase.auth.signOut()
    }

    const selectChild = (child: any) => {
        setSelectedChild(child)
    }

    return (
        <AuthContext.Provider value={{ session, user, loading, signOut, selectedChild, selectChild }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
