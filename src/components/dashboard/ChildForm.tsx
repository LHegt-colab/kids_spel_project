import React, { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { AvatarSelector } from './AvatarSelector'
import { X } from 'lucide-react'

interface ChildFormProps {
    onSuccess: () => void
    onCancel: () => void
}

export const ChildForm: React.FC<ChildFormProps> = ({ onSuccess, onCancel }) => {
    const { user } = useAuth()
    const [name, setName] = useState('')
    const [ageBand, setAgeBand] = useState<'6-7' | '8-9' | '10'>('6-7')
    const [avatarId, setAvatarId] = useState('astronaut-1')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) return

        setLoading(true)
        try {
            const { error } = await supabase.from('child_profiles').insert({
                parent_id: user.id,
                name,
                age_band: ageBand,
                avatar_id: avatarId
            } as any)

            if (error) throw error
            onSuccess()
        } catch (error) {
            console.error('Error creating child profile:', error)
            alert('Er ging iets mis bij het aanmaken van het profiel.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <div className="bg-space-800 p-6 rounded-2xl border border-space-600 w-full max-w-md relative">
                <button
                    onClick={onCancel}
                    className="absolute top-4 right-4 text-space-200 hover:text-white"
                >
                    <X size={24} />
                </button>

                <h3 className="text-2xl font-bold text-white mb-6">Nieuwe Speler</h3>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-space-200 mb-2 font-semibold">Naam</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-space-900 border border-space-600 rounded-xl p-3 text-white focus:outline-none focus:border-brand-teal"
                            placeholder="Naam van je kind"
                        />
                    </div>

                    <div>
                        <label className="block text-space-200 mb-2 font-semibold">Leeftijdsgroep</label>
                        <div className="grid grid-cols-3 gap-2">
                            {(['6-7', '8-9', '10'] as const).map((band) => (
                                <button
                                    key={band}
                                    type="button"
                                    onClick={() => setAgeBand(band)}
                                    className={`
                            py-2 rounded-lg font-bold border-2 transition-colors
                            ${ageBand === band
                                            ? 'bg-brand-teal border-brand-teal text-space-900'
                                            : 'bg-space-900 border-space-600 text-space-200 hover:border-space-400'}
                        `}
                                >
                                    {band} jaar
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-space-200 mb-2 font-semibold">Kies een Avatar</label>
                        <AvatarSelector selectedAvatar={avatarId} onSelect={setAvatarId} />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-brand-orange hover:bg-orange-500 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Bezig...' : 'Speler Toevoegen'}
                    </button>
                </form>
            </div>
        </div>
    )
}
