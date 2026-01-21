import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { Save, Settings, BookOpen } from 'lucide-react'
import { ContentManager } from './ContentManager'

export const ParentSettings = () => {
    const { user } = useAuth()
    const [activeTab, setActiveTab] = useState<'general' | 'content'>('general')
    const [pin, setPin] = useState('')
    const [loading, setLoading] = useState(false)
    const [msg, setMsg] = useState('')

    useEffect(() => {
        if (!user) return
        const fetchSettings = async () => {
            const { data } = await supabase.from('profiles').select('pin_code').eq('id', user.id).single()
            if (data && (data as any).pin_code) {
                setPin((data as any).pin_code)
            }
        }
        fetchSettings()
    }, [user])

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMsg('')

        if (user?.id) {
            const { error } = await supabase.from('profiles').update({
                pin_code: pin
            } as any).eq('id', user.id)

            setLoading(false)
            if (error) {
                console.error('Save error:', error)
                setMsg(`Fout bij opslaan: ${error.message || error.details || JSON.stringify(error)}`)
            } else {
                setMsg('Instellingen opgeslagen!')
            }
        }
    }

    return (
        <div className="space-y-6">
            {/* Tabs */}
            <div className="flex gap-4 border-b border-space-700 pb-1">
                <button
                    onClick={() => setActiveTab('general')}
                    className={`flex items-center gap-2 px-4 py-2 font-bold rounded-t-xl transition-colors ${activeTab === 'general' ? 'bg-space-800 text-white border-b-2 border-brand-teal' : 'text-space-400 hover:text-white'}`}
                >
                    <Settings size={20} /> Algemeen
                </button>
                <button
                    onClick={() => setActiveTab('content')}
                    className={`flex items-center gap-2 px-4 py-2 font-bold rounded-t-xl transition-colors ${activeTab === 'content' ? 'bg-space-800 text-white border-b-2 border-brand-purple' : 'text-space-400 hover:text-white'}`}
                >
                    <BookOpen size={20} /> Woorden & Zinnen
                </button>
            </div>

            {/* Content */}
            {activeTab === 'general' && (
                <div className="bg-space-800 p-6 rounded-2xl border border-space-600 max-w-lg animate-in fade-in slide-in-from-left-4">
                    <h3 className="text-xl font-bold text-white mb-4">Ouder Instellingen</h3>
                    <form onSubmit={handleSave} className="space-y-4">
                        <div>
                            <label className="block text-space-200 mb-2 font-semibold">Ouder PIN Code</label>
                            <p className="text-sm text-space-400 mb-2">
                                Beveilig het ouder dashboard tegen slimme astronauten.
                            </p>
                            <input
                                type="text"
                                pattern="[0-9]*"
                                inputMode="numeric"
                                maxLength={4}
                                value={pin}
                                onChange={(e) => setPin(e.target.value)}
                                className="w-full bg-space-900 border border-space-600 rounded-xl p-3 text-white tracking-widest text-center text-2xl focus:outline-none focus:border-brand-teal"
                                placeholder="0000"
                            />
                        </div>

                        {msg && <p className="text-brand-orange">{msg}</p>}

                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center justify-center gap-2 w-full bg-brand-teal hover:bg-teal-400 text-space-900 font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
                        >
                            <Save size={20} /> Opslaan
                        </button>
                    </form>
                </div>
            )}

            {activeTab === 'content' && (
                <div className="animate-in fade-in slide-in-from-right-4">
                    <div className="bg-space-800 p-6 rounded-2xl border border-space-600 mb-6">
                        <h3 className="text-xl font-bold text-white mb-2">Beheer Oefenmateriaal</h3>
                        <p className="text-space-300">
                            Voeg hier eigen woorden, zinnen of verhaaltjes toe. Deze worden gebruikt in spellen zoals Woordenjacht en Lees & Kies.
                        </p>
                    </div>
                    <ContentManager />
                </div>
            )}
        </div>
    )
}
