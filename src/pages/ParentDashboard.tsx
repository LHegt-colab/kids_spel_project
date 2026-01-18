import React, { useState } from 'react'
import { Layout } from '../components/layout/Layout'
import { useAuth } from '../context/AuthContext'
import { ChildList } from '../components/dashboard/ChildList'
import { ChildForm } from '../components/dashboard/ChildForm'
import { ParentSettings } from '../components/dashboard/ParentSettings'

export const ParentDashboard = () => {
    const { signOut } = useAuth()
    const [showAddModal, setShowAddModal] = useState(false)
    const [refreshKey, setRefreshKey] = useState(0)

    const handleChildAdded = () => {
        setShowAddModal(false)
        setRefreshKey(prev => prev + 1)
    }

    return (
        <Layout>
            <div className="max-w-7xl mx-auto p-6 w-full">
                <div className="flex justify-between items-center mb-8 border-b border-space-700 pb-6">
                    <div>
                        <h1 className="text-3xl font-bold font-display text-white">Ouder Dashboard</h1>
                        <p className="text-space-200">Beheer profielen en instellingen</p>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={signOut}
                            className="bg-red-500/10 hover:bg-red-500/20 text-red-200 px-4 py-2 rounded-lg transition-colors border border-red-500/30 text-sm font-semibold"
                        >
                            Uitloggen
                        </button>
                    </div>
                </div>

                <div className="space-y-8">
                    <section>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-brand-yellow">Mijn Ruimtevaarders</h2>
                        </div>

                        <ChildList onAddClick={() => setShowAddModal(true)} keyProp={refreshKey} />
                    </section>

                    <section className="pt-8 border-t border-space-700">
                        <ParentSettings />
                    </section>
                </div>

                {showAddModal && (
                    <ChildForm
                        onSuccess={handleChildAdded}
                        onCancel={() => setShowAddModal(false)}
                    />
                )}
            </div>
        </Layout>
    )
}
