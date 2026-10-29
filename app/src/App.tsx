import { lazy, Suspense, useEffect, useState } from 'react'
import { HashRouter, Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom'
import { AuthProvider, useAuth } from './auth'
import { PrefsProvider, usePrefs } from './i18n'
import Layout from './components/Layout'
import { Logo, LogoAnime, Wordmark } from './components/ui'
import Accueil from './pages/Accueil'
import Themes from './pages/Themes'
import { ouvrirFiche } from './components/FicheLancement'
import { trouverSousTheme } from './themes'
import Partie from './pages/Partie'
const Parametres = lazy(() => import('./pages/Parametres'))
import Connexion from './pages/Connexion'
const ChoixFamilles = lazy(() => import('./pages/ChoixFamilles'))
import { choixAFaire } from './progression'
const Revision = lazy(() => import('./pages/Revision'))
const Fiches = lazy(() => import('./pages/Fiches'))
const ClassementJour = lazy(() => import('./pages/ClassementJour'))
const Soiree = lazy(() => import('./pages/Soiree'))
const Stats = lazy(() => import('./pages/Stats'))
const Saison = lazy(() => import('./pages/Saison'))
const Aventure = lazy(() => import('./pages/Aventure'))
const Amis = lazy(() => import('./pages/Amis'))
const Profil = lazy(() => import('./pages/Profil'))
const Joueur = lazy(() => import('./pages/Profil').then((m) => ({ default: m.Joueur })))
const Duels = lazy(() => import('./pages/Duels'))
const Duel = lazy(() => import('./pages/Duel'))
const Salon = lazy(() => import('./pages/Salon'))
const Rejoindre = lazy(() => import('./pages/Rejoindre'))
const Tv = lazy(() => import('./pages/Tv'))
const Caster = lazy(() => import('./pages/Caster'))
import LiensAppli from './components/LiensAppli'
const Classements = lazy(() => import('./pages/Classements'))
const Album = lazy(() => import('./pages/Album'))
const Boutique = lazy(() => import('./pages/Boutique'))
const Activite = lazy(() => import('./pages/Activite'))
const Clan = lazy(() => import('./pages/Clan'))
const CeJour = lazy(() => import('./pages/CeJour'))
const Tournoi = lazy(() => import('./pages/Tournoi'))
const Frise = lazy(() => import('./pages/Frise'))
import RelaisGoogle from './pages/RelaisGoogle'

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
  if (loading) return <div className="ecran-lancement"><LogoAnime width={110} /><Wordmark size={30} /></div>
  // Page ouverte dans le navigateur par l'appli pour la connexion Google (connecté ou non)
  if (location.hash.startsWith('#/relais-google')) return <RelaisGoogle />
  // Invités (QR code du mode télé) : rejoindre un salon ou lancer la télé sans compte
  const pageInvite = /^#\/(rejoindre|tv|salon)/.test(location.hash)
  if ((!user && pageInvite) || user?.isAnonymous) return (
    <HashRouter>
      <LiensAppli />
      <Suspense fallback={<div className="ecran-lancement"><LogoAnime width={84} /></div>}><Routes>
        <Route path="/rejoindre" element={<Rejoindre />} />
        <Route path="/rejoindre/:code" element={<Rejoindre />} />
        <Route path="/tv" element={<Tv />} />
        <Route path="/cast" element={<Caster />} />
        <Route path="/salon/:code" element={user ? <Salon /> : <Navigate to="/rejoindre" replace />} />
        <Route path="*" element={<Navigate to="/rejoindre" replace />} />
      </Routes></Suspense>
    </HashRouter>
  )
  if (!user) return <Connexion />
  // Nouveau compte : choisir ses 3 familles de départ avant de jouer
  if (choixAFaire(profile)) return <ChoixFamilles />
  return (
    <HashRouter>
      <LiensAppli />
      <Suspense fallback={<div className="ecran-lancement"><LogoAnime width={84} /></div>}><Routes>
        <Route path="/partie" element={<PartieCle />} />
        <Route path="/duel/:id" element={<Duel />} />
        <Route path="/salon/:code" element={<Salon />} />
        <Route path="/tv" element={<Tv />} />
        <Route path="/cast" element={<Caster />} />
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
          <Route path="/activite" element={<Activite />} />
          <Route path="/clan" element={<Clan />} />
          <Route path="/cejour" element={<CeJour />} />
          <Route path="/tournoi" element={<Tournoi />} />
          <Route path="/frise" element={<Frise />} />
          <Route path="*" element={<BientotDisponible />} />
        </Route>
      </Routes></Suspense>
    </HashRouter>
  )
}

// Au lancement, le logo animé joue une fois en entier (l'appli se charge derrière), puis s'efface en fondu
function IntroLancement() {
  const [etat, setEtat] = useState<'joue' | 'part' | 'fini'>('joue')
  useEffect(() => {
    const t1 = setTimeout(() => setEtat('part'), 1700)
    const t2 = setTimeout(() => setEtat('fini'), 2050)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])
  if (etat === 'fini') return null
  return <div className={`intro-lancement${etat === 'part' ? ' part' : ''}`} aria-hidden="true"><LogoAnime width={110} /><Wordmark size={30} /></div>
}

export default function App() {
  return (
    <PrefsProvider>
      <AuthProvider>
        <Routeur />
        <IntroLancement />
      </AuthProvider>
    </PrefsProvider>
  )
}
