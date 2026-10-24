import type { Lang } from './i18n'
import { niveau, type Profile } from './auth'
import { FAMILLES } from './themes'

// Badges à 3 paliers (bronze, argent, or) : calculés à partir du profil, rien à stocker.
export type Badge = { id: string; nom: Record<Lang, string>; desc: Record<Lang, (n: number) => string>; couleur: string; icon: string; valeur: (p: Profile) => number; paliers: [number, number, number] }
export const PALIERS = [
  { nom: { fr: 'Bronze', en: 'Bronze' }, couleur: '#C98B5A' },
  { nom: { fr: 'Argent', en: 'Silver' }, couleur: '#9AA3AD' },
  { nom: { fr: 'Or', en: 'Gold' }, couleur: '#D8B04A' },
]

const ETOILE = 'm12 3.5 2.5 5.3 5.8.7-4.3 4 1.1 5.7L12 16.4l-5.1 2.8 1.1-5.7-4.3-4 5.8-.7Z'
const FLAMME = 'M12 3.5c.8 3.2 5 5.2 5 9.8a5 5 0 0 1-10 0c0-2.4 1.3-3.9 2.4-4.9.1 1.9 1 2.9 2 2.9-.3-2.8-.7-5.2.6-7.8Z'
const CIBLE = 'M12 3.5a8.5 8.5 0 1 1 0 17a8.5 8.5 0 1 1 0-17ZM12 8a4 4 0 1 1 0 8a4 4 0 1 1 0-8ZM12 11.5v1'
const TROPHEE = 'M8 4.5h8v5a4 4 0 0 1-8 0ZM8 6.5H5a3 3 0 0 0 3 4M16 6.5h3a3 3 0 0 1-3 4M12 13.5v3M8.5 19.5h7M10 16.5h4v3h-4Z'
const ECLAIR = 'M13 3 5 13.5h6L10 21l8-10.5h-6Z'
const COEUR = 'M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z'
const CLE = 'M14.5 4a5 5 0 1 1-4.6 7L4 17v3h3v-2h2v-2h2l1.9-1.9A5 5 0 0 1 14.5 4ZM15.5 7.5h.01'
const AMIS = 'M9 11a3.5 3.5 0 1 0 0-7a3.5 3.5 0 0 0 0 7ZM2.5 20c1-3.5 3.5-5 6.5-5s5.5 1.5 6.5 5M16 11a3 3 0 1 0-1-5.8M18 14.6c1.8.6 3 2.3 3.5 5.4'

const fr = (f: (n: number) => string, e: (n: number) => string) => ({ fr: f, en: e })
const nb = (n: number) => new Intl.NumberFormat('fr-FR').format(n)
const m = (p: Profile, id: string) => p.maitrise?.[id] ?? 0
const quizJoues = (p: Profile) => Object.values(p.maitrise ?? {}).filter((v) => v > 0).length

