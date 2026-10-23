import { doc, runTransaction, arrayUnion, increment, setDoc } from 'firebase/firestore'
import { db } from './firebase'
import { niveau, type Profile } from './auth'
import { FAMILLES, type Famille } from './themes'

// ——— Règles de progression ———
// Au premier lancement, on choisit 3 familles ; les autres se débloquent avec des pièces.
export const FAMILLES_DEPART = 3
export const PRIX_FAMILLE = 200
// Difficile et Expert se méritent avec le niveau
export const NIVEAU_DIFFICULTE: Record<number, number> = { 0: 1, 1: 1, 2: 1, 3: 3, 4: 6 }
export const PRIX_INDICE = 10

// 2 pièces par bonne réponse, + bonus défi du jour réussi et sans-faute
export const piecesGagnees = (bonnes: number, total: number, defi: boolean) =>
  bonnes * 2 + (defi && bonnes >= total / 2 ? 20 : 0) + (bonnes === total && total >= 10 ? 15 : 0)

// Anciens comptes (avant cette règle) : tout reste ouvert, on ne reprend rien à personne
export const familleOuverte = (k: Famille, p?: Profile | null) => !p?.familles || p.familles.includes(k)
export const choixAFaire = (p?: Profile | null) => !!p && Array.isArray(p.familles) && p.familles.length === 0

export function difficulteOuverte(d: number, p?: Profile | null) {
  return niveau(p?.xp ?? 0) >= (NIVEAU_DIFFICULTE[d] ?? 1)
}

// Difficulté automatique plafonnée à ce qui est débloqué
export function plafonner(d: 1 | 2 | 3 | 4, p?: Profile | null): 1 | 2 | 3 | 4 {
  let x = d
  while (x > 1 && !difficulteOuverte(x, p)) x = (x - 1) as 1 | 2 | 3
  return x
}

export const familleDe = (id: string) => FAMILLES.find((x) => x.subs.some((s) => s.id === id))
export const accesQuiz = (id: string, p?: Profile | null) => { const f = familleDe(id); return !f || familleOuverte(f.k, p) }

export const choisirFamilles = (uid: string, ks: Famille[]) => setDoc(doc(db, 'users', uid), { familles: ks }, { merge: true })

// Dépense atomique : refusée si le solde ne suffit pas (pas de solde négatif, même avec deux appareils)
async function depenser(uid: string, montant: number, maj: Record<string, unknown> = {}) {
  return runTransaction(db, async (tx) => {
    const ref = doc(db, 'users', uid)
    const solde = ((await tx.get(ref)).data()?.pieces as number | undefined) ?? 0
    if (solde < montant) return false
    tx.update(ref, { pieces: increment(-montant), ...maj })
    return true
  })
}

export const acheterFamille = (uid: string, k: Famille) => depenser(uid, PRIX_FAMILLE, { familles: arrayUnion(k) })
export const payerIndice = (uid: string) => depenser(uid, PRIX_INDICE)
