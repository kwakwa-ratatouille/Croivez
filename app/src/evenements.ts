import type { Lang } from './i18n'

// ——— Saisons : une par mois, chacune avec son thème et ses récompenses exclusives au passe de combat ———
// Palier 5 : avatar · palier 10 : titre · palier 20 : cadre animé (ids « avatar-s-… », « titre-s-… », « cadre-s-… »)
export type ThemeSaison = {
  id: string; nom: Record<Lang, string>; emoji: string; fond: string
  titre: Record<Lang, string>; avatar: string
  cadre: { couleur: string; anim: string; orbite: string[] }
}
export const SAISONS: ThemeSaison[] = [
  { id: 'givre', nom: { fr: 'Saison du givre', en: 'Frost season' }, emoji: '❄️', fond: 'linear-gradient(120deg, #0F2A4A, #3B82F6 60%, #BAE6FD)', titre: { fr: 'Cœur de glace', en: 'Heart of ice' }, avatar: '⛄', cadre: { couleur: 'conic-gradient(#E0F2FE, #7DD3FC, #FFFFFF, #38BDF8, #E0F2FE)', anim: 'tourne glace', orbite: ['❄️', '🧊', '❄️'] } },
  { id: 'amour', nom: { fr: 'Saison des cœurs', en: 'Season of hearts' }, emoji: '💘', fond: 'linear-gradient(120deg, #881337, #E11D48 55%, #FDA4AF)', titre: { fr: 'Cupidon', en: 'Cupid' }, avatar: '💘', cadre: { couleur: 'conic-gradient(#FB7185, #FFE4E6, #E11D48, #FB7185)', anim: 'tourne pulse', orbite: ['💖', '💌', '💕'] } },
  { id: 'eveil', nom: { fr: 'Saison de l’éveil', en: 'Awakening season' }, emoji: '🌱', fond: 'linear-gradient(120deg, #14532D, #22C55E 60%, #FEF08A)', titre: { fr: 'Pousse prodige', en: 'Prodigy sprout' }, avatar: '🌱', cadre: { couleur: 'conic-gradient(#86EFAC, #FEF08A, #22C55E, #86EFAC)', anim: 'vague', orbite: ['🌱', '🦋', '🌼'] } },
  { id: 'chocolat', nom: { fr: 'Saison chocolat', en: 'Chocolate season' }, emoji: '🐣', fond: 'linear-gradient(120deg, #78350F, #D97706 55%, #FDE68A)', titre: { fr: 'Chasseur d’œufs', en: 'Egg hunter' }, avatar: '🐰', cadre: { couleur: 'conic-gradient(#92400E, #FCD34D, #F472B6, #92400E)', anim: 'tourne brille', orbite: ['🥚', '🐣', '🍫'] } },
  { id: 'floraison', nom: { fr: 'Saison des fleurs', en: 'Blossom season' }, emoji: '🌸', fond: 'linear-gradient(120deg, #831843, #EC4899 55%, #FBCFE8)', titre: { fr: 'Fleur de génie', en: 'Genius blossom' }, avatar: '🌸', cadre: { couleur: 'conic-gradient(#F9A8D4, #FFFFFF, #F472B6, #F9A8D4)', anim: 'tourne', orbite: ['🌸', '🌷', '🌺'] } },
  { id: 'musique', nom: { fr: 'Saison du son', en: 'Season of sound' }, emoji: '🎸', fond: 'linear-gradient(120deg, #312E81, #8B5CF6 55%, #F0ABFC)', titre: { fr: 'Rockstar du savoir', en: 'Knowledge rockstar' }, avatar: '🎸', cadre: { couleur: 'conic-gradient(#A78BFA, #F0ABFC, #22D3EE, #A78BFA)', anim: 'neon', orbite: ['🎵', '🎸', '🎤'] } },
  { id: 'soleil', nom: { fr: 'Saison du soleil', en: 'Sun season' }, emoji: '☀️', fond: 'linear-gradient(120deg, #C2410C, #F59E0B 55%, #FEF08A)', titre: { fr: 'Rayon de soleil', en: 'Ray of sunshine' }, avatar: '😎', cadre: { couleur: 'conic-gradient(#FDE047, #FB923C, #FDE047, #F97316, #FDE047)', anim: 'tourne feu', orbite: ['☀️', '🌴', '🍉'] } },
  { id: 'ocean', nom: { fr: 'Saison des vagues', en: 'Wave season' }, emoji: '🌊', fond: 'linear-gradient(120deg, #0C4A6E, #0EA5E9 55%, #A5F3FC)', titre: { fr: 'Surfeur des savoirs', en: 'Knowledge surfer' }, avatar: '🐬', cadre: { couleur: 'conic-gradient(#0EA5E9, #22D3EE, #6366F1, #0EA5E9)', anim: 'vague', orbite: ['🌊', '🐠', '🏄'] } },
  { id: 'rentree', nom: { fr: 'Saison de la rentrée', en: 'Back-to-school season' }, emoji: '🎒', fond: 'linear-gradient(120deg, #1E3A8A, #2563EB 55%, #FDE68A)', titre: { fr: 'Premier de la classe', en: 'Top of the class' }, avatar: '🎒', cadre: { couleur: 'conic-gradient(#2563EB, #FACC15, #EF4444, #2563EB)', anim: 'tourne', orbite: ['✏️', '📚', '🎒'] } },
  { id: 'halloween', nom: { fr: 'Saison hantée', en: 'Haunted season' }, emoji: '🎃', fond: 'linear-gradient(120deg, #1A1A1A, #7C3AED 50%, #FF7A00)', titre: { fr: 'Esprit frappeur', en: 'Poltergeist' }, avatar: '👻', cadre: { couleur: 'conic-gradient(#FF7A00, #1A1A1A, #7C3AED, #1A1A1A, #FF7A00)', anim: 'tourne feu', orbite: ['🎃', '🦇', '🕸️'] } },
  { id: 'automne', nom: { fr: 'Saison des feuilles', en: 'Leaf season' }, emoji: '🍂', fond: 'linear-gradient(120deg, #7C2D12, #EA580C 55%, #FCD34D)', titre: { fr: 'Érudit d’automne', en: 'Autumn scholar' }, avatar: '🦔', cadre: { couleur: 'conic-gradient(#B45309, #F97316, #FCD34D, #B45309)', anim: 'vague', orbite: ['🍂', '🍁', '🌰'] } },
  { id: 'noel', nom: { fr: 'Saison des fêtes', en: 'Holiday season' }, emoji: '🎄', fond: 'linear-gradient(120deg, #14532D, #DC2626 55%, #FDE68A)', titre: { fr: 'Lutin en chef', en: 'Head elf' }, avatar: '🎅', cadre: { couleur: 'conic-gradient(#DC2626, #FFFFFF, #16A34A, #FFFFFF, #DC2626)', anim: 'tourne brille', orbite: ['🎄', '🎁', '⭐'] } },
]
export const saisonDuMois = (d = new Date()) => SAISONS[d.getMonth()]

