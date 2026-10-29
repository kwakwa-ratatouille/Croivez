import { arrayUnion, doc, increment, setDoc } from 'firebase/firestore'
import { db } from './firebase'
import type { Profile } from './auth'
import type { SousThemeId } from './quiz/engine'

// Calendriers à cases : une case par jour, un mini-quiz de 5 questions (3 bonnes réponses pour l'ouvrir) et un cadeau qui grossit.
// Une case oubliée peut être rattrapée plus tard dans la période, pour la moitié du cadeau.
export type Calendrier = { id: string; nom: string; emoji: string; debut: [number, number]; cases: number; fond: string; themes: SousThemeId[]; final: string }
export const CALENDRIERS: Calendrier[] = [
  { id: 'avent', nom: 'Calendrier de l’Avent', emoji: '🎄', debut: [12, 1], cases: 24, fond: 'linear-gradient(135deg, #14532D, #B91C1C 60%, #F59E0B)', final: 'Cadre « Étoile du sapin » et titre « Lutin de l’Avent »',
    themes: ['drapeaux', 'films', 'chansons-disney', 'capitales', 'animaux', 'monuments', 'dessins-animes', 'emojis-films', 'personnalites', 'desserts', 'expressions', 'repliques', 'logos', 'cris-animaux', 'idees-recues', 'proverbes', 'jeux', 'superheros', 'acteurs', 'fruits', 'artistes', 'generiques', 'emojis-series', 'sagas'] as SousThemeId[] },
  { id: 'oeufs', nom: 'Chasse aux œufs de Pâques', emoji: '🐣', debut: [4, 1], cases: 14, fond: 'linear-gradient(135deg, #F9A8D4, #FDE68A 50%, #86EFAC)', final: 'Cadre « Œuf doré » et titre « Chasseur d’œufs en or »',
    themes: ['animaux', 'fruits', 'desserts', 'drapeaux', 'capitales', 'films', 'cris-animaux', 'emojis-films', 'monuments', 'expressions', 'eco-saison', 'proverbes', 'chansons-disney', 'logos'] as SousThemeId[] },
]
const cle = (c: Calendrier, annee: number) => `${c.id}-${annee}`
// Jour du calendrier (1 = premier jour) pour une date, ou 0 hors période
export function jourCalendrier(c: Calendrier, d = new Date()) {
  const debut = new Date(d.getFullYear(), c.debut[0] - 1, c.debut[1])
  const n = Math.floor((new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() - debut.getTime()) / 864e5) + 1
  return n >= 1 && n <= c.cases ? n : 0
}
export const calendrierActif = (d = new Date()) => CALENDRIERS.find((c) => jourCalendrier(c, d) > 0) ?? null
// Prochain calendrier (pour le compte à rebours hors période)
export function prochainCalendrier(d = new Date()) {
  return CALENDRIERS.map((c) => { let x = new Date(d.getFullYear(), c.debut[0] - 1, c.debut[1]); if (x < d) x = new Date(d.getFullYear() + 1, c.debut[0] - 1, c.debut[1]); return { c, date: x } }).sort((a, b) => a.date.getTime() - b.date.getTime())[0]
}
export const casesOuvertes = (p: Profile | null | undefined, c: Calendrier, annee = new Date().getFullYear()) => ((p as { calendriers?: Record<string, number[]> } | null)?.calendriers?.[cle(c, annee)] ?? [])
export const cadeau = (c: Calendrier, n: number) => (n === c.cases ? 500 : 20 + n * 6)
export const urlCase = (c: Calendrier, n: number) => `/partie?s=${c.themes[(n - 1) % c.themes.length]}&d=0&n=5&m=qcm&cal=${c.id}&case=${n}`
export async function ouvrirCase(uid: string, c: Calendrier, n: number, enRetard: boolean) {
  const gain = enRetard ? Math.round(cadeau(c, n) / 2) : cadeau(c, n)
  await setDoc(doc(db, 'users', uid), { pieces: increment(gain), calendriers: { [cle(c, new Date().getFullYear())]: arrayUnion(n) } }, { merge: true })
  return gain
}
// Récompense finale : toutes les cases sauf deux au plus
export const finalObtenue = (p: Profile, id: string) => { const c = CALENDRIERS.find((x) => x.id === id)!; return casesOuvertes(p, c).length >= c.cases - 2 }
