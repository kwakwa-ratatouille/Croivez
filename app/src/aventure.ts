import { doc, increment, setDoc } from 'firebase/firestore'
import { db } from './firebase'

// Mode histoire : un tour du monde en 8 mondes de 8 étapes. Chaque étape est un quiz lié au monde ;
// la 8ᵉ étape d'un monde est un boss (plus dur, il faut 8/10). Les étapes se débloquent dans l'ordre.
// La difficulté monte doucement : Facile au début, Expert pour les derniers boss.
export type Etape = { s: string; d: 1 | 2 | 3 | 4; boss?: boolean; nom: { fr: string; en: string } }
export type Region = { k: string; nom: { fr: string; en: string }; emoji: string; etapes: Etape[] }
const e = (s: string, d: 1 | 2 | 3 | 4, fr: string, boss = false): Etape => ({ s, d, boss, nom: { fr, en: fr } })
export const REGIONS: Region[] = [
  { k: 'depart', nom: { fr: 'Le village de départ', en: 'Starting village' }, emoji: '🏡', etapes: [
    e('drapeaux-europe', 1, 'Les drapeaux de la place'), e('animaux', 1, 'La ferme'), e('fruits', 1, 'Le marché'), e('logos', 1, 'Les vitrines'),
    e('chiens', 1, 'Le chenil'), e('films', 1, 'Le petit cinéma'), e('capitales', 1, 'La carte au trésor'), e('drapeaux', 2, 'Le gardien du pont', true)] },
  { k: 'foret', nom: { fr: 'La forêt des savoirs', en: 'Forest of knowledge' }, emoji: '🌲', etapes: [
    e('arbres', 1, 'Les grands arbres'), e('fleurs', 1, 'La clairière fleurie'), e('oiseaux', 2, 'Le chant des oiseaux'), e('champignons', 2, 'Les sous-bois'),
    e('insectes', 2, 'La fourmilière'), e('mammiferes', 2, 'Les terriers'), e('legendes', 2, 'Le conteur du feu de camp'), e('animaux', 3, 'L’ours de la forêt', true)] },
  { k: 'montagne', nom: { fr: 'Les sommets', en: 'The peaks' }, emoji: '🏔️', etapes: [
    e('montagnes', 2, 'Le camp de base'), e('volcans', 2, 'Le cratère'), e('fleuves', 2, 'La source'), e('pays-carte', 2, 'La table d’orientation'),
    e('fromages', 2, 'Le refuge'), e('sports-photo', 2, 'Les pistes'), e('catastrophes', 2, 'L’avalanche'), e('volcans-pays', 3, 'Le dragon du volcan', true)] },
  { k: 'cite', nom: { fr: 'La cité des arts', en: 'City of arts' }, emoji: '🏛️', etapes: [
    e('tableaux-photo', 2, 'Le musée'), e('monuments', 2, 'Les monuments'), e('sculptures', 2, 'L’atelier'), e('peintres', 2, 'Les portraits'),
    e('histoire', 2, 'Les archives'), e('souverains', 2, 'Le palais'), e('batailles', 3, 'Le champ de bataille'), e('personnalites', 3, 'Le maître du musée', true)] },
  { k: 'studio', nom: { fr: 'Les studios', en: 'The studios' }, emoji: '🎬', etapes: [
    e('affiches', 2, 'Le hall des affiches'), e('acteurs', 2, 'Le tapis rouge'), e('series', 2, 'Le plateau télé'), e('studios', 2, 'Le studio d’animation'),
    e('roles', 2, 'Les loges'), e('animes', 2, 'Le coin manga'), e('mechants-photo', 3, 'Le repaire des méchants'), e('films-annee', 3, 'Le réalisateur fou', true)] },
  { k: 'scene', nom: { fr: 'La grande scène', en: 'The big stage' }, emoji: '🎤', etapes: [
    e('artistes', 2, 'Les coulisses'), e('blind-titre', 2, 'Les balances'), e('artistes-fr', 2, 'La première partie'), e('groupes', 2, 'Le groupe'),
    e('albums', 3, 'Le disquaire'), e('artistes-recents', 3, 'Les stars d’aujourd’hui'), e('artistes-genre', 3, 'Le festival'), e('extraits', 3, 'La rock star', true)] },
  { k: 'ocean', nom: { fr: 'L’océan des mystères', en: 'Ocean of mysteries' }, emoji: '🌊', etapes: [
    e('poissons', 2, 'Le récif'), e('iles', 2, 'L’archipel'), e('specialites-pays', 2, 'Le port'), e('traditions', 3, 'Les escales'),
    e('dieux', 3, 'Le temple englouti'), e('drapeaux-oceanie', 3, 'Les îles lointaines'), e('capitales-inverse', 3, 'La boussole'), e('drapeaux-afrique', 4, 'Le Kraken', true)] },
  { k: 'espace', nom: { fr: 'Les étoiles', en: 'The stars' }, emoji: '🚀', etapes: [
    e('planetes', 2, 'Le décollage'), e('constellations', 3, 'La carte du ciel'), e('astronautes', 3, 'La station spatiale'), e('missions', 3, 'Les grandes missions'),
    e('logos-tech', 3, 'Le centre de contrôle'), e('inventions', 3, 'Le laboratoire'), e('lunes', 4, 'Les lunes lointaines'), e('drapeaux-asie', 4, 'Le gardien des étoiles', true)] },
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
