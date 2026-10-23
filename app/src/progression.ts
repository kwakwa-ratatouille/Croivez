import { doc, runTransaction, arrayUnion, increment, setDoc, deleteField } from 'firebase/firestore'
import { db } from './firebase'
import { niveau, type Profile } from './auth'
import { FAMILLES, type Famille } from './themes'

// ——— Règles de progression ———
// Au premier lancement, on choisit 3 familles (entièrement ouvertes). Dans les autres, chaque quiz
// se gagne en ouvrant une caisse : un quiz encore verrouillé de la famille, tiré au hasard.
export const FAMILLES_DEPART = 3
export const PRIX_CAISSE = 60
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

// Légende : ouverte dans une famille quand chaque quiz ouvert de la famille a ses 4 difficultés réussies
export function progresLegende(k: Famille, p?: Profile | null) {
  const quiz = (FAMILLES.find((f) => f.k === k)?.subs ?? []).filter((s) => s.jouable)
  const faits = quiz.reduce((n, s) => n + [1, 2, 3, 4].filter((d) => p?.paliers?.[s.id]?.includes(d)).length, 0)
  return { faits, total: quiz.length * 4 }
}
export const legendeOuverte = (k: Famille, p?: Profile | null) => { const { faits, total } = progresLegende(k, p); return total > 0 && faits >= total }

export const familleDe = (id: string) => FAMILLES.find((x) => x.subs.some((s) => s.id === id))
export const accesQuiz = (id: string, p?: Profile | null) => { const f = familleDe(id); return !f || familleOuverte(f.k, p) || !!p?.quiz?.includes(id) }

// Quiz encore à gagner dans une famille (contenu possible de la caisse)
export const quizVerrouilles = (k: Famille, p?: Profile | null) =>
  (FAMILLES.find((f) => f.k === k)?.subs ?? []).filter((s) => s.jouable && !accesQuiz(s.id, p))

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

// Caisse : le gain est tiré ici, puis payé et enregistré d'un coup (refusé si pièces insuffisantes)
export async function ouvrirCaisse(uid: string, k: Famille, p?: Profile | null) {
  const possibles = quizVerrouilles(k, p)
  if (!possibles.length) return null
  const gain = possibles[Math.floor(Math.random() * possibles.length)]
  return (await depenser(uid, PRIX_CAISSE, { quiz: arrayUnion(gain.id) })) ? gain : false
}
export const payerIndice = (uid: string) => depenser(uid, PRIX_INDICE)

// ——— Menu de test (3 appuis sur le logo) ———
// Tout débloquer : retire la liste des familles (= tout ouvert, comme un ancien compte)
export const testToutDebloquer = (uid: string) => setDoc(doc(db, 'users', uid), { familles: deleteField(), quiz: deleteField() }, { merge: true })
// Repartir de zéro côté progression : choix des 3 familles, caisses, 50 pièces (XP et stats conservés)
export const testReinitialiser = (uid: string) => setDoc(doc(db, 'users', uid), { familles: [], quiz: [], pieces: 50 }, { merge: true })
export const testPieces = (uid: string, n: number) => setDoc(doc(db, 'users', uid), { pieces: increment(n) }, { merge: true })
