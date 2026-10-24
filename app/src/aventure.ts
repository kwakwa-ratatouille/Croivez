import { doc, increment, setDoc } from 'firebase/firestore'
import { db } from './firebase'

// Mode histoire : un tour du monde en 13 mondes de 8 étapes (les 5 derniers, ajoutés après, sont de plus en plus durs). Chaque étape est un quiz lié au monde ;
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
  // ——— Au-delà des étoiles : Difficile puis Expert partout ———
  { k: 'arcade', nom: { fr: 'L’arcade infinie', en: 'Endless arcade' }, emoji: '🕹️', etapes: [
    e('consoles', 3, 'Le grenier aux consoles'), e('jeux', 3, 'La salle d’arcade'), e('pokemon', 3, 'Les hautes herbes'), e('persos-jeux', 3, 'Le sélecteur de personnage'),
    e('lieux-jeux', 3, 'Les mondes ouverts'), e('jeux-societe', 3, 'La ludothèque'), e('persos-jeu', 4, 'Les PNJ oubliés'), e('jeux', 4, 'Le boss final du jeu', true)] },
  { k: 'labo', nom: { fr: 'Le laboratoire secret', en: 'Secret lab' }, emoji: '🧪', etapes: [
    e('elements', 3, 'Le tableau périodique'), e('corps', 3, 'La salle d’anatomie'), e('dinosaures', 3, 'Les fossiles'), e('mineraux', 3, 'La collection de pierres'),
    e('scientifiques', 3, 'Les génies'), e('formules', 4, 'Le tableau noir'), e('maladies', 4, 'L’infirmerie'), e('inventions', 4, 'Le savant fou', true)] },
  { k: 'arene', nom: { fr: 'L’arène des champions', en: 'Champions’ arena' }, emoji: '🏟️', etapes: [
    e('balles', 3, 'Le vestiaire'), e('clubs', 3, 'Les blasons'), e('stades', 3, 'Les tribunes'), e('jo', 3, 'La flamme olympique'),
    e('coupe-monde', 4, 'La Coupe du monde'), e('ballon-or', 4, 'Le Ballon d’or'), e('sportifs', 4, 'Le Hall of Fame'), e('sports-photo', 4, 'Le champion invaincu', true)] },
  { k: 'temps', nom: { fr: 'La machine à remonter le temps', en: 'Time machine' }, emoji: '⏳', etapes: [
    e('presidents', 3, 'L’Élysée'), e('dirigeants', 4, 'Les sommets mondiaux'), e('traites', 4, 'Les grands traités'), e('mouvements', 4, 'Les révolutions'),
    e('batailles', 4, 'Les champs de bataille'), e('souverains', 4, 'La galerie des rois'), e('histoire', 4, 'Les dates oubliées'), e('personnalites', 4, 'Le gardien du temps', true)] },
  { k: 'legendes', nom: { fr: 'Le royaume des légendes', en: 'Realm of legends' }, emoji: '🐉', etapes: [
    e('livres', 4, 'La bibliothèque interdite'), e('auteurs', 4, 'Les plumes'), e('citations', 4, 'Le mur des citations'), e('repliques', 4, 'Les répliques cultes'),
    e('proverbes', 4, 'La sagesse des anciens'), e('mangas', 4, 'Le dojo'), e('legendes', 4, 'Le dragon des contes'), e('dieux', 4, 'Le Panthéon : boss ultime', true)] },
]
export const ETAPES = REGIONS.flatMap((r) => r.etapes.map((x) => ({ ...x, region: r.k })))
// Le boss ultime (dernière étape) demande 9/10
export const seuilEtape = (x: Etape) => (x.boss && x.s === ETAPES[ETAPES.length - 1].s && x.d === 4 && x.nom.fr === ETAPES[ETAPES.length - 1].nom.fr ? 9 : x.boss ? 8 : 7)
export const urlEtape = (n: number) => { const x = ETAPES[n]; return `/partie?s=${x.s}&m=auto&n=10&d=${x.d}&aventure=${n}` }

// Étape réussie : on avance (seulement si c'est la prochaine étape), avec une récompense
export async function validerEtape(uid: string, n: number, actuelle: number) {
  if (n !== actuelle) return false
  await setDoc(doc(db, 'users', uid), { aventure: n + 1, pieces: increment(ETAPES[n].boss ? (n >= 64 ? 120 : 60) : n >= 64 ? 40 : 20) }, { merge: true })
  return true
}
