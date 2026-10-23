import { NavLink, Outlet } from 'react-router-dom'
import { useAuth, niveau } from '../auth'
import { usePrefs, type Key } from '../i18n'
import { ICONS, Icon, Logo, Piece, Pieces, useOnline } from './ui'
import { aReviser } from '../quiz/revision'
import MiseAJour from './MiseAJour'
import { useEffect, useRef, useState } from 'react'
import MenuTest from './MenuTest'
import { telechargerEnFond, surveillerWifi } from '../telechargementFond'
import { familleOuverte } from '../progression'
import type { Famille } from '../themes'

const LIENS: { to: string; k: Key; icon: string }[] = [
  { to: '/', k: 'nav.home', icon: ICONS.home },
  { to: '/themes', k: 'nav.themes', icon: ICONS.themes },
  { to: '/revision', k: 'nav.review', icon: ICONS.review },
  { to: '/duels', k: 'nav.duels', icon: ICONS.duels },
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
  const appuis = useRef<number[]>([])
  const appuiLogo = (e: React.MouseEvent) => {
    const t = Date.now()
    appuis.current = [...appuis.current.filter((x) => t - x < 1200), t]
    if (appuis.current.length >= 3) { e.preventDefault(); appuis.current = []; setTest(true) }
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
      <nav className="side" aria-label="Navigation principale">
        <NavLink to="/" aria-label="Croivez" className="side-logo" onClick={appuiLogo} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 12px 28px', textDecoration: 'none' }}>
          <Logo /><span className="t" style={{ fontSize: 24, fontWeight: 900 }}>Croivez</span>
        </NavLink>
        {LIENS.map((l) => (
          <NavLink key={l.to} to={l.to} end={l.to === '/'} className={({ isActive }) => `nav${isActive ? ' active' : ''}${l.to === '/parametres' ? ' nav-pc' : ''}`}>
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
            <span className="t" style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--sci-t)', color: 'var(--sci-i)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>{pseudo[0]?.toUpperCase()}</span>
            <span style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontWeight: 700, fontSize: 15 }}>{pseudo}</span>
              <span style={{ fontSize: 13, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 6 }}>{t('level')} {niveau(profile?.xp ?? 0)} · <Piece size={14} />{profile?.pieces ?? 0}</span>
            </span>
          </NavLink>
        </div>
      </nav>
      <main className="main">
        <div className="entete-mobile" style={{ justifyContent: 'space-between' }}>
          <NavLink to="/" aria-label="Croivez" onClick={appuiLogo} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}><Logo width={34} /><span className="t" style={{ fontSize: 20, fontWeight: 900 }}>Croivez</span></NavLink>
          <Pieces n={profile?.pieces ?? 0} />
        </div>
        <MiseAJour />
        <Outlet />
      </main>
    </div>
  )
}
