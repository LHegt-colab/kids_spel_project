import React from 'react'
import { X, Star, Clock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface GameLayoutProps {
    children: React.ReactNode
    title: string
    score: number
    time?: number // seconds
    onExit: () => void
    color?: string
}

export const GameLayout: React.FC<GameLayoutProps> = ({
    children,
    title,
    score,
    time,
    onExit,
    color = 'bg-blue-500'
}) => {
    // Format time mm:ss
    const formatTime = (secs: number) => {
        const m = Math.floor(secs / 60)
        const s = secs % 60
        return `${m}:${s < 10 ? '0' : ''}${s}`
    }

    return (
        <div className="min-h-screen bg-space-900 bg-stars flex flex-col">
            {/* Header */}
            <header className="p-4 flex justify-between items-center max-w-5xl mx-auto w-full">
                <button
                    onClick={onExit}
                    className="bg-space-800 p-2 rounded-xl text-space-300 hover:text-white hover:bg-red-500/20 hover:text-red-400 transition-colors"
                >
                    <X size={32} />
                </button>

                <div className="flex items-center gap-6">
                    {time !== undefined && (
                        <div className={`flex items-center gap-2 px-6 py-2 rounded-full font-mono text-2xl font-bold ${time < 10 ? 'bg-red-500/20 text-red-500 animate-pulse' : 'bg-space-800 text-white'}`}>
                            <Clock size={24} />
                            {formatTime(time)}
                        </div>
                    )}

                    <div className="flex items-center gap-2 px-6 py-2 rounded-full bg-brand-yellow/10 text-brand-yellow font-bold text-2xl border border-brand-yellow/20">
                        <Star className="fill-brand-yellow" size={24} />
                        {score}
                    </div>
                </div>
            </header>

            {/* Game Content */}
            <main className="flex-1 flex flex-col items-center justify-center p-4 max-w-3xl mx-auto w-full">
                <h2 className="text-space-400 uppercase tracking-widest font-bold text-sm mb-8">{title}</h2>
                {children}
            </main>
        </div>
    )
}
