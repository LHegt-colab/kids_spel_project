import React, { useEffect, useState } from 'react'
import { Layout } from '../components/layout/Layout'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { AVATARS } from '../components/dashboard/AvatarSelector'
import { useNavigate } from 'react-router-dom'
import { Lock } from 'lucide-react'

export const ChildSelectPage = () => {
    const { user, selectChild } = useAuth()
    const [children, setChildren] = useState<any[]>([])
    const navigate = useNavigate()

    useEffect(() => {
        if (!user) return
        const fetchChildren = async () => {
            const { data } = await supabase.from('child_profiles').select('*').eq('parent_id', user.id)
            setChildren(data || [])
        }
        fetchChildren()
    }, [user])

    const handleSelect = (child: any) => {
        selectChild(child)
        navigate('/game/home')
    }

    const handleParentAccess = () => {
        // Here we should ask for PIN
        // For now, just navigate
        navigate('/parent/dashboard')
    }

    return (
        <Layout>
            <div className="flex-1 flex flex-col items-center justify-center p-4">
                <h1 className="text-4xl font-display font-bold text-brand-yellow mb-12">Wie gaat er spelen?</h1>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {children.map(child => {
                        const avatar = AVATARS.find(a => a.id === child.avatar_id) || AVATARS[0]
                        const Icon = avatar.icon
                        return (
                            <button
                                key={child.id}
                                onClick={() => handleSelect(child)}
                                className="flex flex-col items-center gap-4 group"
                            >
                                <div className={`w-32 h-32 rounded-full ${avatar.color} flex items-center justify-center transform group-hover:scale-110 transition-transform shadow-xl border-4 border-space-800`}>
                                    <Icon className="text-white" size={64} />
                                </div>
                                <span className="text-2xl font-bold text-white group-hover:text-brand-yellow transition-colors">{child.name}</span>
                            </button>
                        )
                    })}
                </div>

                <button
                    onClick={handleParentAccess}
                    className="fixed bottom-8 right-8 bg-space-800 p-4 rounded-full border border-space-600 text-space-200 hover:text-white hover:border-brand-teal transition-all"
                    title="Ouder Omgeving"
                >
                    <Lock size={24} />
                </button>
            </div>
        </Layout>
    )
}
