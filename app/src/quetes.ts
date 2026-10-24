import { doc, increment, runTransaction } from 'firebase/firestore'
import { db } from './firebase'
import type { Lang } from './i18n'

// Quêtes quotidiennes : 3 objectifs par jour (les mêmes pour tout le monde, tirés de la date), à récupérer contre des pièces
export type StatsPartie = { bonnes: number; comboMax: number; jeu?: string; famille?: string; difficulte?: number }
export type EtatQuetes = { jour: string; prog: Record<string, number>; recues: string[]; familles: string[] }

type Quete = { id: string; titre: Record<Lang, string>; objectif: number; gain: number; avance: (s: StatsPartie, e: EtatQuetes) => number }

const QUETES: Quete[] = [
  { id: 'parties', titre: { fr: 'Jouer 3 parties', en: 'Play 3 games' }, objectif: 3, gain: 25, avance: (_, e) => (e.prog.parties ?? 0) + 1 },
  { id: 'bonnes', titre: { fr: 'Donner 25 bonnes réponses', en: 'Get 25 correct answers' }, objectif: 25, gain: 30, avance: (s, e) => (e.prog.bonnes ?? 0) + s.bonnes },
  { id: 'combo', titre: { fr: 'Faire un combo de 5', en: 'Hit a 5-answer combo' }, objectif: 5, gain: 30, avance: (s, e) => Math.max(e.prog.combo ?? 0, s.comboMax) },
  { id: 'difficile', titre: { fr: 'Finir une partie en Difficile ou plus', en: 'Finish a game on Hard or above' }, objectif: 1, gain: 35, avance: (s, e) => (e.prog.difficile ?? 0) + (s.difficulte && s.difficulte >= 3 ? 1 : 0) },
  { id: 'express', titre: { fr: 'Jouer une partie Express', en: 'Play an Express game' }, objectif: 1, gain: 25, avance: (s, e) => (e.prog.express ?? 0) + (s.jeu === 'express' ? 1 : 0) },
  { id: 'survie', titre: { fr: '10 bonnes réponses en Survie', en: '10 correct in Survival' }, objectif: 10, gain: 40, avance: (s, e) => Math.max(e.prog.survie ?? 0, s.jeu === 'survie' ? s.bonnes : 0) },
  { id: 'mix', titre: { fr: 'Jouer une partie Mix', en: 'Play a Mix game' }, objectif: 1, gain: 20, avance: (s, e) => (e.prog.mix ?? 0) + (s.jeu === 'mix' ? 1 : 0) },
  { id: 'familles', titre: { fr: 'Jouer dans 2 familles différentes', en: 'Play in 2 different families' }, objectif: 2, gain: 30, avance: (s, e) => new Set([...e.familles, ...(s.famille && !s.jeu ? [s.famille] : [])]).size },
]

const jourActuel = () => new Date().toLocaleDateString('sv')

// Les 3 quêtes du jour : choix reproductible à partir de la date
export function quetesDuJour(jour = jourActuel()) {
  let h = 0
  for (const c of jour) h = (h * 31 + c.charCodeAt(0)) >>> 0
  const pool = [...QUETES]
  const out: Quete[] = []
  while (out.length < 3) { h = (h * 1103515245 + 12345) >>> 0; out.push(pool.splice(h % pool.length, 1)[0]) }
  return out
}

export const etatDuJour = (e?: EtatQuetes | null): EtatQuetes => (e?.jour === jourActuel() ? e : { jour: jourActuel(), prog: {}, recues: [], familles: [] })

// Après une partie : nouvel état des quêtes du jour (à enregistrer dans le profil)
export function avancerQuetes(e: EtatQuetes | undefined | null, s: StatsPartie): EtatQuetes {
  const etat = etatDuJour(e)
  const prog = { ...etat.prog }
  for (const q of quetesDuJour()) prog[q.id] = Math.min(q.objectif, q.avance(s, etat))
  const familles = s.famille && !s.jeu && !etat.familles.includes(s.famille) ? [...etat.familles, s.famille] : etat.familles
  return { ...etat, prog, familles }
}

// Récupérer la récompense d'une quête terminée (une seule fois, vérifié côté transaction)
export async function recupererQuete(uid: string, id: string) {
  const q = QUETES.find((x) => x.id === id)
  if (!q) return false
  return runTransaction(db, async (tx) => {
    const ref = doc(db, 'users', uid)
    const e = etatDuJour((await tx.get(ref)).data()?.quetes as EtatQuetes | undefined)
    if ((e.prog[id] ?? 0) < q.objectif || e.recues.includes(id)) return false
    tx.update(ref, { pieces: increment(q.gain), quetes: { ...e, recues: [...e.recues, id] } })
    return true
  })
}
