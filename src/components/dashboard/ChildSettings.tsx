import React, { useEffect, useState } from 'react'
import { X, Save, Clock, Gamepad2, Volume2, Trophy, FileText, AlertCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { ProgressReport } from './ProgressReport'
import { ContentManager } from './ContentManager'

// Constants for modules (could be imported from a config file)
const MODULES = [
    { id: 'math-adventure', title: 'RekenAvontuur' },
    { id: 'math-race', title: 'RekenRace' },
    { id: 'word-hunt', title: 'Woordenjacht' },
    { id: 'sentence-builder', title: 'Zinnenbouwer' },
    { id: 'read-choose', title: 'Lees & Kies' },
    { id: 'mystery-island', title: 'Mysterie-Eiland' },
    { id: 'time-money', title: 'Tijd & Geld' },
]

interface ChildSettingsProps {
    childId: string
    childName: string
    onClose: () => void
}

export const ChildSettings: React.FC<ChildSettingsProps> = ({ childId, childName, onClose }) => {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [msg, setMsg] = useState('')

    // Settings State
    const [dailyLimit, setDailyLimit] = useState(30)
    const [enabledModules, setEnabledModules] = useState<string[]>([])
    const [soundEnabled, setSoundEnabled] = useState(true)
    const [rewardsEnabled, setRewardsEnabled] = useState(true)
    const [reportingLevel, setReportingLevel] = useState<'simple' | 'detailed'>('simple')

    useEffect(() => {
        const fetchSettings = async () => {
            setLoading(true)
            const { data, error } = await supabase
                .from('child_settings')
                .select('*')
                .eq('child_id', childId)
                .single()

            if (data) {
                const settings = data as any // Force cast since we know the structure but types might be lagging
                setDailyLimit(settings.daily_limit_minutes)
                // Cast from JSON/any to string array
                setEnabledModules((settings.enabled_modules as unknown as string[]) || [])
                setSoundEnabled(settings.sound_enabled)
                setRewardsEnabled(settings.rewards_enabled)
                setReportingLevel(settings.reporting_level as 'simple' | 'detailed')
            } else if (!error) {
                // No settings found, create defaults? Or just use local defaults and upsert later.
                // It's cleaner to init with all modules enabled if new.
                setEnabledModules(MODULES.map(m => m.id))
            }
            setLoading(false)
        }
        fetchSettings()
    }, [childId])

    const handleSave = async () => {
        setSaving(true)
        setMsg('')

        const payload = {
            child_id: childId,
            daily_limit_minutes: dailyLimit,
            enabled_modules: enabledModules,
            sound_enabled: soundEnabled,
            rewards_enabled: rewardsEnabled,
            reporting_level: reportingLevel,
            updated_at: new Date().toISOString()
        }

        const { error } = await supabase.from('child_settings').upsert(payload as any)

        setSaving(false)
        if (error) {
            console.error(error)
            setMsg('Fout bij opslaan')
        } else {
            setMsg('Instellingen opgeslagen!')
            setTimeout(onClose, 1500)
        }
    }

    const toggleModule = (id: string) => {
        setEnabledModules(prev =>
            prev.includes(id)
                ? prev.filter(m => m !== id)
                : [...prev, id]
        )
    }

    if (loading) return <div className="p-8 text-white">Laden...</div>

    return (
        <div className="bg-space-800 p-6 rounded-2xl border border-space-600 w-full max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-6 border-b border-space-600 pb-4">
                <h3 className="text-2xl font-bold text-white">Instellingen voor <span className="text-brand-yellow">{childName}</span></h3>
                <button onClick={onClose} className="text-space-300 hover:text-white">Sluiten</button>
            </div>

            <div className="space-y-8">
                {/* Time Limit */}
                <section>
                    <div className="flex items-center gap-3 mb-4">
                        <Clock className="text-brand-teal" />
                        <h4 className="text-lg font-bold text-white">Speeltijd Limiet</h4>
                    </div>
                    <div className="bg-space-900 p-4 rounded-xl">
                        <div className="flex justify-between text-space-200 mb-2">
                            <span>10 min</span>
                            <span className="font-bold text-white text-xl">{dailyLimit} minuten</span>
                            <span>120 min</span>
                        </div>
                        <input
                            type="range"
                            min="10"
                            max="120"
                            step="5"
                            value={dailyLimit}
                            onChange={(e) => setDailyLimit(Number(e.target.value))}
                            className="w-full accent-brand-teal h-2 bg-space-700 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>
                </section>

                {/* Modules */}
                <section>
                    <div className="flex items-center gap-3 mb-4">
                        <Shield className="text-brand-orange" />
                        <h4 className="text-lg font-bold text-white">Beschikbare Spellen</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {MODULES.map(m => (
                            <label key={m.id} className="flex items-center justify-between bg-space-900 p-4 rounded-xl cursor-pointer hover:bg-space-800 transition-colors border border-space-700">
                                <span className="text-white font-medium">{m.title}</span>
                                <input
                                    type="checkbox"
                                    checked={enabledModules.includes(m.id)}
                                    onChange={() => toggleModule(m.id)}
                                    className="w-6 h-6 text-brand-orange rounded focus:ring-brand-orange bg-space-700 border-space-500"
                                />
                            </label>
                        ))}
                    </div>
                </section>

                {/* Other Toggles */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <Volume2 className="text-purple-400" />
                            <h4 className="text-lg font-bold text-white">Geluid & Beloningen</h4>
                        </div>
                        <div className="space-y-3">
                            <label className="flex items-center justify-between text-space-200">
                                <span>Geluidseffecten</span>
                                <input type="checkbox" checked={soundEnabled} onChange={e => setSoundEnabled(e.target.checked)} className="w-5 h-5 rounded" />
                            </label>
                            <label className="flex items-center justify-between text-space-200">
                                <span>Beloningen Systeem</span>
                                <input type="checkbox" checked={rewardsEnabled} onChange={e => setRewardsEnabled(e.target.checked)} className="w-5 h-5 rounded" />
                            </label>
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <BarChart className="text-blue-400" />
                            <h4 className="text-lg font-bold text-white">Rapportage</h4>
                        </div>
                        <select
                            value={reportingLevel}
                            onChange={(e) => setReportingLevel(e.target.value as any)}
                            className="w-full bg-space-900 border border-space-600 rounded-lg p-3 text-white"
                        >
                            <option value="simple">Simpel (Alleen positeve feedback)</option>
                            <option value="detailed">Gedetailleerd (Inclusief fouten)</option>
                        </select>
                    </div>
                </section>

                {msg && <div className="text-center font-bold text-brand-teal animate-pulse">{msg}</div>}

                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full bg-brand-teal hover:bg-teal-400 text-space-900 font-bold py-4 rounded-xl text-lg flex items-center justify-center gap-2 transition-transform hover:scale-[1.01]"
                >
                    <Save /> Instellingen Opslaan
                </button>
            </div>
        </div>
    )
}