// ——— Événements : quelques jours à semaines, en plus de la saison ———
// Jouer pendant l'événement : le cadre dès la 1ʳᵉ partie, l'avatar et le titre à la 5ᵉ. Son quiz spécial rapporte XP ×2.
export type Evenement = {
  id: string; nom: Record<Lang, string>; desc: Record<Lang, string>; debut: string; fin: string; emoji: string; fond: string
  quiz: string // quiz spécial (famille Événements)
  cadre: { id: string; nom: Record<Lang, string>; couleur: string; anim: string; orbite: string[] }
  avatar: { id: string; nom: Record<Lang, string>; emoji: string }
  titre: { id: string; nom: Record<Lang, string> }
}
export const EVENEMENTS: Evenement[] = [
  { id: 'nouvel-an', nom: { fr: 'Nouvel An', en: 'New Year' }, desc: { fr: 'Les traditions du réveillon autour du monde', en: 'New Year traditions' }, debut: '12-27', fin: '01-04', emoji: '🎆', fond: 'linear-gradient(120deg, #0F172A, #4338CA 55%, #FACC15)', quiz: 'evt-nouvel-an',
    cadre: { id: 'cadre-nouvel-an', nom: { fr: 'Feu d’artifice', en: 'Fireworks' }, couleur: 'conic-gradient(#FACC15, #0F172A, #F472B6, #0F172A, #22D3EE, #FACC15)', anim: 'tourne eclair', orbite: ['🎆', '🥂', '🎇'] },
    avatar: { id: 'avatar-nouvel-an', nom: { fr: 'Cotillon', en: 'Party popper' }, emoji: '🎉' }, titre: { id: 'titre-nouvel-an', nom: { fr: 'Roi du réveillon', en: 'King of the countdown' } } },
  { id: 'saint-valentin', nom: { fr: 'Saint-Valentin', en: 'Valentine’s Day' }, desc: { fr: 'Couples célèbres et histoires d’amour', en: 'Famous couples' }, debut: '02-07', fin: '02-15', emoji: '💝', fond: 'linear-gradient(120deg, #9F1239, #F43F5E 55%, #FECDD3)', quiz: 'evt-saint-valentin',
    cadre: { id: 'cadre-saint-valentin', nom: { fr: 'Coup de foudre', en: 'Love at first sight' }, couleur: 'conic-gradient(#F43F5E, #FFE4E6, #BE123C, #F43F5E)', anim: 'pulse', orbite: ['💝', '🌹', '💘'] },
    avatar: { id: 'avatar-saint-valentin', nom: { fr: 'Cœur', en: 'Heart' }, emoji: '💝' }, titre: { id: 'titre-saint-valentin', nom: { fr: 'Âme romantique', en: 'Romantic soul' } } },
  { id: 'paques', nom: { fr: 'Pâques', en: 'Easter' }, desc: { fr: 'Chocolat, œufs et traditions de printemps', en: 'Chocolate and spring traditions' }, debut: '04-01', fin: '04-14', emoji: '🐣', fond: 'linear-gradient(120deg, #854D0E, #FBBF24 55%, #FBCFE8)', quiz: 'evt-paques',
    cadre: { id: 'cadre-paques', nom: { fr: 'Chasse aux œufs', en: 'Egg hunt' }, couleur: 'conic-gradient(#FBBF24, #F9A8D4, #A7F3D0, #93C5FD, #FBBF24)', anim: 'tourne holo', orbite: ['🥚', '🐇', '🍫'] },
    avatar: { id: 'avatar-paques', nom: { fr: 'Poussin', en: 'Chick' }, emoji: '🐣' }, titre: { id: 'titre-paques', nom: { fr: 'Lapin de Pâques', en: 'Easter bunny' } } },
  { id: 'fete-musique', nom: { fr: 'Fête de la musique', en: 'Music Day' }, desc: { fr: 'Instruments, tubes et records de la musique', en: 'Music hits and records' }, debut: '06-15', fin: '06-23', emoji: '🎶', fond: 'linear-gradient(120deg, #4C1D95, #A855F7 55%, #22D3EE)', quiz: 'evt-musique',
    cadre: { id: 'cadre-fete-musique', nom: { fr: 'Ampli', en: 'Amp' }, couleur: 'conic-gradient(#A855F7, #22D3EE, #F0ABFC, #A855F7)', anim: 'neon', orbite: ['🎶', '🥁', '🎺'] },
    avatar: { id: 'avatar-fete-musique', nom: { fr: 'Micro', en: 'Mic' }, emoji: '🎤' }, titre: { id: 'titre-fete-musique', nom: { fr: 'Tête d’affiche', en: 'Headliner' } } },
  { id: 'ete', nom: { fr: 'Vacances d’été', en: 'Summer holidays' }, desc: { fr: 'Plages, glaces et destinations de rêve', en: 'Beaches and dream trips' }, debut: '07-14', fin: '08-15', emoji: '🏖️', fond: 'linear-gradient(120deg, #0369A1, #38BDF8 50%, #FDE68A)', quiz: 'evt-ete',
    cadre: { id: 'cadre-ete', nom: { fr: 'Coucher de soleil', en: 'Sunset' }, couleur: 'conic-gradient(#F97316, #FDE047, #F472B6, #38BDF8, #F97316)', anim: 'tourne vague', orbite: ['🏖️', '🍦', '⛱️'] },
    avatar: { id: 'avatar-ete', nom: { fr: 'Glace', en: 'Ice cream' }, emoji: '🍦' }, titre: { id: 'titre-ete', nom: { fr: 'Roi de la plage', en: 'Beach king' } } },
  { id: 'rentree', nom: { fr: 'Rentrée', en: 'Back to school' }, desc: { fr: 'Le programme de l’école en 40 questions', en: 'School knowledge' }, debut: '09-01', fin: '09-10', emoji: '🎒', fond: 'linear-gradient(120deg, #1E40AF, #3B82F6 55%, #FEF08A)', quiz: 'evt-rentree',
    cadre: { id: 'cadre-rentree', nom: { fr: 'Tableau noir', en: 'Blackboard' }, couleur: 'conic-gradient(#14532D, #FFFFFF, #14532D, #FACC15, #14532D)', anim: 'tourne', orbite: ['📐', '✏️', '📏'] },
    avatar: { id: 'avatar-rentree', nom: { fr: 'Crayon', en: 'Pencil' }, emoji: '✏️' }, titre: { id: 'titre-rentree', nom: { fr: 'Chouchou du prof', en: 'Teacher’s pet' } } },
  { id: 'halloween', nom: { fr: 'Halloween', en: 'Halloween' }, desc: { fr: 'Monstres, légendes et films qui font peur', en: 'Monsters and horror' }, debut: '10-25', fin: '11-01', emoji: '🎃', fond: 'linear-gradient(120deg, #0B0B0B, #6D28D9 50%, #FF7A00)', quiz: 'evt-halloween',
    cadre: { id: 'cadre-halloween', nom: { fr: 'Halloween', en: 'Halloween' }, couleur: 'conic-gradient(#FF7A00, #1A1A1A, #7C3AED, #1A1A1A, #FF7A00)', anim: 'tourne pulse', orbite: ['🦇', '👻', '🎃'] },
    avatar: { id: 'avatar-citrouille', nom: { fr: 'Citrouille', en: 'Pumpkin' }, emoji: '🎃' }, titre: { id: 'titre-halloween', nom: { fr: 'Créature de la nuit', en: 'Creature of the night' } } },
  { id: 'noel', nom: { fr: 'Noël', en: 'Christmas' }, desc: { fr: 'Traditions, chants et films de Noël', en: 'Christmas traditions and films' }, debut: '12-01', fin: '12-26', emoji: '🎄', fond: 'linear-gradient(120deg, #14532D, #B91C1C 55%, #FDE68A)', quiz: 'evt-noel',
    cadre: { id: 'cadre-noel', nom: { fr: 'Guirlande', en: 'Tinsel' }, couleur: 'repeating-conic-gradient(#DC2626 0 15deg, #FFFFFF 15deg 30deg, #16A34A 30deg 45deg, #FFFFFF 45deg 60deg)', anim: 'tourne brille', orbite: ['🎄', '🎁', '❄️'] },
    avatar: { id: 'avatar-noel', nom: { fr: 'Père Noël', en: 'Santa' }, emoji: '🎅' }, titre: { id: 'titre-noel', nom: { fr: 'Esprit de Noël', en: 'Christmas spirit' } } },
]

const md = (d: Date) => `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
// Un événement peut chevaucher le Nouvel An (début en décembre, fin en janvier)
const dedans = (e: Evenement, d: Date) => (e.debut <= e.fin ? md(d) >= e.debut && md(d) <= e.fin : md(d) >= e.debut || md(d) <= e.fin)
export const evenementActif = (d = new Date()) => EVENEMENTS.find((e) => dedans(e, d)) ?? null
// Prochain événement (pour l'annoncer)
export function prochainEvenement(d = new Date()) {
  for (let i = 1; i <= 366; i++) { const j = new Date(d.getTime() + i * 864e5); const e = EVENEMENTS.find((x) => x.debut === md(j)); if (e) return { e, jours: i } }
  return null
}
export function joursRestants(e: Evenement, d = new Date()) {
  const [m, j] = e.fin.split('-').map(Number)
  let fin = new Date(d.getFullYear(), m - 1, j, 23, 59)
  if (fin < d) fin = new Date(d.getFullYear() + 1, m - 1, j, 23, 59)
  return Math.max(1, Math.ceil((fin.getTime() - d.getTime()) / 864e5))
}
