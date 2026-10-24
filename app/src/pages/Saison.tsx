import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth'
import { usePrefs } from '../i18n'
import { NB_PALIERS, XP_PALIER, etatSaison, finSaison, recompense, reclamerPalier } from '../saison'
import { retourFin } from '../retour'
import Avatar from '../components/Avatar'
import { ICONS, Icon, Piece } from '../components/ui'

// Pass de saison façon passe de combat : grand bandeau, piste horizontale de récompenses, palier actuel centré
export default function Saison() {
  const { lang } = usePrefs()
  const fr = lang === 'fr'
  const { user, profile } = useAuth()
  const [envoi, setEnvoi] = useState<number | null>(null)
  const piste = useRef<HTMLDivElement>(null)
  const s = etatSaison(profile)
  const mois = new Date().toLocaleDateString(fr ? 'fr-FR' : 'en-GB', { month: 'long' })
  const dansPalier = s.palier >= NB_PALIERS ? XP_PALIER : s.xp % XP_PALIER
  const aRecuperer = Array.from({ length: s.palier }, (_, i) => i + 1).filter((n) => !s.recl.includes(n))

  // Le palier en cours est amené au centre de la piste
  useEffect(() => {
    const el = piste.current?.querySelector<HTMLElement>('.bp-carte.actuelle')
    el?.scrollIntoView({ inline: 'center', block: 'nearest' })
  }, [])

  const reclamer = async (n: number) => {
    if (!user) return
    setEnvoi(n)
    if (await reclamerPalier(user.uid, n).catch(() => false)) retourFin(true)
    setEnvoi(null)
  }

  return (
    <div className="bp">
      <Link to="/" className="bp-retour"><Icon d={ICONS.arrowL} />{fr ? 'Accueil' : 'Home'}</Link>
      <header className="bp-bandeau">
        <div className="bp-niveau"><small>{fr ? 'NIVEAU' : 'TIER'}</small><strong className="t">{s.palier}</strong></div>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span className="bp-saison">{fr ? 'SAISON' : 'SEASON'} · {mois.toUpperCase()}</span>
          <strong className="t bp-titre">{fr ? 'Passe de combat' : 'Battle pass'}</strong>
          <div className="bp-xp"><span style={{ width: `${(dansPalier / XP_PALIER) * 100}%` }} /></div>
          <span className="bp-info">{s.palier >= NB_PALIERS ? (fr ? 'Passe terminé, légende !' : 'Pass complete!') : `${dansPalier} / ${XP_PALIER} XP ${fr ? 'avant le niveau' : 'to tier'} ${s.palier + 1}`} · ⏳ {finSaison()} {fr ? 'jours restants' : 'days left'}</span>
        </div>
        <div className="bp-apercu">
          <Avatar pseudo={profile?.pseudo} avatar={profile?.avatar} cadre="cadre-saison" taille={86} anime />
          <small>{fr ? 'Niveau 20' : 'Tier 20'}</small>
        </div>
      </header>

      {aRecuperer.length > 0 && (
        <button className="btn btn-p btn-lg bp-tout" onClick={async () => { for (const n of aRecuperer) await reclamer(n) }}>
          🎁 {fr ? `Récupérer ${aRecuperer.length} récompense${aRecuperer.length > 1 ? 's' : ''}` : `Claim ${aRecuperer.length}`}
        </button>
      )}

      <div className="bp-piste" ref={piste}>
        {Array.from({ length: NB_PALIERS }, (_, i) => i + 1).map((n) => {
          const r = recompense(n)
          const atteint = s.palier >= n
          const pris = s.recl.includes(n)
          const actuelle = n === Math.min(NB_PALIERS, s.palier + 1)
          return (
            <div key={n} className={`bp-carte${atteint ? ' atteint' : ''}${pris ? ' pris' : ''}${actuelle ? ' actuelle' : ''}${r.objet ? ' rare' : ''}`}>
              <span className="bp-num t">{n}</span>
              <div className="bp-lot">
                {r.objet === 'cadre-saison' ? <Avatar pseudo={profile?.pseudo} avatar={profile?.avatar} cadre="cadre-saison" taille={58} />
                  : r.objet ? <span className="bp-gros">🏷️</span>
                    : <span className="bp-gros"><Piece size={40} /></span>}
              </div>
              <strong className="bp-nom">{r.nom ? r.nom[lang] : `${r.pieces} ${fr ? 'pièces' : 'coins'}`}</strong>
              {r.objet && <small className="bp-plus">+ {r.pieces} {fr ? 'pièces' : 'coins'}</small>}
              <div className="bp-pied">
                {pris ? <span className="bp-ok">✓ {fr ? 'Obtenu' : 'Claimed'}</span>
                  : atteint ? <button className="btn btn-p" disabled={envoi === n} onClick={() => reclamer(n)}>{fr ? 'Récupérer' : 'Claim'}</button>
                    : <span className="bp-verrou"><Icon d={ICONS.lock} size={13} />{n * XP_PALIER} XP</span>}
              </div>
            </div>
          )
        })}
      </div>
      <p className="bp-aide">{fr ? 'Toute l’XP gagnée ce mois-ci fait monter le passe. Nouveau passe et nouvelles récompenses le 1er du mois.' : 'All XP earned this month levels up the pass. Resets on the 1st.'}</p>
    </div>
  )
}
