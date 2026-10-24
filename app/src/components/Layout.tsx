import { doc, setDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { pseudoCle } from '../social'
import { Capacitor } from '@capacitor/core'
import Invitations from './Invitations'
import { planifierRappels } from '../rappels'
import { reclamerParrainages } from '../parrainage'
import { auth } from '../firebase'
import { NavLink, Outlet } from 'react-router-dom'
import { useAuth, niveau } from '../auth'
import { usePrefs, type Key } from '../i18n'
import { ICONS, Icon, Logo, Piece, Pieces, useOnline, Wordmark } from './ui'
import { aReviser } from '../quiz/revision'
import MiseAJour from './MiseAJour'
import { useEffect, useRef, useState } from 'react'
import MenuTest from './MenuTest'
import Nouveautes from './Nouveautes'
import PluiePieces from './PluiePieces'
import Avatar from './Avatar'
import FicheLancement from './FicheLancement'
import Achat from './Achat'
import { telechargerEnFond, surveillerWifi } from '../telechargementFond'
import { familleOuverte } from '../progression'
import type { Famille } from '../themes'

// Sur téléphone, la barre du bas garde 5 onglets (Histoire et Révision sont sur l'accueil, Amis dans Profil et Multi)
const PC_SEULEMENT = ['/aventure', '/revision', '/amis', '/parametres']
const LIENS: { to: string; k: Key; icon: string }[] = [
  { to: '/', k: 'nav.home', icon: ICONS.home },
  { to: '/themes', k: 'nav.themes', icon: ICONS.themes },
  { to: '/aventure', k: 'nav.story', icon: 'M9 4.5 3.5 6.5v13l5.5-2 6 2 5.5-2v-13l-5.5 2-6-2ZM9 4.5v13M15 6.5v13' },
  { to: '/revision', k: 'nav.review', icon: ICONS.review },
  { to: '/duels', k: 'nav.duels', icon: ICONS.duels },
  { to: '/amis', k: 'nav.friends', icon: 'M9 11a3.5 3.5 0 1 0 0-7a3.5 3.5 0 1 0 0 7ZM2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6M16 4.3a3.5 3.5 0 0 1 0 6.4M18 14.4c2.2.7 3.5 2.8 3.5 5.6' },
  { to: '/classements', k: 'nav.ranking', icon: ICONS.ranking },
  { to: '/profil', k: 'nav.profile', icon: ICONS.profile },
  { to: '/parametres', k: 'nav.settings', icon: ICONS.settings },
]

export default function Layout() {
  const { t } = usePrefs()
  const { profile } = useAuth()
  const online = useOnline()
  const pseudo = profile?.pseudo ?? '…'
  const dues = aReviser(profile?.revision).length

  // 3 appuis rapides sur le logo : menu de test
  const [test, setTest] = useState(false)
  const [fiche, setFiche] = useState<string | null>(null)
  const [achat, setAchat] = useState<string | null>(null)
  useEffect(() => {
    const h = (e: Event) => setFiche((e as CustomEvent<string>).detail)
    const a = (e: Event) => setAchat((e as CustomEvent<string>).detail)
    window.addEventListener('croivez:fiche', h)
    window.addEventListener('croivez:acheter', a)
    return () => { window.removeEventListener('croivez:fiche', h); window.removeEventListener('croivez:acheter', a) }
  }, [])
  // Bonus des filleuls inscrits avec mon lien
  const uid = profile ? auth.currentUser?.uid : undefined
  useEffect(() => { if (uid) reclamerParrainages(uid).catch(() => {}) }, [uid])
  // Rappels du lendemain (série, quiz du jour, révisions), replanifiés à chaque ouverture
  useEffect(() => { if (profile) planifierRappels(profile).catch(() => {}) }, [profile?.dernierJour, profile?.serie]) // eslint-disable-line react-hooks/exhaustive-deps
  // Demande du créateur : le solde de « Victor la tortue » est remis à 1 400 pièces (une seule fois, la pénalité ne s'applique plus)
  useEffect(() => {
    if (uid && profile && pseudoCle(profile.pseudo) === 'victorlatortue' && !(profile as { rendusTortue?: boolean }).rendusTortue)
      setDoc(doc(db, 'users', uid), { pieces: 1400, malusTortue: true, rendusTortue: true }, { merge: true }).catch(() => {})
  }, [uid, profile])
  const appuis = useRef<number[]>([])
  const appuiLogo = (e: React.MouseEvent) => {
    const t = Date.now()
    appuis.current = [...appuis.current.filter((x) => t - x < 1200), t]
    if (appuis.current.length >= 3 && Capacitor.getPlatform() !== 'android') { e.preventDefault(); appuis.current = []; setTest(true) }
  }

  // Images des thèmes en arrière-plan, en Wi-Fi seulement, familles ouvertes d'abord
  const ouvertes = (k: Famille) => familleOuverte(k, profile)
  const familles = profile?.familles?.join(',')
  useEffect(() => {
    if (!profile) return
    const lancer = () => telechargerEnFond(ouvertes)
    const t = setTimeout(lancer, 4000) // après le démarrage, pour ne pas le ralentir
    const stop = surveillerWifi(lancer)
    return () => { clearTimeout(t); stop() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!profile, familles])

  return (
    <div className="shell">
      {test && <MenuTest onFermer={() => setTest(false)} />}
      <Nouveautes />
      <PluiePieces />
      {achat && <Achat k={achat as Famille} onFermer={() => setAchat(null)} />}
      {fiche && <FicheLancement id={fiche} onFermer={() => setFiche(null)} />}
      <nav className="side" aria-label="Navigation principale">
        <NavLink to="/" aria-label="Croivez" className="side-logo" onClick={appuiLogo} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 12px 28px', textDecoration: 'none' }}>
          <Logo /><Wordmark size={24} />
        </NavLink>
        {LIENS.map((l) => (
          <NavLink key={l.to} to={l.to} end={l.to === '/'} className={({ isActive }) => `nav${isActive ? ' active' : ''}${PC_SEULEMENT.includes(l.to) ? ' nav-pc' : ''}`}>
            <Icon d={l.icon} />{t(l.k)}
            {l.to === '/revision' && dues > 0 && <span className="chip" style={{ marginLeft: 'auto', minHeight: 22, padding: '0 8px', background: 'var(--his-t)', color: 'var(--his-i)' }}>{dues}</span>}
          </NavLink>
        ))}
        <div className="side-pied" style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {!online && (
            <div role="status" style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '10px 12px', borderRadius: 14, background: 'var(--surface2)', color: 'var(--muted)', fontSize: 13, lineHeight: 1.4 }}>
              <Icon d={ICONS.cloudOff} size={18} />{t('offline')}
            </div>
          )}
          <NavLink to="/profil" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, borderRadius: 18, background: 'var(--surface2)', textDecoration: 'none' }}>
            <Avatar pseudo={pseudo} avatar={profile?.avatar} cadre={profile?.cadre} taille={40} />
            <span style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontWeight: 700, fontSize: 15 }}>{pseudo}</span>
              <span style={{ fontSize: 13, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 6 }}>{t('level')} {niveau(profile?.xp ?? 0)} · <Piece size={14} />{profile?.pieces ?? 0}</span>
            </span>
          </NavLink>
        </div>
      </nav>
      <main className="main">
        <div className="entete-mobile" style={{ justifyContent: 'space-between' }}>
          <NavLink to="/" aria-label="Croivez" onClick={appuiLogo} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}><Logo width={34} /><Wordmark size={20} /></NavLink>
          <Pieces n={profile?.pieces ?? 0} />
        </div>
        <MiseAJour />
        <Invitations />
        <Outlet />
      </main>
    </div>
  )
}
