import type { SousThemeId } from './engine'

// Carte de révision (répétition espacée inspirée de SM-2) : stockée dans le profil, clé « sousTheme~id »
export type CarteRevision = { s: SousThemeId; id: string; due: number; jours: number; facilite: number; reps: number }

const JOUR = 864e5
export const cleRevision = (s: string, id: string) => `${s}~${id}`

// Une erreur crée ou réinitialise la carte (à revoir demain) ; une bonne réponse espace la suivante
export function planifier(carte: CarteRevision | undefined, s: SousThemeId, id: string, juste: boolean, now = Date.now()): CarteRevision | null {
  if (!carte && juste) return null // on ne suit que ce qui a déjà été raté
  const c = carte ?? { s, id, due: now, jours: 0, facilite: 2.5, reps: 0 }
  if (!juste) return { ...c, jours: 1, reps: 0, facilite: Math.max(1.3, c.facilite - 0.2), due: now + JOUR }
  const jours = c.reps === 0 ? 3 : Math.round(c.jours * c.facilite)
  // Retenue 4 fois de suite à plus d'un mois d'intervalle : considérée comme acquise
  if (c.reps >= 3 && jours > 30) return null
  return { ...c, jours, reps: c.reps + 1, facilite: Math.min(3, c.facilite + 0.1), due: now + jours * JOUR }
}

export const aReviser = (rev: Record<string, CarteRevision> | undefined, now = Date.now()) =>
  Object.values(rev ?? {}).filter((c) => c.due <= now)
