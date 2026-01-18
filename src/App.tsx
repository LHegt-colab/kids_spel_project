import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { LandingPage } from './pages/LandingPage'
import { AuthPage } from './pages/AuthPage'
import { ParentDashboard } from './pages/ParentDashboard'
import { ChildSelectPage } from './pages/ChildSelectPage'
import { GameHome } from './pages/GameHome'
import { RekenAvontuur } from './pages/games/RekenAvontuur'
import { RekenRace } from './pages/games/RekenRace'
import { Woordenjacht } from './pages/games/Woordenjacht'
import { Zinnenbouwer } from './pages/games/Zinnenbouwer'
import { LeesKies } from './pages/games/LeesKies'
import { MysterieMissie } from './pages/games/MysterieMissie'
import { RuimteWinkel } from './pages/games/RuimteWinkel'
import { ShopPage } from './pages/ShopPage'
import { ProtectedParentRoute } from './components/auth/ProtectedParentRoute'
import { useAuth } from './context/AuthContext'

function App() {
  const { loading, session } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-space-900 flex items-center justify-center text-white">
        Laden...
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={session ? <Navigate to="/parent/dashboard" /> : <AuthPage />} />
        <Route
          path="/parent/dashboard"
          element={
            session ? (
              <ProtectedParentRoute>
                <ParentDashboard />
              </ProtectedParentRoute>
            ) : (
              <Navigate to="/auth" />
            )
          }
        />
        <Route
          path="/child/select"
          element={session ? <ChildSelectPage /> : <Navigate to="/auth" />}
        />
        <Route
          path="/game/home"
          element={session ? <GameHome /> : <Navigate to="/auth" />}
        />
        <Route
          path="/game/math-adventure"
          element={session ? <RekenAvontuur /> : <Navigate to="/auth" />}
        />
        <Route
          path="/game/math-race"
          element={session ? <RekenRace /> : <Navigate to="/auth" />}
        />
        <Route
          path="/game/word-hunt"
          element={session ? <Woordenjacht /> : <Navigate to="/auth" />}
        />
        <Route
          path="/game/sentence-builder"
          element={session ? <Zinnenbouwer /> : <Navigate to="/auth" />}
        />
        <Route
          path="/game/read-quiz"
          element={session ? <LeesKies /> : <Navigate to="/auth" />}
        />
        <Route
          path="/game/mysterie-missie"
          element={session ? <MysterieMissie /> : <Navigate to="/auth" />}
        />
        <Route
          path="/game/shop-game"
          element={session ? <RuimteWinkel /> : <Navigate to="/auth" />}
        />
        <Route
          path="/shop"
          element={session ? <ShopPage /> : <Navigate to="/auth" />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App


