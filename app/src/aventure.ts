import { doc, increment, setDoc } from 'firebase/firestore'
import { db } from './firebase'

// Mode histoire : un tour du monde en 17 mondes de 8 étapes. Chaque étape est un quiz lié au monde.
// Dans chaque monde : un mini-boss à la 4ᵉ étape (une difficulté au-dessus), un gros boss à la 8ᵉ (8/10),
// et tout au bout, le boss ultime : 15 questions de tous les thèmes, 13/15 pour gagner.
// L'ordre des 104 premières étapes ne bouge jamais (la progression des joueurs est un numéro d'étape) : on ajoute à la fin.
export type TypeEtape = 'mini' | 'boss' | 'ultime'
export type Etape = { s: string; d: 1 | 2 | 3 | 4; boss?: boolean; type?: TypeEtape; nom: { fr: string; en: string } }
export type Region = { k: string; nom: { fr: string; en: string }; emoji: string; etapes: Etape[] }
const e = (s: string, d: 1 | 2 | 3 | 4, fr: string, boss = false): Etape => ({ s, d, boss, ...(boss ? { type: 'boss' as const } : {}), nom: { fr, en: fr } })
// Mini-boss : une difficulté au-dessus de son monde
const mini = (s: string, d: 1 | 2 | 3 | 4, fr: string): Etape => ({ s, d: Math.min(4, d + 1) as 1 | 2 | 3 | 4, type: 'mini', nom: { fr, en: fr } })
export const REGIONS: Region[] = [
  { k: 'depart', nom: { fr: 'Le village de départ', en: 'Starting village' }, emoji: '🏡', etapes: [
    e('drapeaux-europe', 1, 'Les drapeaux de la place'), e('animaux', 1, 'La ferme'), e('fruits', 1, 'Le marché'), mini('logos', 1, 'Le chat voleur du marché'),
    e('chiens', 1, 'Le chenil'), e('films', 1, 'Le petit cinéma'), e('capitales', 1, 'La carte au trésor'), e('drapeaux', 2, 'Le gardien du pont', true)] },
  { k: 'foret', nom: { fr: 'La forêt des savoirs', en: 'Forest of knowledge' }, emoji: '🌲', etapes: [
    e('arbres', 1, 'Les grands arbres'), e('fleurs', 1, 'La clairière fleurie'), e('oiseaux', 2, 'Le chant des oiseaux'), mini('champignons', 2, 'Le sanglier des sous-bois'),
    e('insectes', 2, 'La fourmilière'), e('mammiferes', 2, 'Les terriers'), e('legendes', 2, 'Le conteur du feu de camp'), e('animaux', 3, 'L’ours de la forêt', true)] },
  { k: 'montagne', nom: { fr: 'Les sommets', en: 'The peaks' }, emoji: '🏔️', etapes: [
    e('montagnes', 2, 'Le camp de base'), e('volcans', 2, 'Le cratère'), e('fleuves', 2, 'La source'), mini('pays-carte', 2, 'Le yéti égaré'),
    e('fromages', 2, 'Le refuge'), e('sports-photo', 2, 'Les pistes'), e('catastrophes', 2, 'L’avalanche'), e('volcans-pays', 3, 'Le dragon du volcan', true)] },
  { k: 'cite', nom: { fr: 'La cité des arts', en: 'City of arts' }, emoji: '🏛️', etapes: [
    e('tableaux-photo', 2, 'Le musée'), e('monuments', 2, 'Les monuments'), e('sculptures', 2, 'L’atelier'), mini('peintres', 2, 'Le faussaire'),
    e('histoire', 2, 'Les archives'), e('souverains', 2, 'Le palais'), e('batailles', 3, 'Le champ de bataille'), e('personnalites', 3, 'Le maître du musée', true)] },
  { k: 'studio', nom: { fr: 'Les studios', en: 'The studios' }, emoji: '🎬', etapes: [
    e('affiches', 2, 'Le hall des affiches'), e('acteurs', 2, 'Le tapis rouge'), e('series', 2, 'Le plateau télé'), mini('studios', 2, 'La diva capricieuse'),
    e('roles', 2, 'Les loges'), e('animes', 2, 'Le coin manga'), e('mechants-photo', 3, 'Le repaire des méchants'), e('films-annee', 3, 'Le réalisateur fou', true)] },
  { k: 'scene', nom: { fr: 'La grande scène', en: 'The big stage' }, emoji: '🎤', etapes: [
    e('artistes', 2, 'Les coulisses'), e('blind-titre', 2, 'Les balances'), e('artistes-fr', 2, 'La première partie'), mini('groupes', 2, 'Le DJ fou'),
    e('albums', 3, 'Le disquaire'), e('artistes-recents', 3, 'Les stars d’aujourd’hui'), e('artistes-genre', 3, 'Le festival'), e('extraits', 3, 'La rock star', true)] },
  { k: 'ocean', nom: { fr: 'L’océan des mystères', en: 'Ocean of mysteries' }, emoji: '🌊', etapes: [
    e('poissons', 2, 'Le récif'), e('iles', 2, 'L’archipel'), e('specialites-pays', 2, 'Le port'), mini('traditions', 3, 'Le pirate des escales'),
    e('dieux', 3, 'Le temple englouti'), e('drapeaux-oceanie', 3, 'Les îles lointaines'), e('capitales-inverse', 3, 'La boussole'), e('drapeaux-afrique', 4, 'Le Kraken', true)] },
  { k: 'espace', nom: { fr: 'Les étoiles', en: 'The stars' }, emoji: '🚀', etapes: [
    e('planetes', 2, 'Le décollage'), e('constellations', 3, 'La carte du ciel'), e('astronautes', 3, 'La station spatiale'), mini('missions', 3, 'Le robot détraqué'),
    e('logos-tech', 3, 'Le centre de contrôle'), e('inventions', 3, 'Le laboratoire'), e('lunes', 4, 'Les lunes lointaines'), e('drapeaux-asie', 4, 'Le gardien des étoiles', true)] },
  // ——— Au-delà des étoiles : Difficile puis Expert partout ———
  { k: 'arcade', nom: { fr: 'L’arcade infinie', en: 'Endless arcade' }, emoji: '🕹️', etapes: [
    e('consoles', 3, 'Le grenier aux consoles'), e('jeux', 3, 'La salle d’arcade'), e('pokemon', 3, 'Les hautes herbes'), mini('persos-jeux', 3, 'Le fantôme du bug'),
    e('lieux-jeux', 3, 'Les mondes ouverts'), e('jeux-societe', 3, 'La ludothèque'), e('persos-jeu', 4, 'Les PNJ oubliés'), e('jeux', 4, 'Le boss final du jeu', true)] },
  { k: 'labo', nom: { fr: 'Le laboratoire secret', en: 'Secret lab' }, emoji: '🧪', etapes: [
    e('elements', 3, 'Le tableau périodique'), e('corps', 3, 'La salle d’anatomie'), e('dinosaures', 3, 'Les fossiles'), mini('mineraux', 3, 'L’assistant mutant'),
    e('scientifiques', 3, 'Les génies'), e('formules', 4, 'Le tableau noir'), e('maladies', 4, 'L’infirmerie'), e('inventions', 4, 'Le savant fou', true)] },
  { k: 'arene', nom: { fr: 'L’arène des champions', en: 'Champions’ arena' }, emoji: '🏟️', etapes: [
    e('balles', 3, 'Le vestiaire'), e('clubs', 3, 'Les blasons'), e('stades', 3, 'Les tribunes'), mini('jo', 3, 'L’arbitre impitoyable'),
    e('coupe-monde', 4, 'La Coupe du monde'), e('ballon-or', 4, 'Le Ballon d’or'), e('sportifs', 4, 'Le Hall of Fame'), e('sports-photo', 4, 'Le champion invaincu', true)] },
  { k: 'temps', nom: { fr: 'La machine à remonter le temps', en: 'Time machine' }, emoji: '⏳', etapes: [
    e('presidents', 3, 'L’Élysée'), e('dirigeants', 4, 'Les sommets mondiaux'), e('traites', 4, 'Les grands traités'), mini('mouvements', 4, 'Le chevalier perdu'),
    e('batailles', 4, 'Les champs de bataille'), e('souverains', 4, 'La galerie des rois'), e('histoire', 4, 'Les dates oubliées'), e('personnalites', 4, 'Le gardien du temps', true)] },
  { k: 'legendes', nom: { fr: 'Le royaume des légendes', en: 'Realm of legends' }, emoji: '🐉', etapes: [
    e('livres', 4, 'La bibliothèque interdite'), e('auteurs', 4, 'Les plumes'), e('citations', 4, 'Le mur des citations'), mini('repliques', 4, 'Le troll du pont'),
    e('proverbes', 4, 'La sagesse des anciens'), e('mangas', 4, 'Le dojo'), e('legendes', 4, 'Le dragon des contes'), e('dieux', 4, 'Le Panthéon', true)] },
  // ——— Les nouveaux mondes : dessins animés, festival, curiosités, et le cœur du multivers ———
  { k: 'toons', nom: { fr: 'Le pays des dessins animés', en: 'Toon land' }, emoji: '🎨', etapes: [
    e('dessins-animes', 3, 'La télé du samedi matin'), e('persos-animation', 3, 'Les studios Disney'), e('generiques', 3, 'Les génériques'), mini('chansons-disney', 3, 'Le Génie farceur'),
    e('persos-animation-photo', 3, 'La parade'), e('heros-photo', 3, 'La ligue des héros'), e('heros', 4, 'Le QG des gentils'), e('mechants', 4, 'Le roi des méchants', true)] },
  { k: 'festival', nom: { fr: 'Le grand festival', en: 'The big festival' }, emoji: '🎧', etapes: [
    e('pop-inter', 3, 'La scène pop'), e('indie', 3, 'La tente indie'), e('afro', 3, 'La scène afro'), mini('rap-fr', 3, 'Le MC du freestyle'),
    e('rap-us', 3, 'Le block party'), e('musiques-films', 3, 'Le ciné-concert'), e('musiques-jeux', 4, 'La scène gaming'), e('blind-titre', 4, 'La tête d’affiche', true)] },
  { k: 'curiosites', nom: { fr: 'Le cabinet des curiosités', en: 'Cabinet of curiosities' }, emoji: '🤪', etapes: [
    e('comparaisons', 3, 'La balance à tacos'), e('eco-comparaisons', 3, 'Le terrain de foot géant'), e('verlan', 3, 'La rue qui parle à l’envers'), mini('idees-recues', 3, 'Le menteur professionnel'),
    e('records-monde', 3, 'Le livre des records'), e('emojis-films', 3, 'Le rébus'), e('devinettes', 4, 'Le grenier aux énigmes'), e('suites-logiques', 4, 'Le Sphinx', true)] },
  { k: 'multivers', nom: { fr: 'Le cœur du multivers', en: 'Heart of the multiverse' }, emoji: '🌌', etapes: [
    e('pokemon-photo', 4, 'La faille Pokémon'), e('mechants-photo', 4, 'La prison des méchants'), e('realisateurs', 4, 'La salle de montage'), mini('villes-idf', 4, 'Le gardien de Paris'),
    e('voix-vf', 4, 'Les voix d’ailleurs'), e('cris-animaux', 4, 'La jungle sonore'), e('code-route', 4, 'Le périphérique cosmique'),
    { s: 'mix', d: 4, boss: true, type: 'ultime', nom: { fr: 'L’Ultime', en: 'The Ultimate' } }] },
]
export const ETAPES = REGIONS.flatMap((r) => r.etapes.map((x) => ({ ...x, region: r.k })))
// Boss : 8/10 ; boss ultime : 13/15 (questions de tous les thèmes) ; mini-boss et étapes : 7/10
export const questionsEtape = (x: Etape) => (x.type === 'ultime' ? 15 : 10)
export const seuilEtape = (x: Etape) => (x.type === 'ultime' ? 13 : x.boss ? 8 : 7)
export const urlEtape = (n: number) => {
  const x = ETAPES[n]
  if (x.type === 'ultime') return `/partie?jeu=mix&m=qcm&n=15&d=4&aventure=${n}`
  return `/partie?s=${x.s}&m=${x.s.startsWith('villes') ? 'libre' : 'auto'}&n=10&d=${x.d}&aventure=${n}`
}
// Repères pour les récompenses : fin de chaque monde (boss), mini-boss battus
export const FIN_MONDE: Record<string, number> = (() => { let n = 0; return Object.fromEntries(REGIONS.map((r) => [r.k, (n += r.etapes.length)])) })()
export const miniBattus = (fait: number) => ETAPES.slice(0, fait).filter((x) => x.type === 'mini').length
export const bossBattus = (fait: number) => ETAPES.slice(0, fait).filter((x) => x.boss).length

// Étape réussie : on avance (seulement si c'est la prochaine étape), avec une récompense
export async function validerEtape(uid: string, n: number, actuelle: number) {
  if (n !== actuelle) return false
  const x = ETAPES[n], dur = n >= 64
  const gain = x.type === 'ultime' ? 1000 : x.boss ? (dur ? 150 : 75) : x.type === 'mini' ? (dur ? 70 : 35) : dur ? 40 : 20
  await setDoc(doc(db, 'users', uid), { aventure: n + 1, pieces: increment(gain) }, { merge: true })
  return true
}
