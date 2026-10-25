import { doc, increment, setDoc } from 'firebase/firestore'
import { db } from './firebase'
import { jour, type Profile } from './auth'
import { publierXp } from './social'

// Événements historiques d'une date (Wikipédia « Éphéméride », via l'API Wikimedia : ouverte aux appels depuis le navigateur)
export type Evenement = { annee: number; texte: string; image?: string }
const cache = new Map<string, Evenement[]>()

export async function evenementsDu(mois: number, jourMois: number): Promise<Evenement[]> {
  const cle = `${mois}-${jourMois}`
  if (cache.has(cle)) return cache.get(cle)!
  const r = await fetch(`https://api.wikimedia.org/feed/v1/wikipedia/fr/onthisday/events/${String(mois).padStart(2, '0')}/${String(jourMois).padStart(2, '0')}`)
  const j = await r.json() as { events?: { year: number; text: string; pages?: { thumbnail?: { source: string } }[] }[] }
  const l = (j.events ?? [])
    .filter((e) => e.year > 0 && e.text && e.text.length > 25 && e.text.length < 260)
    .map((e) => ({ annee: e.year, texte: e.text.replace(/\s\((?:en|es|de|it|pt|nl|ru|ja|zh|ar|pl|sv)\)/g, '').replace(/^\s*[a-zà-ÿ]/, (c) => c.toUpperCase()).replace(/\s*\.?$/, '.'), image: e.pages?.find((p) => p.thumbnail)?.thumbnail?.source }))
  cache.set(cle, l)
  return l
}

export const melanger = <T,>(l: T[]) => { const a = [...l]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] } return a }

// Ce jour-là : « en quelle année ? », avec trois autres années plausibles (même époque si possible)
export function questionsAnnee(evs: Evenement[], n = 10) {
  const annees = [...new Set(evs.map((e) => e.annee))]
  return melanger(evs.filter((e, i, l) => l.findIndex((x) => x.annee === e.annee) === i)).slice(0, n).map((e) => {
    const proches = melanger(annees.filter((a) => a !== e.annee).sort((a, b) => Math.abs(a - e.annee) - Math.abs(b - e.annee)).slice(0, 8)).slice(0, 3)
    while (proches.length < 3) { const x = e.annee + (Math.floor(Math.random() * 40) - 20); if (x !== e.annee && x > 0 && !proches.includes(x)) proches.push(x) }
    return { ...e, options: melanger([e.annee, ...proches]) }
  })
}

// Frise : 5 événements d'années bien différentes, à remettre dans l'ordre
export function manche(evs: Evenement[], n = 5) {
  const choisis: Evenement[] = []
  for (const e of melanger(evs)) { if (choisis.every((c) => Math.abs(c.annee - e.annee) >= 8)) choisis.push(e); if (choisis.length === n) break }
  return choisis
}

// Récompense, une fois par jour et par mode (pièces + XP du profil et de la semaine)
export async function recompenser(uid: string, p: Profile, mode: 'ceJour' | 'frise', bonnes: number, total: number) {
  const cle = mode === 'ceJour' ? 'ceJourFait' : 'friseFaite'
  if ((p as unknown as Record<string, string>)[cle] === jour()) return null
  const pieces = Math.round(10 + (bonnes / total) * 40)
  const xp = Math.round(20 + (bonnes / total) * 60)
  await setDoc(doc(db, 'users', uid), { pieces: increment(pieces), xp: increment(xp), [cle]: jour() }, { merge: true })
  await publierXp(uid, p.pseudo, xp, (p.xp ?? 0) + xp, p.serie ?? 0).catch(() => {})
  return { pieces, xp }
}
