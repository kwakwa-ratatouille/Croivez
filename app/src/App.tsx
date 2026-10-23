import { HashRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './auth'
import { PrefsProvider, usePrefs } from './i18n'
import Layout from './components/Layout'
import { Logo } from './components/ui'
import Accueil from './pages/Accueil'
import Themes from './pages/Themes'
import Configuration from './pages/Configuration'
import Partie from './pages/Partie'
import Parametres from './pages/Parametres'
import Connexion from './pages/Connexion'
import Revision from './pages/Revision'
import Profil from './pages/Profil'

function BientotDisponible() {
  const { t } = usePrefs()
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, textAlign: 'center' }}>
      <Logo width={96} />
      <h1 className="t" style={{ fontSize: 30, fontWeight: 900 }}>{t('soon.title')}</h1>
      <p style={{ color: 'var(--muted)' }}>{t('soon.sub')}</p>
    </div>
  )
}

function Routeur() {
  const { user, loading } = useAuth()
  if (loading) return <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}><Logo width={72} /></div>
  if (!user) return <Connexion />
  return (
    <HashRouter>
      <Routes>
        <Route path="/partie" element={<Partie />} />
        <Route element={<Layout />}>
          <Route path="/" element={<Accueil />} />
          <Route path="/themes" element={<Themes />} />
          <Route path="/jouer/:sous" element={<Configuration />} />
          <Route path="/parametres" element={<Parametres />} />
          <Route path="/revision" element={<Revision />} />
          <Route path="/profil" element={<Profil />} />
          <Route path="*" element={<BientotDisponible />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}

export default function App() {
  return (
    <PrefsProvider>
      <AuthProvider>
        <Routeur />
      </AuthProvider>
    </PrefsProvider>
  )
}
