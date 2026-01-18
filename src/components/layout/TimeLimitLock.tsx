import React, { useState } from 'react'
import { Lock, Clock } from 'lucide-react'
import { useSession } from '../../context/SessionContext'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'

export const TimeLimitLock = () => {
    const { isLocked, unlockTemporary } = useSession()
    const { user } = useAuth()
    const [pin, setPin] = useState('')
    const [error, setError] = useState('')

    if (!isLocked) return null

    const handleUnlock = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (!user) return

        // Verify PIN against parent profile
        const { data } = await supabase.from('profiles').select('pin_code').eq('id', user.id).single()

        if (data && (data as any).pin_code === pin) {
            unlockTemporary()
        } else {
            setError('Incorrecte PIN')
            setPin('')
        }
    }

    return (
        <div className="fixed inset-0 z-50 bg-space-900/95 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-space-800 p-8 rounded-3xl border-2 border-brand-orange max-w-md w-full text-center shadow-2xl animate-in zoom-in duration-300">
                <div className="w-20 h-20 bg-space-900 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-brand-orange">
                    <Clock className="text-brand-orange" size={40} />
                </div>

                <h2 className="text-3xl font-display font-bold text-white mb-4">Tijd is op!</h2>
                <p className="text-space-200 text-lg mb-8">
                    Je hebt vandaag genoeg gespeeld. Tot morgen!
                    <br />
                    <span className="text-sm opacity-70">(Of vraag papa/mama)</span>
                </p>

                <form onSubmit={handleUnlock} className="bg-space-900 p-6 rounded-xl border border-space-700">
                    <label className="block text-sm font-bold text-space-300 mb-2">Ouder PIN voor extra tijd</label>
                    <input
                        type="password"
                        inputMode="numeric"
                        maxLength={4}
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                        className="w-full bg-space-800 border border-space-600 rounded-lg p-3 text-center text-2xl text-white tracking-widest focus:outline-none focus:border-brand-teal mb-4"
                        placeholder="••••"
                    />

                    {error && <p className="text-red-400 mb-3">{error}</p>}

                    <button
                        type="submit"
                        className="w-full bg-brand-orange hover:bg-orange-400 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        <Lock size={18} /> Ontgrendel
                    </button>
                </form>

                <button
                    onClick={() => window.location.href = '/'}
                    className="mt-6 text-space-400 hover:text-white underline"
                >
                    Terug naar startscherm
                </button>
            </div>
        </div>
    )
}
