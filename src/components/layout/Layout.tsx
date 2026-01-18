import React from 'react'
import { TimeLimitLock } from './TimeLimitLock'

export const Layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="min-h-screen bg-space-900 bg-stars font-body flex flex-col">
            <TimeLimitLock />
            <nav className="p-4 flex justify-between items-center bg-space-900/50 backdrop-blur-md border-b border-space-800 sticky top-0 z-40">
                {/* Dynamic Header could go here */}
                <div className="max-w-7xl mx-auto flex justify-between items-center w-full">
                    {/* Logo/Home Link */}
                    <div className="pointer-events-auto">
                        {/* Placeholder for Logo */}
                    </div>
                    {/* Contextual Navigation */}
                    <div className="pointer-events-auto flex items-center gap-4">
                        {/* Placeholder for Sign Out / Settings */}
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
