import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useGamification } from '../../context/GamificationContext'
import { useGameSession } from '../../hooks/useGameSession'
import { GameLayout } from '../../components/game/GameLayout'
import { useGameSounds } from '../../hooks/useGameSounds'
import { Brain, Star, Check, Sparkles } from 'lucide-react'
import confetti from 'canvas-confetti'

export const MysterieMissie = () => {
    const { selectedChild } = useAuth()
    const { completeChallengeTask } = useGamification()
    const navigate = useNavigate()
    const { playCorrect, playWrong } = useGameSounds()
    const { endSession } = useGameSession('logic-puzzle')

    const [level, setLevel] = useState(1)
    const [score, setScore] = useState(0)
    const [gameState, setGameState] = useState<'playing' | 'finished'>('playing')

    // Pattern State
    const [sequence, setSequence] = useState<string[]>([])
    const [options, setOptions] = useState<string[]>([])
    const [missingIndex, setMissingIndex] = useState(0) // The index the user needs to guess

    const ICONS = ['🚀', '👽', '🪐', '⭐', '🛸', '🌛']

    useEffect(() => {
        if (!selectedChild) {
            navigate('/child/select')
            return
        }
        startLevel(1)
    }, [selectedChild])

    const startLevel = (lvl: number) => {
        setLevel(lvl)
        generatePattern(lvl)
    }

    const generatePattern = (lvl: number) => {
        // Simple Logic:
        // Level 1: ABAB... [?]
        // Level 2: AAB AAB... [?] (More complex repetition)
        // Level 3: ABC ABC... [?]

        let patternType = 'ABAB'
        if (lvl > 2) patternType = 'AAB'
        if (lvl > 5) patternType = 'ABC'

        // Pick symbols
        const symbolA = ICONS[Math.floor(Math.random() * ICONS.length)]
        let symbolB = ICONS[Math.floor(Math.random() * ICONS.length)]
        while (symbolB === symbolA) symbolB = ICONS[Math.floor(Math.random() * ICONS.length)]

        let symbolC = ICONS[Math.floor(Math.random() * ICONS.length)]
        while (symbolC === symbolA || symbolC === symbolB) symbolC = ICONS[Math.floor(Math.random() * ICONS.length)]

        let fullSeq: string[] = []
        const length = 5 + Math.floor(lvl / 2) // Length grows

        for (let i = 0; i < length; i++) {
            if (patternType === 'ABAB') {
                fullSeq.push(i % 2 === 0 ? symbolA : symbolB)
            } else if (patternType === 'AAB') {
                fullSeq.push(i % 3 === 2 ? symbolB : symbolA) // A A B
            } else {
                fullSeq.push(i % 3 === 0 ? symbolA : (i % 3 === 1 ? symbolB : symbolC))
            }
        }

        // Determine missing item (always the last one for now to complete the pattern)
        setMissingIndex(fullSeq.length) // The next item is missing

        // Calculate what the answer WOULD be
        let answer = ''
        if (patternType === 'ABAB') answer = (fullSeq.length % 2 === 0 ? symbolA : symbolB)
        else if (patternType === 'AAB') answer = (fullSeq.length % 3 === 2 ? symbolB : symbolA)
        else answer = (fullSeq.length % 3 === 0 ? symbolA : (fullSeq.length % 3 === 1 ? symbolB : symbolC))

        setSequence(fullSeq) // The VISIBLE sequence (not including the missing one yet)

        // Options: The answer + some randoms
        const wrong1 = ICONS.find(x => x !== answer) || '❓'
        const wrong2 = ICONS.find(x => x !== answer && x !== wrong1) || '❓'

        setOptions([answer, wrong1, wrong2].sort(() => Math.random() - 0.5))
    }

    const checkAnswer = (selected: string) => {
        // Re-calculate correct answer to verify
        // Actually, let's store correct answer in state or derive simpler.
        // Simplest: Extend sequence logic.

        // Helper to get correct answer based on current sequence and logic
        // But wait, my generatePattern logic was slightly convoluted for "next item".
        // Let's rely on the user visually matching.
        // Re-derive for correctness check:
        let isCorrect = false

        // Analyzing the sequence to find the pattern source
        // Heuristic: Check the Last few items?
        // Let's cheat: I know what I generated.

        // To avoid state mess: verify if adding this item maintains the pattern?
        // Let's assume the user MUST pick the one that follows logic.

        // Actually, easier way: Store the `correctAnswer` in state.

        // RE-FIXING Generation to be robust
        // I will do this in the `generatePattern` state update if I could... 
        // For now, I'll just check if it matches the logic.

        // Let's restart generation logic to be cleaner.
        // See new `generatePattern` below.
    }

    // ... WAIT, I can't put complex logic inside the `ReplacementContent` easily without error. 
    // I will rewrite the whole component cleanly.

    // RENDER
    return (
        <GameLayout title={`Kraak de code: Level ${level}`} score={score} onExit={() => navigate('/game/home')}>
            <LogicGameInner
                level={level}
                startNext={() => startLevel(level + 1)}
                addScore={() => setScore(s => s + 10)}
                onFinish={() => {
                    setGameState('finished')
                    endSession(score + 50)
                    completeChallengeTask('logic')
                }}
            />

            <div className="mt-8 text-center">
                <button onClick={() => navigate('/game/home')} className="text-space-400 hover:text-white underline font-bold tracking-widest text-sm">
                    STOPPEN & TERUG
                </button>
            </div>
        </GameLayout>
    )
}

