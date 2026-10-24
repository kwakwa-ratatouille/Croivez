import { doc, increment, setDoc } from 'firebase/firestore'
import { db } from './firebase'

// Mode aventure : un tour du monde en 5 régions de 6 étapes. Chaque étape est un quiz ;
// la 6ᵉ étape d'une région est un boss (plus dur, il faut 8/10). Les étapes se débloquent dans l'ordre.
export type Etape = { s: string; d: 1 | 2 | 3 | 4; boss?: boolean; nom: { fr: string; en: string } }
export type Region = { k: string; nom: { fr: string; en: string }; emoji: string; etapes: Etape[] }
const e = (s: string, d: 1 | 2 | 3 | 4, fr: string, boss = false): Etape => ({ s, d, boss, nom: { fr, en: fr } })
export const REGIONS: Region[] = [
  { k: 'depart', nom: { fr: 'Le village de départ', en: 'Starting village' }, emoji: '🏡', etapes: [e('drapeaux', 1, 'Les drapeaux du village'), e('animaux', 1, 'La ferme'), e('logos', 1, 'Le marché'), e('films', 1, 'Le cinéma du coin'), e('capitales', 1, 'La carte au trésor'), e('drapeaux', 3, 'Le gardien du pont', true)] },
  { k: 'foret', nom: { fr: 'La forêt des savoirs', en: 'Forest of knowledge' }, emoji: '🌲', etapes: [e('arbres', 1, 'Les grands arbres'), e('fleurs', 2, 'La clairière fleurie'), e('oiseaux', 2, 'Le chant des oiseaux'), e('champignons', 2, 'Les sous-bois'), e('insectes', 2, 'La fourmilière'), e('animaux', 4, 'L’ours de la forêt', true)] },
  { k: 'cite', nom: { fr: 'La cité des arts', en: 'City of arts' }, emoji: '🏛️', etapes: [e('tableaux-photo', 2, 'Le musée'), e('monuments', 2, 'Les monuments'), e('artistes', 2, 'La scène'), e('personnalites', 2, 'Le grand salon'), e('histoire', 2, 'Les archives'), e('peintres', 4, 'Le maître du musée', true)] },
  { k: 'ocean', nom: { fr: 'L’océan des mystères', en: 'Ocean of mysteries' }, emoji: '🌊', etapes: [e('poissons', 2, 'Le récif'), e('iles', 2, 'L’archipel'), e('volcans', 3, 'L’île volcanique'), e('legendes', 2, 'Les légendes marines'), e('catastrophes', 3, 'La tempête'), e('capitales', 4, 'Le Kraken', true)] },
  { k: 'espace', nom: { fr: 'Les étoiles', en: 'The stars' }, emoji: '🚀', etapes: [e('planetes', 2, 'Le décollage'), e('constellations', 3, 'La carte du ciel'), e('astronautes', 3, 'La station spatiale'), e('missions', 3, 'Les grandes missions'), e('lunes', 3, 'Les lunes lointaines'), e('drapeaux', 4, 'Le gardien des étoiles', true)] },
]
export const ETAPES = REGIONS.flatMap((r) => r.etapes.map((x) => ({ ...x, region: r.k })))
export const seuilEtape = (x: Etape) => (x.boss ? 8 : 7)
export const urlEtape = (n: number) => { const x = ETAPES[n]; return `/partie?s=${x.s}&m=auto&n=10&d=${x.d}&aventure=${n}` }

// Étape réussie : on avance (seulement si c'est la prochaine étape), avec une récompense
export async function validerEtape(uid: string, n: number, actuelle: number) {
  if (n !== actuelle) return false
  await setDoc(doc(db, 'users', uid), { aventure: n + 1, pieces: increment(ETAPES[n].boss ? 60 : 20) }, { merge: true })
  return true
}
