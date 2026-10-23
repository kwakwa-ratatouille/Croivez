import type { Lang } from '../i18n'

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
export type Difficulte = 0 | 1 | 2 | 3 | 4 // 0 = auto

export type SousThemeId = 'drapeaux' | 'drapeaux-inverse' | 'capitales' | 'capitales-inverse' | 'villes-fr' | 'villes-monde' | 'pays-carte' | CultureId

// Thèmes générés depuis Wikidata (scripts/build-culture.mjs)
type Texte = Record<Lang, string>
export type ItemCulture = { id: string; n: Texte; d?: Texte; img?: string; r?: string | Texte; g?: string; alt?: Texte[]; f?: [Texte, string | Texte | undefined][] }
type TypeCulture = 'image' | 'attribut' | 'annee' | 'audio'
const CULTURE = {
  films: { type: 'attribut', q: { fr: (n) => `Qui a réalisé « ${n} » ?`, en: (n) => `Who directed “${n}”?` } },
  series: { type: 'annee', q: { fr: (n) => `En quelle année a débuté la série « ${n} » ?`, en: (n) => `In what year did “${n}” first air?` } },
  acteurs: { type: 'image', q: { fr: (_, g) => (g === 'f' ? 'Qui est cette actrice ?' : 'Qui est cet acteur ?'), en: () => 'Who is this actor?' } },
  artistes: { type: 'image', q: { fr: (_, g) => (g === 'f' ? 'Qui est cette artiste ?' : 'Qui est cet artiste ?'), en: () => 'Who is this artist?' } },
  albums: { type: 'attribut', q: { fr: (n) => `Quel artiste a sorti l’album « ${n} » ?`, en: (n) => `Which artist released the album “${n}”?` } },
  animaux: { type: 'image', q: { fr: () => 'Quel est cet animal ?', en: () => 'What is this animal?' } },
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
  extraits: { type: 'audio', q: { fr: () => 'Qui interprète ce titre ?', en: () => 'Who performs this song?' } },
} satisfies Record<string, { type: TypeCulture; montrer?: boolean; q: Record<Lang, (nom: string, genre?: string) => string> }>
export type CultureId = keyof typeof CULTURE
export const estCulture = (s: string): s is CultureId => s in CULTURE

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
  carte?: Carte
  fiche: Fiche
}

export const drapeau = (id: string, w = 320) => `https://flagcdn.com/w${w}/${id}.png`
export const numPays = (n?: string) => (n ?? '').padStart(3, '0')

const caches = new Map<string, unknown>()
async function pack<T>(nom: string): Promise<T> {
  if (!caches.has(nom)) caches.set(nom, await (await fetch(`./packs/${nom}`)).json())
  return caches.get(nom) as T
}
export const chargerPays = async () => (await pack<{ pays: Pays[] }>('pays.json')).pays

export function difficulteAuto(maitrise = 0): 1 | 2 | 3 | 4 {
  return maitrise < 30 ? 1 : maitrise < 55 ? 2 : maitrise < 80 ? 3 : 4
}

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
const SEUIL_FR = { 1: 50, 2: 35, 3: 25, 4: 20 } as const

// Distracteurs « similaires » : même continent d'abord
function distracteurs(cible: Pays, pool: Pays[], n: number) {
  const autres = pool.filter((p) => p.id !== cible.id)
  return [...melanger(autres.filter((p) => p.region.en === cible.region.en)), ...melanger(autres.filter((p) => p.region.en !== cible.region.en))].slice(0, n)
}

export function distanceKm([lat1, lng1]: [number, number], [lat2, lng2]: [number, number]) {
  const r = Math.PI / 180
  const a = Math.sin(((lat2 - lat1) * r) / 2) ** 2 + Math.cos(lat1 * r) * Math.cos(lat2 * r) * Math.sin(((lng2 - lng1) * r) / 2) ** 2
  return 6371 * 2 * Math.asin(Math.sqrt(a))
}

type Opts = { sousTheme: SousThemeId; difficulte: 1 | 2 | 3 | 4; nombre: number; mode: Mode; lang: Lang; ids?: string[]; seed?: number }

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

