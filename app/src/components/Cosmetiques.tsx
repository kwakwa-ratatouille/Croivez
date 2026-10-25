import type { CSSProperties } from 'react'
import type { Lang } from '../i18n'
import { SAISONS } from '../evenements'
import { TOUS_RANGS } from '../ligues'

// ——— Fonds de vitrine animés : un dégradé et des particules qui tombent, montent ou flottent ———
export type FondAnime = { id: string; nom: Record<Lang, string>; prix: number; fond: string; particules: string[]; mouvement: 'tombe' | 'monte' | 'flotte'; saison?: string; luxe?: 1 | 2; halo?: boolean; effet?: string; rang?: string; jetons?: number }
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
  // Luxe : un halo de couleurs qui ondule derrière les particules
  { id: 'fond-aurore', nom: { fr: 'Aurore boréale', en: 'Northern lights' }, prix: 3000, luxe: 1, halo: true, fond: 'linear-gradient(180deg, #020617, #064E3B 55%, #134E4A)', particules: ['✨', '⭐', '✨'], mouvement: 'flotte' },
  { id: 'fond-tresor', nom: { fr: 'Salle du trésor', en: 'Treasure room' }, prix: 7500, luxe: 1, halo: true, fond: 'radial-gradient(circle at 50% 110%, #FDE047, #B45309 45%, #451A03)', particules: ['💎', '👑', '🪙', '💰'], mouvement: 'tombe' },
  { id: 'fond-ultime', nom: { fr: 'Big Bang', en: 'Big Bang' }, prix: 30000, luxe: 2, halo: true, fond: 'conic-gradient(from 0deg at 50% 50%, #0F0C29, #6D28D9, #DB2777, #F59E0B, #22D3EE, #0F0C29)', particules: ['🌌', '💫', '🪐', '☄️', '⭐', '💎'], mouvement: 'flotte' },
  // Motifs animés dessinés, petits prix
  { id: 'fond-m-damier', nom: { fr: 'Damier qui glisse', en: 'Sliding checks' }, prix: 300, effet: 'damier', fond: 'linear-gradient(135deg, #0EA5E9, #6366F1)', particules: [], mouvement: 'flotte' },
  { id: 'fond-m-pois', nom: { fr: 'Pois pop', en: 'Pop dots' }, prix: 300, effet: 'pois', fond: 'linear-gradient(135deg, #F472B6, #FB923C)', particules: [], mouvement: 'flotte' },
  { id: 'fond-m-rayures', nom: { fr: 'Rayures bonbon', en: 'Candy stripes' }, prix: 350, effet: 'rayures', fond: 'linear-gradient(135deg, #F43F5E, #FDE68A)', particules: [], mouvement: 'flotte' },
  { id: 'fond-m-ondes', nom: { fr: 'Ondes', en: 'Ripples' }, prix: 400, effet: 'ondes', fond: 'radial-gradient(circle, #14B8A6, #0F766E)', particules: [], mouvement: 'flotte' },
  { id: 'fond-m-losanges', nom: { fr: 'Arlequin', en: 'Harlequin' }, prix: 400, effet: 'losanges', fond: 'linear-gradient(135deg, #7C3AED, #DB2777)', particules: [], mouvement: 'flotte' },
  { id: 'fond-m-zebre', nom: { fr: 'Zèbre', en: 'Zebra' }, prix: 450, effet: 'zebre', fond: '#111827', particules: [], mouvement: 'flotte' },
  { id: 'fond-m-papier', nom: { fr: 'Cahier d’écolier', en: 'School notebook' }, prix: 350, effet: 'cahier', fond: '#FFFDF5', particules: [], mouvement: 'flotte' },
  { id: 'fond-m-hexa', nom: { fr: 'Ruche', en: 'Hive' }, prix: 500, effet: 'hexa', fond: 'linear-gradient(135deg, #F59E0B, #B45309)', particules: [], mouvement: 'flotte' },
  { id: 'fond-m-degrade', nom: { fr: 'Dégradé vivant', en: 'Living gradient' }, prix: 500, effet: 'degrade', fond: 'linear-gradient(120deg, #22D3EE, #A855F7, #F472B6, #FACC15)', particules: [], mouvement: 'flotte' },
  { id: 'fond-m-carreaux', nom: { fr: 'Vichy', en: 'Gingham' }, prix: 300, effet: 'vichy', fond: '#FEE2E2', particules: [], mouvement: 'flotte' },
  { id: 'fond-m-tourbillon', nom: { fr: 'Tourbillon', en: 'Swirl' }, prix: 600, effet: 'tourbillon', fond: '#1E1B4B', particules: [], mouvement: 'flotte' },
  { id: 'fond-m-lava', nom: { fr: 'Lampe à lave', en: 'Lava lamp' }, prix: 700, effet: 'lava', fond: 'linear-gradient(180deg, #4C1D95, #BE185D)', particules: [], mouvement: 'flotte' },
  // Luxe dessiné : des effets de lumière à la place des particules d'émojis
  { id: 'fond-lx-rideaux', nom: { fr: 'Rideaux d’aurore', en: 'Aurora curtains' }, prix: 4000, luxe: 1, effet: 'rideaux', fond: 'linear-gradient(180deg, #020617, #0F172A 60%, #052E16)', particules: ['·', '✦'], mouvement: 'flotte' },
  { id: 'fond-lx-retro', nom: { fr: 'Autoroute 1984', en: 'Highway 1984' }, prix: 4500, luxe: 1, effet: 'grille', fond: 'linear-gradient(180deg, #1E1B4B, #701A75 55%, #F97316)', particules: ['✦'], mouvement: 'flotte' },
  { id: 'fond-lx-soleil', nom: { fr: 'Soleil levant', en: 'Rising sun' }, prix: 3500, luxe: 1, effet: 'rayons', fond: 'radial-gradient(circle at 50% 110%, #FEF3C7, #F59E0B 30%, #B91C1C 70%, #450A0A)', particules: ['✦'], mouvement: 'monte' },
  { id: 'fond-lx-matrice', nom: { fr: 'Matrice', en: 'Matrix' }, prix: 5000, luxe: 1, effet: 'pluie', fond: 'linear-gradient(180deg, #000, #022C22)', particules: ['0', '1'], mouvement: 'tombe' },
  { id: 'fond-lx-ocean', nom: { fr: 'Houle profonde', en: 'Deep swell' }, prix: 4000, luxe: 1, effet: 'vagues', fond: 'linear-gradient(180deg, #0C4A6E, #082F49)', particules: ['·'], mouvement: 'monte' },
  { id: 'fond-lx-nebuleuse', nom: { fr: 'Nébuleuse vivante', en: 'Living nebula' }, prix: 9000, luxe: 1, halo: true, effet: 'nebuleuse', fond: 'linear-gradient(160deg, #0B0221, #1E1B4B)', particules: ['✦', '·', '✧'], mouvement: 'flotte' },
  { id: 'fond-lx-prisme', nom: { fr: 'Palais de cristal', en: 'Crystal palace' }, prix: 35000, luxe: 2, halo: true, effet: 'prisme', fond: 'conic-gradient(from 45deg, #312E81, #0E7490, #A21CAF, #312E81)', particules: ['✦', '✧', '◆'], mouvement: 'flotte' },
  // Boutique des rangs (jetons)
  { id: 'fond-j-podium', nom: { fr: 'Podium', en: 'Podium' }, prix: 0, jetons: 45, fond: 'linear-gradient(180deg, #1E3A8A, #6D28D9)', particules: ['🏆', '🥇', '✨'], mouvement: 'monte' },
  { id: 'fond-j-arene', nom: { fr: 'Arène en feu', en: 'Blazing arena' }, prix: 0, jetons: 90, halo: true, fond: 'radial-gradient(circle at 50% 120%, #F97316, #7F1D1D 55%, #111827)', particules: ['🔥', '⚔️', '🔥'], mouvement: 'monte' },
  { id: 'fond-j-trophees', nom: { fr: 'Salle des trophées', en: 'Trophy room' }, prix: 0, jetons: 150, halo: true, fond: 'linear-gradient(160deg, #451A03, #B45309 60%, #FDE68A)', particules: ['🏆', '👑', '💎', '🥇'], mouvement: 'tombe' },
  { id: 'fond-j-pantheon', nom: { fr: 'Panthéon', en: 'Pantheon' }, prix: 0, jetons: 280, luxe: 2, halo: true, fond: 'conic-gradient(from 0deg at 50% 50%, #312E81, #F4C430, #DB2777, #22D3EE, #312E81)', particules: ['👑', '🌟', '💫', '🏛️'], mouvement: 'flotte' },
  // Un fond par rang (finir 3 semaines dans ce rang)
  ...TOUS_RANGS.map((r, i): FondAnime => ({ id: `fond-rang-${r.id}`, nom: { fr: `Vitrine ${r.nom.fr}`, en: `${r.nom.en} showcase` }, prix: 0, rang: r.id, halo: i >= 4, luxe: r.id === 'legende' ? 2 : undefined, fond: `radial-gradient(circle at 50% 120%, ${r.couleur}, ${r.fonce} 60%, #0B0B12)`, particules: [r.emoji, '✨', r.emoji], mouvement: 'monte' })),
  // Un fond par saison du passe de combat (palier 15)
  ...SAISONS.map((s): FondAnime => ({ id: `fond-s-${s.id}`, nom: s.nom, prix: 0, fond: s.fond, particules: s.cadre.orbite, mouvement: s.id === 'givre' || s.id === 'automne' || s.id === 'noel' ? 'tombe' : 'flotte', saison: s.id })),
]
export const fondAnime = (id?: string) => FONDS_ANIMES.find((f) => f.id === id)

