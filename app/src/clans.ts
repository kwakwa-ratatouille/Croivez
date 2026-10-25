import { doc, getDoc, setDoc } from 'firebase/firestore'
import { get, increment, ref as rref, remove, set, update } from 'firebase/database'
import { db, rtdb } from './firebase'
import { semaine } from './social'

// Clans : rangés sous duels/clan-<CODE> (chemin ouvert aux joueurs connectés).
// Un index commun (duels/clans-index) sert à chercher un clan par son nom et à proposer des suggestions.
export type Blason = { forme: Forme; motif: Motif; c1: string; c2: string; symbole: Symbole }
export type Forme = 'ecu' | 'rond' | 'hexa' | 'pointe' | 'etoile' | 'couronne'
export type Motif = 'uni' | 'bande' | 'chevron' | 'quartiers' | 'rayons' | 'pal'
export type Symbole = 'etoile' | 'couronne' | 'eclair' | 'flamme' | 'feuille' | 'coeur' | 'lune' | 'diamant' | 'epee' | 'livre' | 'oeil' | 'aile'
export type Membre = { pseudo: string; avatar?: string; cadre?: string; depuis: number }
export type Clan = { code: string; nom: string; devise?: string; blason: Blason; embleme?: string; couleur?: string; chef: string; membres: Record<string, Membre>; cree: number; xp?: number }
export type EntreeIndex = { nom: string; cle: string; xp: number; n: number; blason: Blason }

export const FORMES: Forme[] = ['ecu', 'rond', 'hexa', 'pointe', 'etoile', 'couronne']
export const MOTIFS: Motif[] = ['uni', 'bande', 'chevron', 'quartiers', 'rayons', 'pal']
export const SYMBOLES: Symbole[] = ['etoile', 'couronne', 'eclair', 'flamme', 'feuille', 'coeur', 'lune', 'diamant', 'epee', 'livre', 'oeil', 'aile']
export const PALETTE = ['#7C3AED', '#2563EB', '#0EA5E9', '#14B8A6', '#16A34A', '#84CC16', '#FACC15', '#F59E0B', '#EA580C', '#DC2626', '#DB2777', '#111827', '#F8FAFC', '#B45309']
// Formes et motifs se débloquent avec le niveau du clan (le blason s'embellit en montant)
export const NIVEAU_FORME: Record<Forme, number> = { ecu: 1, rond: 1, hexa: 3, pointe: 5, etoile: 8, couronne: 12 }
export const NIVEAU_MOTIF: Record<Motif, number> = { uni: 1, bande: 1, chevron: 2, pal: 4, quartiers: 6, rayons: 10 }
export const BLASON_DEFAUT: Blason = { forme: 'ecu', motif: 'bande', c1: '#7C3AED', c2: '#FACC15', symbole: 'etoile' }

// Niveaux : lents, c'est un effort collectif. Niveau 2 à 2 500 XP, 5 à 40 000, 10 à 202 500, 20 à 902 500.
export const niveauClan = (xp = 0) => Math.floor(Math.sqrt(xp / 2500)) + 1
export const xpNiveau = (n: number) => (n - 1) ** 2 * 2500
export const maxMembres = (n: number) => Math.min(40, 10 + (n - 1) * 2)
export const objectifSemaine = (n: number) => 2000 + (n - 1) * 750
export const AVANTAGES: [number, string][] = [
  [1, 'Blason écu ou rond, 10 membres'], [2, 'Motif chevron'], [3, 'Forme hexagone'], [4, 'Motif pal'], [5, 'Forme pointe, halo doré autour du blason'],
  [6, 'Motif écartelé'], [8, 'Forme étoile'], [10, 'Motif rayons, blason animé'], [12, 'Forme couronne'], [15, 'Blason légendaire scintillant'],
]

const chemin = (code: string) => `duels/clan-${code}`
const INDEX = 'duels/clans-index'
export const cleNom = (s: string) => s.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '')
const nouveauCode = () => Array.from({ length: 5 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 31)]).join('')
const marquer = (uid: string, code: string | null) => Promise.all([
  setDoc(doc(db, 'users', uid), { clan: code ?? '' }, { merge: true }),
  setDoc(doc(db, 'profils', uid), { clan: code ?? '' }, { merge: true }),
])
const blasonDe = (c: Partial<Clan>): Blason => c.blason ?? { ...BLASON_DEFAUT, c1: c.couleur ?? BLASON_DEFAUT.c1 }
const indexer = (c: Clan) => set(rref(rtdb, `${INDEX}/${c.code}`), { nom: c.nom, cle: cleNom(c.nom), xp: c.xp ?? 0, n: Object.keys(c.membres ?? {}).length, blason: blasonDe(c) } satisfies EntreeIndex)

