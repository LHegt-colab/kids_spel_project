import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useGamification } from '../../context/GamificationContext'
import { useGameSession } from '../../hooks/useGameSession'
import { GameLayout } from '../../components/game/GameLayout'
import { useGameSounds } from '../../hooks/useGameSounds'
import { ShoppingBag, Coins, Calculator, Check, ShoppingCart } from 'lucide-react'
import confetti from 'canvas-confetti'

interface ShopItem {
    id: string
    name: string
    price: number
    icon: string
}

export const RuimteWinkel = () => {
    const { selectedChild } = useAuth()
    const navigate = useNavigate()
    const { playCorrect, playWrong } = useGameSounds()
    const { endSession, logAnswer } = useGameSession('shop-game')

    const [level, setLevel] = useState(1)
    const [score, setScore] = useState(0)
    const [customerOrder, setCustomerOrder] = useState<ShopItem[]>([])
    const [totalPrice, setTotalPrice] = useState(0)
    const [userCalculation, setUserCalculation] = useState('')
    const [gameState, setGameState] = useState<'calculating' | 'change' | 'finished'>('calculating')

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
            return
        }
        startLevel(1)
    }, [selectedChild])

    const startLevel = (lvl: number) => {
        setLevel(lvl)
        generateOrder(lvl)
        setUserCalculation('')
        setGameState('calculating')
    }

    const generateOrder = (lvl: number) => {
        // Level 1: 2 items
        // Level 2: 3 items
        // Level 3: 4 items
        const count = 1 + lvl
        const order = Array.from({ length: count }, () => SHOP_ITEMS[Math.floor(Math.random() * SHOP_ITEMS.length)])
        setCustomerOrder(order)
        setTotalPrice(order.reduce((sum, item) => sum + item.price, 0))
    }

    const handleNumpad = (num: number) => {
        setUserCalculation(prev => prev.length < 3 ? prev + num : prev)
    }

    const handleBackspace = () => {
        setUserCalculation(prev => prev.slice(0, -1))
    }

    const checkTotal = () => {
        const inputVal = parseInt(userCalculation)
        if (inputVal === totalPrice) {
            playCorrect()
            setScore(prev => prev + 10)
            logAnswer(`order-level-${level}`, true, userCalculation, totalPrice.toString())

            // Next Level or Finish
            if (level < 5) {
                confetti({ particleCount: 50, spread: 50, origin: { y: 0.7 } })
                setTimeout(() => startLevel(level + 1), 1500)
            } else {
                setGameState('finished')
                endSession(score + 10 + 50) // Bonus for finishing
                confetti({ particleCount: 150, spread: 100 })
            }
        } else {
            playWrong()
            logAnswer(`order-level-${level}`, false, userCalculation, totalPrice.toString())
            setUserCalculation('')
        }
    }

    if (gameState === 'finished') {
        return (
            <GameLayout title="Winkel Gesloten!" score={score} onExit={() => navigate('/game/home')}>
                <div className="text-center animate-in zoom-in">
                    <ShoppingBag size={80} className="text-brand-teal mx-auto mb-6" />
                    <h1 className="text-4xl font-display font-bold text-white mb-2">Goed Verkocht!</h1>
                    <p className="text-xl text-space-200 mb-8">Je hebt alle klanten geholpen.</p>
                </div>
            </GameLayout>
        )
    }

    return (
        <GameLayout title={`Ruimte Winkel - Klant ${level}`} score={score} onExit={() => navigate('/game/home')}>
            <div className="flex flex-col md:flex-row gap-8 max-w-5xl mx-auto h-full">

                {/* Order Panel */}
                <div className="flex-1 bg-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-brand-teal animate-pulse"></div>
                    <h3 className="text-2xl font-bold text-space-900 mb-6 flex items-center gap-3">
                        <ShoppingCart className="text-brand-teal" /> Bestelling
                    </h3>

                    <div className="space-y-4">
                        {customerOrder.map((item, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-space-50 rounded-lg border border-space-100 animate-in slide-in-from-left fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                                <div className="flex items-center gap-4">
                                    <span className="text-3xl">{item.icon}</span>
                                    <span className="text-xl font-bold text-space-800">{item.name}</span>
                                </div>
                                <div className="text-xl font-bold text-brand-purple">€ {item.price}</div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 pt-6 border-t-2 border-dashed border-space-200">
                        <p className="text-center text-space-500 font-medium">Hoeveel kost dit samen?</p>
                    </div>
                </div>

                {/* Calculator Panel */}
                <div className="flex-1 bg-space-800 rounded-2xl p-6 shadow-2xl border border-space-600 flex flex-col items-center justify-center">
                    <div className="bg-space-900 w-full p-6 rounded-xl mb-6 text-right border-4 border-space-700 shadow-inner">
                        <span className="text-5xl font-mono text-brand-yellow tracking-widest">
                            € {userCalculation || '?'}
                        </span>
                    </div>

                    <div className="grid grid-cols-3 gap-3 w-full max-w-xs">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                            <button
                                key={num}
                                onClick={() => handleNumpad(num)}
                                className="bg-space-700 text-white text-3xl font-bold p-4 rounded-xl hover:bg-space-600 hover:scale-105 transition-all shadow-lg active:scale-95"
                            >
                                {num}
                            </button>
                        ))}
                        <button onClick={handleBackspace} className="bg-red-500/80 text-white font-bold p-4 rounded-xl hover:bg-red-500 flex items-center justify-center">
                            ←
                        </button>
                        <button onClick={() => handleNumpad(0)} className="bg-space-700 text-white text-3xl font-bold p-4 rounded-xl hover:bg-space-600">
                            0
                        </button>
                        <button onClick={checkTotal} className="bg-green-500 text-white font-bold p-4 rounded-xl hover:bg-green-400 flex items-center justify-center shadow-lg hover:scale-105 transition-all">
                            <Check size={32} />
                        </button>
                    </div>
                </div>
            </div>
        </GameLayout>
    )
}
