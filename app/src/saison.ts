import { arrayUnion, doc, increment, runTransaction } from 'firebase/firestore'
import { db } from './firebase'
import { saisonId, type Profile } from './auth'
import { saisonDuMois } from './evenements'

// Saison = un mois. L'XP gagnée pendant le mois fait avancer le pass : 20 paliers de 250 XP.
// Chaque palier rapporte des pièces ; le 10ᵉ et le 20ᵉ donnent en plus un objet exclusif.
export const XP_PALIER = 250
export const NB_PALIERS = 20
export type Recompense = { pieces: number; objet?: string; nom?: { fr: string; en: string } }
// Récompenses de la saison du mois (thème : givre, cœurs, fleurs… Halloween, fêtes) : avatar, titre, cadre animé
export const recompense = (n: number, d = new Date()): Recompense => {
  const s = saisonDuMois(d)
  if (n === 5) return { pieces: 60, objet: `avatar-s-${s.id}`, nom: { fr: `Avatar ${s.avatar}`, en: `Avatar ${s.avatar}` } }
  if (n === 10) return { pieces: 100, objet: `titre-s-${s.id}`, nom: { fr: `Titre « ${s.titre.fr} »`, en: `Title “${s.titre.en}”` } }
  if (n === 15) return { pieces: 200, objet: `fond-s-${s.id}`, nom: { fr: `Fond de vitrine animé ${s.emoji}`, en: `Animated showcase ${s.emoji}` } }
  if (n === 20) return { pieces: 250, objet: `cadre-s-${s.id}`, nom: { fr: `Cadre « ${s.nom.fr} »`, en: `“${s.nom.en}” frame` } }
  return { pieces: n % 5 === 0 ? 75 : 25 + n * 2 }
}

export const etatSaison = (p?: Profile | null) => {
  const s = p?.saison?.id === saisonId() ? p.saison : { id: saisonId(), xp: 0, recl: [] as number[] }
  return { ...s, palier: Math.min(NB_PALIERS, Math.floor(s.xp / XP_PALIER)) }
}
export function finSaison(d = new Date()) {
  const fin = new Date(d.getFullYear(), d.getMonth() + 1, 1)
  return Math.ceil((fin.getTime() - d.getTime()) / 864e5)
}

// Récupère un palier atteint (une seule fois, même depuis deux appareils)
export async function reclamerPalier(uid: string, n: number) {
  return runTransaction(db, async (tx) => {
    const ref = doc(db, 'users', uid)
    const p = (await tx.get(ref)).data() as Profile | undefined
    const s = p?.saison
    if (!s || s.id !== saisonId() || s.recl?.includes(n) || Math.floor(s.xp / XP_PALIER) < n) return false
    const r = recompense(n)
    tx.update(ref, { 'saison.recl': arrayUnion(n), pieces: increment(r.pieces), ...(r.objet ? { possede: arrayUnion(r.objet) } : {}) })
    return true
  })
}