const cache = new Map<string, Promise<Clan | null>>()
export async function lireClan(code: string, frais = true): Promise<Clan | null> {
  const k = code.toUpperCase()
  if (!frais && cache.has(k)) return cache.get(k)!
  const p = get(rref(rtdb, chemin(k))).then((s) => (s.exists() ? { ...(s.val() as Clan), code: k, blason: blasonDe(s.val()) } : null))
  cache.set(k, p)
  return p
}

export async function chercherClans(): Promise<(EntreeIndex & { code: string })[]> {
  const s = await get(rref(rtdb, INDEX))
  return Object.entries((s.val() ?? {}) as Record<string, EntreeIndex>).map(([code, e]) => ({ ...e, code })).sort((a, b) => b.xp - a.xp)
}

export async function nomPris(nom: string) {
  return (await chercherClans()).some((c) => c.cle === cleNom(nom))
}

export async function creerClan(uid: string, moi: Membre, nom: string, devise: string, blason: Blason) {
  let code = nouveauCode()
  while (await lireClan(code)) code = nouveauCode()
  const c: Clan = { code, nom: nom.trim().slice(0, 24), devise: devise.trim().slice(0, 60), blason, chef: uid, membres: { [uid]: moi }, cree: Date.now(), xp: 0 }
  const { code: _c, ...donnees } = c; void _c
  await set(rref(rtdb, chemin(code)), donnees)
  await indexer(c)
  await marquer(uid, code)
  return code
}

export async function modifierClan(c: Clan, maj: { nom?: string; devise?: string; blason?: Blason }) {
  await update(rref(rtdb, chemin(c.code)), maj)
  await indexer({ ...c, ...maj })
}

export async function rejoindreClan(uid: string, moi: Membre, code: string): Promise<'ok' | 'introuvable' | 'plein'> {
  const c = await lireClan(code)
  if (!c) return 'introuvable'
  if (Object.keys(c.membres ?? {}).length >= maxMembres(niveauClan(c.xp)) && !c.membres?.[uid]) return 'plein'
  await update(rref(rtdb, `${chemin(c.code)}/membres`), { [uid]: moi })
  await indexer({ ...c, membres: { ...c.membres, [uid]: moi } })
  await marquer(uid, c.code)
  return 'ok'
}

export async function quitterClan(uid: string, code: string) {
  const c = await lireClan(code)
  if (c) {
    const restants = Object.keys(c.membres ?? {}).filter((u) => u !== uid)
    if (!restants.length) { await remove(rref(rtdb, chemin(c.code))); await remove(rref(rtdb, `${INDEX}/${c.code}`)) }
    else {
      await remove(rref(rtdb, `${chemin(c.code)}/membres/${uid}`))
      if (c.chef === uid) await set(rref(rtdb, `${chemin(c.code)}/chef`), restants[0]) // le plus ancien prend la tête
      const m = { ...c.membres }; delete m[uid]
      await indexer({ ...c, membres: m })
    }
  }
  await marquer(uid, null)
}

// Chaque partie d'un membre fait monter l'XP du clan (et son rang dans l'index)
export async function gagnerXpClan(code: string, xp: number) {
  if (!code || xp <= 0) return
  await update(rref(rtdb, chemin(code)), { xp: increment(xp) })
  await update(rref(rtdb, `${INDEX}/${code}`), { xp: increment(xp) })
}

// XP de la semaine de chaque membre (classement de la semaine), du meilleur au moins bon
export async function scoresClan(c: Clan) {
  const uids = Object.keys(c.membres ?? {})
  const xp = await Promise.all(uids.map((u) => getDoc(doc(db, 'semaines', semaine(), 'scores', u)).then((d) => (d.data()?.xp as number) ?? 0).catch(() => 0)))
  return uids.map((uid, i) => ({ uid, ...c.membres[uid], xp: xp[i] })).sort((a, b) => b.xp - a.xp)
}
