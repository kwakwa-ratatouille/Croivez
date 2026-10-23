import { useState } from 'react'
import { useAuth } from '../auth'
import { usePrefs } from '../i18n'
import { FAMILLES, type Famille } from '../themes'
import { FAMILLES_DEPART, PRIX_CAISSE, choisirFamilles } from '../progression'
import Illustration from '../components/Illustration'
import { Coche, Logo, Piece } from '../components/ui'

// Premier lancement : on choisit ses 3 familles de départ, les autres se débloqueront avec des pièces
export default function ChoixFamilles() {
  const { lang } = usePrefs()
  const fr = lang === 'fr'
  const { user } = useAuth()
  const [choix, setChoix] = useState<Famille[]>([])
  const [envoi, setEnvoi] = useState(false)
  const complet = choix.length === FAMILLES_DEPART

  const basculer = (k: Famille) => setChoix((c) => (c.includes(k) ? c.filter((x) => x !== k) : c.length < FAMILLES_DEPART ? [...c, k] : c))

  return (
    <div style={{ minHeight: '100%', padding: 'calc(28px + env(safe-area-inset-top)) 16px calc(120px + env(safe-area-inset-bottom))', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22 }}>
      <div className="rise" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, maxWidth: 560 }}>
        <Logo width={70} />
        <h1 className="t" style={{ fontSize: 30, fontWeight: 900 }}>{fr ? 'Par quoi on commence ?' : 'Where do we start?'}</h1>
        <p style={{ color: 'var(--muted)', lineHeight: 1.5 }}>
          {fr
            ? `Choisissez ${FAMILLES_DEPART} familles de thèmes. Les autres se débloquent avec les pièces gagnées en jouant (une caisse de ${PRIX_CAISSE} pièces = un quiz au hasard).`
            : `Pick ${FAMILLES_DEPART} topic families. Unlock the others with coins earned by playing (a ${PRIX_CAISSE}-coin crate = one random quiz).`}
        </p>
      </div>
      <div style={{ width: '100%', maxWidth: 980, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))', gap: 12 }}>
        {FAMILLES.map((f) => {
          const pris = choix.includes(f.k)
          return (
            <button key={f.k} type="button" onClick={() => basculer(f.k)} aria-pressed={pris} className="famille"
              style={{ position: 'relative', padding: '10px 10px 14px', borderRadius: 24, cursor: 'pointer', textAlign: 'center', background: `var(--${f.k}-t)`, color: `var(--${f.k}-i)`, border: `3px solid ${pris ? `var(--${f.k})` : 'transparent'}`, opacity: complet && !pris ? 0.5 : 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, font: 'inherit' }}>
              {pris && <span style={{ position: 'absolute', top: 8, right: 8, background: 'var(--surface)', borderRadius: '50%', padding: 4, display: 'flex' }}><Coche size={20} anim={false} /></span>}
              <Illustration k={f.k} taille={130} fond={false} />
              <span className="t" style={{ fontWeight: 800, fontSize: 15, lineHeight: 1.2 }}>{f.nom[lang]}</span>
              <span style={{ fontSize: 12, fontWeight: 600 }}>{f.subs.filter((s) => s.jouable).length} quiz</span>
            </button>
          )
        })}
      </div>
      <div style={{ position: 'fixed', inset: 'auto 0 0 0', padding: '12px 16px calc(12px + env(safe-area-inset-bottom))', background: 'var(--bg)', borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'center' }}>
        <button className="btn btn-p btn-lg" disabled={!complet || envoi} style={{ width: '100%', maxWidth: 480 }}
          onClick={async () => { if (!user) return; setEnvoi(true); await choisirFamilles(user.uid, choix) }}>
          {complet ? (fr ? 'C’est parti !' : 'Let’s go!') : `${choix.length} / ${FAMILLES_DEPART}`}
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, opacity: .85 }}><Piece size={18} />50 {fr ? 'offertes' : 'free'}</span>
        </button>
      </div>
    </div>
  )
}
