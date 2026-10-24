import type { Lang } from '../i18n'
import { PIEGES_CAPITALES, piegesSymbole, sosiesDe } from './pieges'
import { prioriser } from './memoire'

export type Pays = {
  id: string
  num?: string // code ISO numérique (cartes world-atlas)
  nom: Record<Lang, string>
  alias?: string[]
  capitale: Record<Lang, string> | null
  region: Record<Lang, string>
  population: number
  superficie: number
  latlng: [number, number] | null
}
// [nom, population, lat, lng, département | code pays]
export type Ville = [string, number, number, number, string]

export type Mode = 'qcm' | 'libre'
export type Difficulte = 0 | 1 | 2 | 3 | 4 | 5 // 0 = tout (toutes débloquées mélangées) ; 5 = Légende
export const LEGENDE = 5
// Légende : 6 propositions au lieu de 4, toutes piégeuses
const nbLeurres = (d: Difficulte) => (d === LEGENDE ? 5 : 3)
export type Palier = 1 | 2 | 3 | 4

export type SousThemeId = 'drapeaux' | 'drapeaux-inverse' | 'capitales' | 'capitales-inverse' | 'villes-fr' | 'villes-monde' | 'pays-carte' | CultureId

// Thèmes générés depuis Wikidata (scripts/build-culture.mjs)
type Texte = Record<Lang, string>
export type ItemCulture = { id: string; n: Texte; d?: Texte; img?: string; r?: string | Texte; g?: string; alt?: Texte[]; x?: Record<string, string | Texte | undefined>; f?: [Texte, string | Texte | undefined][] }
type TypeCulture = 'image' | 'attribut' | 'annee' | 'audio'
const CULTURE = {
  films: { type: 'attribut', q: { fr: (n) => `Qui a réalisé « ${n} » ?`, en: (n) => `Who directed “${n}”?` } },
  series: { type: 'annee', q: { fr: (n) => `En quelle année a débuté la série « ${n} » ?`, en: (n) => `In what year did “${n}” first air?` } },
  acteurs: { type: 'image', q: { fr: (_, g) => (g === 'f' ? 'Qui est cette actrice ?' : 'Qui est cet acteur ?'), en: () => 'Who is this actor?' } },
  artistes: { type: 'image', q: { fr: (_, g) => (g === 'f' ? 'Qui est cette artiste ?' : 'Qui est cet artiste ?'), en: () => 'Who is this artist?' } },
  albums: { type: 'attribut', q: { fr: (n) => `Quel artiste a sorti l’album « ${n} » ?`, en: (n) => `Which artist released the album “${n}”?` } },
  animaux: { type: 'image', q: { fr: () => 'Quel est cet animal ?', en: () => 'What is this animal?' } },
  mammiferes: { type: 'image', q: { fr: () => 'Quel est ce mammifère ?', en: () => 'What is this mammal?' } },
  oiseaux: { type: 'image', q: { fr: () => 'Quel est cet oiseau ?', en: () => 'What is this bird?' } },
  poissons: { type: 'image', q: { fr: () => 'Quel est ce poisson ?', en: () => 'What is this fish?' } },
  reptiles: { type: 'image', q: { fr: () => 'Quel est cet animal ?', en: () => 'What is this animal?' } },
  papillons: { type: 'image', q: { fr: () => 'Quel est ce papillon ?', en: () => 'What is this butterfly?' } },
  araignees: { type: 'image', q: { fr: () => 'Quelle est cette araignée ?', en: () => 'What is this spider?' } },
  champignons: { type: 'image', q: { fr: () => 'Quel est ce champignon ?', en: () => 'What is this mushroom?' } },
  chiens: { type: 'image', q: { fr: () => 'Quelle est cette race de chien ?', en: () => 'Which dog breed is this?' } },
  chats: { type: 'image', q: { fr: () => 'Quelle est cette race de chat ?', en: () => 'Which cat breed is this?' } },
  chevaux: { type: 'image', q: { fr: () => 'Quelle est cette race de cheval ?', en: () => 'Which horse breed is this?' } },
  'noms-scientifiques': { type: 'attribut', pack: 'animaux', champ: 'latin', montrer: true, q: { fr: (n) => `Quel est le nom scientifique de : ${n} ?`, en: (n) => `What is the scientific name of ${n}?` } },
  insectes: { type: 'image', q: { fr: () => 'Quel est cet insecte ?', en: () => 'What is this insect?' } },
  plantes: { type: 'image', q: { fr: () => 'Quelle est cette plante ?', en: () => 'What is this plant?' } },
  corps: { type: 'image', q: { fr: () => 'Quelle est cette partie du corps ?', en: () => 'What is this body part?' } },
  elements: { type: 'attribut', q: { fr: (n) => `Quel est le symbole chimique de cet élément : ${n} ?`, en: (n) => `What is the chemical symbol of ${n}?` } },
  personnalites: { type: 'image', q: { fr: () => 'Qui est cette personnalité ?', en: () => 'Who is this famous person?' } },
  histoire: { type: 'annee', q: { fr: (n) => `En quelle année a commencé : ${n} ?`, en: (n) => `In what year did this begin: ${n}?` } },
  logos: { type: 'image', q: { fr: () => 'À quelle marque appartient ce logo ?', en: () => 'Which brand does this logo belong to?' } },
  marques: { type: 'attribut', q: { fr: (n) => `De quel pays vient ${n} ?`, en: (n) => `Which country is ${n} from?` } },
  monuments: { type: 'image', q: { fr: () => 'Quel est ce monument ?', en: () => 'What is this landmark?' } },
  plats: { type: 'attribut', montrer: true, q: { fr: (n) => `De quel pays vient ce plat : ${n} ?`, en: (n) => `Which country is this dish from: ${n}?` } },
  monnaies: { type: 'attribut', q: { fr: (n) => `Quelle est la monnaie de ce pays : ${n} ?`, en: (n) => `What is the currency of ${n}?` } },
  langues: { type: 'attribut', q: { fr: (n) => `Quelle est une langue officielle de ce pays : ${n} ?`, en: (n) => `What is an official language of ${n}?` } },
  tableaux: { type: 'attribut', montrer: true, q: { fr: (n) => `Qui a peint « ${n} » ?`, en: (n) => `Who painted “${n}”?` } },
  'films-annee': { type: 'annee', pack: 'films', champ: 'annee', q: { fr: (n) => `En quelle année est sorti « ${n} » ?`, en: (n) => `In what year was “${n}” released?` } },
  'personnalites-pays': { type: 'attribut', pack: 'personnalites', champ: 'pays', montrer: true, q: { fr: (n) => `De quel pays est ${n} ?`, en: (n) => `Which country is ${n} from?` } },
  'personnalites-metier': { type: 'attribut', pack: 'personnalites', champ: 'metier', montrer: true, q: { fr: (n) => `Quelle est l’activité principale de ${n} ?`, en: (n) => `What is ${n} best known as?` } },
  'personnalites-naissance': { type: 'annee', pack: 'personnalites', champ: 'naissance', montrer: true, q: { fr: (n, g) => `En quelle année est ${g === 'f' ? 'née' : 'né'} ${n} ?`, en: (n) => `In what year was ${n} born?` } },
  clubs: { type: 'image', q: { fr: () => 'Quel est ce club ?', en: () => 'Which club is this?' } },
  sportifs: { type: 'image', q: { fr: (_, g) => (g === 'f' ? 'Qui est cette sportive ?' : 'Qui est ce sportif ?'), en: () => 'Who is this athlete?' } },
  'sportifs-sport': { type: 'attribut', pack: 'sportifs', champ: 'sport', montrer: true, q: { fr: (n) => `Quel sport pratique ${n} ?`, en: (n) => `What sport does ${n} play?` } },
  jo: { type: 'attribut', q: { fr: (n) => `Dans quel pays se sont déroulés les ${n} ?`, en: (n) => `In which country were the ${n} held?` } },
  livres: { type: 'attribut', q: { fr: (n) => `Qui a écrit « ${n} » ?`, en: (n) => `Who wrote “${n}”?` } },
  'livres-annee': { type: 'annee', pack: 'livres', champ: 'annee', q: { fr: (n) => `En quelle année a été publié « ${n} » ?`, en: (n) => `In what year was “${n}” published?` } },
  auteurs: { type: 'image', q: { fr: (_, g) => (g === 'f' ? 'Qui est cette écrivaine ?' : 'Qui est cet écrivain ?'), en: () => 'Who is this writer?' } },
  bd: { type: 'image', q: { fr: () => 'Quel est ce personnage ?', en: () => 'Who is this character?' } },
  mangas: { type: 'attribut', q: { fr: (n) => `Qui est l’auteur du manga « ${n} » ?`, en: (n) => `Who created the manga “${n}”?` } },
  inventions: { type: 'attribut', q: { fr: (n) => `Qui a inventé ou découvert : ${n} ?`, en: (n) => `Who invented or discovered: ${n}?` } },
  constellations: { type: 'image', q: { fr: () => 'Quelle est cette constellation ?', en: () => 'Which constellation is this?' } },
  scientifiques: { type: 'image', q: { fr: (_, g) => (g === 'f' ? 'Qui est cette scientifique ?' : 'Qui est ce scientifique ?'), en: () => 'Who is this scientist?' } },
  lunes: { type: 'attribut', q: { fr: (n) => `Autour de quel astre tourne ${n} ?`, en: (n) => `What does ${n} orbit?` } },
  jeux: { type: 'attribut', q: { fr: (n) => `Quel studio a développé « ${n} » ?`, en: (n) => `Which studio developed “${n}”?` } },
  'jeux-annee': { type: 'annee', pack: 'jeux', champ: 'annee', q: { fr: (n) => `En quelle année est sorti « ${n} » ?`, en: (n) => `In what year was “${n}” released?` } },
  'persos-jeux': { type: 'image', q: { fr: () => 'Quel est ce personnage de jeu vidéo ?', en: () => 'Which video game character is this?' } },
  consoles: { type: 'attribut', montrer: true, q: { fr: (n) => `Qui fabrique la console « ${n} » ?`, en: (n) => `Who makes the “${n}” console?` } },
  'departements-numero': { type: 'annee', pack: 'departements', champ: 'numero', q: { fr: (n) => `Quel est le numéro du département : ${n} ?`, en: (n) => `What is the number of the department ${n}?` } },
  'departements-prefecture': { type: 'attribut', pack: 'departements', champ: 'prefecture', q: { fr: (n) => `Quelle est la préfecture de ce département : ${n} ?`, en: (n) => `What is the prefecture of ${n}?` } },
  'departements-region': { type: 'attribut', pack: 'departements', champ: 'region', q: { fr: (n) => `Dans quelle région se trouve ce département : ${n} ?`, en: (n) => `Which region is ${n} in?` } },
  presidents: { type: 'image', q: { fr: () => 'Quel président de la République est-ce ?', en: () => 'Which French president is this?' } },
  montagnes: { type: 'attribut', montrer: true, q: { fr: (n) => `Dans quel pays se trouve : ${n} ?`, en: (n) => `Which country is ${n} in?` } },
  iles: { type: 'attribut', montrer: true, q: { fr: (n) => `À quel pays appartient l’île : ${n} ?`, en: (n) => `Which country does ${n} belong to?` } },
  fleuves: { type: 'attribut', q: { fr: (n) => `Quel pays traverse : ${n} ?`, en: (n) => `Which country does ${n} flow through?` } },
  'etats-us': { type: 'attribut', q: { fr: (n) => `Quelle est la capitale de l’État : ${n} ?`, en: (n) => `What is the capital of ${n}?` } },
  sculptures: { type: 'attribut', montrer: true, q: { fr: (n) => `Qui a sculpté « ${n} » ?`, en: (n) => `Who sculpted “${n}”?` } },
  architecture: { type: 'attribut', montrer: true, q: { fr: (n) => `Qui est l’architecte de : ${n} ?`, en: (n) => `Who was the architect of ${n}?` } },
  compositeurs: { type: 'image', q: { fr: (_, g) => (g === 'f' ? 'Qui est cette compositrice ?' : 'Qui est ce compositeur ?'), en: () => 'Who is this composer?' } },
  mouvements: { type: 'attribut', montrer: true, q: { fr: (n) => `De quel mouvement artistique relève « ${n} » ?`, en: (n) => `Which art movement is “${n}” part of?` } },
  // Vocabulaire : le mot est toujours donné en français, on demande sa traduction
  'traduction-en': { type: 'attribut', pack: 'vocabulaire', champ: 'en', q: { fr: (n) => `Comment dit-on « ${n.toLowerCase()} » en anglais ?`, en: (n) => `How do you say “${n.toLowerCase()}” in English?` } },
  'traduction-es': { type: 'attribut', pack: 'vocabulaire', champ: 'es', q: { fr: (n) => `Comment dit-on « ${n.toLowerCase()} » en espagnol ?`, en: (n) => `How do you say “${n.toLowerCase()}” in Spanish?` } },
  'traduction-de': { type: 'attribut', pack: 'vocabulaire', champ: 'de', q: { fr: (n) => `Comment dit-on « ${n.toLowerCase()} » en allemand ?`, en: (n) => `How do you say “${n.toLowerCase()}” in German?` } },
  'traduction-it': { type: 'attribut', pack: 'vocabulaire', champ: 'it', q: { fr: (n) => `Comment dit-on « ${n.toLowerCase()} » en italien ?`, en: (n) => `How do you say “${n.toLowerCase()}” in Italian?` } },
  extraits: { type: 'audio', q: { fr: () => 'Qui interprète ce titre ?', en: () => 'Who performs this song?' } },
  // Blind tests : mêmes extraits, on demande le titre ou l'album
  'blind-titre': { type: 'audio', pack: 'extraits', champ: 'nom', q: { fr: () => 'Quel est le titre de ce morceau ?', en: () => 'What is the title of this song?' } },
  'blind-album': { type: 'audio', pack: 'extraits', champ: 'f:Album', q: { fr: () => 'De quel album vient ce morceau ?', en: () => 'Which album is this song from?' } },
  'artistes-genre': { type: 'attribut', pack: 'artistes', champ: 'genre', montrer: true, q: { fr: (n) => `Quel est le genre musical de ${n} ?`, en: (n) => `What music genre is ${n} known for?` } },
  studios: { type: 'attribut', q: { fr: (n) => `Quel studio a produit « ${n} » ?`, en: (n) => `Which studio produced “${n}”?` } },
  'studios-annee': { type: 'annee', pack: 'studios', champ: 'annee', q: { fr: (n) => `En quelle année est sorti « ${n} » ?`, en: (n) => `In what year was “${n}” released?` } },
  groupes: { type: 'image', q: { fr: () => 'Quel est ce groupe ?', en: () => 'Which band is this?' } },
  stades: { type: 'attribut', montrer: true, q: { fr: (n) => `Dans quelle ville se trouve : ${n} ?`, en: (n) => `Which city is ${n} in?` } },
  'lieux-jeux': { type: 'attribut', q: { fr: (n) => `Dans quel jeu trouve-t-on : ${n} ?`, en: (n) => `Which game features ${n}?` } },
  sagas: { type: 'attribut', montrer: true, q: { fr: (n) => `Quel éditeur publie la saga « ${n} » ?`, en: (n) => `Who publishes the “${n}” series?` } },
  'persos-univers': { type: 'attribut', pack: 'persos-jeux', champ: 'univers', montrer: true, q: { fr: (n) => `De quel univers vient ${n} ?`, en: (n) => `Which franchise is ${n} from?` } },
} satisfies Record<string, { type: TypeCulture; montrer?: boolean; pack?: string; champ?: string; q: Record<Lang, (nom: string, genre?: string) => string> }>
export type CultureId = keyof typeof CULTURE
export const estCulture = (s: string): s is CultureId => s in CULTURE
export const packCulture = (s: CultureId) => (CULTURE[s] as { pack?: string }).pack ?? s

