import React from 'react'
import { Layout } from '../components/layout/Layout'
import { AuthForm } from '../components/auth/AuthForm'

export const AuthPage = () => {
    return (
        <Layout>
            <div className="flex-1 flex items-center justify-center p-4">
                <AuthForm />
            </div>
        </Layout>
    )
}
