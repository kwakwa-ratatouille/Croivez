import type { Lang } from './i18n'
import { niveau, type Profile } from './auth'

export type Badge = { id: string; nom: Record<Lang, string>; desc: Record<Lang, string>; couleur: string; icon: string; progres: (p: Profile) => [number, number] }

const ETOILE = 'm12 3.5 2.5 5.3 5.8.7-4.3 4 1.1 5.7L12 16.4l-5.1 2.8 1.1-5.7-4.3-4 5.8-.7Z'
const FLAMME = 'M12 3.5c.8 3.2 5 5.2 5 9.8a5 5 0 0 1-10 0c0-2.4 1.3-3.9 2.4-4.9.1 1.9 1 2.9 2 2.9-.3-2.8-.7-5.2.6-7.8Z'
const CIBLE = 'M12 3.5a8.5 8.5 0 1 1 0 17a8.5 8.5 0 1 1 0-17ZM12 8a4 4 0 1 1 0 8a4 4 0 1 1 0-8ZM12 11.5v1'
const GLOBE = 'M12 3.5a8.5 8.5 0 1 0 0 17a8.5 8.5 0 1 0 0-17ZM3.5 12h17M12 3.5c2.4 2.6 3.5 5.4 3.5 8.5s-1.1 5.9-3.5 8.5c-2.4-2.6-3.5-5.4-3.5-8.5s1.1-5.9 3.5-8.5Z'
const TROPHEE = 'M8 4.5h8v5a4 4 0 0 1-8 0ZM8 6.5H5a3 3 0 0 0 3 4M16 6.5h3a3 3 0 0 1-3 4M12 13.5v3M8.5 19.5h7M10 16.5h4v3h-4Z'

const s = (p: Profile) => p.meilleureSerie ?? p.serie ?? 0
const m = (p: Profile, id: string) => p.maitrise?.[id] ?? 0

// Badges calculés à partir du profil : rien à stocker, ils se débloquent tout seuls
export const BADGES: Badge[] = [
  { id: 'premiere', nom: { fr: 'Premier pas', en: 'First step' }, desc: { fr: 'Jouer une première partie', en: 'Play your first game' }, couleur: 'geo', icon: ETOILE, progres: (p) => [p.parties ?? 0, 1] },
  { id: 'parties50', nom: { fr: 'Habitué', en: 'Regular' }, desc: { fr: 'Jouer 50 parties', en: 'Play 50 games' }, couleur: 'geo', icon: ETOILE, progres: (p) => [p.parties ?? 0, 50] },
  { id: 'serie3', nom: { fr: 'Ça chauffe', en: 'Warming up' }, desc: { fr: '3 jours de série', en: '3-day streak' }, couleur: 'cine', icon: FLAMME, progres: (p) => [s(p), 3] },
  { id: 'serie7', nom: { fr: 'Semaine parfaite', en: 'Perfect week' }, desc: { fr: '7 jours de série', en: '7-day streak' }, couleur: 'cine', icon: FLAMME, progres: (p) => [s(p), 7] },
  { id: 'serie30', nom: { fr: 'Inarrêtable', en: 'Unstoppable' }, desc: { fr: '30 jours de série', en: '30-day streak' }, couleur: 'cine', icon: FLAMME, progres: (p) => [s(p), 30] },
  { id: 'bonnes100', nom: { fr: 'Curieux', en: 'Curious' }, desc: { fr: '100 bonnes réponses', en: '100 correct answers' }, couleur: 'nat', icon: CIBLE, progres: (p) => [p.bonnes ?? 0, 100] },
  { id: 'bonnes1000', nom: { fr: 'Encyclopédie', en: 'Encyclopedia' }, desc: { fr: '1 000 bonnes réponses', en: '1,000 correct answers' }, couleur: 'nat', icon: CIBLE, progres: (p) => [p.bonnes ?? 0, 1000] },
  { id: 'sansfaute', nom: { fr: 'Sans faute', en: 'Flawless' }, desc: { fr: 'Une partie de 10+ questions sans erreur', en: 'A flawless game of 10+ questions' }, couleur: 'ok', icon: TROPHEE, progres: (p) => [p.sansFaute ?? 0, 1] },
  { id: 'defis5', nom: { fr: 'Relève les défis', en: 'Challenger' }, desc: { fr: 'Réussir 5 défis du jour', en: 'Complete 5 daily challenges' }, couleur: 'his', icon: TROPHEE, progres: (p) => [p.defis ?? 0, 5] },
  { id: 'niveau5', nom: { fr: 'Niveau 5', en: 'Level 5' }, desc: { fr: 'Atteindre le niveau 5', en: 'Reach level 5' }, couleur: 'mus', icon: ETOILE, progres: (p) => [niveau(p.xp ?? 0), 5] },
  { id: 'niveau10', nom: { fr: 'Niveau 10', en: 'Level 10' }, desc: { fr: 'Atteindre le niveau 10', en: 'Reach level 10' }, couleur: 'mus', icon: ETOILE, progres: (p) => [niveau(p.xp ?? 0), 10] },
  { id: 'drapeaux', nom: { fr: 'Porte-drapeau', en: 'Flag bearer' }, desc: { fr: '80 % de maîtrise des drapeaux', en: '80% flag mastery' }, couleur: 'geo', icon: GLOBE, progres: (p) => [m(p, 'drapeaux'), 80] },
  { id: 'capitales', nom: { fr: 'Globe-trotteur', en: 'Globetrotter' }, desc: { fr: '80 % de maîtrise des capitales', en: '80% capital mastery' }, couleur: 'geo', icon: GLOBE, progres: (p) => [m(p, 'capitales'), 80] },
  { id: 'villes', nom: { fr: 'Cartographe', en: 'Cartographer' }, desc: { fr: '80 % de maîtrise des villes de France', en: '80% French cities mastery' }, couleur: 'geo', icon: GLOBE, progres: (p) => [m(p, 'villes-fr'), 80] },
]

export const debloque = (b: Badge, p: Profile) => { const [v, max] = b.progres(p); return v >= max }
