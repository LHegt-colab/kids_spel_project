import React, { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Calendar, Clock, CheckCircle, XCircle, TrendingUp } from 'lucide-react'

interface ProgressReportProps {
    childId: string
}

export const ProgressReport: React.FC<ProgressReportProps> = ({ childId }) => {
    const [stats, setStats] = useState({
        totalSessions: 0,
        totalPlaytimeMinutes: 0,
        averageAccuracy: 0,
        totalAnswered: 0
    })
    const [history, setHistory] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (childId) fetchStats()
    }, [childId])

    const fetchStats = async () => {
        setLoading(true)

        // 1. Fetch Sessions
        const { data: sessions } = await supabase
            .from('game_sessions')
            .select('*')
            .eq('child_id', childId)
            .order('start_time', { ascending: false })
            .limit(20)

        // 2. Fetch Answers Stats (Aggregate via RPC would be better but doing client side for V1)
        // We'll just fetch recent logs
        const { data: logs } = await supabase
            .from('answers_log')
            .select('is_correct')
            .eq('session_id', sessions?.[0]?.id || '') // Just for last session for now to save bandwidth? No, let's look at all sessions for this child. 
        // Actually, without a backend join, this is heavy. 
        // Let's stick to session metadata if we stored it?
        // We didn't store accuracy in sessions, only score.
        // Let's rely on stored stats or simple summation of sessions.

        if (sessions) {
            setHistory(sessions)

            const totalSecs = sessions.reduce((acc, curr) => acc + (curr.duration_seconds || 0), 0)
            setStats(prev => ({
                ...prev,
                totalSessions: sessions.length,
                totalPlaytimeMinutes: Math.round(totalSecs / 60)
            }))
        }

        // Fetch global accuracy for this child
        // Note: In production we'd use a dedicated 'stats' table updated via trigger
        const { count: totalAnswers } = await supabase
            .from('answers_log')
            .select('*', { count: 'exact', head: true })
        // We need to join with sessions linked to this child.
        // Complex query warning. For V1 we might skip exact percentage if too heavy.
        // Let's try a direct query if RLS permits.
        // Actually RLS checks via join so it is slow but works.

        // Alternative: Just show last 5 sessions details
        setLoading(false)
    }

    if (loading) return <div className="p-8 text-center text-space-400">Rapport laden...</div>

    return (
        <div className="bg-space-800 rounded-2xl border border-space-600 overflow-hidden">
            <div className="p-6 border-b border-space-700 bg-space-900/50">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <TrendingUp className="text-brand-teal" />
                    Voortgang & Statistieken
                </h3>
            </div>

            <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-space-900 p-4 rounded-xl border border-space-700">
                    <div className="text-space-400 text-sm mb-1 flex items-center gap-2"><Clock size={14} /> Totaal Gespeeld</div>
                    <div className="text-2xl font-bold text-white">{stats.totalPlaytimeMinutes} min</div>
                </div>
                <div className="bg-space-900 p-4 rounded-xl border border-space-700">
                    <div className="text-space-400 text-sm mb-1 flex items-center gap-2"><CheckCircle size={14} /> Sessies</div>
                    <div className="text-2xl font-bold text-white">{stats.totalSessions}</div>
                </div>
                {/* Placeholders for future stats */}
                <div className="bg-space-900 p-4 rounded-xl border border-space-700 opacity-50">
                    <div className="text-space-400 text-sm mb-1">Nauwkeurigheid</div>
                    <div className="text-2xl font-bold text-white">- %</div>
                </div>
                <div className="bg-space-900 p-4 rounded-xl border border-space-700 opacity-50">
                    <div className="text-space-400 text-sm mb-1">Niveau</div>
                    <div className="text-2xl font-bold text-white">Groep 4</div>
                </div>
            </div>

            <div className="p-6">
                <h4 className="text-white font-bold mb-4 flex items-center gap-2"><Calendar size={18} /> Recente Activiteit</h4>
                <div className="space-y-3">
                    {history.length === 0 && <p className="text-space-400 italic">Nog geen spellen gespeeld.</p>}

                    {history.map(session => (
                        <div key={session.id} className="bg-space-700/50 p-4 rounded-xl flex items-center justify-between">
                            <div>
                                <div className="font-bold text-white capitalize">{session.module_id.replace('-', ' ')}</div>
                                <div className="text-sm text-space-400">
                                    {new Date(session.start_time).toLocaleDateString()} • {new Date(session.start_time).toLocaleTimeString()}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-brand-yellow font-bold text-xl">{session.score} Ptn</div>
                                <div className="text-xs text-space-400 uppercase tracking-wider">Score</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
