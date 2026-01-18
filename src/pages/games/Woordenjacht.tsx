import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { GameLayout } from '../../components/game/GameLayout'
import { useGameSounds } from '../../hooks/useGameSounds'
import { useGameSession } from '../../hooks/useGameSession'
import { Heart, Keyboard } from 'lucide-react'

interface Word {
    id: string
    text: string
    x: number // percentage 0-100
    y: number // percentage 0-100
    speed: number
}

export const Woordenjacht = () => {
    const { selectedChild } = useAuth()
    const navigate = useNavigate()
    const { playCorrect, playWrong } = useGameSounds()
    const { sessionId, endSession, logAnswer } = useGameSession('word-hunt')
    const canvasRef = useRef<HTMLDivElement>(null)

    const [loading, setLoading] = useState(true)
    const [gameState, setGameState] = useState<'playing' | 'gameover'>('playing')
    const [score, setScore] = useState(0)
    const [lives, setLives] = useState(3)
    const [activeWords, setActiveWords] = useState<Word[]>([])
    const [availableWords, setAvailableWords] = useState<string[]>([])
    const [input, setInput] = useState('')

    // Refs for loop
    const requestRef = useRef<number | null>(null)
    const lastTimeRef = useRef<number | null>(null)
    const spawnTimerRef = useRef(0)

    useEffect(() => {
        if (!selectedChild) {
            navigate('/child/select')
            return
        }
        fetchWords()
    }, [selectedChild])

    const fetchWords = async () => {
        // Fetch customized words for parent profile (assuming child is linked to parent profile implicitly via auth context parent)
        // Actually, we don't have parent_id easily on selectedChild without a join.
        // But for V1 we used `selectedChild.parent_id` (wait, check schema).
        // `child_profiles` has `parent_id`. 

        if (!selectedChild) return

        // 1. Get Parent ID
        // The authenticated user is the parent. `selectedChild` is just a state.
        // Correct.

        const { data } = await supabase
            .from('library_words')
            //.eq('profile_id', user.id) // We need to access parent user id.
            // Actually, querying across RLS might receive only own words if logged in.
            .select('word')
            .limit(50)

        if (data && data.length > 0) {
            setAvailableWords(data.map(w => w.word))
        } else {
            // Fallback defaults
            setAvailableWords(['maan', 'zon', 'ster', 'raket', 'planeet', 'komeet', 'ruimte', 'aarde', 'mars', 'pluto'])
        }
        setLoading(false)
    }

    // Game Loop
    // RAF Loop Removed in favor of Interval (Simpler for React State)
    /*
    const animate = (time: number) => { ... }
    const updateGame = (delta: number) => { ... }
    */

    // --- ALTERNATIVE: Interval Based Loop (Simpler for React) ---
    useEffect(() => {
        if (gameState !== 'playing' || loading) return

        const interval = setInterval(() => {
            setActiveWords(prev => {
                const nextWords = prev.map(w => ({ ...w, y: w.y + 1.5 })) // Move down 1.5% tick

                const missed = nextWords.filter(w => w.y > 85)
                const kept = nextWords.filter(w => w.y <= 85)

                if (missed.length > 0) {
                    playWrong()
                    setLives(l => {
                        const newLives = l - missed.length
                        if (newLives <= 0) setGameState('gameover')
                        return newLives
                    })
                }

                return kept
            })
        }, 50) // 20 FPS

        const spawner = setInterval(() => {
            if (availableWords.length === 0) return
            const randomWord = availableWords[Math.floor(Math.random() * availableWords.length)]
            const newWord: Word = {
                id: Math.random().toString(),
                text: randomWord,
                x: Math.random() * 80 + 10, // 10-90%
                y: 0,
                speed: 1
            }
            setActiveWords(prev => [...prev, newWord])
        }, 3000) // Spawn every 3s

        return () => {
            clearInterval(interval)
            clearInterval(spawner)
        }
    }, [gameState, loading, availableWords])


    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value
        setInput(val)

        // Check Match
        const match = activeWords.find(w => w.text.toLowerCase() === val.toLowerCase())
        if (match) {
            playCorrect()
            logAnswer('word-' + match.text, true, val, match.text)
            // Zap animation could be added here
            setActiveWords(prev => prev.filter(w => w.id !== match.id))
            setScore(prev => prev + 10)
            setInput('')
        }
    }

    // Effect for Game Over to save session
    useEffect(() => {
        if (gameState === 'gameover') {
            endSession(score, { lives_left: lives })
        }
    }, [gameState])


    const handleKeyDown = (e: React.KeyboardEvent) => {
        // Prevent form submission if we had one
    }

    if (loading) return <div className="text-white text-center mt-20">Laden...</div>

    if (gameState === 'gameover') {
        return (
            <GameLayout title="Woordenjacht" score={score} onExit={() => navigate('/game/home')}>
                <div className="text-center animate-in zoom-in">
                    <h1 className="text-5xl font-display font-bold text-white mb-6">Game Over!</h1>
                    <p className="text-xl text-space-200 mb-8">Je hebt {score} punten.</p>
                    <button
                        onClick={() => {
                            setLives(3)
                            setScore(0)
                            setActiveWords([])
                            setGameState('playing')
                        }}
                        className="bg-brand-teal text-space-900 font-bold px-8 py-3 rounded-xl"
                    >
                        Opnieuw Spelen
                    </button>
                </div>
            </GameLayout>
        )
    }

    return (
        <GameLayout title="Woordenjacht" score={score} onExit={() => navigate('/game/home')}>
            {/* HUD */}
            <div className="absolute top-4 left-4 flex gap-2">
                {[...Array(3)].map((_, i) => (
                    <Heart key={i} className={`${i < lives ? 'text-red-500 fill-current' : 'text-space-700'}`} />
                ))}
            </div>

            {/* Game Area */}
            <div className="relative w-full h-[60vh] bg-space-900/50 rounded-xl border border-space-700 overflow-hidden mb-4">
                {activeWords.map(word => (
                    <div
                        key={word.id}
                        className="absolute px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-white font-bold border border-white/20 shadow-lg transition-all duration-75"
                        style={{ left: `${word.x}%`, top: `${word.y}%` }}
                    >
                        {word.text}
                    </div>
                ))}

                {/* Danger Zone */}
                <div className="absolute bottom-0 w-full h-1 bg-red-500/50 animate-pulse shadow-[0_0_20px_rgba(255,0,0,0.5)]"></div>
            </div>

            {/* Input Area */}
            <div className="flex justify-center">
                <div className="relative w-full max-w-md">
                    <input
                        value={input}
                        onChange={handleInput}
                        autoFocus
                        placeholder="Typ het woord..."
                        className="w-full bg-space-800 border-2 border-brand-teal rounded-full py-4 pl-6 pr-12 text-2xl text-white outline-none shadow-[0_0_30px_rgba(45,212,191,0.2)]"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-space-400">
                        <Keyboard />
                    </div>
                </div>
            </div>
        </GameLayout>
    )
}
