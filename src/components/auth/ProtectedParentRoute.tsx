import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { Lock } from 'lucide-react'

interface ProtectedParentRouteProps {
    children: React.ReactNode
}

export const ProtectedParentRoute: React.FC<ProtectedParentRouteProps> = ({ children }) => {
    const { user } = useAuth()
    const [isUnlocked, setIsUnlocked] = useState(false)
    const [pinInput, setPinInput] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(true)
    const [userPin, setUserPin] = useState<string | null>(null)

    useEffect(() => {
        if (!user) return
        const fetchPin = async () => {
            const { data } = await supabase.from('profiles').select('pin_code').eq('id', user.id).single()
            if (data && (data as any).pin_code) {
                setUserPin((data as any).pin_code)
            }
            setLoading(false)
        }
        fetchPin()
    }, [user])

    const handleUnlock = (e: React.FormEvent) => {
        e.preventDefault()
        if (!userPin) {
            // If no PIN set, allow access (or force set PIN flow - but let's allow for now)
            setIsUnlocked(true)
            return
        }

        if (pinInput === userPin) {
            setIsUnlocked(true)
            setError('')
        } else {
            setError('Incorrecte PIN')
            setPinInput('')
        }
    }

    if (loading) return <div className="p-8 text-white text-center">Verificatie laden...</div>

    // If no PIN is set yet, we might want to let them in to set it, or force setting it.
    // For simplicity: if no PIN, we consider it unlocked (first use)
    if (!userPin || isUnlocked) {
        return <>{children}</>
    }

    return (
        <div className="fixed inset-0 bg-space-900 bg-stars flex items-center justify-center p-4 z-50">
            <div className="bg-space-800 p-8 rounded-3xl border-2 border-space-600 max-w-sm w-full text-center shadow-2xl">
                <div className="w-16 h-16 bg-space-700 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Lock className="text-brand-yellow" size={32} />
                </div>

                <h2 className="text-2xl font-bold text-white mb-2">Ouder Beveiliging</h2>
                <p className="text-space-200 mb-6">Voer je PIN code in</p>

                <form onSubmit={handleUnlock}>
                    <input
                        type="password"
                        inputMode="numeric"
                        maxLength={4}
                        value={pinInput}
                        onChange={(e) => setPinInput(e.target.value)}
                        className="w-full bg-space-900 border border-space-600 rounded-xl p-4 text-center text-3xl text-white tracking-[1em] mb-4 focus:outline-none focus:border-brand-teal"
                        placeholder="••••"
                        autoFocus
                    />

                    {error && <p className="text-red-400 mb-4 font-bold">{error}</p>}

                    <div className="grid grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={() => window.history.back()}
                            className="w-full py-3 rounded-xl border border-space-600 text-space-300 hover:text-white transition-colors"
                        >
                            Annuleren
                        </button>
                        <button
                            type="submit"
                            className="w-full bg-brand-teal hover:bg-teal-400 text-space-900 font-bold py-3 rounded-xl transition-colors"
                        >
                            Openen
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
