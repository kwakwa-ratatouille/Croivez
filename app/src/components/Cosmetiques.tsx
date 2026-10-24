import type { CSSProperties } from 'react'
import type { Lang } from '../i18n'
import { SAISONS } from '../evenements'

// ——— Fonds de vitrine animés : un dégradé et des particules qui tombent, montent ou flottent ———
export type FondAnime = { id: string; nom: Record<Lang, string>; prix: number; fond: string; particules: string[]; mouvement: 'tombe' | 'monte' | 'flotte'; saison?: string }
export const FONDS_ANIMES: FondAnime[] = [
  { id: 'fond-pieces', nom: { fr: 'Pluie de pièces', en: 'Coin rain' }, prix: 400, fond: 'linear-gradient(140deg, #78350F, #D97706 55%, #FDE68A)', particules: ['🪙', '💰', '🪙'], mouvement: 'tombe' },
  { id: 'fond-neige', nom: { fr: 'Nuit enneigée', en: 'Snowy night' }, prix: 350, fond: 'linear-gradient(180deg, #0F172A, #1E3A8A)', particules: ['❄️', '❅', '❆'], mouvement: 'tombe' },
  { id: 'fond-confettis', nom: { fr: 'Confettis', en: 'Confetti' }, prix: 450, fond: 'linear-gradient(130deg, #6D28D9, #DB2777)', particules: ['🎊', '🎉', '✨'], mouvement: 'tombe' },
  { id: 'fond-coeurs', nom: { fr: 'Pluie de cœurs', en: 'Hearts' }, prix: 400, fond: 'linear-gradient(130deg, #BE185D, #F9A8D4)', particules: ['💖', '💕', '💗'], mouvement: 'monte' },
  { id: 'fond-bulles', nom: { fr: 'Fond marin', en: 'Underwater' }, prix: 450, fond: 'linear-gradient(180deg, #0EA5E9, #1E3A8A)', particules: ['🫧', '🐠', '🫧'], mouvement: 'monte' },
  { id: 'fond-feu', nom: { fr: 'Brasier', en: 'Blaze' }, prix: 600, fond: 'linear-gradient(0deg, #7F1D1D, #F97316 60%, #FDE047)', particules: ['🔥', '✨', '🔥'], mouvement: 'monte' },
  { id: 'fond-lucioles', nom: { fr: 'Lucioles', en: 'Fireflies' }, prix: 500, fond: 'linear-gradient(160deg, #052E16, #166534)', particules: ['✨', '🌟', '✨'], mouvement: 'flotte' },
  { id: 'fond-musique', nom: { fr: 'Concert', en: 'Concert' }, prix: 500, fond: 'linear-gradient(130deg, #312E81, #A855F7)', particules: ['🎵', '🎶', '🎸'], mouvement: 'monte' },
  { id: 'fond-espace', nom: { fr: 'Décollage', en: 'Lift-off' }, prix: 750, fond: 'radial-gradient(circle at 20% 30%, #fff 0 1px, transparent 2px) 0 0 / 40px 40px, linear-gradient(160deg, #020617, #312E81)', particules: ['🚀', '🪐', '⭐'], mouvement: 'flotte' },
  { id: 'fond-jackpot', nom: { fr: 'Jackpot', en: 'Jackpot' }, prix: 1500, fond: 'linear-gradient(130deg, #14532D, #22C55E 50%, #FDE047)', particules: ['💸', '💎', '🪙'], mouvement: 'tombe' },
  { id: 'fond-feuilles', nom: { fr: 'Feuilles d’automne', en: 'Autumn leaves' }, prix: 350, fond: 'linear-gradient(140deg, #7C2D12, #F59E0B)', particules: ['🍂', '🍁', '🍂'], mouvement: 'tombe' },
  { id: 'fond-cerveau', nom: { fr: 'Cerveau en ébullition', en: 'Big brain' }, prix: 900, fond: 'linear-gradient(130deg, #831843, #6366F1)', particules: ['🧠', '💡', '❓'], mouvement: 'flotte' },
  // Un fond par saison du passe de combat (palier 15)
  ...SAISONS.map((s): FondAnime => ({ id: `fond-s-${s.id}`, nom: s.nom, prix: 0, fond: s.fond, particules: s.cadre.orbite, mouvement: s.id === 'givre' || s.id === 'automne' || s.id === 'noel' ? 'tombe' : 'flotte', saison: s.id })),
]
export const fondAnime = (id?: string) => FONDS_ANIMES.find((f) => f.id === id)