const GENERAUX: Badge[] = [
  { id: 'parties', nom: { fr: 'Assidu', en: 'Dedicated' }, desc: fr((n) => `Jouer ${nb(n)} parties`, (n) => `Play ${n} games`), couleur: 'geo', icon: ETOILE, valeur: (p) => p.parties ?? 0, paliers: [10, 100, 500] },
  { id: 'bonnes', nom: { fr: 'Encyclopédie', en: 'Encyclopedia' }, desc: fr((n) => `${nb(n)} bonnes réponses`, (n) => `${n} correct answers`), couleur: 'nat', icon: CIBLE, valeur: (p) => p.bonnes ?? 0, paliers: [100, 1000, 10000] },
  { id: 'serie', nom: { fr: 'Inarrêtable', en: 'Unstoppable' }, desc: fr((n) => `${n} jours de série`, (n) => `${n}-day streak`), couleur: 'cine', icon: FLAMME, valeur: (p) => p.meilleureSerie ?? p.serie ?? 0, paliers: [3, 14, 60] },
  { id: 'niveau', nom: { fr: 'Ascension', en: 'Ascent' }, desc: fr((n) => `Atteindre le niveau ${n}`, (n) => `Reach level ${n}`), couleur: 'mus', icon: ETOILE, valeur: (p) => niveau(p.xp ?? 0), paliers: [5, 15, 30] },
  { id: 'xp', nom: { fr: 'Puits de science', en: 'Fount of knowledge' }, desc: fr((n) => `${nb(n)} XP`, (n) => `${n} XP`), couleur: 'mus', icon: ECLAIR, valeur: (p) => p.xp ?? 0, paliers: [1000, 10000, 50000] },
  { id: 'sansfaute', nom: { fr: 'Sans faute', en: 'Flawless' }, desc: fr((n) => `${n} parties de 10 sans erreur`, (n) => `${n} flawless games of 10`), couleur: 'ok', icon: TROPHEE, valeur: (p) => p.sansFaute ?? 0, paliers: [1, 10, 50] },
  { id: 'defis', nom: { fr: 'Relève les défis', en: 'Challenger' }, desc: fr((n) => `Réussir ${n} défis du jour`, (n) => `Win ${n} daily challenges`), couleur: 'his', icon: TROPHEE, valeur: (p) => p.defis ?? 0, paliers: [3, 15, 50] },
  { id: 'curieux', nom: { fr: 'Touche-à-tout', en: 'Jack of all trades' }, desc: fr((n) => `Jouer à ${n} quiz différents`, (n) => `Play ${n} different quizzes`), couleur: 'brd', icon: ETOILE, valeur: quizJoues, paliers: [5, 20, 50] },
  { id: 'maitre', nom: { fr: 'Maître', en: 'Master' }, desc: fr((n) => `Maîtriser ${n} quiz à 80 %`, (n) => `Master ${n} quizzes at 80%`), couleur: 'his', icon: CIBLE, valeur: (p) => Object.values(p.maitrise ?? {}).filter((v) => v >= 80).length, paliers: [1, 10, 30] },
  { id: 'legende', nom: { fr: 'Légendaire', en: 'Legendary' }, desc: fr((n) => `Valider les 4 difficultés de ${n} quiz`, (n) => `Pass all 4 difficulties in ${n} quizzes`), couleur: 'his', icon: TROPHEE, valeur: (p) => Object.values(p.paliers ?? {}).filter((l) => [1, 2, 3, 4].every((d) => l.includes(d))).length, paliers: [1, 5, 15] },
  { id: 'caisses', nom: { fr: 'Chasseur de caisses', en: 'Crate hunter' }, desc: fr((n) => `Gagner ${n} quiz dans les caisses`, (n) => `Win ${n} quizzes from crates`), couleur: 'jv', icon: CLE, valeur: (p) => p.quiz?.length ?? 0, paliers: [3, 10, 25] },
  { id: 'express', nom: { fr: 'Éclair', en: 'Lightning' }, desc: fr((n) => `${n} bonnes réponses en Express`, (n) => `${n} correct in Express`), couleur: 'cine', icon: ECLAIR, valeur: (p) => p.records?.express ?? 0, paliers: [10, 20, 30] },
  { id: 'survie', nom: { fr: 'Survivant', en: 'Survivor' }, desc: fr((n) => `${n} bonnes réponses en Survie`, (n) => `${n} correct in Survival`), couleur: 'nat', icon: COEUR, valeur: (p) => p.records?.survie ?? 0, paliers: [10, 20, 30] },
  { id: 'amis', nom: { fr: 'Sociable', en: 'Sociable' }, desc: fr((n) => `Ajouter ${n} amis`, (n) => `Add ${n} friends`), couleur: 'sci', icon: AMIS, valeur: (p) => p.amis?.length ?? 0, paliers: [1, 5, 15] },
  { id: 'revision', nom: { fr: 'Bonne mémoire', en: 'Good memory' }, desc: fr((n) => `${n} questions à revoir en attente au plus`, (n) => `At most ${n} pending reviews`), couleur: 'ok', icon: CIBLE, valeur: (p) => (p.parties ? Math.max(0, 50 - Object.keys(p.revision ?? {}).length) : 0), paliers: [10, 30, 50] },
]

// Un badge par famille : maîtrise moyenne de ses quiz
const FAMILLE_BADGES: Badge[] = FAMILLES.map((f) => ({
  id: `famille-${f.k}`, nom: { fr: `Expert · ${f.nom.fr}`, en: `Expert · ${f.nom.en}` },
  desc: fr((n) => `${n} % de maîtrise moyenne`, (n) => `${n}% average mastery`), couleur: f.k, icon: f.icon,
  valeur: (p) => { const q = f.subs.filter((s) => s.jouable); return Math.round(q.reduce((a, s) => a + m(p, s.id), 0) / Math.max(1, q.length)) },
  paliers: [25, 50, 80],
}))

// Quelques badges thématiques emblématiques
const THEMATIQUES: [string, string, string, string][] = [
  ['drapeaux', 'Porte-drapeau', 'Flag bearer', 'geo'], ['capitales', 'Globe-trotteur', 'Globetrotter', 'geo'], ['villes-fr', 'Cartographe', 'Cartographer', 'geo'],
  ['elements', 'Chimiste', 'Chemist', 'sci'], ['acteurs', 'Cinéphile', 'Film buff', 'cine'], ['extraits', 'Oreille absolue', 'Perfect pitch', 'mus'],
  ['animaux', 'Naturaliste', 'Naturalist', 'nat'], ['logos', 'Œil de lynx', 'Eagle eye', 'brd'], ['departements-numero', 'Chauvin', 'Patriot', 'geo'],
  ['personnalites', 'Physionomiste', 'Face reader', 'his'], ['tableaux', 'Esthète', 'Aesthete', 'his'], ['sportifs', 'Supporter', 'Fan', 'spo'],
]
const THEME_BADGES: Badge[] = THEMATIQUES.map(([id, nf, ne, k]) => ({
  id: `quiz-${id}`, nom: { fr: nf, en: ne }, desc: fr((n) => `${n} % de maîtrise`, (n) => `${n}% mastery`), couleur: k,
  icon: FAMILLES.find((f) => f.k === k)?.icon ?? ETOILE, valeur: (p) => m(p, id), paliers: [30, 60, 90],
}))

export const BADGES: Badge[] = [...GENERAUX, ...FAMILLE_BADGES, ...THEME_BADGES]

// Palier atteint : 0 = aucun, 1 bronze, 2 argent, 3 or
export function palierAtteint(b: Badge, p: Profile) {
  const v = b.valeur(p)
  return b.paliers.filter((s) => v >= s).length
}
export const debloque = (b: Badge, p: Profile) => palierAtteint(b, p) > 0