// Particules réparties en largeur, délais et tailles variés, en boucle (transform/opacity seulement)
export function Particules({ f, nb = 14 }: { f: FondAnime; nb?: number }) {
  return (
    <span className={`particules ${f.mouvement}${f.luxe === 2 ? ' ultra' : ''}`} aria-hidden="true">
      {f.halo && <span className="fond-halo" />}
      {f.effet && <span className={`fond-effet effet-${f.effet}`} />}
      {Array.from({ length: nb }, (_, i) => (
        <span key={i} style={{ left: `${(i * 73) % 100}%`, animationDelay: `${-(i * 1.37) % 7}s`, animationDuration: `${6 + (i % 5)}s`, fontSize: `${14 + ((i * 7) % 16)}px` }}>{f.particules[i % f.particules.length]}</span>
      ))}
    </span>
  )
}

// ——— Styles de pseudo : le nom affiché en dégradé, doré, néon… ———
export type StylePseudo = { id: string; nom: Record<Lang, string>; prix: number; css: CSSProperties; classe?: string; luxe?: 1 | 2; rang?: string; jetons?: number }
export const STYLES_PSEUDO: StylePseudo[] = [
  { id: 'pseudo-or', nom: { fr: 'Doré', en: 'Golden' }, prix: 300, css: { backgroundImage: 'linear-gradient(90deg, #B8862E, #F4C430, #FFF2B8, #F4C430, #B8862E)' }, classe: 'brille' },
  { id: 'pseudo-arcenciel', nom: { fr: 'Arc-en-ciel', en: 'Rainbow' }, prix: 600, css: { backgroundImage: 'linear-gradient(90deg, #EF4444, #F59E0B, #22C55E, #3B82F6, #A855F7, #EF4444)' }, classe: 'defile' },
  { id: 'pseudo-neon', nom: { fr: 'Néon', en: 'Neon' }, prix: 500, css: { backgroundImage: 'linear-gradient(90deg, #FF00E5, #00F0FF)', filter: 'drop-shadow(0 0 6px rgba(255, 0, 229, .55))' } },
  { id: 'pseudo-feu', nom: { fr: 'Feu', en: 'Fire' }, prix: 450, css: { backgroundImage: 'linear-gradient(0deg, #DC2626, #F97316, #FDE047)' } },
  { id: 'pseudo-glace', nom: { fr: 'Glace', en: 'Ice' }, prix: 450, css: { backgroundImage: 'linear-gradient(90deg, #0EA5E9, #E0F2FE, #38BDF8)' }, classe: 'brille' },
  { id: 'pseudo-galaxie', nom: { fr: 'Galaxie', en: 'Galaxy' }, prix: 800, css: { backgroundImage: 'linear-gradient(90deg, #6D28D9, #DB2777, #2563EB, #6D28D9)' }, classe: 'defile' },
  { id: 'pseudo-foret', nom: { fr: 'Forêt', en: 'Forest' }, prix: 300, css: { backgroundImage: 'linear-gradient(90deg, #14532D, #4ADE80)' } },
  { id: 'pseudo-diamant', nom: { fr: 'Diamant', en: 'Diamond' }, prix: 2500, luxe: 1, css: { backgroundImage: 'linear-gradient(90deg, #60A5FA, #FFFFFF, #A5F3FC, #FFFFFF, #60A5FA)', filter: 'drop-shadow(0 0 5px rgba(165, 243, 252, .8))' }, classe: 'defile' },
  { id: 'pseudo-lave', nom: { fr: 'Lave en fusion', en: 'Molten lava' }, prix: 6000, luxe: 1, css: { backgroundImage: 'linear-gradient(90deg, #7F1D1D, #F97316, #FDE047, #F97316, #7F1D1D)', filter: 'drop-shadow(0 0 6px rgba(249, 115, 22, .7))' }, classe: 'defile' },
  { id: 'pseudo-legendaire', nom: { fr: 'Légendaire', en: 'Legendary' }, prix: 20000, luxe: 2, css: { backgroundImage: 'linear-gradient(90deg, #B8862E, #F4C430, #F472B6, #A78BFA, #22D3EE, #B8862E)', filter: 'drop-shadow(0 0 8px rgba(244, 196, 48, .9))' }, classe: 'defile ultra' },
  { id: 'pseudo-rubis', nom: { fr: 'Rubis', en: 'Ruby' }, prix: 150, css: { backgroundImage: 'linear-gradient(90deg, #9F1239, #E11D48, #9F1239)' } },
  { id: 'pseudo-saphir', nom: { fr: 'Saphir', en: 'Sapphire' }, prix: 150, css: { backgroundImage: 'linear-gradient(90deg, #1E3A8A, #3B82F6, #1E3A8A)' } },
  { id: 'pseudo-emeraude', nom: { fr: 'Émeraude', en: 'Emerald' }, prix: 150, css: { backgroundImage: 'linear-gradient(90deg, #065F46, #10B981, #065F46)' } },
  { id: 'pseudo-amethyste', nom: { fr: 'Améthyste', en: 'Amethyst' }, prix: 150, css: { backgroundImage: 'linear-gradient(90deg, #581C87, #A855F7, #581C87)' } },
  { id: 'pseudo-corail', nom: { fr: 'Corail', en: 'Coral' }, prix: 200, css: { backgroundImage: 'linear-gradient(90deg, #F97316, #FB7185)' } },
  { id: 'pseudo-menthe', nom: { fr: 'Menthe glaciale', en: 'Mint' }, prix: 200, css: { backgroundImage: 'linear-gradient(90deg, #14B8A6, #A7F3D0)' } },
  { id: 'pseudo-lavande', nom: { fr: 'Lavande', en: 'Lavender' }, prix: 200, css: { backgroundImage: 'linear-gradient(90deg, #8B5CF6, #F0ABFC)' } },
  { id: 'pseudo-citron', nom: { fr: 'Citron', en: 'Lemon' }, prix: 200, css: { backgroundImage: 'linear-gradient(90deg, #CA8A04, #FDE047, #CA8A04)' } },
  { id: 'pseudo-argent', nom: { fr: 'Argent', en: 'Silver' }, prix: 250, css: { backgroundImage: 'linear-gradient(90deg, #64748B, #F1F5F9, #94A3B8, #F1F5F9, #64748B)' }, classe: 'brille' },
  { id: 'pseudo-bronze', nom: { fr: 'Bronze', en: 'Bronze' }, prix: 250, css: { backgroundImage: 'linear-gradient(90deg, #7C2D12, #D97706, #FED7AA, #D97706, #7C2D12)' }, classe: 'brille' },
  { id: 'pseudo-coucher', nom: { fr: 'Coucher de soleil', en: 'Sunset' }, prix: 400, css: { backgroundImage: 'linear-gradient(90deg, #F59E0B, #EF4444, #DB2777, #7C3AED)' } },
  { id: 'pseudo-ocean', nom: { fr: 'Océan profond', en: 'Deep ocean' }, prix: 400, css: { backgroundImage: 'linear-gradient(90deg, #0C4A6E, #0EA5E9, #67E8F9, #0EA5E9, #0C4A6E)' }, classe: 'defile' },
  { id: 'pseudo-aurore', nom: { fr: 'Aurore boréale', en: 'Aurora' }, prix: 650, css: { backgroundImage: 'linear-gradient(90deg, #34D399, #22D3EE, #A78BFA, #F472B6, #34D399)' }, classe: 'defile' },
  { id: 'pseudo-toxique', nom: { fr: 'Toxique', en: 'Toxic' }, prix: 550, css: { backgroundImage: 'linear-gradient(90deg, #365314, #A3E635, #ECFCCB, #A3E635, #365314)' }, classe: 'defile pulse-vert' },
  { id: 'pseudo-vapeur', nom: { fr: 'Vaporwave', en: 'Vaporwave' }, prix: 700, css: { backgroundImage: 'linear-gradient(90deg, #F472B6, #A78BFA, #22D3EE, #F472B6)' }, classe: 'defile' },
  { id: 'pseudo-sakura', nom: { fr: 'Sakura', en: 'Sakura' }, prix: 500, css: { backgroundImage: 'linear-gradient(90deg, #FBCFE8, #F472B6, #FFF1F2, #F472B6, #FBCFE8)' }, classe: 'defile' },
  { id: 'pseudo-chocolat', nom: { fr: 'Chocolat', en: 'Chocolate' }, prix: 350, css: { backgroundImage: 'linear-gradient(90deg, #451A03, #92400E, #D6A06B, #92400E)' } },
  { id: 'pseudo-tricolore', nom: { fr: 'Tricolore', en: 'Tricolour' }, prix: 500, css: { backgroundImage: 'linear-gradient(90deg, #1D4ED8, #1D4ED8 33%, #F8FAFC 33%, #F8FAFC 66%, #DC2626 66%)' } },
  { id: 'pseudo-camo', nom: { fr: 'Camouflage', en: 'Camo' }, prix: 450, css: { backgroundImage: 'repeating-linear-gradient(90deg, #365314 0 6px, #4D7C0F 6px 12px, #713F12 12px 16px, #1A2E05 16px 20px)' } },
  { id: 'pseudo-zebre', nom: { fr: 'Zèbre', en: 'Zebra' }, prix: 450, css: { backgroundImage: 'repeating-linear-gradient(115deg, #0F172A 0 4px, #F8FAFC 4px 8px)' } },
  { id: 'pseudo-damier', nom: { fr: 'Damier', en: 'Checker' }, prix: 450, css: { backgroundImage: 'repeating-linear-gradient(90deg, #EF4444 0 5px, #FACC15 5px 10px)' } },
  { id: 'pseudo-holo', nom: { fr: 'Holographique', en: 'Holographic' }, prix: 1200, css: { backgroundImage: 'linear-gradient(90deg, #F0ABFC, #A5F3FC, #FDE68A, #A7F3D0, #C4B5FD, #F0ABFC)' }, classe: 'defile holo' },
  { id: 'pseudo-glitch', nom: { fr: 'Glitch', en: 'Glitch' }, prix: 1500, css: { backgroundImage: 'linear-gradient(90deg, #22D3EE, #F8FAFC, #F472B6)' }, classe: 'glitch' },
  { id: 'pseudo-plasma', nom: { fr: 'Plasma', en: 'Plasma' }, prix: 1400, css: { backgroundImage: 'linear-gradient(90deg, #7C3AED, #22D3EE, #F472B6, #7C3AED)' }, classe: 'defile pulse-violet' },
  { id: 'pseudo-matrix', nom: { fr: 'Matrix', en: 'Matrix' }, prix: 1100, css: { backgroundImage: 'linear-gradient(180deg, #BBF7D0, #22C55E 50%, #14532D)' }, classe: 'pulse-vert' },
  { id: 'pseudo-magma', nom: { fr: 'Cœur de magma', en: 'Magma core' }, prix: 1600, css: { backgroundImage: 'linear-gradient(90deg, #450A0A, #DC2626, #FB923C, #FEF08A, #FB923C, #DC2626, #450A0A)' }, classe: 'defile pulse-feu' },
  { id: 'pseudo-givre', nom: { fr: 'Givre éternel', en: 'Eternal frost' }, prix: 1300, css: { backgroundImage: 'linear-gradient(90deg, #E0F2FE, #7DD3FC, #FFFFFF, #38BDF8, #E0F2FE)' }, classe: 'defile pulse-glace' },
  { id: 'pseudo-electrique', nom: { fr: 'Électrique', en: 'Electric' }, prix: 1800, css: { backgroundImage: 'linear-gradient(90deg, #CA8A04, #FDE047, #0EA5E9, #CA8A04)' }, classe: 'defile eclair' },
  { id: 'pseudo-nebuleuse', nom: { fr: 'Nébuleuse', en: 'Nebula' }, prix: 2200, css: { backgroundImage: 'linear-gradient(90deg, #1E1B4B, #7C3AED, #EC4899, #F59E0B, #7C3AED, #1E1B4B)' }, classe: 'defile pulse-violet', luxe: 1 },
  { id: 'pseudo-or-rose', nom: { fr: 'Or rose', en: 'Rose gold' }, prix: 2000, css: { backgroundImage: 'linear-gradient(90deg, #9F5F4A, #F4C2B0, #FFF1EA, #E8A48D, #9F5F4A)' }, classe: 'defile brille', luxe: 1 },
  { id: 'pseudo-obsidienne', nom: { fr: 'Obsidienne', en: 'Obsidian' }, prix: 3500, css: { backgroundImage: 'linear-gradient(90deg, #0F0F0F, #4C1D95, #0F0F0F, #A78BFA, #0F0F0F)' }, classe: 'defile pulse-violet', luxe: 1 },
  { id: 'pseudo-prisme', nom: { fr: 'Prisme', en: 'Prism' }, prix: 4000, css: { backgroundImage: 'linear-gradient(90deg, #EF4444, #F59E0B, #FDE047, #22C55E, #06B6D4, #3B82F6, #A855F7, #EF4444)' }, classe: 'defile rapide holo', luxe: 1 },
  { id: 'pseudo-soleil', nom: { fr: 'Soleil noir', en: 'Black sun' }, prix: 9000, css: { backgroundImage: 'linear-gradient(90deg, #000000, #F59E0B, #FFF7D6, #F59E0B, #000000)' }, classe: 'defile pulse-feu', luxe: 1 },
  { id: 'pseudo-divin', nom: { fr: 'Divin', en: 'Divine' }, prix: 50000, css: { backgroundImage: 'linear-gradient(90deg, #B8862E, #F4C430, #FFF2B8, #F472B6, #F4C430, #B8862E)' }, classe: 'defile ultra divin', luxe: 2 },
  { id: 'pseudo-j-champion', nom: { fr: 'Champion', en: 'Champion' }, prix: 0, jetons: 30, css: { backgroundImage: 'linear-gradient(90deg, #B45309, #FDE047, #DC2626, #FDE047, #B45309)' }, classe: 'defile pulse-feu' },
  { id: 'pseudo-j-arene', nom: { fr: 'Arène', en: 'Arena' }, prix: 0, jetons: 60, css: { backgroundImage: 'linear-gradient(90deg, #111827, #F97316, #FDE047, #F97316, #111827)' }, classe: 'defile' },
  { id: 'pseudo-j-eclipse', nom: { fr: 'Éclipse', en: 'Eclipse' }, prix: 0, jetons: 120, css: { backgroundImage: 'linear-gradient(90deg, #1E1B4B, #F59E0B, #FFF7D6, #F59E0B, #1E1B4B)' }, classe: 'defile pulse-violet' },
  { id: 'pseudo-j-couronne', nom: { fr: 'Couronné', en: 'Crowned' }, prix: 0, jetons: 220, luxe: 2, css: { backgroundImage: 'linear-gradient(90deg, #7C3AED, #F4C430, #FFFFFF, #F4C430, #7C3AED)' }, classe: 'defile ultra divin' },
  { id: 'pseudo-bonbon', nom: { fr: 'Bonbon', en: 'Candy' }, prix: 350, css: { backgroundImage: 'linear-gradient(90deg, #F472B6, #A5F3FC, #F472B6)' }, classe: 'defile' },
]
// Couleurs de rang (finir une semaine dans ce rang)
STYLES_PSEUDO.push(...TOUS_RANGS.map((r): StylePseudo => ({ id: `pseudo-rang-${r.id}`, nom: { fr: `Couleur ${r.nom.fr}`, en: `${r.nom.en} colour` }, prix: 0, rang: r.id, css: { backgroundImage: r.id === 'legende' ? 'linear-gradient(90deg, #B8862E, #F4C430, #F472B6, #A78BFA, #22D3EE, #B8862E)' : `linear-gradient(90deg, ${r.fonce}, ${r.couleur}, ${r.fonce})`, filter: `drop-shadow(0 0 5px ${r.couleur}99)` }, classe: r.id === 'legende' ? 'defile ultra divin' : 'defile' })))
STYLES_PSEUDO.sort((a, b) => a.prix - b.prix)
export const stylePseudo = (id?: string) => STYLES_PSEUDO.find((s) => s.id === id)

// Pseudo affiché avec le style équipé
export function Pseudo({ nom, style }: { nom: string; style?: string }) {
  const s = stylePseudo(style)
  if (!s) return <>{nom}</>
  return <span className={`pseudo-style ${s.classe ?? ''}`} style={s.css}>{nom}</span>
}
