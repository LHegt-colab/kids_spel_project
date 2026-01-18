import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './context/AuthContext'
import { SessionProvider } from './context/SessionContext'
import { GamificationProvider } from './context/GamificationContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <SessionProvider>
        <GamificationProvider>
          <App />
        </GamificationProvider>
      </SessionProvider>
    </AuthProvider>
  </StrictMode>,
)
