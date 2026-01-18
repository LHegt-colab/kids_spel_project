import React from 'react'
import { Link } from 'react-router-dom'
import { Layout } from '../components/layout/Layout'
import { Rocket } from 'lucide-react'

export const LandingPage = () => {
    return (
        <Layout>
            <div className="flex flex-col items-center justify-center min-h-[80vh] p-4 text-center">
                <div className="bg-brand-orange p-4 rounded-full mb-6 animate-bounce">
                    <Rocket size={48} className="text-white" />
                </div>
                <h1 className="text-5xl md:text-7xl font-display font-bold text-brand-yellow mb-6 drop-shadow-lg">
                    Space Learning Quest
                </h1>
                <p className="text-xl md:text-2xl text-space-100 max-w-2xl mb-12">
                    Hoi astronaut! Ben je klaar om te leren en te spelen in de ruimte?
                </p>

                <div className="flex flex-col md:flex-row gap-6 w-full max-w-md">
                    <Link to="/auth" className="flex-1 bg-brand-teal hover:bg-teal-400 text-space-900 font-bold py-4 px-8 rounded-2xl text-xl transition-transform hover:scale-105 shadow-xl text-center">
                        Voor Ouders (Start)
                    </Link>
                    {/* If we had a direct child login, it would go here, but focusing on Parent-First flow */}
                </div>
            </div>
        </Layout>
    )
}
