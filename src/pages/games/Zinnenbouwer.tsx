import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { GameLayout } from '../../components/game/GameLayout'
import { useGameSounds } from '../../hooks/useGameSounds'
import { useGameSession } from '../../hooks/useGameSession'
import { Trophy, ArrowRight, RotateCcw } from 'lucide-react'
import confetti from 'canvas-confetti'

export const Zinnenbouwer = () => {
    const { selectedChild } = useAuth()
    const navigate = useNavigate()
    const { playCorrect, playWrong } = useGameSounds()
    const { sessionId, endSession, logAnswer } = useGameSession('sentence-builder')

    const [loading, setLoading] = useState(true)
    const [sentences, setSentences] = useState<any[]>([])
    const [currentIndex, setCurrentIndex] = useState(0)

    // Game State
    const [targetSentence, setTargetSentence] = useState<string[]>([])
    const [scrambledWords, setScrambledWords] = useState<{ id: number, text: string, hidden: boolean }[]>([])
    const [builtSentence, setBuiltSentence] = useState<{ id: number, text: string }[]>([])
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
    const [score, setScore] = useState(0)
    const [gameFinished, setGameFinished] = useState(false)

    useEffect(() => {
        if (!selectedChild) {
            navigate('/child/select')
            return
        }
        fetchSentences()
    }, [selectedChild])

    const fetchSentences = async () => {
        // Fetch sentences. Logic similar to Woordenjacht: ideally filter by difficulty/age.
        // For V1 we just fetch all available.

        const { data } = await supabase
            .from('library_sentences')
            .select('sentence_text')
            .limit(10)

        let pool = data?.map(d => d.sentence_text) || []

        // Default pool if empty
        if (pool.length === 0) {
            pool = [
                "De hond rent in het park.",
                "Ik vind ijsjes heel lekker.",
                "De maan is ver weg.",
                "Wij gaan met de raket naar Mars.",
                "De kat slaapt op de bank."
            ]
        }

        setSentences(pool)
        setLoading(false)
    }

    const startLevel = (index: number) => {
        if (index >= sentences.length) {
            setGameFinished(true)
            confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 } })
            return
        }

        const sentence = sentences[index]
        // Simple tokenizer: split by space, keep punctuation attached to word? 
        // For simplicity: remove punctuation for scrambling or keep it?
        // Let's keep it simple: split by space.
        const words = sentence.split(' ')
        setTargetSentence(words)

        // Scramble
        const scrambled = words.map((w: string, i: number) => ({ id: i, text: w, hidden: false }))
            .sort(() => Math.random() - 0.5)

        setScrambledWords(scrambled)
        setBuiltSentence([])
        setIsCorrect(null)
    }

    useEffect(() => {
        if (sentences.length > 0 && !loading) {
            startLevel(0)
        }
    }, [sentences, loading])

    const handleWordClick = (wordObj: { id: number, text: string, hidden: boolean }) => {
        if (wordObj.hidden || isCorrect !== null) return // Locked if checked

        // Add to built
        setBuiltSentence(prev => [...prev, wordObj])
        // Hide in bank
        setScrambledWords(prev => prev.map(w => w.id === wordObj.id ? { ...w, hidden: true } : w))
    }

    const handleRemoveWord = (index: number) => {
        if (isCorrect !== null) return

        const wordToRemove = builtSentence[index]
        // Remove from built
        setBuiltSentence(prev => prev.filter((_, i) => i !== index))
        // Show in bank
        setScrambledWords(prev => prev.map(w => w.id === wordToRemove.id ? { ...w, hidden: false } : w))
    }

    const checkAnswer = () => {
        const currentString = builtSentence.map(w => w.text).join(' ')
        const targetString = targetSentence.join(' ')

        if (currentString === targetString) {
            setIsCorrect(true)
            setScore(prev => prev + 20)
            playCorrect()
            logAnswer('sentence-' + currentIndex, true, currentString, targetString)
            confetti({ particleCount: 50, spread: 30, origin: { y: 0.7 } })
        } else {
            setIsCorrect(false)
            playWrong()
            logAnswer('sentence-' + currentIndex, false, currentString, targetString)
        }
    }

    const nextLevel = () => {
        setCurrentIndex(prev => prev + 1)
        startLevel(currentIndex + 1)
    }

    // Close session when finished
    useEffect(() => {
        if (gameFinished) {
            endSession(score)
        }
    }, [gameFinished])

    const retry = () => {
        // Reset current level
        setBuiltSentence([])
        setScrambledWords(prev => prev.map(w => ({ ...w, hidden: false })))
        setIsCorrect(null)
    }

    if (loading) return <div className="text-white text-center mt-20">Laden...</div>

    if (gameFinished) {
        return (
            <GameLayout title="Zinnenbouwer" score={score} onExit={() => navigate('/game/home')}>
                <div className="text-center animate-in zoom-in">
                    <Trophy size={80} className="text-brand-yellow mx-auto mb-6" />
                    <h1 className="text-4xl font-display font-bold text-white mb-2">Goed gedaan!</h1>
                    <p className="text-xl text-space-200 mb-8">Je hebt alle zinnen gemaakt.</p>
                    <button
                        onClick={() => navigate('/game/home')}
                        className="bg-brand-teal text-space-900 font-bold px-8 py-3 rounded-xl"
                    >
                        Terug
                    </button>
                </div>
            </GameLayout>
        )
    }

    return (
        <GameLayout title={`Zin ${currentIndex + 1} / ${sentences.length}`} score={score} onExit={() => navigate('/game/home')}>
            <div className="max-w-3xl mx-auto w-full">

                {/* Construction Area */}
                <div className={`
                    min-h-[120px] bg-white rounded-2xl p-6 mb-8 flex flex-wrap gap-3 items-center shadow-lg transition-all
                    ${isCorrect === true ? 'ring-4 ring-green-500 bg-green-50' : ''}
                    ${isCorrect === false ? 'ring-4 ring-red-500 bg-red-50' : ''}
                `}>
                    {builtSentence.length === 0 && <span className="text-gray-400 italic">Klik op de woorden om de zin te maken...</span>}

                    {builtSentence.map((word, i) => (
                        <button
                            key={i}
                            onClick={() => handleRemoveWord(i)}
                            className="bg-brand-purple text-white font-bold text-xl px-4 py-2 rounded-lg shadow-md hover:scale-105 transition-transform animate-in fade-in zoom-in duration-200"
                        >
                            {word.text}
                        </button>
                    ))}
                </div>

                {/* Feedback & Controls */}
                <div className="h-16 mb-8 flex items-center justify-center">
                    {isCorrect === null && builtSentence.length > 0 && (
                        <button onClick={checkAnswer} className="bg-brand-teal text-space-900 font-bold text-xl px-12 py-3 rounded-xl shadow-lg hover:scale-105 transition-transform">
                            Controleren
                        </button>
                    )}

                    {isCorrect === true && (
                        <button onClick={nextLevel} className="bg-green-500 text-white font-bold text-xl px-12 py-3 rounded-xl shadow-lg hover:scale-105 transition-transform flex items-center gap-2">
                            Volgende <ArrowRight />
                        </button>
                    )}

                    {isCorrect === false && (
                        <div className="flex gap-4">
                            <div className="bg-red-100 text-red-600 px-6 py-2 rounded-lg font-bold flex items-center">
                                Helaas! Probeer het opnieuw.
                            </div>
                            <button onClick={retry} className="bg-space-600 text-white p-3 rounded-lg hover:bg-space-500">
                                <RotateCcw />
                            </button>
                        </div>
                    )}
                </div>

                {/* Word Bank */}
                <div className="bg-space-800/50 p-6 rounded-2xl flex flex-wrap gap-4 justify-center border border-space-700 min-h-[150px]">
                    {scrambledWords.map((word) => (
                        <button
                            key={word.id}
                            onClick={() => handleWordClick(word)}
                            disabled={word.hidden}
                            className={`
                                font-bold text-xl px-6 py-3 rounded-xl shadow-lg transition-all duration-300
                                ${word.hidden
                                    ? 'bg-space-700 text-transparent scale-0 opacity-0 cursor-default'
                                    : 'bg-white text-space-900 hover:bg-space-100 hover:-translate-y-1'
                                }
                            `}
                        >
                            {word.text}
                        </button>
                    ))}
                </div>

            </div>
        </GameLayout>
    )
}
