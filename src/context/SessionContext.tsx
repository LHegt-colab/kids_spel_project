import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

interface SessionContextType {
    minutesUsed: number
    dailyLimit: number
    isLocked: boolean
    enabledModules: string[]
    checkAccess: (moduleId: string) => boolean
    unlockTemporary: () => void
}

const SessionContext = createContext<SessionContextType>({
    minutesUsed: 0,
    dailyLimit: 30,
    isLocked: false,
    enabledModules: [],
    checkAccess: () => false,
    unlockTemporary: () => { },
})

export const useSession = () => useContext(SessionContext)

export const SessionProvider = ({ children }: { children: React.ReactNode }) => {
    const { selectedChild } = useAuth()
    const [minutesUsed, setMinutesUsed] = useState(0)
    const [dailyLimit, setDailyLimit] = useState(30)
    const [enabledModules, setEnabledModules] = useState<string[]>([])
    const [isLocked, setIsLocked] = useState(false)
    const [unlockedTemp, setUnlockedTemp] = useState(false)

    // Load Settings & Usage
    useEffect(() => {
        if (!selectedChild) return

        const fetchSessionData = async () => {
            // 1. Fetch Settings
            const { data: settings } = await supabase
                .from('child_settings')
                .select('*')
                .eq('child_id', selectedChild.id)
                .single()

            if (settings) {
                const s = settings as any
                setDailyLimit(s.daily_limit_minutes || 30)
                setEnabledModules((s.enabled_modules as string[]) || [])
            } else {
                // Defaults
                setDailyLimit(30)
                setEnabledModules([])
            }

            // 2. Fetch Usage for Today
            const today = new Date().toISOString().split('T')[0]
            const { data: usage } = await supabase
                .from('daily_usage')
                .select('minutes_used')
                .eq('child_id', selectedChild.id)
                .eq('date', today)
                .single()

            setMinutesUsed(usage?.minutes_used || 0)
        }

        fetchSessionData()
    }, [selectedChild])

    // Heartbeat: Increment minutes every minute
    useEffect(() => {
        if (!selectedChild || isLocked) return

        const interval = setInterval(async () => {
            setMinutesUsed(prev => {
                const newVal = prev + 1
                // Persist to DB
                const today = new Date().toISOString().split('T')[0]
                const payload = {
                    child_id: selectedChild.id,
                    date: today,
                    minutes_used: newVal
                }

                supabase.from('daily_usage').upsert(
                    payload as any,
                    { onConflict: 'child_id,date' }
                ).then(({ error }) => {
                    if (error) console.error('Error updating usage:', error)
                })

                return newVal
            })
        }, 60000) // 1 minute

        return () => clearInterval(interval)
    }, [selectedChild, isLocked])

    // Lock Logic
    useEffect(() => {
        if (unlockedTemp) {
            setIsLocked(false)
            return
        }
        if (minutesUsed >= dailyLimit) {
            setIsLocked(true)
        }
    }, [minutesUsed, dailyLimit, unlockedTemp])

    const checkAccess = (moduleId: string) => {
        if (enabledModules.length === 0) return true // If empty/new, assume all? Or none? Let's assume all for fail-safe
        return enabledModules.includes(moduleId)
    }

    const unlockTemporary = () => {
        setUnlockedTemp(true)
        setIsLocked(false)
    }

    return (
        <SessionContext.Provider value={{
            minutesUsed,
            dailyLimit,
            isLocked,
            enabledModules,
            checkAccess,
            unlockTemporary
        }}>
            {children}
        </SessionContext.Provider>
    )
}
