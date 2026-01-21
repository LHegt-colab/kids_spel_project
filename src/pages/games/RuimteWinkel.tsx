
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useGamification } from '../../context/GamificationContext'
import { useGameSession } from '../../hooks/useGameSession'
import { GameLayout } from '../../components/game/GameLayout'
import { useGameSounds } from '../../hooks/useGameSounds'
import { ShoppingBag, Coins, Calculator, Check, ShoppingCart, Clock, ArrowRight } from 'lucide-react'
import { useKeyboardInput } from '../../hooks/useKeyboardInput'
import confetti from 'canvas-confetti'

interface ShopItem {
    id: string
    name: string
    price: number
    icon: string
}

export const RuimteWinkel = () => {
    const { selectedChild } = useAuth()
    const { completeChallengeTask } = useGamification()
    const navigate = useNavigate()
    const { playCorrect, playWrong } = useGameSounds()
    const { endSession, logAnswer } = useGameSession('shop-game')

    const [gameMode, setGameMode] = useState<'select' | 'shop' | 'time'>('select')

    // Shared State
    const [level, setLevel] = useState(1)
    const [score, setScore] = useState(0)
    const [gameState, setGameState] = useState<'playing' | 'finished'>('playing')

    // Shop State
    const [customerOrder, setCustomerOrder] = useState<ShopItem[]>([])
    const [totalPrice, setTotalPrice] = useState(0)
    const [userCalculation, setUserCalculation] = useState('')

    // Time State
    const [targetTime, setTargetTime] = useState<{ h: number, m: number }>({ h: 12, m: 0 })
    const [timeOptions, setTimeOptions] = useState<string[]>([])

    const SHOP_ITEMS: ShopItem[] = [
        { id: '1', name: 'Appel', price: 1, icon: '🍎' },
        { id: '2', name: 'Brood', price: 2, icon: '🍞' },
        { id: '3', name: 'Melk', price: 2, icon: '🥛' },
        { id: '4', name: 'Taart', price: 5, icon: '🎂' },
        { id: '5', name: 'Raketijsje', price: 3, icon: '🍦' },
        { id: '6', name: 'Alien Knuffel', price: 10, icon: '👾' },
    ]

    useEffect(() => {
        if (!selectedChild) {
            navigate('/child/select')
        }
    }, [selectedChild])

    // --- GAME MODES ---

    const startShopGame = () => {
        setGameMode('shop')
        setGameState('playing')
        startShopLevel(1)
    }

    const startTimeGame = () => {
        setGameMode('time')
        setGameState('playing')
        startTimeLevel(1)
    }

    // --- SHOP LOGIC ---

    const startShopLevel = (lvl: number) => {
        setLevel(lvl)
        const count = 1 + lvl
        const order = Array.from({ length: count }, () => SHOP_ITEMS[Math.floor(Math.random() * SHOP_ITEMS.length)])
        setCustomerOrder(order)
        setTotalPrice(order.reduce((sum, item) => sum + item.price, 0))
        setUserCalculation('')
    }

    const handleShopNumpad = (num: number) => {
        setUserCalculation(prev => prev.length < 3 ? prev + num : prev)
    }

    const checkShopTotal = () => {
        const inputVal = parseInt(userCalculation)
        if (inputVal === totalPrice) {
            playCorrect()
            setScore(prev => prev + 10)
            logAnswer(`shop-level-${level}`, true, userCalculation, totalPrice.toString())

            if (level < 5) {
                confetti({ particleCount: 50, spread: 50, origin: { y: 0.7 } })
                setTimeout(() => startShopLevel(level + 1), 1500)
            } else {
                finishGame(score + 10 + 50)
            }
        } else {
            playWrong()
            logAnswer(`shop-level-${level}`, false, userCalculation, totalPrice.toString())
            setUserCalculation('')
        }
    }


    useKeyboardInput({
        onInput: (val) => {
            if (gameMode === 'shop') setUserCalculation(prev => prev.length < 3 ? prev + val : prev)
        },
        onDelete: () => {
            if (gameMode === 'shop') setUserCalculation(prev => prev.slice(0, -1))
        },
        onSubmit: () => {
            if (gameMode === 'shop') checkShopTotal()
        },
        disabled: gameMode !== 'shop'
    })

    // --- TIME LOGIC ---

    const startTimeLevel = (lvl: number) => {
        setLevel(lvl)
        // Generate random time
        // Level 1: Whole hours
        // Level 2: Half hours
        // Level 3: Quarter hours

        let h = Math.floor(Math.random() * 12) + 1
        let m = 0

        if (lvl > 1) m = Math.random() > 0.5 ? 30 : 0
        if (lvl > 3) m = [0, 15, 30, 45][Math.floor(Math.random() * 4)]

        setTargetTime({ h, m })
        generateTimeOptions(h, m)
    }

    const generateTimeOptions = (h: number, m: number) => {
        const correct = formatTime(h, m)
        const options = new Set([correct])

        while (options.size < 4) {
            const rh = Math.floor(Math.random() * 12) + 1
            const rm = [0, 15, 30, 45][Math.floor(Math.random() * 4)]
            options.add(formatTime(rh, rm))
        }

        setTimeOptions(Array.from(options).sort())
    }

    const formatTime = (h: number, m: number) => `${h}:${m.toString().padStart(2, '0')}`

    const checkTimeAnswer = (answer: string) => {
        const correct = formatTime(targetTime.h, targetTime.m)
        if (answer === correct) {
            playCorrect()
            setScore(prev => prev + 10)
            logAnswer(`time-level-${level}`, true, answer, correct)

            if (level < 5) {
                confetti({ particleCount: 50, spread: 50, origin: { y: 0.7 } })
                setTimeout(() => startTimeLevel(level + 1), 1500)
            } else {
                finishGame(score + 10 + 50)
            }
        } else {
            playWrong()
            logAnswer(`time-level-${level}`, false, answer, correct)
        }
    }

    // --- SHARED FINISH ---

    const finishGame = (finalScore: number) => {
        setGameState('finished')
        endSession(finalScore)
        if (finalScore > 0) {
            completeChallengeTask(gameMode === 'time' ? 'math' : 'math') // Both count as Math/Logic? Let's say Math.
        }
        confetti({ particleCount: 150, spread: 100 })
    }


    // --- RENDER ---

    if (gameMode === 'select') {
        return (
            <GameLayout title="Kies een Spel" score={0} onExit={() => navigate('/game/home')}>
                <div className="flex flex-col md:flex-row gap-8 items-center justify-center h-full animate-in zoom-in">
                    <button onClick={startShopGame} className="bg-white p-8 rounded-3xl shadow-xl flex flex-col items-center gap-4 hover:scale-105 transition-all group border-4 border-transparent hover:border-brand-teal">
                        <div className="w-32 h-32 bg-pink-100 rounded-full flex items-center justify-center group-hover:bg-pink-200 transition-colors">
                            <ShoppingBag size={64} className="text-pink-500" />
                        </div>
                        <h2 className="text-3xl font-bold text-space-900">Winkel</h2>
                        <p className="text-space-500">Reken uit wat het kost</p>
                    </button>

                    <button onClick={startTimeGame} className="bg-white p-8 rounded-3xl shadow-xl flex flex-col items-center gap-4 hover:scale-105 transition-all group border-4 border-transparent hover:border-brand-teal">
                        <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                            <Clock size={64} className="text-blue-500" />
                        </div>
                        <h2 className="text-3xl font-bold text-space-900">Klokkijken</h2>
                        <p className="text-space-500">Hoe laat is het?</p>
                    </button>
                </div>
            </GameLayout>
        )
    }

    if (gameState === 'finished') {
        return (
            <GameLayout title="Goed Gedaan!" score={score} onExit={() => navigate('/game/home')}>
                <div className="text-center animate-in zoom-in">
                    <div className="w-32 h-32 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/50">
                        <Check size={64} className="text-white" />
                    </div>
                    <h1 className="text-4xl font-display font-bold text-white mb-2">Geweldig!</h1>
                    <p className="text-xl text-space-200 mb-8">Je hebt {score} punten verdiend.</p>
                </div>
            </GameLayout>
        )
    }

    if (gameMode === 'shop') {
        return (
            <GameLayout title={`Winkel - Klant ${level}`} score={score} onExit={() => setGameMode('select')}>
                <div className="flex flex-col md:flex-row gap-8 max-w-5xl mx-auto h-full">
                    {/* Order Panel */}
                    <div className="flex-1 bg-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
                        <h3 className="text-2xl font-bold text-space-900 mb-6 flex items-center gap-3">
                            <ShoppingCart className="text-brand-teal" /> Bestelling
                        </h3>
                        <div className="space-y-4">
                            {customerOrder.map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-space-50 rounded-lg border border-space-100">
                                    <div className="flex items-center gap-4">
                                        <span className="text-3xl">{item.icon}</span>
                                        <span className="text-xl font-bold text-space-800">{item.name}</span>
                                    </div>
                                    <div className="text-xl font-bold text-brand-purple">€ {item.price}</div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-8 pt-6 border-t-2 border-dashed border-space-200 text-center text-space-500 font-medium">Hoeveel kost dit samen?</div>
                    </div>

                    {/* Calculator */}
                    <div className="flex-1 bg-space-800 rounded-2xl p-6 shadow-2xl flex flex-col items-center justify-center">
                        <div className="bg-space-900 w-full p-6 rounded-xl mb-6 text-right border-4 border-space-700 shadow-inner">
                            <span className="text-5xl font-mono text-brand-yellow tracking-widest">€ {userCalculation || '?'}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-3 w-full max-w-xs">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                                <button key={num} onClick={() => handleShopNumpad(num)} className="bg-space-700 text-white text-3xl font-bold p-4 rounded-xl hover:bg-space-600 transition-colors shadow-lg">{num}</button>
                            ))}
                            <button onClick={() => setUserCalculation(prev => prev.slice(0, -1))} className="bg-red-500 hover:bg-red-400 text-white font-bold p-4 rounded-xl shadow-lg">←</button>
                            <button onClick={() => handleShopNumpad(0)} className="bg-space-700 text-white text-3xl font-bold p-4 rounded-xl hover:bg-space-600">0</button>
                            <button onClick={checkShopTotal} className="bg-green-500 text-white font-bold p-4 rounded-xl hover:bg-green-400 flex items-center justify-center shadow-lg"><Check size={32} /></button>
                        </div>
                        <button onClick={() => setGameMode('select')} className="mt-8 text-space-400 hover:text-white underline font-bold tracking-widest text-sm">
                            STOPPEN
                        </button>
                    </div>
                </div>
            </GameLayout>
        )
    }

    if (gameMode === 'time') {
        // Analog Clock Drawing Logic Helper
        const rotation = (targetTime.h % 12) * 30 + (targetTime.m / 2)
        const minRotation = targetTime.m * 6

        return (
            <GameLayout title={`Klokkijken - Niveau ${level}`} score={score} onExit={() => setGameMode('select')}>
                <div className="flex flex-col items-center justify-center h-full">
                    {/* Clock Face */}
                    <div className="relative w-80 h-80 bg-white rounded-full border-8 border-space-700 shadow-2xl mb-12 flex items-center justify-center">
                        {/* Hour Marks */}
                        {[...Array(12)].map((_, i) => (
                            <div key={i} className="absolute w-2 h-6 bg-space-300 origin-bottom" style={{ transform: `rotate(${i * 30}deg) translateY(-145px)` }}></div>
                        ))}
                        {/* Center Dot */}
                        <div className="absolute w-4 h-4 bg-space-900 rounded-full z-20"></div>

                        {/* Hands */}
                        {/* Hour Hand */}
                        <div className="absolute w-2 h-20 bg-space-900 rounded-full origin-bottom z-10" style={{ transform: `translateY(-50%) rotate(${rotation}deg)` }}></div>
                        {/* Minute Hand */}
                        <div className="absolute w-1 h-32 bg-brand-teal rounded-full origin-bottom z-10" style={{ transform: `translateY(-50%) rotate(${minRotation}deg)` }}></div>
                    </div>

                    {/* Options */}
                    <h2 className="text-3xl font-bold text-white mb-8">Hoe laat is het?</h2>
                    <div className="grid grid-cols-2 gap-4 w-full max-w-lg">
                        {timeOptions.map((opt, i) => (
                            <button
                                key={i}
                                onClick={() => checkTimeAnswer(opt)}
                                className="bg-white hover:bg-brand-yellow text-space-900 text-3xl font-bold py-6 rounded-2xl shadow-lg transition-all hover:scale-105 active:scale-95"
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                </div>
            </GameLayout>
        )
    }

    return null
}
