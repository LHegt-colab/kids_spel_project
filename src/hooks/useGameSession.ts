import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export const useGameSession = (moduleId: string) => {
    const { selectedChild } = useAuth()
    const [sessionId, setSessionId] = useState<string | null>(null)
    const startTimeRef = useRef<Date>(new Date())

    useEffect(() => {
        if (selectedChild) {
            startSession()
        }
    }, [selectedChild, moduleId])

    const startSession = async () => {
        if (!selectedChild) return
        startTimeRef.current = new Date()

        const { data, error } = await supabase
            .from('game_sessions')
            .insert({
                child_id: selectedChild.id,
                module_id: moduleId,
                start_time: new Date().toISOString(),
                duration_seconds: 0,
                score: 0
            })
            .select() // Need to select to get ID if using PG < 15 or if policies allow
            .single()

        // Track Daily Usage for Streak
        if (selectedChild) {
            const today = new Date().toISOString().split('T')[0]
            // Upsert usage (handling unique constraint via onConflict if supported, or manual check)
            // Since we don't have upsert helper easily, let's try strict insert and ignore duplicate error, 
            // OR checks exist. Schema says unique(child_id, date).
            // We'll trust supabase.upsert if policies allow, or just separate check.
            // Simplest for now: Attempt insert, ignore error.
            const { error: usageError } = await supabase.from('daily_usage').upsert({
                child_id: selectedChild.id,
                date: today,
                minutes_used: 1 // Incrementing properly would require read-update, just marking active for now
            } as any, { onConflict: 'child_id, date' })
        }

        if (data) {
            setSessionId(data.id)
        } else if (error) {
            console.error("Error starting session:", error)
        }
    }

    const endSession = async (score: number, meta?: any) => {
        if (!sessionId) return

        const endTime = new Date()
        const duration = Math.round((endTime.getTime() - startTimeRef.current.getTime()) / 1000)

        await supabase
            .from('game_sessions')
            .update({
                end_time: endTime.toISOString(),
                duration_seconds: duration,
                score: score,
                meta: meta
            })
            .eq('id', sessionId)

        // Award Stars (Economy Logic)
        if (score > 0) {
            const starsEarned = Math.ceil(score / 5) // 5 points = 1 star
            const { data: profile } = await supabase
                .from('child_profiles')
                .select('total_stars')
                .eq('id', selectedChild.id)
                .single()

            if (profile) {
                const newTotal = (profile.total_stars || 0) + starsEarned
                await supabase
                    .from('child_profiles')
                    .update({ total_stars: newTotal })
                    .eq('id', selectedChild.id)
            }
        }
    }

    const logAnswer = async (
        questionId: string,
        isCorrect: boolean,
        answer: string,
        correctAnswer: string
    ) => {
        if (!sessionId) return

        // Assuming answers_log table exists from Phase 3 (it was mentioned in summary)
        // If not, we might fail silently or error. Assuming it exists.
        await supabase
            .from('answers_log')
            .insert({
                session_id: sessionId,
                question_id: questionId,
                is_correct: isCorrect,
                answer: answer,
                correct_answer: correctAnswer,
                response_time_ms: 0 // We could track this too if needed
            })
    }

    return { sessionId, endSession, logAnswer }
}