export async function genererPartie(o: Opts): Promise<Question[]> {
  const tous = await chargerPays()
  await (o.sousTheme === 'villes-fr' ? pack('villes-fr.json') : o.sousTheme === 'villes-monde' ? pack('villes-monde.json') : null)
  if (estCulture(o.sousTheme)) await pack(`culture/${o.sousTheme}.json`)
  // Packs chargés avant de fixer la graine : la génération qui suit est synchrone, donc reproductible
  rand = o.seed ? mulberry32(o.seed) : Math.random
  if (estCulture(o.sousTheme)) return culture(o, await pack<ItemCulture[]>(`culture/${o.sousTheme}.json`))
  if (o.sousTheme === 'villes-fr') return villesFrance(o)
  if (o.sousTheme === 'villes-monde') return villesMonde(o, tous)
  return questionsPays(o, tous)
}

function questionsPays({ sousTheme, difficulte, nombre, mode: modeChoisi, lang, ids }: Opts, tous: Pays[]): Question[] {
  const avecCapitale = sousTheme.startsWith('capitales')
  const avecCarte = sousTheme === 'pays-carte'
  const valides = tous.filter((p) => (!avecCapitale || p.capitale) && (!avecCarte || p.num))
  const pool = valides.slice(0, POOL_PAYS[difficulte])
  const cibles = ids ? valides.filter((p) => ids.includes(p.id)) : melanger(pool).slice(0, nombre)
  const mode = sousTheme === 'drapeaux-inverse' ? 'qcm' : modeChoisi

  return cibles.map((p): Question => {
    const nom = (x: Pays) => x.nom[lang]
    const autres = mode === 'qcm' ? distracteurs(p, pool.length >= 4 ? pool : valides, 3) : []
    const melange = melanger([p, ...autres])
    const base = { id: p.id, imagesOnly: false, fiche: fichePays(p, tous, lang), acceptees: [p.nom.fr, p.nom.en, ...(p.alias ?? [])], reponse: nom(p) }
    switch (sousTheme) {
      case 'drapeaux':
        return { ...base, enonce: lang === 'fr' ? 'À quel pays appartient ce drapeau ?' : 'Which country does this flag belong to?', image: drapeau(p.id, 640), options: mode === 'qcm' ? melange.map((x) => ({ label: nom(x) })) : [] }
      case 'drapeaux-inverse':
        return { ...base, enonce: lang === 'fr' ? `Quel est le drapeau de ce pays : ${p.nom.fr} ?` : `Which flag belongs to ${p.nom.en}?`, imagesOnly: true, options: melange.map((x) => ({ label: nom(x), image: drapeau(x.id) })) }
      case 'capitales':
        return { ...base, enonce: lang === 'fr' ? `Quelle est la capitale de ce pays : ${p.nom.fr} ?` : `What is the capital of ${p.nom.en}?`, reponse: p.capitale![lang], acceptees: [p.capitale!.fr, p.capitale!.en], options: mode === 'qcm' ? melange.map((x) => ({ label: x.capitale![lang] })) : [] }
      case 'capitales-inverse':
        return { ...base, enonce: lang === 'fr' ? `${p.capitale!.fr} est la capitale de quel pays ?` : `${p.capitale!.en} is the capital of which country?`, options: mode === 'qcm' ? melange.map((x) => ({ label: nom(x) })) : [] }
      default: // pays-carte : QCM = pays surligné à nommer, libre = cliquer le pays
        return mode === 'qcm'
          ? { ...base, enonce: lang === 'fr' ? 'Quel est ce pays ?' : 'Which country is this?', options: melange.map((x) => ({ label: nom(x) })), carte: { vue: 'monde', surligne: numPays(p.num), seuilKm: 0 } }
          : { ...base, enonce: lang === 'fr' ? `Cliquez sur ce pays : ${p.nom.fr}` : `Click on ${p.nom.en}`, options: [], carte: { vue: 'monde', trouverPays: numPays(p.num), seuilKm: 0 } }
    }
  })
}

