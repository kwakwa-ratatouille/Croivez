import { arrayUnion, doc, increment, setDoc } from 'firebase/firestore'
import { db } from './firebase'
import type { Profile } from './auth'

// Récompenses de l'album : des pièces en lisant chaque carte obtenue, un bonus par page et par album complets,
// et des cosmétiques exclusifs (boutique de l'album) débloqués par la collection.
export const GAIN_CARTE: Record<string, number> = { commun: 3, rare: 6, epique: 12, legendaire: 25, exotique: 50 }
export const GAIN_PAGE = 75
export const GAIN_ALBUM = 500

export const nbCartes = (p: Profile) => Object.values(p.album ?? {}).reduce((a, l) => a + l.length, 0)
// Cartes obtenues dont on n'a pas encore récupéré les pièces (pastille « à récupérer »), d'un quiz ou de tous
export const cartesARecuperer = (p: Profile | null | undefined, quiz?: string) => {
  if (!p) return 0
  const lus = new Set(p.albumLu ?? [])
  return Object.entries(p.album ?? {}).filter(([q]) => !quiz || q === quiz).reduce((n, [q, ids]) => n + ids.filter((id) => !lus.has(`${q}:${id}`)).length, 0)
}
const nbPages = (p: Profile) => p.albumPages?.length ?? 0
const nbAlbums = (p: Profile) => p.albumsFinis?.length ?? 0

const ecrire = (uid: string, d: Record<string, unknown>) => setDoc(doc(db, 'users', uid), d, { merge: true })
export const lireCarte = (uid: string, quiz: string, id: string, gain: number) => ecrire(uid, { pieces: increment(gain), albumLu: arrayUnion(`${quiz}:${id}`) })
// Toutes les cartes non lues d'une page d'un coup (bouton « Récupérer les pièces de la page »)
export const lireCartes = (uid: string, quiz: string, ids: string[], gain: number) => ecrire(uid, { pieces: increment(gain), albumLu: arrayUnion(...ids.map((id) => `${quiz}:${id}`)) })
// Toutes les cartes non lues de tous les albums d'un coup (« quiz:carte »)
export const lireToutes = (uid: string, cles: string[], gain: number) => ecrire(uid, { pieces: increment(gain), albumLu: arrayUnion(...cles) })
export const reclamerPage = (uid: string, quiz: string, page: number) => ecrire(uid, { pieces: increment(GAIN_PAGE), albumPages: arrayUnion(`${quiz}:${page}`) })
export const reclamerAlbum = (uid: string, quiz: string) => ecrire(uid, { pieces: increment(GAIN_ALBUM), albumsFinis: arrayUnion(quiz) })

type Cond = { desc: { fr: string; en: string }; test: (p: Profile) => boolean }
const cartes = (n: number): Cond => ({ desc: { fr: `Collectionner ${n.toLocaleString('fr-FR')} cartes d’album`, en: `Collect ${n} album cards` }, test: (p) => nbCartes(p) >= n })
const pages = (n: number): Cond => ({ desc: { fr: `Compléter ${n} pages d’album`, en: `Complete ${n} album pages` }, test: (p) => nbPages(p) >= n })
const albums = (n: number): Cond => ({ desc: { fr: n === 1 ? 'Compléter un album entier' : `Compléter ${n} albums entiers`, en: `Complete ${n} full albums` }, test: (p) => nbAlbums(p) >= n })
export const CONDITIONS_ALBUM: Record<string, Cond> = {
  c50: cartes(50), c150: cartes(150), c300: cartes(300), c600: cartes(600), c1000: cartes(1000), c2000: cartes(2000),
  p5: pages(5), p20: pages(20), p50: pages(50), a1: albums(1), a3: albums(3), a10: albums(10),
}
