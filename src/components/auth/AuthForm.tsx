import React, { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useNavigate } from 'react-router-dom'
import { Rocket, Star } from 'lucide-react'

export const AuthForm = () => {
    const [isRegistering, setIsRegistering] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [fullName, setFullName] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const navigate = useNavigate()

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            if (isRegistering) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName,
                        },
                    },
                })
                if (error) throw error
                // On successful signup, maybe show check email message or auto login?
                // Supabase defaults to "check email" unless auto-confirm is on.
                // Assuming development mode might have auto-confirm or user manually confirms.
                // If auto-confirm is OFF, we should tell them to check email.
                alert('Check je email om je account te bevestigen!')
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                })
                if (error) throw error
                navigate('/parent/dashboard')
            }
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="w-full max-w-md bg-space-800 p-8 rounded-3xl border-2 border-space-600 shadow-2xl relative overflow-hidden">
            {/* Decorative stars */}
            <Star className="absolute top-4 right-4 text-brand-yellow opacity-50 animate-pulse" size={24} />
            <Star className="absolute bottom-8 left-4 text-brand-teal opacity-30 animate-pulse" size={16} />

            <div className="text-center mb-8">
                <div className="bg-brand-orange w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Rocket className="text-white" size={32} />
                </div>
                <h2 className="text-3xl font-bold font-display text-white">
                    {isRegistering ? 'Maak Account' : 'Ouder Login'}
                </h2>
                <p className="text-space-200 mt-2">
                    {isRegistering
                        ? 'Start het avontuur voor je kinderen!'
                        : 'Welkom terug, commandant!'}
                </p>
            </div>

            <form onSubmit={handleAuth} className="space-y-6">
                {isRegistering && (
                    <div>
                        <label className="block text-space-200 mb-2 text-sm font-semibold">Je Naam</label>
                        <input
                            type="text"
                            required
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full bg-space-900 border border-space-600 rounded-xl p-3 text-white focus:outline-none focus:border-brand-teal transition-colors"
                            placeholder="Bijv. Mark Jansen"
                        />
                    </div>
                )}

                <div>
                    <label className="block text-space-200 mb-2 text-sm font-semibold">Email Adres</label>
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-space-900 border border-space-600 rounded-xl p-3 text-white focus:outline-none focus:border-brand-teal transition-colors"
                        placeholder="naam@voorbeeld.nl"
                    />
                </div>

                <div>
                    <label className="block text-space-200 mb-2 text-sm font-semibold">Wachtwoord</label>
                    <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-space-900 border border-space-600 rounded-xl p-3 text-white focus:outline-none focus:border-brand-teal transition-colors"
                        placeholder="••••••••"
                        minLength={6}
                    />
                </div>

                {error && (
                    <div className="bg-red-500/20 border border-red-500 text-red-100 p-3 rounded-xl text-sm">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-brand-teal hover:bg-teal-400 text-space-900 font-bold py-3 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Laden...' : (isRegistering ? 'Start Avontuur' : 'Inloggen')}
                </button>
            </form>

            <div className="mt-6 text-center">
                <button
                    onClick={() => setIsRegistering(!isRegistering)}
                    className="text-space-200 hover:text-white hover:underline text-sm transition-colors"
                >
                    {isRegistering
                        ? 'Heb je al een account? Log in'
                        : 'Nog geen account? Meld je aan'}
                </button>
            </div>
        </div>
    )
}