export type Option = { label: string; image?: string }
export type Fiche = { image?: string; faits: { l: string; v: string }[]; saviez: string; wiki: string }
export type Carte = {
  vue: 'france' | 'monde'
  cible?: [number, number] // lat, lng à placer
  zoomPays?: string // code numérique : la carte se cadre sur ce pays
  surligne?: string // code numérique du pays mis en évidence (QCM « quel est ce pays ? »)
  trouverPays?: string // code numérique du pays à cliquer
  seuilKm: number
}
export type Question = {
  id: string
  enonce: string
  image?: string
  reponse: string
  acceptees: string[]
  options: Option[]
  imagesOnly: boolean
  audio?: string // identifiant de titre Deezer (extrait à écouter)
  s?: SousThemeId // sous-thème d'origine (parties Mix, Express, Survie)
  boss?: boolean // question finale très dure (+30 pièces)
  carte?: Carte
  fiche: Fiche
  format?: 'qcm' | 'libre' | 'assistee' | 'vf' | 'lettres'
  propose?: string // vrai / faux : la réponse proposée
  vraie?: string // vrai / faux : la vraie réponse
  leurres?: string[] // saisie assistée : suggestions pièges
  lettres?: string[] // lettres mélangées
}

export const drapeau = (id: string, w = 320) => `https://flagcdn.com/w${w}/${id}.png`
export const numPays = (n?: string) => (n ?? '').padStart(3, '0')

