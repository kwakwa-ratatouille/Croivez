import { BOUTIQUE } from '../meta'
import Bonhomme, { PERSOS } from './Bonhomme'
import Illustration from './Illustration'
import Animal, { ANIMAUX } from './Animal'

// Avatar d'un joueur : personnage, illustration de famille ou initiale, dans un cadre (animé pour les cadres de compétence)
export default function Avatar({ pseudo, avatar, cadre, taille = 40, anime = false }: { pseudo?: string; avatar?: string; cadre?: string; taille?: number; anime?: boolean }) {
  const a = BOUTIQUE.find((o) => o.id === avatar)
  const c = BOUTIQUE.find((o) => o.id === cadre)
  const perso = a?.perso ? PERSOS.find((p) => p.id === a.perso) : undefined
  const animal = a?.animal ? ANIMAUX.find((x) => x.id === a.animal) : undefined
  const bord = Math.max(2, Math.round(taille / 14))
  // Les animations ne tournent qu'en grand (profil, boutique) : les listes restent fixes, sans coût
  const anim = c?.anim && (anime || taille >= 64) ? c.anim.split(' ').map((x) => 'cadre-' + x).join(' ') : ''
  return (
    <span className={`avatar ${anim}`} style={{ width: taille, height: taille, borderRadius: '50%', flex: 'none', padding: c ? bord : 0, display: 'inline-flex', position: 'relative', ['--cadre' as string]: c?.couleur }}>
      <span className="t" style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', fontWeight: 800, fontSize: taille * 0.42, background: a?.emoji ? 'linear-gradient(135deg, var(--mus-t), var(--pop-t))' : perso ? 'var(--surface2)' : a?.k ? `var(--${a.k}-t)` : 'var(--sci-t)', color: 'var(--sci-i)' }}>
        {animal ? <Animal a={animal} taille={taille - (c ? bord * 2 : 0)} /> : a?.emoji ? <span style={{ alignSelf: 'center', fontSize: taille * 0.58, lineHeight: 1 }}>{a.emoji}</span> : perso ? <Bonhomme p={perso} taille={taille - (c ? bord * 2 : 0)} anime={anime} /> : a?.k ? <span style={{ alignSelf: 'center' }}><Illustration k={a.k} taille={taille * 1.35} fond={false} /></span> : <span style={{ alignSelf: 'center' }}>{pseudo?.[0]?.toUpperCase() ?? '?'}</span>}
      </span>
    </span>
  )
}