// Particules réparties en largeur, délais et tailles variés, en boucle (transform/opacity seulement)
export function Particules({ f, nb = 14 }: { f: FondAnime; nb?: number }) {
  return (
    <span className={`particules ${f.mouvement}`} aria-hidden="true">
      {Array.from({ length: nb }, (_, i) => (
        <span key={i} style={{ left: `${(i * 73) % 100}%`, animationDelay: `${-(i * 1.37) % 7}s`, animationDuration: `${6 + (i % 5)}s`, fontSize: `${14 + ((i * 7) % 16)}px` }}>{f.particules[i % f.particules.length]}</span>
      ))}
    </span>
  )
}

// ——— Styles de pseudo : le nom affiché en dégradé, doré, néon… ———
export type StylePseudo = { id: string; nom: Record<Lang, string>; prix: number; css: CSSProperties; classe?: string }
export const STYLES_PSEUDO: StylePseudo[] = [
  { id: 'pseudo-or', nom: { fr: 'Doré', en: 'Golden' }, prix: 300, css: { backgroundImage: 'linear-gradient(90deg, #B8862E, #F4C430, #FFF2B8, #F4C430, #B8862E)' }, classe: 'brille' },
  { id: 'pseudo-arcenciel', nom: { fr: 'Arc-en-ciel', en: 'Rainbow' }, prix: 600, css: { backgroundImage: 'linear-gradient(90deg, #EF4444, #F59E0B, #22C55E, #3B82F6, #A855F7, #EF4444)' }, classe: 'defile' },
  { id: 'pseudo-neon', nom: { fr: 'Néon', en: 'Neon' }, prix: 500, css: { backgroundImage: 'linear-gradient(90deg, #FF00E5, #00F0FF)', filter: 'drop-shadow(0 0 6px rgba(255, 0, 229, .55))' } },
  { id: 'pseudo-feu', nom: { fr: 'Feu', en: 'Fire' }, prix: 450, css: { backgroundImage: 'linear-gradient(0deg, #DC2626, #F97316, #FDE047)' } },
  { id: 'pseudo-glace', nom: { fr: 'Glace', en: 'Ice' }, prix: 450, css: { backgroundImage: 'linear-gradient(90deg, #0EA5E9, #E0F2FE, #38BDF8)' }, classe: 'brille' },
  { id: 'pseudo-galaxie', nom: { fr: 'Galaxie', en: 'Galaxy' }, prix: 800, css: { backgroundImage: 'linear-gradient(90deg, #6D28D9, #DB2777, #2563EB, #6D28D9)' }, classe: 'defile' },
  { id: 'pseudo-foret', nom: { fr: 'Forêt', en: 'Forest' }, prix: 300, css: { backgroundImage: 'linear-gradient(90deg, #14532D, #4ADE80)' } },
  { id: 'pseudo-bonbon', nom: { fr: 'Bonbon', en: 'Candy' }, prix: 350, css: { backgroundImage: 'linear-gradient(90deg, #F472B6, #A5F3FC, #F472B6)' }, classe: 'defile' },
]
export const stylePseudo = (id?: string) => STYLES_PSEUDO.find((s) => s.id === id)

// Pseudo affiché avec le style équipé
export function Pseudo({ nom, style }: { nom: string; style?: string }) {
  const s = stylePseudo(style)
  if (!s) return <>{nom}</>
  return <span className={`pseudo-style ${s.classe ?? ''}`} style={s.css}>{nom}</span>
}