const caches = new Map<string, unknown>()
async function pack<T>(nom: string): Promise<T> {
  if (!caches.has(nom)) caches.set(nom, await (await fetch(`./packs/${nom}`)).json())
  return caches.get(nom) as T
}
export const chargerPays = async () => (await pack<{ pays: Pays[] }>('pays.json')).pays


const melanger = <T,>(arr: T[]) => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const L = {
  fr: { capital: 'Capitale', continent: 'Continent', population: 'Population', dep: 'Département', country: 'Pays' },
  en: { capital: 'Capital', continent: 'Continent', population: 'Population', dep: 'Department', country: 'Country' },
}
const ordinal = (n: number, lang: Lang) => lang === 'fr'
  ? (n === 1 ? '1er' : `${n}e`)
  : `${n}${n % 100 >= 11 && n % 100 <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10] ?? 'th'}`
const wiki = (titre: string, lang: Lang) => `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(titre)}`

function fichePays(p: Pays, tous: Pays[], lang: Lang): Fiche {
  const fmt = new Intl.NumberFormat(lang === 'fr' ? 'fr-FR' : 'en-GB')
  const rang = ordinal(tous.indexOf(p) + 1, lang)
  const surf = p.superficie ? fmt.format(p.superficie) : ''
  return {
    image: drapeau(p.id),
    faits: [
      ...(p.capitale ? [{ l: L[lang].capital, v: p.capitale[lang] }] : []),
      { l: L[lang].continent, v: p.region[lang] },
      ...(p.population ? [{ l: L[lang].population, v: fmt.format(p.population) }] : []),
    ],
    saviez: lang === 'fr'
      ? `${p.nom.fr} est le ${rang} pays le plus peuplé du monde${surf ? `, pour ${surf} km²` : ''}.`
      : `${p.nom.en} is the world's ${rang} most populous country${surf ? `, covering ${surf} km²` : ''}.`,
    wiki: wiki(p.nom[lang], lang),
  }
}

