import React, { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import type { Database } from '../../types/supabase'
import { AVATARS } from './AvatarSelector'
import { Plus, Trash2, Settings } from 'lucide-react'
import { ChildSettings } from './ChildSettings'

type ChildProfile = Database['public']['Tables']['child_profiles']['Row']

interface ChildListProps {
    onAddClick: () => void
    keyProp: number // mechanism to force refresh
}

export const ChildList: React.FC<ChildListProps> = ({ onAddClick, keyProp }) => {
    const { user } = useAuth()
    const [children, setChildren] = useState<ChildProfile[]>([])
    const [loading, setLoading] = useState(true)
    const [editingChild, setEditingChild] = useState<ChildProfile | null>(null)

    useEffect(() => {
        if (!user) return

        const fetchChildren = async () => {
            setLoading(true)
            const { data, error } = await supabase
                .from('child_profiles')
                .select('*')
                .eq('parent_id', user.id)
                .order('created_at', { ascending: true })

            if (error) {
                console.error('Error fetching children:', error)
            } else {
                setChildren(data || [])
            }
            setLoading(false)
        }

        fetchChildren()
    }, [user, keyProp])

    const handleDelete = async (id: string) => {
        if (!confirm('Weet je zeker dat je dit profiel wilt verwijderen? Alle voortgang gaat verloren.')) return;

        const { error } = await supabase.from('child_profiles').delete().eq('id', id);
        if (error) {
            console.error(error);
            alert('Kon profiel niet verwijderen');
        } else {
            setChildren(prev => prev.filter(c => c.id !== id));
        }
    }

    if (loading) return <div className="text-white">Profielen laden...</div>

    if (editingChild) {
        return (
            <ChildSettings
                childId={editingChild.id}
                childName={editingChild.name}
                onClose={() => setEditingChild(null)}
            />
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {children.map((child) => {
                const avatar = AVATARS.find(a => a.id === child.avatar_id) || AVATARS[0]
                const Icon = avatar.icon

                return (
                    <div key={child.id} className="bg-space-800 p-6 rounded-2xl border border-space-600 flex flex-col justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className={`w - 12 h - 12 rounded - full flex items - center justify - center ${avatar.color} `}>
                                <Icon className="text-white" size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold text-xl text-white">{child.name}</h4>
                                <p className="text-space-200 text-sm">Leeftijd: {child.age_band}</p>
                            </div>
                        </div>

                        <div className="flex gap-2 justify-end border-t border-space-700 pt-4">
                            <button
                                onClick={() => setEditingChild(child)}
                                className="flex items-center gap-2 text-brand-teal hover:text-teal-300 transition-colors px-3 py-2 text-sm font-bold bg-space-900/50 rounded-lg hover:bg-space-900"
                            >
                                <Settings size={16} /> Instellingen
                            </button>
                            <button
                                onClick={() => handleDelete(child.id)}
                                className="text-space-400 hover:text-red-400 transition-colors p-2 hover:bg-space-900 rounded-lg"
                                title="Verwijderen"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                    </div>
                )
            })}

            <button
                onClick={onAddClick}
                className="bg-space-800/50 hover:bg-space-800 border-2 border-dashed border-space-600 hover:border-brand-teal rounded-2xl p-6 flex flex-col items-center justify-center gap-2 group transition-all"
            >
                <div className="w-12 h-12 rounded-full bg-space-700 flex items-center justify-center group-hover:bg-brand-teal transition-colors">
                    <Plus className="text-white" size={24} />
                </div>
                <span className="text-space-200 font-semibold group-hover:text-white">Nieuw Profiel</span>
            </button>
        </div>
    )
}
