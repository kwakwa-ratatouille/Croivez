import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth'
import { usePrefs } from '../i18n'
import { NB_PALIERS, XP_PALIER, etatSaison, finSaison, recompense, reclamerPalier } from '../saison'
import { retourFin } from '../retour'
import { ICONS, Icon, Piece } from '../components/ui'

// Pass de saison : 20 paliers, on récupère les récompenses atteintes d'un appui
export default function Saison() {
  const { lang } = usePrefs()
  const fr = lang === 'fr'
  const { user, profile } = useAuth()
  const [envoi, setEnvoi] = useState<number | null>(null)
  const s = etatSaison(profile)
  const mois = new Date().toLocaleDateString(fr ? 'fr-FR' : 'en-GB', { month: 'long', year: 'numeric' })
  const dansPalier = s.palier >= NB_PALIERS ? XP_PALIER : s.xp % XP_PALIER
  const reclamer = async (n: number) => {
    if (!user) return
    setEnvoi(n)
    const ok = await reclamerPalier(user.uid, n).catch(() => false)
    if (ok) retourFin(true)
    setEnvoi(null)
  }
  const aRecuperer = Array.from({ length: s.palier }, (_, i) => i + 1).filter((n) => !s.recl.includes(n))
  return (
    <>
      <Link to="/profil" style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 8, minHeight: 44, fontWeight: 600, textDecoration: 'none', color: 'var(--muted)' }}><Icon d={ICONS.arrowL} />{fr ? 'Profil' : 'Profile'}</Link>
      <header className="saison-tete card">
        <span className="eyebrow" style={{ color: 'rgba(255,255,255,.85)' }}>{fr ? 'Saison' : 'Season'} · {mois}</span>
        <h1 className="t" style={{ fontSize: 28, fontWeight: 900 }}>{fr ? `Palier ${s.palier} / ${NB_PALIERS}` : `Tier ${s.palier} / ${NB_PALIERS}`}</h1>
        <div className="bar" style={{ height: 10, background: 'rgba(255,255,255,.3)' }}><span style={{ width: `${(dansPalier / XP_PALIER) * 100}%`, background: '#fff' }} /></div>
        <span style={{ fontSize: 13, fontWeight: 600 }}>{s.palier >= NB_PALIERS ? (fr ? 'Pass terminé, bravo !' : 'Pass complete!') : `${dansPalier} / ${XP_PALIER} XP`} · {fr ? `fin dans ${finSaison()} j` : `ends in ${finSaison()} d`}</span>
        {aRecuperer.length > 1 && <button className="btn btn-lg" style={{ background: '#fff', color: 'var(--esp-i)' }} onClick={async () => { for (const n of aRecuperer) await reclamer(n) }}>{fr ? `Tout récupérer (${aRecuperer.length})` : `Claim all (${aRecuperer.length})`}</button>}
      </header>
      <p style={{ fontSize: 13, color: 'var(--muted)' }}>{fr ? 'Toute l’XP gagnée ce mois-ci fait avancer le pass. Il repart à zéro le 1er du mois, avec de nouvelles récompenses.' : 'All XP earned this month moves the pass forward. It resets on the 1st.'}</p>
      <section className="saison-paliers">
        {Array.from({ length: NB_PALIERS }, (_, i) => i + 1).map((n) => {
          const r = recompense(n)
          const atteint = s.palier >= n
          const pris = s.recl.includes(n)
          return (
            <div key={n} className={`saison-palier${atteint ? ' atteint' : ''}${r.objet ? ' special' : ''}`}>
              <span className="t saison-num">{n}</span>
              <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                <strong style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Piece size={16} />{r.pieces}</strong>
                {r.nom && <small style={{ fontWeight: 700, color: 'var(--esp-i)' }}>✨ {r.nom[lang]}</small>}
              </span>
              {pris ? <span style={{ color: 'var(--ok-i)', fontWeight: 800 }}>✓</span>
                : atteint ? <button className="btn btn-p" style={{ minHeight: 38 }} disabled={envoi === n} onClick={() => reclamer(n)}>{fr ? 'Récupérer' : 'Claim'}</button>
                  : <span style={{ fontSize: 12, color: 'var(--muted)' }}>{n * XP_PALIER} XP</span>}
            </div>
          )
        })}
      </section>
    </>
  )
}