// Plus un pays est peuplé, plus il est « connu »
const POOL_PAYS = { 1: 40, 2: 90, 3: 150, 4: Infinity } as const
// Paliers de population des villes
const MIN_FR = { 1: 80_000, 2: 20_000, 3: 5_000, 4: 0 } as const
const MIN_MONDE = { 1: 1_500_000, 2: 400_000, 3: 100_000, 4: 15_000 } as const
// Tolérance (km) : large en facile, plus serrée en expert
const SEUIL_FR = { 1: 80, 2: 55, 3: 40, 4: 30 } as const

// Distracteurs « similaires » : même continent d'abord
// Pour les drapeaux : d'abord les sosies (Tchad/Roumanie, Indonésie/Monaco…), même hors de la difficulté choisie
function distracteurs(cible: Pays, pool: Pays[], n: number, tous: Pays[] = [], sosies = false) {
  const autres = pool.filter((p) => p.id !== cible.id)
  const jumeaux = sosies ? melanger(tous.filter((p) => sosiesDe(cible.id).includes(p.id))) : []
  const vus = new Set(jumeaux.map((p) => p.id))
  const reste = [...melanger(autres.filter((p) => p.region.en === cible.region.en)), ...melanger(autres.filter((p) => p.region.en !== cible.region.en))].filter((p) => !vus.has(p.id))
  return [...jumeaux, ...reste].slice(0, n)
}

