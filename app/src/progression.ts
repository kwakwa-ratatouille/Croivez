import { doc, runTransaction, arrayUnion, increment, setDoc, deleteField } from 'firebase/firestore'
import { db } from './firebase'
import type { Profile } from './auth'
import type { Lang } from './i18n'
import { FAMILLES, type Famille } from './themes'

// ——— Règles de progression ———
// Au premier lancement, on choisit 6 sous-thèmes (dans n'importe quelles familles).
// Les autres s'achètent un par un, au prix de leur rareté, avec une animation de révélation.
export const QUIZ_DEPART = 6
export const PRIX_INDICE = 10
export const PRIX_SAUT = 100 // sauter une difficulté sans l'avoir réussie (jamais pour la Légende)

export type Rarete = 'commun' | 'rare' | 'epique' | 'legendaire'
export const RARETES: Record<Rarete, { nom: Record<Lang, string>; prix: number; couleur: string }> = {
  commun: { nom: { fr: 'Commun', en: 'Common' }, prix: 60, couleur: '#8FA0AE' },
  rare: { nom: { fr: 'Rare', en: 'Rare' }, prix: 120, couleur: '#5B8DEF' },
  epique: { nom: { fr: 'Épique', en: 'Epic' }, prix: 200, couleur: '#A35BE0' },
  legendaire: { nom: { fr: 'Légendaire', en: 'Legendary' }, prix: 350, couleur: '#E3A72F' },
}
// Rareté d'un quiz : selon sa difficulté et sa richesse (par défaut : commun)
const RARETE: Record<string, Rarete> = {
  'drapeaux-inverse': 'rare', 'capitales-inverse': 'rare', 'films-annee': 'rare', albums: 'rare', papillons: 'rare', araignees: 'rare',
  champignons: 'rare', sculptures: 'rare', mouvements: 'rare', 'livres-annee': 'rare', 'jeux-annee': 'rare', 'personnalites-naissance': 'rare',
  clubs: 'rare', 'departements-region': 'rare', monnaies: 'rare', chevaux: 'rare', chats: 'rare', presidents: 'rare',
  'villes-monde': 'epique', 'pays-carte': 'epique', extraits: 'epique', insectes: 'epique', plantes: 'epique', constellations: 'epique',
  inventions: 'epique', architecture: 'epique', mangas: 'epique', 'persos-jeux': 'epique', fleuves: 'epique', iles: 'epique',
  'departements-prefecture': 'epique', compositeurs: 'epique', 'sportifs-sport': 'epique', 'personnalites-metier': 'epique',
  'noms-scientifiques': 'legendaire', 'departements-numero': 'legendaire', elements: 'legendaire', 'villes-fr': 'legendaire',
  tableaux: 'legendaire', 'blind-album': 'legendaire', 'blind-titre': 'epique', 'artistes-genre': 'rare', studios: 'commun', 'studios-annee': 'rare', lunes: 'epique', jo: 'rare', 'persos-univers': 'rare', 'lieux-jeux': 'epique', sagas: 'rare', consoles: 'rare', logos: 'legendaire', 'personnalites-pays': 'legendaire',
}
export const rareteDe = (id: string): Rarete => RARETE[id] ?? 'commun'

// 2 pièces par bonne réponse, + bonus défi du jour réussi et sans-faute
export const piecesGagnees = (bonnes: number, total: number, defi: boolean) =>
  bonnes * 2 + (defi && bonnes >= total / 2 ? 20 : 0) + (bonnes === total && total >= 10 ? 15 : 0)

export const familleDe = (id: string) => FAMILLES.find((x) => x.subs.some((s) => s.id === id))

// Anciens comptes (ni liste de quiz, ni familles) : tout reste ouvert, on ne reprend rien à personne.
// Comptes de l'étape « familles » : les quiz de leurs familles choisies restent acquis.
const toutOuvert = (p?: Profile | null) => !p || (!p.quiz && !p.familles)
export const accesQuiz = (id: string, p?: Profile | null) =>
  toutOuvert(p) || !!p?.quiz?.includes(id) || !!p?.familles?.includes(familleDe(id)?.k ?? '')

