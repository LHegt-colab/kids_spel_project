import React, { useEffect } from 'react'
import { Layout } from '../components/layout/Layout'
import { useAuth } from '../context/AuthContext'
import { useGamification } from '../context/GamificationContext'
import { Navigate, useNavigate } from 'react-router-dom'
import { ArrowLeft, Calculator, BookOpen, Search, Puzzle, Star, Zap, ShoppingBag } from 'lucide-react'

const MODULES = [
    { id: 'math-adventure', title: 'RekenAvontuur', icon: Calculator, color: 'bg-blue-500', active: true },
    { id: 'math-race', title: 'RekenRace', icon: Zap, color: 'bg-red-500', active: true },
    { id: 'word-hunt', title: 'Woordenjacht', icon: Search, color: 'bg-green-500', active: true },
    { id: 'sentence-builder', title: 'Zinnenbouwer', icon: BookOpen, color: 'bg-purple-500', active: true },
    { id: 'read-quiz', title: 'Lees & Kies', icon: BookOpen, color: 'bg-yellow-500', active: true },
    { id: 'mystery-island', title: 'Mysterie-Missie', icon: Puzzle, color: 'bg-indigo-500', active: true },
    { id: 'time-money', title: 'Ruimte Winkel', icon: ShoppingBag, color: 'bg-pink-500', active: true },
    { id: 'avatar-rewards', title: 'Avatar Shop', icon: Star, color: 'bg-teal-500', active: true },
]

import { DailyChallengeBoard } from '../components/game/DailyChallengeBoard'

export const GameHome = () => {
    const { selectedChild } = useAuth()
    const { stars, streak, refreshProfile } = useGamification()
    const navigate = useNavigate()

    useEffect(() => {
        refreshProfile()
    }, [])

    if (!selectedChild) {
        return <Navigate to="/child/select" />
    }

    const handleModuleClick = (id: string, title: string, active: boolean) => {
        if (!active) {
            alert(`Module "${title}" komt in een volgende fase!`)
            return
        }

        // Navigation Logic
        if (id === 'math-adventure') return navigate('/game/math-adventure')
        if (id === 'math-race') return navigate('/game/math-race')
        if (id === 'word-hunt') return navigate('/game/word-hunt')
        if (id === 'sentence-builder') return navigate('/game/sentence-builder')
        if (id === 'read-quiz') return navigate('/game/read-quiz')
        if (id === 'mystery-island') return navigate('/game/mysterie-missie')
        if (id === 'time-money') return navigate('/game/shop-game')
        if (id === 'avatar-rewards') return navigate('/shop')
    }

    return (
        <Layout>
            <div className="flex-1 p-6 max-w-7xl mx-auto w-full">
                <header className="flex justify-between items-center mb-8">
                    <button
                        onClick={() => navigate('/child/select')}
                        className="flex items-center gap-2 text-space-200 hover:text-white transition-colors bg-space-800/50 px-4 py-2 rounded-full"
                    >
                        <ArrowLeft size={20} /> <span className="hidden md:inline">Terug naar menu</span>
                    </button>

                    <div className="text-right">
                        <h1 className="text-2xl md:text-3xl font-display font-bold text-white">
                            Welkom, <span className="text-brand-yellow">{selectedChild.name}</span>!
                        </h1>
                        <div className="flex items-center justify-end gap-3 mt-2">
                            <div className="bg-brand-purple px-3 py-1 rounded-full text-xs font-bold text-purple-100 flex items-center gap-1 border border-purple-400">
                                <Zap size={14} className="fill-purple-100" /> {streak} Dagen
                            </div>
                            <div className="bg-brand-yellow px-3 py-1 rounded-full text-xs font-bold text-yellow-900 flex items-center gap-1 border border-yellow-500">
                                <Star size={14} className="fill-yellow-900" /> {stars} Sterren
                            </div>
                        </div>
                    </div>
                </header>

                <DailyChallengeBoard />

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {MODULES.map((module) => {
                        const Icon = module.icon
                        return (
                            <button
                                key={module.id}
                                onClick={() => handleModuleClick(module.id, module.title, module.active)}
                                className={`
                                    bg-space-800 border-2 rounded-2xl p-6 flex flex-col items-center gap-4 transition-all group shadow-xl
                                    ${module.active
                                        ? 'border-space-600 hover:scale-[1.02] hover:border-brand-teal'
                                        : 'border-space-700 opacity-60 cursor-not-allowed grayscale'
                                    }
                                `}
                            >
                                <div className={`w-16 h-16 rounded-2xl ${module.color} flex items-center justify-center transform group-hover:rotate-12 transition-transform shadow-lg`}>
                                    <Icon className="text-white" size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-white text-center group-hover:text-brand-yellow transition-colors">{module.title}</h3>

                                {module.active ? (
                                    <span className="text-xs text-brand-teal uppercase tracking-widest font-bold bg-brand-teal/10 px-3 py-1 rounded-full">
                                        Nu Spelen
                                    </span>
                                ) : (
                                    <span className="text-xs text-space-400 uppercase tracking-widest font-semibold">
                                        Binnenkort
                                    </span>
                                )}
                            </button>
                        )
                    })}
                </div>
            </div>
        </Layout>
    )
}
