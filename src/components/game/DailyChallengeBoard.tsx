import React from 'react'
import { CheckCircle, Trophy, Target, Star } from 'lucide-react'
import { useGamification } from '../../context/GamificationContext'

export const DailyChallengeBoard = () => {
    const { dailyChallenge, claimReward } = useGamification()

    if (!dailyChallenge) return null

    const tasks = [
        { id: 'math', label: 'Reken Race', completed: dailyChallenge.math_completed, icon: '🧮' },
        { id: 'language', label: 'Woordenjacht', completed: dailyChallenge.language_completed, icon: '📝' },
        { id: 'logic', label: 'Mysterie Missie', completed: dailyChallenge.logic_completed, icon: 'puzzle' },
    ]

    const allCompleted = tasks.every(t => t.completed)
    const isClaimed = dailyChallenge.rewards_claimed

    return (
        <div className="bg-gradient-to-r from-space-800 to-space-900 rounded-2xl border border-space-600 p-6 shadow-xl relative overflow-hidden mb-8">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-yellow/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-display font-bold text-white flex items-center gap-2">
                            <Target className="text-brand-teal" /> Dagelijkse Missies
                        </h2>
                        <p className="text-space-300">Voltooi alle taken voor een bonus!</p>
                    </div>

                    {allCompleted && !isClaimed && (
                        <button
                            onClick={claimReward}
                            className="bg-brand-yellow text-yellow-950 font-bold px-6 py-2 rounded-full animate-bounce shadow-lg hover:bg-yellow-300 transition-colors flex items-center gap-2"
                        >
                            <Trophy size={18} /> Claim 50 Sterren
                        </button>
                    )}

                    {isClaimed && (
                        <div className="bg-green-500/20 text-green-300 border border-green-500/50 px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2">
                            <CheckCircle size={16} /> Beloning Geclaimd
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {tasks.map(task => (
                        <div
                            key={task.id}
                            className={`p-4 rounded-xl border flex items-center gap-4 transition-all ${task.completed
                                ? 'bg-green-500/10 border-green-500/30'
                                : 'bg-space-800 border-space-700'}`}
                        >
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${task.completed ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' : 'bg-space-700 text-space-400'}`}>
                                {task.completed ? <CheckCircle size={24} /> : task.icon === 'puzzle' ? <Target size={24} /> : task.icon}
                            </div>
                            <div>
                                <h3 className={`font-bold ${task.completed ? 'text-white' : 'text-space-200'}`}>{task.label}</h3>
                                <p className={`text-xs ${task.completed ? 'text-green-300' : 'text-space-400'}`}>
                                    {task.completed ? 'Voltooid!' : 'Nog te doen'}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
