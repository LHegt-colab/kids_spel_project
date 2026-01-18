import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

interface GamificationContextType {
    stars: number
    streak: number
    refreshProfile: () => void
    hasDailyChallenge: boolean
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined)

export const GamificationProvider = ({ children }: { children: React.ReactNode }) => {
    const { selectedChild } = useAuth()
    const [stars, setStars] = useState(0)
    const [streak, setStreak] = useState(0)
    const [hasDailyChallenge, setHasDailyChallenge] = useState(false)

    useEffect(() => {
        if (selectedChild) {
            fetchGamificationData()
        }
    }, [selectedChild])

    const fetchGamificationData = async () => {
        if (!selectedChild) return

        // 1. Get Profile Stats
        const { data: profile } = await supabase
            .from('child_profiles')
            .select('stars, streak_count') // Ensure streak_count is added to DB
            .eq('id', selectedChild.id)
            .single()

        if (profile) {
            setStars(profile.stars || 0)
            setStreak(profile.streak_count || 0)
        }

        // 2. Check Daily Challenge
        const today = new Date().toISOString().split('T')[0]
        const { data: challenge } = await supabase
            .from('daily_challenges')
            .select('*')
            .eq('child_id', selectedChild.id)
            .eq('challenge_date', today)
            .single()

        if (!challenge) {
            // Create daily challenge if none exists
            await supabase.from('daily_challenges').insert({
                child_id: selectedChild.id,
                challenge_date: today,
                // Default uncompleted
            })
            setHasDailyChallenge(true)
        } else {
            setHasDailyChallenge(true)
        }
    }

    const refreshProfile = () => {
        fetchGamificationData()
    }

    return (
        <GamificationContext.Provider value={{ stars, streak, refreshProfile, hasDailyChallenge }}>
            {children}
        </GamificationContext.Provider>
    )
}

export const useGamification = () => {
    const context = useContext(GamificationContext)
    if (context === undefined) {
        throw new Error('useGamification must be used within a GamificationProvider')
    }
    return context
}
