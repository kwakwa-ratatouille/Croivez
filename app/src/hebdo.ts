import { arrayUnion, doc, increment, runTransaction } from 'firebase/firestore'
import { db } from './firebase'
import type { Profile } from './auth'
import { semaine } from './social'

// Série hebdo du quiz du jour : chaque quiz du jour réussi remplit la barre de la semaine.
// Coffres à 3, 5 et 7 jours (pièces et XP), récupérables une fois par semaine.
export const COFFRES = [{ jours: 3, pieces: 60, xp: 100 }, { jours: 5, pieces: 120, xp: 250 }, { jours: 7, pieces: 300, xp: 600 }]
export const etatHebdo = (p?: Profile | null) => (p?.defisSemaine?.s === semaine() ? p.defisSemaine : { s: semaine(), jours: [] as string[], coffres: [] as number[] })

export async function ouvrirCoffre(uid: string, jours: number) {
  const c = COFFRES.find((x) => x.jours === jours)
  if (!c) return false
  return runTransaction(db, async (tx) => {
    const ref = doc(db, 'users', uid)
    const p = (await tx.get(ref)).data() as Profile | undefined
    const e = etatHebdo(p)
    if (e.jours.length < jours || e.coffres.includes(jours)) return false
    tx.update(ref, { 'defisSemaine.coffres': arrayUnion(jours), pieces: increment(c.pieces), xp: increment(c.xp) })
    return true
  })
}
