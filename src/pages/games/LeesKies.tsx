import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { GameLayout } from '../../components/game/GameLayout'
import { useGameSounds } from '../../hooks/useGameSounds'
import { useGameSession } from '../../hooks/useGameSession'
import { BookOpen, Check, X, Trophy } from 'lucide-react'
import confetti from 'canvas-confetti'

interface Question {
    id: string
    question: string
    options: string[]
    correct_answer: string
}

interface Text {
    id: string
    title: string
    content: string
}

export const LeesKies = () => {
    const { selectedChild } = useAuth()
    const navigate = useNavigate()
    const { playCorrect, playWrong } = useGameSounds()
    const { sessionId, endSession, logAnswer } = useGameSession('read-quiz')

    const [loading, setLoading] = useState(true)
    const [texts, setTexts] = useState<Text[]>([])
    const [currentText, setCurrentText] = useState<Text | null>(null)
    const [questions, setQuestions] = useState<Question[]>([])

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [score, setScore] = useState(0)
    const [selectedOption, setSelectedOption] = useState<string | null>(null)
    const [explanation, setExplanation] = useState<string | null>(null)
    const [isFinished, setIsFinished] = useState(false)
    const [textSelectionMode, setTextSelectionMode] = useState(true)

    useEffect(() => {
        if (!selectedChild) {
            navigate('/child/select')
            return
        }
        fetchTexts()
    }, [selectedChild])

    const fetchTexts = async () => {
        const { data } = await supabase
            .from('library_texts')
            .select('*')
            .limit(10)

        if (data && data.length > 0) {
            setTexts(data)
        } else {
            // Default sample
            setTexts([{
                id: 'sample-1',
                title: 'De Ruimtereis',
                content: 'Sep en Suus gaan op reis. Ze stappen in een raket. De raket is groot en zilver. "3, 2, 1, start!" roept Sep. Vroem! De raket vliegt omhoog. Ze zien de maan. De maan is van kaas? Nee, dat is een grapje. De maan is van steen.'
            }])
        }
        setLoading(false)
    }

    const startText = async (text: Text) => {
        setLoading(true)
        setCurrentText(text)

        // Fetch questions for this text
        // Note: For V1 sample, we might hardcode if using sample-1
        let qs: Question[] = []

        if (text.id === 'sample-1') {
            qs = [
                { id: 'q1', question: 'Waar gaan Sep en Suus mee op reis?', options: ['Een auto', 'Een raket', 'Een fiets'], correct_answer: 'Een raket' },
                { id: 'q2', question: 'Welke kleur heeft de raket?', options: ['Rood', 'Blauw', 'Zilver'], correct_answer: 'Zilver' },
                { id: 'q3', question: 'Is de maan van kaas?', options: ['Ja', 'Nee', 'Misschien'], correct_answer: 'Nee' }
            ]
        } else {
            const { data } = await supabase
                .from('library_questions')
                .select('*')
                .eq('text_id', text.id)
            if (data) qs = data
        }

        if (qs.length === 0) {
            alert("Dit verhaal heeft nog geen vragen!")
            setLoading(false)
            return
        }

        setQuestions(qs)
        setCurrentQuestionIndex(0)
        setScore(0)
        setIsFinished(false)
        setTextSelectionMode(false)
        setLoading(false)
    }

    const handleOptionSelect = (option: string) => {
        if (selectedOption) return // Locked
        setSelectedOption(option)

        const currentQ = questions[currentQuestionIndex]
        if (option === currentQ.correct_answer) {
            playCorrect()
            setScore(prev => prev + 10)
            setExplanation('Goed gedaan!')
            logAnswer(currentQ.id, true, option, currentQ.correct_answer)
            confetti({ particleCount: 30, spread: 50, origin: { x: 0.7 } })
        } else {
            playWrong()
            setExplanation(`Helaas! Het goede antwoord was: ${currentQ.correct_answer}`)
            logAnswer(currentQ.id, false, option, currentQ.correct_answer)
        }
    }

    const nextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1)
            setSelectedOption(null)
            setExplanation(null)
        } else {
            setIsFinished(true)
            endSession(score) // Note: using score state here might be stale if updated in same tick, but here it's separate event.
            // Actually, waiting for next tick or using accumulated value is safer.
            // But score only updates on option select, and end session is separate click "Next", so it's fine.
            confetti({ particleCount: 200, spread: 100 })
        }
    }

    if (loading) return <div className="text-white text-center mt-20">Laden...</div>

    // Mode 1: Select Text
    if (textSelectionMode) {
        return (
            <GameLayout title="Kies een Verhaal" score={0} onExit={() => navigate('/game/home')}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                    {texts.map(text => (
                        <button
                            key={text.id}
                            onClick={() => startText(text)}
                            className="bg-white rounded-2xl p-6 text-left shadow-lg hover:scale-105 transition-transform group"
                        >
                            <div className="w-12 h-12 bg-brand-purple/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-brand-purple/20 transition-colors">
                                <BookOpen className="text-brand-purple" size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-space-900 mb-2">{text.title}</h3>
                            <p className="text-space-500 text-sm line-clamp-3">{text.content}</p>
                        </button>
                    ))}
                </div>
            </GameLayout>
        )
    }

    // Mode 3: Finished
    if (isFinished) {
        return (
            <GameLayout title="Klaar!" score={score} onExit={() => navigate('/game/home')}>
                <div className="text-center animate-in zoom-in">
                    <Trophy size={80} className="text-brand-yellow mx-auto mb-6" />
                    <h1 className="text-4xl font-display font-bold text-white mb-2">Verhaal Uitgelezen!</h1>
                    <p className="text-xl text-space-200 mb-8">Je score: {score} punten</p>
                    <button
                        onClick={() => setTextSelectionMode(true)}
                        className="bg-brand-teal text-space-900 font-bold px-8 py-3 rounded-xl"
                    >
                        Nog een verhaal kiezen
                    </button>
                </div>
            </GameLayout>
        )
    }

    // Mode 2: Reading & Quiz
    const currentQ = questions[currentQuestionIndex]

    return (
        <GameLayout title={currentText?.title || 'Lezen'} score={score} onExit={() => navigate('/game/home')}>
            <div className="flex flex-col md:flex-row gap-8 max-w-6xl mx-auto h-[70vh]">

                {/* Text Panel (Left) */}
                <div className="flex-1 bg-white/95 backdrop-blur rounded-2xl p-8 shadow-xl overflow-y-auto border-l-8 border-brand-purple">
                    <div className="prose prose-lg text-space-900 max-w-none font-reading leading-relaxed">
                        {currentText?.content.split('\n').map((para, i) => (
                            <p key={i} className="mb-4">{para}</p>
                        ))}
                    </div>
                </div>

                {/* Question Panel (Right) */}
                <div className="flex-1 flex flex-col justify-center">
                    <div className="bg-space-800/80 backdrop-blur rounded-2xl p-6 border border-space-600 shadow-2xl">
                        <div className="text-brand-teal font-bold uppercase tracking-wider text-sm mb-2">Vraag {currentQuestionIndex + 1} / {questions.length}</div>
                        <h3 className="text-2xl font-bold text-white mb-6 leading-snug">{currentQ.question}</h3>

                        <div className="space-y-3">
                            {currentQ.options.map((option, idx) => {
                                const isSelected = selectedOption === option
                                const isCorrect = option === currentQ.correct_answer
                                const showCorrect = selectedOption && isCorrect
                                const showWrong = selectedOption && isSelected && !isCorrect

                                let btnClass = "w-full text-left p-4 rounded-xl font-bold text-lg transition-all border-2 border-transparent"
                                if (selectedOption) {
                                    if (isCorrect) btnClass += " bg-green-500 text-white border-green-400"
                                    else if (isSelected) btnClass += " bg-red-500 text-white border-red-400"
                                    else btnClass += " bg-space-700 text-space-400 opacity-50"
                                } else {
                                    btnClass += " bg-space-700 text-white hover:bg-space-600 hover:border-brand-teal/50"
                                }

                                return (
                                    <button
                                        key={idx}
                                        onClick={() => handleOptionSelect(option)}
                                        disabled={!!selectedOption}
                                        className={btnClass}
                                    >
                                        <div className="flex items-center justify-between">
                                            {option}
                                            {showCorrect && <Check />}
                                            {showWrong && <X />}
                                        </div>
                                    </button>
                                )
                            })}
                        </div>

                        {selectedOption && (
                            <div className="mt-6 animate-in slide-in-from-bottom-2 fade-in">
                                <div className={`p-4 rounded-xl mb-4 text-center font-bold ${explanation?.includes('Goed') ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                                    {explanation}
                                </div>
                                <button
                                    onClick={nextQuestion}
                                    className="w-full bg-brand-yellow text-space-900 font-bold py-4 rounded-xl shadow-lg hover:brightness-110 flex items-center justify-center gap-2"
                                >
                                    {currentQuestionIndex < questions.length - 1 ? 'Volgende Vraag' : 'Afronden'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </GameLayout>
    )
}
