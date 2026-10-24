import { BOUTIQUE } from '../meta'
import Illustration from './Illustration'

// Avatar d'un joueur : illustration de famille (ou initiale) dans un cadre éventuel
export default function Avatar({ pseudo, avatar, cadre, taille = 40 }: { pseudo?: string; avatar?: string; cadre?: string; taille?: number }) {
  const a = BOUTIQUE.find((o) => o.id === avatar)
  const c = BOUTIQUE.find((o) => o.id === cadre)
  const bord = Math.max(2, Math.round(taille / 14))
  return (
    <span style={{ width: taille, height: taille, borderRadius: '50%', flex: 'none', padding: c ? bord : 0, background: c?.couleur, display: 'inline-flex' }}>
      <span className="t" style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: taille * 0.42, background: a?.k ? `var(--${a.k}-t)` : 'var(--sci-t)', color: 'var(--sci-i)' }}>
        {a?.k ? <Illustration k={a.k} taille={taille * 1.35} fond={false} /> : pseudo?.[0]?.toUpperCase() ?? '?'}
      </span>
    </span>
  )
}
