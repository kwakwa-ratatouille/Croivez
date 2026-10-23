// Mémoire des questions par appareil : ce qui a été vu, quand, et combien de fois réussi d'affilée.
// Sert à varier les parties (jamais les mêmes questions) et à faire revenir ce qu'on ne sait pas.
type Trace = [number, number] // [dernière fois (ms), réussites d'affilée]
type Memoire = Record<string, Trace>

const MIN = 6e4
const HEURE = 36e5
const JOUR = 24 * HEURE
// Après 1, 2, 3, 4+ réussites d'affilée : la question est mise de côté de plus en plus longtemps
const PAUSES = [0, 6 * HEURE, 2 * JOUR, 7 * JOUR, 30 * JOUR]
const RATEE_DE_NOUVEAU = 3 * MIN // une erreur revient vite, mais pas dans la même partie

const cle = (s: string) => `memoire:${s}`
const cache = new Map<string, Memoire>()

function lire(s: string): Memoire {
  if (!cache.has(s)) {
    let m: Memoire = {}
    try { m = JSON.parse(localStorage.getItem(cle(s)) ?? '{}') } catch { /* stockage indisponible */ }
    cache.set(s, m)
  }
  return cache.get(s)!
}

export function memoriser(s: string, id: string, juste: boolean) {
  const m = lire(s)
  const serie = juste ? (m[id]?.[1] ?? 0) + 1 : 0
  m[id] = [Date.now(), serie]
  try { localStorage.setItem(cle(s), JSON.stringify(m)) } catch { /* stockage plein : tant pis */ }
}

// Priorité d'une question : à revoir (ratée) > jamais vue > réussie dont la pause est finie > encore en pause
function priorite(t: Trace | undefined, maintenant: number) {
  if (!t) return 2
  const [vu, serie] = t
  if (serie === 0) return maintenant - vu > RATEE_DE_NOUVEAU ? 3 : -1
  return maintenant - vu >= PAUSES[Math.min(serie, PAUSES.length - 1)] ? 1 : -2 - serie
}

// Classe les candidats : les plus utiles d'abord, hasard à priorité égale
export function prioriser<T>(s: string, liste: T[], idDe: (x: T) => string, hasard: () => number): T[] {
  const m = lire(s)
  const maintenant = Date.now()
  return liste
    .map((x) => ({ x, p: priorite(m[idDe(x)], maintenant) + hasard() * 0.9 }))
    .sort((a, b) => b.p - a.p)
    .map((e) => e.x)
}

// Pour la page Profil : combien de questions de ce quiz sont vues / bien retenues
export function bilanMemoire(s: string) {
  const v = Object.values(lire(s))
  return { vues: v.length, retenues: v.filter(([, serie]) => serie >= 3).length }
}
