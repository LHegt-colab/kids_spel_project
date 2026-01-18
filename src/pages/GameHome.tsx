import React from 'react'
import { Layout } from '../components/layout/Layout'
import { useAuth } from '../context/AuthContext'
import { Navigate, useNavigate } from 'react-router-dom'
import { ArrowLeft, Calculator, BookOpen, Search, Flag, Clock, Puzzle, Star, Zap } from 'lucide-react'

const MODULES = [
    { id: 'math-adventure', title: 'RekenAvontuur', icon: Calculator, color: 'bg-blue-500' },
    { id: 'math-race', title: 'RekenRace', icon: Zap, color: 'bg-red-500' },
    { id: 'word-hunt', title: 'Woordenjacht', icon: Search, color: 'bg-green-500' },
    { id: 'sentence-builder', title: 'Zinnenbouwer', icon: BookOpen, color: 'bg-purple-500' },
    { id: 'read-choose', title: 'Lees & Kies', icon: BookOpen, color: 'bg-yellow-500' },
    { id: 'mystery-island', title: 'Mysterie-Eiland', icon: Puzzle, color: 'bg-indigo-500' },
    { id: 'time-money', title: 'Tijd & Geld', icon: Clock, color: 'bg-pink-500' },
    { id: 'daily-challenge', title: 'Dagelijkse Missies', icon: Flag, color: 'bg-orange-500' },
    { id: 'avatar-rewards', title: 'Avatar & Beloningen', icon: Star, color: 'bg-teal-500' },
]

export const GameHome = () => {
    const { selectedChild } = useAuth()
    const navigate = useNavigate()

    if (!selectedChild) {
        return <Navigate to="/child/select" />
    }

    const handleModuleClick = (id: string, title: string) => {
        // Check if module is enabled (using our session context ideally, but strict gating is on settings)
        if (id === 'math-adventure') {
            navigate('/game/math-adventure')
            return
        }
        if (id === 'math-race') {
            navigate('/game/math-race')
            return
        }
        if (id === 'word-hunt') {
            navigate('/game/word-hunt')
            return
        }
        if (id === 'sentence-builder') {
            navigate('/game/sentence-builder')
            return
        }
        if (id === 'read-quiz') {
            navigate('/game/read-quiz')
            return
        }
        alert(`Module "${title}" komt in een volgende fase!`)
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
                        <p className="text-space-200 text-sm">Level 1 • 0 Sterren</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {MODULES.map((module) => {
                        const Icon = module.icon
                        return (
                            <button
                                key={module.id}
                                onClick={() => handleModuleClick(module.id, module.title)}
                                className="bg-space-800 border-2 border-space-600 rounded-2xl p-6 flex flex-col items-center gap-4 hover:scale-[1.02] hover:border-brand-teal transition-all group shadow-xl"
                            >
                                <div className={`w-16 h-16 rounded-2xl ${module.color} flex items-center justify-center transform group-hover:rotate-12 transition-transform shadow-lg`}>
                                    <Icon className="text-white" size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-white text-center group-hover:text-brand-yellow transition-colors">{module.title}</h3>
                                <span className="text-xs text-space-300 uppercase tracking-widest font-semibold">Binnenkort</span>
                            </button>
                        )
                    })}
                </div>
            </div>
        </Layout>
    )
}