// Capitales : la plus grande ville du pays (Sydney pour l'Australie…) remplace un leurre quand elle existe
function optionsCapitale(p: Pays, autres: Pays[], lang: Lang, n = 3): Option[] {
  const pieges = (PIEGES_CAPITALES[p.id] ?? []).map(([fr, en]) => (lang === 'fr' ? fr : en))
  const leurres = [...melanger(pieges).slice(0, 2), ...autres.map((x) => x.capitale![lang])]
  const uniques = [...new Set(leurres)].filter((l) => l !== p.capitale![lang]).slice(0, n)
  return melanger([p.capitale![lang], ...uniques]).map((label) => ({ label }))
}

export function distanceKm([lat1, lng1]: [number, number], [lat2, lng2]: [number, number]) {
  const r = Math.PI / 180
  const a = Math.sin(((lat2 - lat1) * r) / 2) ** 2 + Math.cos(lat1 * r) * Math.cos(lat2 * r) * Math.sin(((lng2 - lng1) * r) / 2) ** 2
  return 6371 * 2 * Math.asin(Math.sqrt(a))
}

// max : difficulté la plus haute débloquée (pour le mode Tout)
type Opts = { sousTheme: SousThemeId; difficulte: Difficulte; max?: Palier; nombre: number; mode: Mode; lang: Lang; ids?: string[]; seed?: number }

// Paliers cumulatifs : chaque difficulté contient celles d'en dessous, mais 60 % des questions
// viennent de son propre palier (Expert = surtout du très pointu). Mode Tout : tout ce qui est débloqué.
// Le choix suit la mémoire de l'appareil : jamais vu ou raté d'abord, bien su mis de côté un temps.
function tirer<T>(liste: T[], fin: (d: Palier) => number, o: Opts, idDe: (x: T) => string): { cibles: T[]; pool: T[] } {
  const max = o.max ?? 4
  const d = o.difficulte
  const haut = d === 0 ? max : d === LEGENDE ? 4 : d
  const pool = liste.slice(0, fin(haut))
  if (o.ids) return { cibles: liste.filter((x) => o.ids!.includes(idDe(x))), pool }
  const debut = d === LEGENDE ? fin(3) : d <= 1 ? 0 : fin((d - 1) as Palier)
  const palier = liste.slice(debut, fin(haut))
  const dessous = liste.slice(0, debut)
  // Défi du jour et duels (graine) : même tirage pour tout le monde, sans la mémoire personnelle
  const trier = (l: T[]) => (o.seed ? melanger(l) : prioriser(o.sousTheme, l, idDe, rand))
  const nPalier = dessous.length && d !== LEGENDE ? Math.ceil(o.nombre * 0.6) : o.nombre
  let cibles = [...trier(palier).slice(0, nPalier), ...trier(dessous).slice(0, o.nombre - Math.min(nPalier, palier.length))]
  if (cibles.length < o.nombre) cibles = [...cibles, ...trier(pool.filter((x) => !cibles.includes(x)))].slice(0, o.nombre)
  return { cibles: melanger(cibles), pool }
}
const palierDe = (d: Difficulte): Palier => (d === 0 ? 2 : d === LEGENDE ? 4 : d)

