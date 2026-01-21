import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useGamification } from '../../context/GamificationContext'
import { supabase } from '../../lib/supabase'
import { generateProblem, type MathProblem, type AgeBand } from '../../lib/MathEngine'
import { GameLayout } from '../../components/game/GameLayout'
import { Numpad } from '../../components/game/Numpad'
import { Timer, Zap, Trophy } from 'lucide-react'
import { useGameSounds } from '../../hooks/useGameSounds'
import { useKeyboardInput } from '../../hooks/useKeyboardInput'
import { useGameSession } from '../../hooks/useGameSession'
import confetti from 'canvas-confetti'

export const RekenRace = () => {
    const { selectedChild } = useAuth()
    const { completeChallengeTask } = useGamification()
    const { playCorrect, playWrong, playLevelUp } = useGameSounds()
    const navigate = useNavigate()
    const timerRef = useRef<number | null>(null)

    // Hook Integration
    const { sessionId, endSession, logAnswer } = useGameSession('math-race')

    const [loading, setLoading] = useState(true)
    const [gameState, setGameState] = useState<'ready' | 'playing' | 'finished'>('ready')

    const [problem, setProblem] = useState<MathProblem | null>(null)
    const [input, setInput] = useState('')
    const [score, setScore] = useState(0)
    const [timeLeft, setTimeLeft] = useState(60) // 60 seconds
    const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)

    useEffect(() => {
        if (!selectedChild) {
            navigate('/child/select')
            return
        }
        setLoading(false)
    }, [selectedChild])

    const startGame = async () => {
        if (!selectedChild) return

        setGameState('playing')
        setScore(0)
        setTimeLeft(60)
        generateNewProblem()

        // Start Timer
        timerRef.current = window.setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    endGame()
                    return 0
                }
                return prev - 1
            })
        }, 1000)
    }

    const endGame = () => {
        if (timerRef.current) clearInterval(timerRef.current)
        setGameState('finished')
        saveSession()
    }

    const saveSession = async () => {
        await endSession(score, { duration_seconds: 60 - timeLeft })

        // Complete Daily Challenge
        if (score > 0) {
            completeChallengeTask('math')
        }

        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        })
    }

    const generateNewProblem = () => {
        if (!selectedChild) return
        const newProb = generateProblem(selectedChild.age_band as AgeBand, 1)
        setProblem(newProb)
        setInput('')
        setFeedback(null)
    }

    const handleInput = (val: string) => {
        if (input.length < 4) setInput(prev => prev + val)
    }

    const handleDelete = () => {
        setInput(prev => prev.slice(0, -1))
    }

    const handleSubmit = async () => {
        if (!problem || !input) return // removed !sessionId check as it's handled by hook (and might be pending but who cares for V1)

        const numInput = parseInt(input)
        const isCorrect = numInput === problem.answer

        // Log Answer
        logAnswer(
            problem.id,
            isCorrect,
            input,
            problem.answer.toString()
        )

        if (isCorrect) {
            setScore(prev => prev + 5) // 5 points per speed answer
            setFeedback('correct')
            playCorrect()
            generateNewProblem() // Instant next
        } else {
            setFeedback('wrong')
            playWrong()
            // Delay slightly for wrong answer to prevent spamming
            setTimeout(() => {
                setInput('')
                setFeedback(null)
            }, 500)
        }
    }


    useKeyboardInput({
        onInput: handleInput,
        onDelete: handleDelete,
        onSubmit: handleSubmit,
        disabled: gameState !== 'playing'
    })

    const handleExit = () => {
        // Direct exit to fix "broken button" feedback
        if (timerRef.current) clearInterval(timerRef.current)
        navigate('/game/home')
    }

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current)
        }
    }, [])

    if (loading) return <div>Laden...</div>

    if (gameState === 'ready') {
        return (
            <GameLayout title="RekenRace" score={0} onExit={() => navigate('/game/home')}>
                <div className="text-center animate-in zoom-in">
                    <div className="w-40 h-40 bg-brand-purple rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl ring-4 ring-brand-purple/50">
                        <Zap size={80} className="text-white fill-current" />
                    </div>
                    <h1 className="text-5xl font-display font-bold text-white mb-6">Klaar voor de start?</h1>
                    <p className="text-xl text-space-200 mb-10 max-w-md mx-auto">
                        Je hebt 60 seconden. <br />
                        Hoeveel sommen kun jij oplossen?
                    </p>
                    <button
                        onClick={startGame}
                        className="bg-brand-orange text-white font-bold text-3xl px-16 py-6 rounded-2xl hover:scale-105 transition-transform shadow-lg border-b-4 border-orange-700 active:border-b-0 active:translate-y-1"
                    >
                        START!
                    </button>
                </div>
            </GameLayout>
        )
    }

    if (gameState === 'finished') {
        return (
            <GameLayout title="RekenRace" score={score} onExit={() => navigate('/game/home')}>
                <div className="text-center animate-in zoom-in">
                    <Trophy size={80} className="text-brand-yellow mx-auto mb-6" />
                    <h1 className="text-4xl font-display font-bold text-white mb-2">Tijd is op!</h1>
                    <div className="text-6xl font-bold text-brand-teal mb-8">{score} Punten</div>

                    <button
                        onClick={() => navigate('/game/home')}
                        className="bg-space-700 text-white font-bold text-xl px-8 py-3 rounded-xl hover:bg-space-600"
                    >
                        Terug
                    </button>
                </div>
            </GameLayout>
        )
    }

    return (
        <GameLayout title="RekenRace" score={score} time={timeLeft} onExit={handleExit}>
            <div className={`
                w-full max-w-lg bg-white rounded-3xl p-6 mb-6 text-center shadow-lg relative overflow-hidden
                ${feedback === 'wrong' ? 'bg-red-50 ring-4 ring-red-400' : ''}
            `}>
                <div className="text-6xl font-bold text-space-900 font-mono">
                    {problem?.question} = <span className="text-brand-purple border-b-4 border-space-200 min-w-[2ch] inline-block">{input}</span>
                </div>
            </div>

            <Numpad
                onInput={handleInput}
                onDelete={handleDelete}
                onSubmit={handleSubmit}
            />

            <div className="mt-8">
                <button
                    onClick={handleExit}
                    className="text-space-400 hover:text-white underline decoration-space-600 hover:decoration-white underline-offset-4 font-bold tracking-widest text-sm"
                >
                    STOPPEN & TERUG
                </button>
            </div>
        </GameLayout>
    )
}
