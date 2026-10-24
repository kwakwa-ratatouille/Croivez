import { useEffect } from 'react'
import { HashRouter, Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom'
import { AuthProvider, useAuth } from './auth'
import { PrefsProvider, usePrefs } from './i18n'
import Layout from './components/Layout'
import { Logo } from './components/ui'
import Accueil from './pages/Accueil'
import Themes from './pages/Themes'
import { ouvrirFiche } from './components/FicheLancement'
import { trouverSousTheme } from './themes'
import Partie from './pages/Partie'
import Parametres from './pages/Parametres'
import Connexion from './pages/Connexion'
import ChoixFamilles from './pages/ChoixFamilles'
import { choixAFaire } from './progression'
import Revision from './pages/Revision'
import Fiches from "./pages/Fiches"
import ClassementJour from "./pages/ClassementJour"
import Soiree from "./pages/Soiree"
import Stats from "./pages/Stats"
import Saison from "./pages/Saison"
import Aventure from "./pages/Aventure"
import Amis from "./pages/Amis"
import Profil, { Joueur } from './pages/Profil'
import Duels from './pages/Duels'
import Duel from './pages/Duel'
import Salon from './pages/Salon'
import Rejoindre from './pages/Rejoindre'
import Tv from './pages/Tv'
import Classements from './pages/Classements'
import Album from './pages/Album'
import Boutique from './pages/Boutique'

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

// Ancien lien direct vers un quiz : on affiche sa famille et on ouvre la fiche de lancement
// (le quiz est déjà choisi, il ne reste que les réglages)
function OuvrirQuiz() {
  const { sous = '' } = useParams()
  useEffect(() => { ouvrirFiche(sous) }, [sous])
  return <Navigate to={`/themes/${trouverSousTheme(sous)?.famille.k ?? ''}`} replace />
}

// Une nouvelle adresse de partie (étape suivante, rejouer…) recrée la partie de zéro
function PartieCle() { const l = useLocation(); return <Partie key={l.search} /> }

function Routeur() {
  const { user, profile, loading } = useAuth()
  if (loading) return <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}><Logo width={72} /></div>
  // Invités (QR code du mode télé) : rejoindre un salon ou lancer la télé sans compte
  const pageInvite = /^#\/(rejoindre|tv|salon)/.test(location.hash)
  if ((!user && pageInvite) || user?.isAnonymous) return (
    <HashRouter>
      <Routes>
        <Route path="/rejoindre" element={<Rejoindre />} />
        <Route path="/rejoindre/:code" element={<Rejoindre />} />
        <Route path="/tv" element={<Tv />} />
        <Route path="/salon/:code" element={user ? <Salon /> : <Navigate to="/rejoindre" replace />} />
        <Route path="*" element={<Navigate to="/rejoindre" replace />} />
      </Routes>
    </HashRouter>
  )
  if (!user) return <Connexion />
  // Nouveau compte : choisir ses 3 familles de départ avant de jouer
  if (choixAFaire(profile)) return <ChoixFamilles />
  return (
    <HashRouter>
      <Routes>
        <Route path="/partie" element={<PartieCle />} />
        <Route path="/duel/:id" element={<Duel />} />
        <Route path="/salon/:code" element={<Salon />} />
        <Route path="/tv" element={<Tv />} />
        <Route path="/rejoindre/:code" element={<Rejoindre />} />
        <Route element={<Layout />}>
          <Route path="/" element={<Accueil />} />
          <Route path="/themes" element={<Themes />} />
          <Route path="/themes/:k" element={<Themes />} />
          <Route path="/jouer/:sous" element={<OuvrirQuiz />} />
          <Route path="/parametres" element={<Parametres />} />
          <Route path="/revision" element={<Revision />} />
          <Route path="/fiches" element={<Fiches />} />
          <Route path="/jour" element={<ClassementJour />} />
          <Route path="/soiree" element={<Soiree />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/saison" element={<Saison />} />
          <Route path="/aventure" element={<Aventure />} />
          <Route path="/amis" element={<Amis />} />
          <Route path="/profil" element={<Profil />} />
          <Route path="/joueur/:uid" element={<Joueur />} />
          <Route path="/duels" element={<Duels />} />
          <Route path="/classements" element={<Classements />} />
          <Route path="/album" element={<Album />} />
          <Route path="/boutique" element={<Boutique />} />
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
