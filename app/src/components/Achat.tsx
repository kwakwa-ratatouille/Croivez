import { useState } from 'react'
import { useAuth } from '../auth'
import { usePrefs } from '../i18n'
import { FAMILLES, type Famille, type SousTheme } from '../themes'
import { PRIX_CAISSE, POIDS, RARETES, ouvrirCaisse, quizVerrouilles, rareteDe, type Rarete } from '../progression'
import Caisse from './Caisse'
import Illustration from './Illustration'
import { ICONS, Icon, Piece } from './ui'

// Caisse d'une famille : prix fixe, chances par rareté, puis ouverture façon CS:GO et révélation
export default function Achat({ k, onFermer }: { k: Famille; onFermer: () => void }) {
  const { lang } = usePrefs()
  const fr = lang === 'fr'
  const { user, profile } = useAuth()
  const [ouverte, setOuverte] = useState<{ gain: SousTheme; possibles: SousTheme[] } | null>(null)
  const [envoi, setEnvoi] = useState(false)
  const f = FAMILLES.find((x) => x.k === k)
  if (!f) return null
  if (ouverte) return <Caisse k={k} possibles={ouverte.possibles} gain={ouverte.gain} onFermer={onFermer} />
  const restants = quizVerrouilles(k, profile)
  const solde = profile?.pieces ?? 0
  const assez = solde >= PRIX_CAISSE
  // Combien de quiz restent par rareté, et la vraie chance de tomber sur chacune
  const parRarete = (Object.keys(RARETES) as Rarete[]).map((r) => ({ r, n: restants.filter((s) => rareteDe(s.id) === r).length }))
  const total = parRarete.reduce((a, x) => a + x.n * POIDS[x.r], 0)
  const ouvrir = async () => {
    if (!user) return
    setEnvoi(true)
    const gain = await ouvrirCaisse(user.uid, k, profile).catch(() => false as const)
    setEnvoi(false)
    if (gain) setOuverte({ gain, possibles: restants })
  }
  return (
    <div className="fiche-fond" onClick={onFermer} role="presentation">
      <div className="fiche" role="dialog" aria-modal="true" aria-label={f.nom[lang]} onClick={(e) => e.stopPropagation()}>
        <div className="fiche-poignee" />
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ width: 72, height: 72, borderRadius: 18, background: `var(--${k}-t)`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flex: 'none' }}><Illustration k={k} taille={80} fond={false} /></span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <span className="eyebrow" style={{ color: `var(--${k}-i)` }}>{fr ? 'Caisse' : 'Crate'}</span>
            <h2 className="t" style={{ fontSize: 22, fontWeight: 900, lineHeight: 1.2 }}>{f.nom[lang]}</h2>
            <span style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600 }}>{restants.length} {fr ? 'quiz à gagner' : 'quizzes to win'}</span>
          </div>
          <button className="btn btn-g" aria-label={fr ? 'Fermer' : 'Close'} onClick={onFermer} style={{ minHeight: 40, padding: '0 10px' }}><Icon d={ICONS.close} size={18} /></button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
          {parRarete.map(({ r, n }) => (
            <div key={r} style={{ padding: '8px 6px', borderRadius: 12, textAlign: 'center', background: 'var(--surface2)', boxShadow: `inset 0 -3px 0 ${RARETES[r].couleur}`, opacity: n ? 1 : 0.4 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: RARETES[r].couleur }}>{RARETES[r].nom[lang]}</div>
              <div className="t" style={{ fontWeight: 900, fontSize: 17 }}>{total ? Math.round((n * POIDS[r] * 100) / total) : 0} %</div>
              <div style={{ fontSize: 11, color: 'var(--muted)' }}>{n} quiz</div>
            </div>
          ))}
        </div>
        <button className="btn btn-p btn-lg" disabled={!assez || envoi || !restants.length} style={{ width: '100%' }} onClick={ouvrir}>
          {!restants.length ? (fr ? 'Tout est débloqué !' : 'All unlocked!') : assez ? (fr ? 'Ouvrir la caisse' : 'Open crate') : (fr ? `Encore ${PRIX_CAISSE - solde} pièces` : `${PRIX_CAISSE - solde} more coins`)} · <Piece size={18} />{PRIX_CAISSE}
        </button>
      </div>
    </div>
  )
}
