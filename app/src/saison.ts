import { arrayUnion, doc, increment, runTransaction } from 'firebase/firestore'
import { db } from './firebase'
import { saisonId, type Profile } from './auth'

// Saison = un mois. L'XP gagnée pendant le mois fait avancer le pass : 20 paliers de 250 XP.
// Chaque palier rapporte des pièces ; le 10ᵉ et le 20ᵉ donnent en plus un objet exclusif.
export const XP_PALIER = 250
export const NB_PALIERS = 20
export type Recompense = { pieces: number; objet?: string; nom?: { fr: string; en: string } }
export const recompense = (n: number): Recompense => {
  if (n === 10) return { pieces: 100, objet: 'titre-saison', nom: { fr: 'Titre « De la saison »', en: 'Season title' } }
  if (n === 20) return { pieces: 250, objet: 'cadre-saison', nom: { fr: 'Cadre animé Saison', en: 'Season animated frame' } }
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
