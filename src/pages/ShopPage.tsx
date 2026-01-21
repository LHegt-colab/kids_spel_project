import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useGamification } from '../context/GamificationContext'
import { supabase } from '../lib/supabase'
import { Layout } from '../components/layout/Layout'
import { Coins, ShoppingBag, CheckCircle, Lock } from 'lucide-react'
import confetti from 'canvas-confetti'

export const ShopPage = () => {
    const { selectedChild } = useAuth()
    const { stars, refreshProfile } = useGamification()
    const navigate = useNavigate()

    // Setup state
    const [items, setItems] = useState<any[]>([])
    const [ownedItems, setOwnedItems] = useState<string[]>([])
    const [equipped, setEquipped] = useState<any>({})
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!selectedChild) {
            navigate('/child/select')
            return
        }
        fetchShopData()
    }, [selectedChild])

    const fetchShopData = async () => {
        setLoading(true)

        // 1. Fetch Items
        const { data: shopItems } = await supabase.from('shop_items').select('*')

        // 2. Fetch Owned
        const { data: purchases } = await supabase
            .from('purchased_items')
            .select('item_id')
            .eq('child_id', selectedChild!.id)

        // 3. Fetch Equipped
        const { data: profile } = await supabase
            .from('child_profiles')
            .select('equipped_helmet, equipped_suit, equipped_pet, equipped_background')
            .eq('id', selectedChild!.id)
            .single()

        setItems(shopItems || [])
        // Fix: Explicitly handle the array type to avoid 'never' inference
        setOwnedItems((purchases as any[])?.map((p: any) => p.item_id) || [])
        setEquipped(profile || {})
        setLoading(false)
    }

    const buyItem = async (item: any) => {
        if (stars < item.cost) {
            alert("Niet genoeg sterren!")
            return
        }

        const { error } = await supabase.from('purchased_items').insert({
            child_id: selectedChild!.id,
            item_id: item.id
        } as any)

        if (!error) {
            // Deduct stars (Manual update or trigger? Manual for now as we don't have triggers set up for this yet)
            // Wait, we need to update profile stars.
            const newStars = stars - item.cost
            await supabase.from('child_profiles').update({ stars: newStars } as any).eq('id', selectedChild!.id)

            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } })
            refreshProfile() // Update context
            fetchShopData() // Update local state
        }
    }

    const equipItem = async (item: any) => {
        const column = `equipped_${item.category}` // e.g., equipped_helmet
        const { error } = await supabase
            .from('child_profiles')
            .update({ [column]: item.asset_url } as any)
            .eq('id', selectedChild!.id)

        if (!error) {
            fetchShopData()
        }
    }

    if (loading) return <div className="text-white text-center mt-20">Winkel laden...</div>

    return (
        <Layout>
            <div className="max-w-6xl mx-auto px-4 py-8">

                {/* Header */}
                <div className="flex items-center justify-between mb-8 bg-space-800 p-6 rounded-2xl border border-space-600 shadow-xl">
                    <div className="flex items-center gap-4">
                        <div className="bg-brand-teal p-3 rounded-full text-space-900">
                            <ShoppingBag size={32} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-display font-bold text-white">Ruimte Winkel</h1>
                            <p className="text-space-300">Koop nieuwe spullen voor je avatar!</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 bg-space-900 px-6 py-3 rounded-full border border-brand-yellow/30 shadow-inner">
                        <Coins className="text-brand-yellow fill-brand-yellow" size={28} />
                        <div className="flex flex-col items-end">
                            <span className="text-3xl font-bold text-white leading-none">{stars}</span>
                            <span className="text-xs text-brand-yellow/80">Speel spellen om te verdienen!</span>
                        </div>
                    </div>
                </div>

                {/* Categories - Simplified to one grid for V1 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {items.map(item => {
                        const isOwned = ownedItems.includes(item.id)
                        const isEquipped = Object.values(equipped).includes(item.asset_url)
                        const canAfford = stars >= item.cost

                        return (
                            <div key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1">
                                <div className="h-40 bg-space-100 flex items-center justify-center p-4 relative">
                                    <img src={item.asset_url} alt={item.name} className="h-24 w-24 object-contain drop-shadow-md" />
                                    {isEquipped && (
                                        <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                                            <CheckCircle size={12} /> AAN
                                        </div>
                                    )}
                                </div>
                                <div className="p-5">
                                    <h3 className="text-xl font-bold text-space-900 mb-1">{item.name}</h3>
                                    <p className="text-space-500 text-sm mb-4 capitalize">{item.category}</p>

                                    {isOwned ? (
                                        <button
                                            onClick={() => equipItem(item)}
                                            disabled={isEquipped}
                                            className={`w-full py-3 rounded-xl font-bold text-lg transition-colors ${isEquipped
                                                ? 'bg-space-200 text-space-400 cursor-default'
                                                : 'bg-brand-purple text-white hover:bg-brand-purple/90'
                                                }`}
                                        >
                                            {isEquipped ? 'Gedragen' : 'Aandoen'}
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => buyItem(item)}
                                            disabled={!canAfford}
                                            className={`w-full py-3 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-colors ${canAfford
                                                ? 'bg-brand-yellow text-space-900 hover:brightness-110 shadow-md'
                                                : 'bg-space-200 text-space-400 cursor-not-allowed'
                                                }`}
                                        >
                                            {canAfford ? (
                                                <>Kopen <span className="text-sm opacity-70">({item.cost})</span></>
                                            ) : (
                                                <><Lock size={16} /> {item.cost}</>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>

            </div>
        </Layout>
    )
}