const LogicGameInner = ({ level, startNext, addScore, onFinish }: any) => {
    const { playCorrect, playWrong } = useGameSounds()
    const [sequence, setSequence] = useState<string[]>([])
    const [options, setOptions] = useState<string[]>([])
    const [correctAnswer, setCorrectAnswer] = useState('')

    useEffect(() => {
        newPuzzle()
    }, [level])

    const ICONS = ['🚀', '👽', '🪐', '⭐', '🛸', '🌛', '☀️', '🌍']

    const newPuzzle = () => {
        // Pattern Types
        const types = ['ABAB', 'AABB', 'ABC']
        const type = types[Math.min(Math.floor((level - 1) / 3), 2)]

        const A = ICONS[Math.floor(Math.random() * ICONS.length)]
        let B = ICONS[Math.floor(Math.random() * ICONS.length)]
        while (B === A) B = ICONS[Math.floor(Math.random() * ICONS.length)]

        let C = ICONS[Math.floor(Math.random() * ICONS.length)]
        while (C === A || C === B) C = ICONS[Math.floor(Math.random() * ICONS.length)]

        let pat: string[] = []
        const len = 4 + Math.floor(level / 2) // 4, 4, 5, 5, 6...

        for (let i = 0; i < len; i++) {
            if (type === 'ABAB') pat.push(i % 2 === 0 ? A : B)
            else if (type === 'AABB') pat.push((i % 4 < 2) ? A : B)
            else if (type === 'ABC') pat.push(i % 3 === 0 ? A : (i % 3 === 1 ? B : C))
        }

        // Determine next
        let next = ''
        const nextIdx = len
        if (type === 'ABAB') next = (nextIdx % 2 === 0 ? A : B)
        else if (type === 'AABB') next = ((nextIdx % 4 < 2) ? A : B)
        else if (type === 'ABC') next = (nextIdx % 3 === 0 ? A : (nextIdx % 3 === 1 ? B : C))

        setSequence(pat)
        setCorrectAnswer(next)

        // Options
        const opts = new Set([next])
        while (opts.size < 3) {
            opts.add(ICONS[Math.floor(Math.random() * ICONS.length)])
        }
        setOptions(Array.from(opts).sort(() => Math.random() - 0.5))
    }

    const handleGuess = (val: string) => {
        if (val === correctAnswer) {
            playCorrect()
            addScore()
            confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } })

            if (level < 10) {
                setTimeout(startNext, 1000)
            } else {
                onFinish()
            }
        } else {
            playWrong()
        }
    }

    return (
        <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
            {/* Sequence Display */}
            <div className="flex gap-4 mb-12 flex-wrap justify-center bg-white/10 p-8 rounded-3xl backdrop-blur-sm border border-white/10 shadow-2xl">
                {sequence.map((item, i) => (
                    <div key={i} className="text-6xl animate-in zoom-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                        {item}
                    </div>
                ))}
                <div className="w-20 h-20 bg-space-800 rounded-xl border-4 border-dashed border-space-400 flex items-center justify-center animate-pulse">
                    <span className="text-4xl text-space-400">?</span>
                </div>
            </div>

            <h3 className="text-2xl text-white font-bold mb-6">Wat komt er daarna?</h3>

            {/* Options */}
            <div className="flex gap-6">
                {options.map((opt, i) => (
                    <button
                        key={i}
                        onClick={() => handleGuess(opt)}
                        className="w-24 h-24 bg-white rounded-2xl text-6xl shadow-xl hover:scale-110 hover:-translate-y-2 transition-all active:scale-95 border-b-8 border-space-200"
                    >
                        {opt}
                    </button>
                ))}
            </div>
        </div>
    )
}