// Générateur pseudo-aléatoire reproductible (mulberry32) : même graine = mêmes questions pour tout le monde
function mulberry32(a: number) {
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
let rand = Math.random

// Mix / Express / Survie : questions piochées dans des quiz variés (sans carte, pour enchaîner vite).
// difficultes : la difficulté de chaque question, dans l'ordre (Survie : de plus en plus dur).
export async function genererMix(o: { quiz: SousThemeId[]; difficultes: Difficulte[]; lang: Lang; max?: Palier }): Promise<Question[]> {
  const possibles = o.quiz.filter((s) => !['villes-fr', 'villes-monde', 'pays-carte'].includes(s))
  const out: Question[] = []
  let precedent = ''
  for (const d of o.difficultes) {
    // Jamais deux fois de suite le même quiz
    const choix = possibles.filter((s) => s !== precedent)
    const s = choix[Math.floor(Math.random() * choix.length)] ?? possibles[0]
    precedent = s
    const [q] = await genererPartie({ sousTheme: s, difficulte: d, max: o.max, nombre: 1, mode: 'qcm', lang: o.lang }).catch(() => [])
    if (q && !out.some((x) => x.id === q.id)) out.push({ ...q, s })
  }
  return out
}

export async function genererPartie(o: Opts): Promise<Question[]> {
  const tous = await chargerPays()
  await (o.sousTheme === 'villes-fr' ? pack('villes-fr.json') : o.sousTheme === 'villes-monde' ? pack('villes-monde.json') : null)
  if (estCulture(o.sousTheme)) await pack(`culture/${packCulture(o.sousTheme)}.json`)
  // Packs chargés avant de fixer la graine : la génération qui suit est synchrone, donc reproductible
  rand = o.seed ? mulberry32(o.seed) : Math.random
  if (estCulture(o.sousTheme)) return culture(o, await pack<ItemCulture[]>(`culture/${packCulture(o.sousTheme)}.json`))
  if (o.sousTheme === 'villes-fr') return villesFrance(o)
  if (o.sousTheme === 'villes-monde') return villesMonde(o, tous)
  return questionsPays(o, tous)
}

function questionsPays(o: Opts, tous: Pays[]): Question[] {
  const { sousTheme, mode: modeChoisi, lang } = o
  const avecCapitale = sousTheme.startsWith('capitales')
  const avecCarte = sousTheme === 'pays-carte'
  const valides = tous.filter((p) => (!avecCapitale || p.capitale) && (!avecCarte || p.num))
  const { cibles, pool } = tirer(valides, (d) => Math.min(valides.length, POOL_PAYS[d]), o, (p) => p.id)
  const mode = sousTheme === 'drapeaux-inverse' ? 'qcm' : modeChoisi

  return cibles.map((p): Question => {
    const nom = (x: Pays) => x.nom[lang]
    const autres = mode === 'qcm' ? distracteurs(p, pool.length >= 4 ? pool : valides, nbLeurres(o.difficulte), valides, sousTheme.startsWith('drapeaux')) : []
    const melange = melanger([p, ...autres])
    const base = { id: p.id, imagesOnly: false, fiche: fichePays(p, tous, lang), acceptees: [p.nom.fr, p.nom.en, ...(p.alias ?? [])], reponse: nom(p) }
    switch (sousTheme) {
      case 'drapeaux':
        return { ...base, enonce: lang === 'fr' ? 'À quel pays appartient ce drapeau ?' : 'Which country does this flag belong to?', image: drapeau(p.id, 640), options: mode === 'qcm' ? melange.map((x) => ({ label: nom(x) })) : [] }
      case 'drapeaux-inverse':
        return { ...base, enonce: lang === 'fr' ? `Quel est le drapeau de ce pays : ${p.nom.fr} ?` : `Which flag belongs to ${p.nom.en}?`, imagesOnly: true, options: melange.map((x) => ({ label: nom(x), image: drapeau(x.id) })) }
      case 'capitales':
        // Le drapeau illustre la question sans donner la capitale
        return { ...base, image: drapeau(p.id, 640), enonce: lang === 'fr' ? `Quelle est la capitale de ce pays : ${p.nom.fr} ?` : `What is the capital of ${p.nom.en}?`, reponse: p.capitale![lang], acceptees: [p.capitale!.fr, p.capitale!.en], options: mode === 'qcm' ? optionsCapitale(p, autres, lang, nbLeurres(o.difficulte)) : [] }
      case 'capitales-inverse':
        return { ...base, enonce: lang === 'fr' ? `${p.capitale!.fr} est la capitale de quel pays ?` : `${p.capitale!.en} is the capital of which country?`, options: mode === 'qcm' ? melange.map((x) => ({ label: nom(x) })) : [] }
      default: // pays-carte : QCM = pays surligné à nommer, libre = cliquer le pays
        return mode === 'qcm'
          ? { ...base, enonce: lang === 'fr' ? 'Quel est ce pays ?' : 'Which country is this?', options: melange.map((x) => ({ label: nom(x) })), carte: { vue: 'monde', surligne: numPays(p.num), seuilKm: 0 } }
          : { ...base, enonce: lang === 'fr' ? `Cliquez sur ce pays : ${p.nom.fr}` : `Click on ${p.nom.en}`, options: [], carte: { vue: 'monde', trouverPays: numPays(p.num), seuilKm: 0 } }
    }
  })
}

async function villesFrance(o: Opts): Promise<Question[]> {
  const { lang } = o
  const difficulte = palierDe(o.difficulte)
  const { deps, villes } = await pack<{ deps: Record<string, string>; villes: Ville[] }>('villes-fr.json')
  const idDe = (v: Ville) => `${v[0]}|${v[4]}`
  const finSeuil = (d: Palier) => { const i = villes.findIndex((v) => v[1] < MIN_FR[d]); return i < 0 ? villes.length : i }
  const { cibles } = tirer(villes, finSeuil, o, idDe)
  const fmt = new Intl.NumberFormat(lang === 'fr' ? 'fr-FR' : 'en-GB')
  return cibles.map(([nom, pop, lat, lng, dep]) => {
    const rang = villes.findIndex((v) => v[0] === nom && v[4] === dep) + 1
    return {
      id: `${nom}|${dep}`, imagesOnly: false, options: [], acceptees: [], reponse: nom,
      enonce: lang === 'fr' ? `Placez ${nom} sur la carte` : `Place ${nom} on the map`,
      carte: { vue: 'france', cible: [lat, lng], seuilKm: SEUIL_FR[difficulte] },
      fiche: {
        faits: [{ l: L[lang].dep, v: `${deps[dep] ?? dep} (${dep})` }, { l: L[lang].population, v: fmt.format(pop) }],
        saviez: lang === 'fr' ? `${nom} est la ${ordinal(rang, lang).replace('1er', '1re')} commune la plus peuplée de France métropolitaine.` : `${nom} is the ${ordinal(rang, lang)} most populous town in mainland France.`,
        wiki: wiki(nom, lang),
      },
    }
  })
}

async function villesMonde(o: Opts, tous: Pays[]): Promise<Question[]> {
  const { lang } = o
  const { villes } = await pack<{ villes: Ville[] }>('villes-monde.json')
  const parCode = new Map(tous.map((p) => [p.id, p]))
  const idDe = (v: Ville) => `${v[0]}|${v[4]}`
  const avecCarte = villes.filter((v) => parCode.get(v[4])?.num)
  const finSeuil = (d: Palier) => { const i = avecCarte.findIndex((v) => v[1] < MIN_MONDE[d]); return i < 0 ? avecCarte.length : i }
  const { cibles } = tirer(avecCarte, finSeuil, o, idDe)
  const fmt = new Intl.NumberFormat(lang === 'fr' ? 'fr-FR' : 'en-GB')
  return cibles.map(([nom, pop, lat, lng, cc]) => {
    const p = parCode.get(cc)!
    const rangPays = villes.filter((v) => v[4] === cc).findIndex((v) => v[0] === nom) + 1
    // Seuil proportionnel à la taille du pays : 30 km au Luxembourg, ~400 km en Russie
    const seuil = Math.max(50, Math.round(Math.sqrt(p.superficie || 10000) * 0.15))
    return {
      id: `${nom}|${cc}`, imagesOnly: false, options: [], acceptees: [], reponse: nom,
      enonce: lang === 'fr' ? `Placez ${nom} (${p.nom.fr})` : `Place ${nom} (${p.nom.en})`,
      carte: { vue: 'monde', cible: [lat, lng], zoomPays: numPays(p.num), seuilKm: seuil },
      fiche: {
        image: drapeau(cc),
        faits: [{ l: L[lang].country, v: p.nom[lang] }, { l: L[lang].population, v: fmt.format(pop) }],
        saviez: lang === 'fr'
          ? (rangPays === 1 ? `${nom} est la ville la plus peuplée du pays.` : `${nom} est la ${rangPays}e ville la plus peuplée du pays.`)
          : (rangPays === 1 ? `${nom} is the country's most populous city.` : `${nom} is the country's ${ordinal(rangPays, lang)} most populous city.`),
        wiki: wiki(nom, lang),
      },
    }
  })
}

// Les éléments sont triés du plus connu au moins connu (nombre d'articles Wikipédia)
const POOL_CULTURE = { 1: 60, 2: 150, 3: 300, 4: Infinity } as const
const texte = (v: string | Texte | undefined, lang: Lang) => (v === undefined ? '' : typeof v === 'string' ? v : v[lang])

function culture(o: Opts, tousItems: ItemCulture[]): Question[] {
  const { sousTheme, mode, lang } = o
  const difficulte = palierDe(o.difficulte)
  const cfg = CULTURE[sousTheme as CultureId] as { type: TypeCulture; montrer?: boolean; champ?: string; q: Record<Lang, (nom: string, genre?: string) => string> }
  // Question dérivée (année d'un film, pays d'une personnalité…) : la réponse vient d'un champ annexe
  // Champ « nom » : le nom lui-même ; « f:Libellé » : un fait de la fiche ; sinon un attribut x (ou la réponse r)
  const champ = (cfg as { champ?: string }).champ
  const val = (it: ItemCulture) => (champ === 'nom' ? it.n : champ?.startsWith('f:') ? it.f?.find(([l]) => l.fr === champ.slice(2))?.[1] : champ ? it.x?.[champ] : it.r)
  // Traduction identique au mot français (« sari » → « sari ») : question sans intérêt, on l'écarte
  const simple = (v: string) => v.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  const items = cfg.type === 'image' ? tousItems : tousItems.filter((it) => val(it) && !(sousTheme.startsWith('traduction') && simple(texte(val(it), 'fr')) === simple(it.n.fr)))
  const { cibles, pool } = tirer(items, (d) => Math.min(items.length, POOL_CULTURE[d]), o, (it) => it.id)
  // Années proposées autour de la bonne : à 1 ou 2 ans près en difficile
  // Légende : toutes les années à 1, 2 ou 3 ans près
  const ecarts = o.difficulte === LEGENDE ? [-3, -2, -1, 1, 2, 3] : { 1: [-15, -10, -7, -5, 5, 7, 10, 15], 2: [-6, -4, -3, -2, 2, 3, 4, 6], 3: [-3, -2, -1, 1, 2, 3], 4: [-2, -1, 1, 2] }[difficulte]
  const nb = nbLeurres(o.difficulte)
  const symboles = sousTheme === 'elements' ? items.map((x) => texte(val(x), lang)) : []

  return cibles.map((it): Question => {
    const nom = it.n[lang]
    const reponse = cfg.type === 'image' ? nom : texte(val(it), lang)
    const acceptees = cfg.type === 'image' ? [it.n.fr, it.n.en] : [val(it)!, ...(cfg.champ ? [] : it.alt ?? [])].flatMap((v) => (typeof v === 'string' ? [v] : [v.fr, v.en]))

    let options: Option[] = []
    if (mode === 'qcm') {
      // Les autres réponses valables (2e langue officielle…) ne doivent pas servir de leurre
      const vus = new Set([reponse, ...(it.alt ?? []).map((v) => texte(v, lang))])
      const autres: string[] = []
      if (cfg.type === 'annee') {
        for (const d of melanger(ecarts)) {
          const y = String(Number(reponse) + d)
          if (!vus.has(y)) { vus.add(y); autres.push(y) }
          if (autres.length === nb) break
        }
      } else if (sousTheme === 'elements') {
        for (const s of melanger(piegesSymbole(it.n.fr, it.n.en, reponse, symboles))) {
          if (!vus.has(s)) { vus.add(s); autres.push(s) }
          if (autres.length === nb) break
        }
      } else {
        // Distracteurs du même groupe d'abord (même genre, même classe d'animaux…)
        const memes = melanger((o.difficulte === LEGENDE ? items : pool).filter((x) => x.g && x.g === it.g))
        const cand = [...memes, ...melanger(pool.length >= 4 ? pool : items)]
        for (const x of cand) {
          const v = cfg.type === 'image' ? x.n[lang] : texte(val(x), lang)
          if (v && !vus.has(v)) { vus.add(v); autres.push(v) }
          if (autres.length === nb) break
        }
      }
      options = melanger([reponse, ...autres]).map((label) => ({ label }))
    }

    const faits = (it.f ?? []).filter(([, v]) => v).map(([l, v]) => ({ l: l[lang], v: texte(v, lang) }))
    const desc = it.d?.[lang]
    return {
      id: it.id,
      enonce: cfg.q[lang](nom, it.g),
      image: cfg.type === 'image' || cfg.montrer ? it.img : undefined,
      audio: cfg.type === 'audio' ? it.id : undefined,
      reponse,
      acceptees,
      options,
      imagesOnly: false,
      fiche: {
        image: it.img,
        faits: cfg.type === 'image' ? faits : [{ l: lang === 'fr' ? 'Réponse' : 'Answer', v: reponse }, ...faits],
        saviez: desc ? `${nom} : ${desc}.` : nom,
        wiki: wiki(nom, lang),
      },
    }
  })
}

// Toutes les images d'un sous-thème (pour le téléchargement hors ligne)
export async function imagesDe(s: SousThemeId): Promise<string[]> {
  if (estCulture(s)) return (await pack<ItemCulture[]>(`culture/${packCulture(s)}.json`)).map((it) => it.img).filter((x): x is string => !!x)
  if (s.startsWith('drapeaux') || s.startsWith('capitales') || s === 'villes-monde') {
    const tous = await chargerPays()
    return tous.flatMap((p) => [drapeau(p.id), ...(s === 'drapeaux' ? [drapeau(p.id, 640)] : [])])
  }
  return [] // cartes et villes de France : déjà dans l'app
}

// XP : 10 par bonne réponse, ×1.5 en saisie libre ou sur carte, + bonus de difficulté
export function calculerXp(bonnes: number, mode: Mode, difficulte: number) {
  return Math.round(bonnes * 10 * (mode === 'libre' ? 1.5 : 1) * (1 + (difficulte - 1) * 0.25))
}
