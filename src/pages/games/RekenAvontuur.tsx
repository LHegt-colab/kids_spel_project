import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useSession } from '../../context/SessionContext'
import { supabase } from '../../lib/supabase'
import { generateProblem, MathProblem, AgeBand } from '../../lib/MathEngine'
import { generateProblem, MathProblem, AgeBand } from '../../lib/MathEngine'
import { GameLayout } from '../../components/game/GameLayout'
import { Numpad } from '../../components/game/Numpad'
import { Rocket, Star, Medal } from 'lucide-react'
import { useGameSounds } from '../../hooks/useGameSounds'
import confetti from 'canvas-confetti'

export const RekenAvontuur = () => {
    const { selectedChild } = useAuth()
    const { unlockTemporary } = useSession() // We might need this for something later
    const { playCorrect, playWrong, playLevelUp } = useGameSounds()
    const navigate = useNavigate()

    const [loading, setLoading] = useState(true)
    const [sessionId, setSessionId] = useState<string | null>(null)
    const [gameState, setGameState] = useState<'playing' | 'feedback' | 'finished'>('playing')

    // Question State
    const [problem, setProblem] = useState<MathProblem | null>(null)
    const [input, setInput] = useState('')
    const [score, setScore] = useState(0)
    const [questionCount, setQuestionCount] = useState(0)
    const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)

    // Constants
    const TOTAL_QUESTIONS = 10

    useEffect(() => {
        if (!selectedChild) {
            navigate('/child/select')
            return
        }
        startSession()
    }, [selectedChild])

    const startSession = async () => {
        if (!selectedChild) return

        // Create Session in DB
        const { data, error } = await supabase.from('game_sessions').insert({
            child_id: selectedChild.id,
            module_id: 'math-adventure',
            meta: { total_questions: TOTAL_QUESTIONS }
        }).select().single()

        if (data) {
            setSessionId(data.id)
            generateNewProblem()
            setLoading(false)
        } else {
            console.error('Failed to start session', error)
            alert('Kan spel niet starten...')
            navigate('/')
        }
    }

    const generateNewProblem = () => {
        if (!selectedChild) return
        const newProb = generateProblem(selectedChild.age_band as AgeBand, 1)
        setProblem(newProb)
        setInput('')
        setGameState('playing')
        setFeedback(null)
    }

    const handleInput = (val: string) => {
        if (input.length < 4) setInput(prev => prev + val)
    }

    const handleDelete = () => {
        setInput(prev => prev.slice(0, -1))
    }

    const handleSubmit = async () => {
        if (!problem || !sessionId || !input) return

        const numInput = parseInt(input)
        const isCorrect = numInput === problem.answer

        // Log Answer
        const startTime = Date.now() // Ideally we capture start time of question, simplifying for now

        await supabase.from('answers_log').insert({
            session_id: sessionId,
            question_id: problem.id,
            is_correct: isCorrect,
            answer: input,
            correct_answer: problem.answer.toString(),
            response_time_ms: 0 // TODO: Track time per question
        })

        // Feedback
        setFeedback(isCorrect ? 'correct' : 'wrong')
        setGameState('feedback')

        if (isCorrect) {
            setScore(prev => prev + 10) // 10 points per proper answer
            playCorrect()
            confetti({
                particleCount: 50,
                spread: 30,
                origin: { y: 0.7 }
            })
        } else {
            playWrong()
        }

        // Wait and Next
        setTimeout(() => {
            if (questionCount + 1 >= TOTAL_QUESTIONS) {
                finishGame()
            } else {
                setQuestionCount(prev => prev + 1)
                generateNewProblem()
            }
        }, 1500)
    }

    const finishGame = async () => {
        setGameState('finished')
        if (!sessionId) return

        // Update Session
        await supabase.from('game_sessions').update({
            end_time: new Date().toISOString(),
            score: score,
            duration_seconds: 0 // Calculate if needed or use DB timestamps
        }).eq('id', sessionId)

        // Final celebration
        confetti({
            particleCount: 150,
            spread: 100,
            origin: { y: 0.6 }
        })
    }

    const handleExit = () => {
        if (confirm('Wil je stoppen? Je voortgang gaat verloren.')) {
            navigate('/game/home')
        }
    }

    if (loading) return <div className="bg-space-900 min-h-screen text-white flex items-center justify-center">Laden...</div>

    if (gameState === 'finished') {
        return (
            <GameLayout title="RekenAvontuur" score={score} onExit={() => navigate('/game/home')}>
                <div className="text-center animate-in zoom-in duration-500">
                    <div className="w-32 h-32 bg-brand-yellow rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_50px_rgba(255,200,0,0.5)]">
                        <Medal size={64} className="text-space-900" />
                    </div>
                    <h1 className="text-5xl font-display font-bold text-white mb-4">Missie Volbracht!</h1>
                    <p className="text-2xl text-space-200 mb-8">Je hebt {score} punten gescoord.</p>

                    <button
                        onClick={() => navigate('/game/home')}
                        className="bg-brand-teal text-space-900 font-bold text-2xl px-12 py-4 rounded-2xl hover:scale-105 transition-transform shadow-xl"
                    >
                        Terug naar Basis
                    </button>
                </div>
            </GameLayout>
        )
    }

    return (
        <GameLayout title={`Vraag ${questionCount + 1} / ${TOTAL_QUESTIONS}`} score={score} onExit={handleExit}>

            {/* Question Card */}
            <div className={`
                w-full max-w-lg bg-white rounded-3xl p-8 mb-8 text-center shadow-2xl relative overflow-hidden transition-all duration-300 transform
                ${feedback === 'correct' ? 'scale-105 ring-8 ring-green-400' : ''}
                ${feedback === 'wrong' ? 'shake ring-8 ring-red-400' : ''}
            `}>
                <div className="text-space-400 text-lg font-bold mb-2 uppercase tracking-wider">Los op:</div>
                <div className="text-7xl font-bold text-space-900 font-mono tracking-tight">
                    {problem?.question} = <span className="text-brand-teal border-b-4 border-space-200 min-w-[2ch] inline-block">{input || '?'}</span>
                </div>

                {/* Feedback Overlay inside card */}
                {feedback && (
                    <div className={`absolute inset-0 flex items-center justify-center bg-opacity-90 ${feedback === 'correct' ? 'bg-green-500' : 'bg-red-500'}`}>
                        {feedback === 'correct' ? (
                            <Star size={80} className="text-white animate-spin-slow" />
                        ) : (
                            <div className="text-white text-4xl font-bold">{problem?.answer}</div>
                        )}
                    </div>
                )}
            </div>

            {/* Numpad */}
            <Numpad
                onInput={handleInput}
                onDelete={handleDelete}
                onSubmit={handleSubmit}
                disabled={gameState === 'feedback'}
            />

            {/* Progress Rocket */}
            <div className="fixed bottom-0 left-0 w-full h-4 bg-space-800">
                <div
                    className="h-full bg-brand-orange transition-all duration-500 relative"
                    style={{ width: `${((questionCount) / TOTAL_QUESTIONS) * 100}%` }}
                >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 text-brand-orange">
                        <Rocket size={24} className="rotate-45" />
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
                .shake { animation: shake 0.3s ease-in-out; }
            `}</style>
        </GameLayout>
    )
}