export const choixAFaire = (p?: Profile | null) => !!p && (p.choixFait === false || (p.choixFait === undefined && Array.isArray(p.familles) && p.familles.length === 0 && !p.quiz?.length))

// Progression d'une famille : quiz possédés / total
export function progresFamille(k: Famille, p?: Profile | null) {
  const quiz = (FAMILLES.find((f) => f.k === k)?.subs ?? []).filter((s) => s.jouable)
  return { possedes: quiz.filter((s) => accesQuiz(s.id, p)).length, total: quiz.length }
}
export const familleOuverte = (k: Famille, p?: Profile | null) => progresFamille(k, p).possedes > 0
export const quizVerrouilles = (k: Famille, p?: Profile | null) =>
  (FAMILLES.find((f) => f.k === k)?.subs ?? []).filter((s) => s.jouable && !accesQuiz(s.id, p))

// ——— Difficultés : chaque niveau se débloque en réussissant le précédent sans faute (valider un niveau valide ceux du dessous) ou en payant ———
export function difficulteOuverte(d: number, p?: Profile | null, id?: string) {
  if (d <= 1) return true
  if (d === 5) { const f = id ? familleDe(id) : undefined; return !!f && legendeOuverte(f.k, p) }
  if (!id || toutOuvert(p)) return true
  return !!p?.paliers?.[id]?.includes(d - 1) || !!p?.sauts?.[id]?.includes(d)
}
export const reussie = (d: number, p?: Profile | null, id?: string) => !!id && !!p?.paliers?.[id]?.includes(d)

// Plus haute difficulté ouverte (1 à 4) pour ce quiz
export function plafonner(d: 1 | 2 | 3 | 4, p?: Profile | null, id?: string): 1 | 2 | 3 | 4 {
  let x = d
  while (x > 1 && !difficulteOuverte(x, p, id)) x = (x - 1) as 1 | 2 | 3
  return x
}

// Légende : ouverte dans une famille quand TOUS ses quiz (il faut donc tous les posséder) ont leurs 4 difficultés réussies.
// Jamais achetable ni sautable.
export function progresLegende(k: Famille, p?: Profile | null) {
  const quiz = (FAMILLES.find((f) => f.k === k)?.subs ?? []).filter((s) => s.jouable)
  const faits = quiz.reduce((n, s) => n + [1, 2, 3, 4].filter((d) => p?.paliers?.[s.id]?.includes(d)).length, 0)
  return { faits, total: quiz.length * 4 }
}
export const legendeOuverte = (k: Famille, p?: Profile | null) => { const { faits, total } = progresLegende(k, p); return total > 0 && faits >= total }

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

export const choisirQuiz = (uid: string, ids: string[]) => setDoc(doc(db, 'users', uid), { quiz: ids, choixFait: true }, { merge: true })
export const acheterQuiz = (uid: string, id: string) => depenser(uid, RARETES[rareteDe(id)].prix, { quiz: arrayUnion(id) })
export const sauterDifficulte = async (uid: string, id: string, d: number) => d >= 2 && d <= 4 && depenser(uid, PRIX_SAUT, { [`sauts.${id}`]: arrayUnion(d) })
export const payerIndice = (uid: string) => depenser(uid, PRIX_INDICE)
// Dépense de pièces pour un bonus en partie
export const payerPieces = (uid: string, n: number) => depenser(uid, n)

// ——— Menu de test (3 appuis sur le logo) ———
export const testToutDebloquer = (uid: string) => setDoc(doc(db, 'users', uid), { familles: deleteField(), quiz: deleteField(), choixFait: deleteField() }, { merge: true })
// Repartir de zéro côté progression : choix des 6 sous-thèmes, 50 pièces (XP et stats conservés)
export const testReinitialiser = (uid: string) => setDoc(doc(db, 'users', uid), { familles: deleteField(), quiz: [], choixFait: false, sauts: deleteField(), pieces: 50 }, { merge: true })
export const testPieces = (uid: string, n: number) => setDoc(doc(db, 'users', uid), { pieces: increment(n) }, { merge: true })
