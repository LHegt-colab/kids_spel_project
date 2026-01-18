import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { Save } from 'lucide-react'

export const ParentSettings = () => {
    const { user } = useAuth()
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
                setMsg('Fout bij opslaan')
            } else {
                setMsg('Instellingen opgeslagen!')
            }
        }
    }

    return (
        <div className="bg-space-800 p-6 rounded-2xl border border-space-600 max-w-lg">
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
    )
}
