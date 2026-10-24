import { BOUTIQUE } from '../meta'
import Bonhomme, { PERSOS } from './Bonhomme'
import Illustration from './Illustration'
import Animal, { ANIMAUX } from './Animal'

// Effets qui ont besoin de leur propre couche (les autres s'appliquent au cadre lui-même)
const COUCHES = ['rayons', 'ondes', 'pointilles', 'comete', 'double', 'scintille', 'anneau', 'flamme', 'bulles']

// Couleur la plus lumineuse d'un dégradé de cadre (les effets restent visibles, même sur un cadre sombre)
function couleurVive(couleur?: string) {
  const hex = (couleur?.match(/#[0-9a-f]{6}|#[0-9a-f]{3}/gi) ?? []).map((h) => (h.length === 4 ? '#' + [...h.slice(1)].map((x) => x + x).join('') : h))
  const lum = (h: string) => { const [r, g, b] = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)); return 0.3 * r + 0.59 * g + 0.11 * b + (Math.max(r, g, b) - Math.min(r, g, b)) * 0.4 }
  return hex.sort((a, b) => lum(b) - lum(a))[0] ?? '#fff'
}

// Avatar d'un joueur : personnage, illustration de famille ou initiale, dans un cadre (animé pour les cadres de compétence)
export default function Avatar({ pseudo, avatar, cadre, taille = 40, anime = false }: { pseudo?: string; avatar?: string; cadre?: string; taille?: number; anime?: boolean }) {
  const a = BOUTIQUE.find((o) => o.id === avatar)
  const c = BOUTIQUE.find((o) => o.id === cadre)
  const perso = a?.perso ? PERSOS.find((p) => p.id === a.perso) : undefined
  const animal = a?.animal ? ANIMAUX.find((x) => x.id === a.animal) : undefined
  const bord = Math.max(2, Math.round(taille / 14))
  // Les animations ne tournent qu'en grand (profil, boutique) : les listes restent fixes, sans coût
  const actif = !!c?.anim && (anime || taille >= 64)
  const anim = actif ? c!.anim!.split(' ').map((x) => 'cadre-' + x).join(' ') : ''
  const couches = actif ? c!.anim!.split(' ').filter((x) => COUCHES.includes(x)) : []
  const fx = couleurVive(c?.couleur) // couleur des effets : la plus vive du cadre (jamais un fond sombre)
  return (
    <span className={`avatar ${anim}${a?.luxe && (anime || taille >= 64) ? ` avatar-luxe${a.luxe === 2 ? ' avatar-ultra' : ''}` : ''}`} style={{ width: taille, height: taille, borderRadius: '50%', flex: 'none', padding: c ? bord : 0, display: 'inline-flex', position: 'relative', ['--cadre' as string]: c?.couleur, ['--fx' as string]: fx }}>
      <span className="t" style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', fontWeight: 800, fontSize: taille * 0.42, background: a?.fondAvatar ? a.fondAvatar : a?.emoji ? 'linear-gradient(135deg, var(--mus-t), var(--pop-t))' : perso ? 'var(--surface2)' : a?.k ? `var(--${a.k}-t)` : 'var(--sci-t)', color: 'var(--sci-i)' }}>
        {animal ? <Animal a={animal} taille={taille - (c ? bord * 2 : 0)} anime={anime || taille >= 64} /> : a?.emoji ? <span className={`avatar-emoji${anime || taille >= 64 ? ' anime' : ''}`} style={{ alignSelf: 'center', fontSize: taille * 0.58, lineHeight: 1 }}>{a.emoji}</span> : perso ? <Bonhomme p={perso} taille={taille - (c ? bord * 2 : 0)} anime={anime || taille >= 64} /> : a?.k ? <span style={{ alignSelf: 'center' }}><Illustration k={a.k} taille={taille * 1.35} fond={false} /></span> : <span style={{ alignSelf: 'center' }}>{pseudo?.[0]?.toUpperCase() ?? '?'}</span>}
      </span>
      {couches.map((x) => <span key={x} className={`cadre-fx fx-${x}`} aria-hidden="true" />)}
      {c?.orbite && (anime || taille >= 64) && <span className="orbite" aria-hidden="true" style={{ ['--t' as string]: `${taille}px` }}>{c.orbite.map((e, i) => <span key={i} style={{ ['--i' as string]: i, ['--n' as string]: c.orbite!.length }}>{e}</span>)}</span>}
    </span>
  )
}