async function villesFrance({ difficulte, nombre, lang, ids }: Opts): Promise<Question[]> {
  const { deps, villes } = await pack<{ deps: Record<string, string>; villes: Ville[] }>('villes-fr.json')
  const idDe = (v: Ville) => `${v[0]}|${v[4]}`
  const pool = villes.filter((v) => v[1] >= MIN_FR[difficulte]).slice(0, difficulte === 4 ? Infinity : 4000)
  const cibles = ids ? villes.filter((v) => ids.includes(idDe(v))) : melanger(pool).slice(0, nombre)
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

async function villesMonde({ difficulte, nombre, lang, ids }: Opts, tous: Pays[]): Promise<Question[]> {
  const { villes } = await pack<{ villes: Ville[] }>('villes-monde.json')
  const parCode = new Map(tous.map((p) => [p.id, p]))
  const idDe = (v: Ville) => `${v[0]}|${v[4]}`
  const pool = villes.filter((v) => v[1] >= MIN_MONDE[difficulte] && parCode.get(v[4])?.num)
  const cibles = ids ? villes.filter((v) => ids.includes(idDe(v))) : melanger(pool).slice(0, nombre)
  const fmt = new Intl.NumberFormat(lang === 'fr' ? 'fr-FR' : 'en-GB')
  return cibles.map(([nom, pop, lat, lng, cc]) => {
    const p = parCode.get(cc)!
    const rangPays = villes.filter((v) => v[4] === cc).findIndex((v) => v[0] === nom) + 1
    // Seuil proportionnel à la taille du pays : 30 km au Luxembourg, ~400 km en Russie
    const seuil = Math.max(30, Math.round(Math.sqrt(p.superficie || 10000) * 0.1))
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

function culture({ sousTheme, difficulte, nombre, mode, lang, ids }: Opts, items: ItemCulture[]): Question[] {
  const cfg = CULTURE[sousTheme as CultureId]
  const pool = items.slice(0, POOL_CULTURE[difficulte])
  const cibles = ids ? items.filter((it) => ids.includes(it.id)) : melanger(pool).slice(0, nombre)
  const ecart = { 1: 25, 2: 12, 3: 6, 4: 3 }[difficulte] // années proposées autour de la bonne

  return cibles.map((it): Question => {
    const nom = it.n[lang]
    const reponse = cfg.type === 'image' ? nom : texte(it.r, lang)
    const acceptees = cfg.type === 'image' ? [it.n.fr, it.n.en] : [it.r!, ...(it.alt ?? [])].flatMap((v) => (typeof v === 'string' ? [v] : [v.fr, v.en]))

    let options: Option[] = []
    if (mode === 'qcm') {
      // Les autres réponses valables (2e langue officielle…) ne doivent pas servir de leurre
      const vus = new Set([reponse, ...(it.alt ?? []).map((v) => texte(v, lang))])
      const autres: string[] = []
      if (cfg.type === 'annee') {
        while (autres.length < 3) {
          const y = String(Number(reponse) + Math.round((rand() * 2 - 1) * ecart) || 1)
          if (!vus.has(y)) { vus.add(y); autres.push(y) }
        }
      } else {
        // Distracteurs du même groupe d'abord (même genre, même classe d'animaux…)
        const cand = [...melanger(pool.filter((x) => x.g && x.g === it.g)), ...melanger(pool.length >= 4 ? pool : items)]
        for (const x of cand) {
          const v = cfg.type === 'image' ? x.n[lang] : texte(x.r, lang)
          if (v && !vus.has(v)) { vus.add(v); autres.push(v) }
          if (autres.length === 3) break
        }
      }
      options = melanger([reponse, ...autres]).map((label) => ({ label }))
    }

    const faits = (it.f ?? []).filter(([, v]) => v).map(([l, v]) => ({ l: l[lang], v: texte(v, lang) }))
    const desc = it.d?.[lang]
    return {
      id: it.id,
      enonce: cfg.q[lang](nom, it.g),
      image: cfg.type === 'image' || ('montrer' in cfg && cfg.montrer) ? it.img : undefined,
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

// XP : 10 par bonne réponse, ×1.5 en saisie libre ou sur carte, + bonus de difficulté
export function calculerXp(bonnes: number, mode: Mode, difficulte: number) {
  return Math.round(bonnes * 10 * (mode === 'libre' ? 1.5 : 1) * (1 + (difficulte - 1) * 0.25))
}
