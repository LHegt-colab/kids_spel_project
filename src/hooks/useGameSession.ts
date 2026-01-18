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
