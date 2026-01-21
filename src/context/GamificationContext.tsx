import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

interface GamificationContextType {
    stars: number
    streak: number
    refreshProfile: () => void
    dailyChallenge: any | null
    claimReward: () => Promise<void>
    completeChallengeTask: (task: 'math' | 'language' | 'logic') => Promise<void>
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined)

export const GamificationProvider = ({ children }: { children: React.ReactNode }) => {
    const { selectedChild } = useAuth()
    const [stars, setStars] = useState(0)
    const [streak, setStreak] = useState(0)
    const [dailyChallenge, setDailyChallenge] = useState<any | null>(null)

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
            .select('total_stars')
            .eq('id', selectedChild.id)
            .single()

        if (profile) {
            setStars(profile.total_stars || 0)

            // Streak Logic: Count consecutive days in daily_usage
            const { data: usage } = await supabase
                .from('daily_usage')
                .select('date')
                .eq('child_id', selectedChild.id)
                .order('date', { ascending: false })

            if (usage && usage.length > 0) {
                const dates = usage.map(u => u.date)
                const today = new Date().toISOString().split('T')[0]
                const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

                let currentStreak = 0
                let checkDate = (dates.includes(today)) ? today : yesterday

                // Simple consecutive check
                // This assumes local time consistency, good enough for V1
                while (dates.includes(checkDate)) {
                    currentStreak++
                    const d = new Date(checkDate)
                    d.setDate(d.getDate() - 1)
                    checkDate = d.toISOString().split('T')[0]
                }
                setStreak(currentStreak)
            } else {
                setStreak(0)
            }
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
            const { data: newChallenge } = await supabase.from('daily_challenges').insert({
                child_id: selectedChild.id,
                challenge_date: today,
                math_completed: false,
                language_completed: false,
                logic_completed: false,
                rewards_claimed: false
            } as any).select().single()

            setDailyChallenge(newChallenge)
        } else {
            setDailyChallenge(challenge)
        }
    }

    const claimReward = async () => {
        if (!dailyChallenge || !selectedChild) return

        // 1. Update Challenge
        await supabase.from('daily_challenges')
            .update({ rewards_claimed: true } as any)
            .eq('id', dailyChallenge.id)

        // 2. Add Stars
        const newStars = stars + 50
        await supabase.from('child_profiles')
            .update({ total_stars: newStars } as any)
            .eq('id', selectedChild.id)

        // 3. Refresh
        fetchGamificationData()
    }

    const completeChallengeTask = async (task: 'math' | 'language' | 'logic') => {
        if (!dailyChallenge || !selectedChild) return

        const column = `${task}_completed`
        // Only update if not already true
        if (dailyChallenge[column]) return

        await supabase.from('daily_challenges')
            .update({ [column]: true } as any)
            .eq('id', dailyChallenge.id)

        fetchGamificationData()
    }

    const refreshProfile = () => {
        fetchGamificationData()
    }

    return (
        <GamificationContext.Provider value={{ stars, streak, refreshProfile, dailyChallenge, claimReward, completeChallengeTask }}>
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
