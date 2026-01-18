import React from 'react'
import { TimeLimitLock } from './TimeLimitLock'

export const Layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="min-h-screen bg-space-900 bg-stars font-body flex flex-col">
            <TimeLimitLock />
            <nav className="p-4 flex justify-between items-center bg-space-900/50 backdrop-blur-md border-b border-space-800 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto flex justify-between items-center w-full">
                    {/* Logo/Home Link */}
                    <div className="pointer-events-auto">
                        <a href="/game/home" className="text-2xl font-display font-bold text-white hover:text-brand-yellow transition-colors">
                            🚀 Kids Spel
                        </a>
                    </div>
                    {/* Contextual Navigation */}
                    <div className="pointer-events-auto flex items-center gap-4">
                        <a href="/shop" className="bg-brand-teal/20 hover:bg-brand-teal/40 text-brand-teal font-bold px-4 py-2 rounded-full transition-colors flex items-center gap-2">
                            🛒 Winkel
                        </a>
                    </div>
                </div>
            </nav>

            <main className="relative z-10 min-h-screen flex flex-col">
                {children}
            </main>

            {/* Decorative Planet or Elements could go absolute here */}
        </div>
    )
}
