import type { Lang } from '../i18n'

export type Pays = {
  id: string
  nom: Record<Lang, string>
  alias?: string[]
  capitale: Record<Lang, string> | null
  region: Record<Lang, string>
  population: number
  superficie: number
  latlng: [number, number] | null
}

export type Mode = 'qcm' | 'libre'
export type Difficulte = 0 | 1 | 2 | 3 | 4 // 0 = auto

export type SousThemeId = 'drapeaux' | 'drapeaux-inverse' | 'capitales' | 'capitales-inverse'

export type Option = { label: string; image?: string }
export type Question = {
  pays: Pays
  enonce: string
  image?: string // drapeau affiché dans l'énoncé
  reponse: string
  acceptees: string[]
  options: Option[] // vide en saisie libre
  imagesOnly: boolean // QCM de 4 drapeaux
}

export const drapeau = (id: string, w = 320) => `https://flagcdn.com/w${w}/${id}.png`

let cache: Pays[] | null = null
export async function chargerPays(): Promise<Pays[]> {
  if (cache) return cache
  const res = await fetch('./packs/pays.json')
  cache = (await res.json()).pays as Pays[]
  return cache
}

// Les pays sont triés par population : plus un pays est peuplé, plus il est « connu »
const TAILLE_POOL = { 1: 40, 2: 90, 3: 150, 4: Infinity } as const

export function difficulteAuto(maitrise = 0): 1 | 2 | 3 | 4 {
  return maitrise < 30 ? 1 : maitrise < 55 ? 2 : maitrise < 80 ? 3 : 4
}

const melanger = <T,>(arr: T[]) => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Distracteurs « similaires » : même continent d'abord, puis le reste du monde
function distracteurs(cible: Pays, tous: Pays[], n: number, ok: (p: Pays) => boolean) {
  const voisins = melanger(tous.filter((p) => p.id !== cible.id && ok(p) && p.region.en === cible.region.en))
  const autres = melanger(tous.filter((p) => p.id !== cible.id && ok(p) && p.region.en !== cible.region.en))
  return [...voisins, ...autres].slice(0, n)
}

const enonces: Record<SousThemeId, Record<Lang, (p: Pays, l: Lang) => string>> = {
  'drapeaux': { fr: () => 'À quel pays appartient ce drapeau ?', en: () => 'Which country does this flag belong to?' },
  'drapeaux-inverse': { fr: (p) => `Quel est le drapeau de ce pays : ${p.nom.fr} ?`, en: (p) => `Which flag belongs to ${p.nom.en}?` },
  'capitales': { fr: (p) => `Quelle est la capitale de ce pays : ${p.nom.fr} ?`, en: (p) => `What is the capital of ${p.nom.en}?` },
  'capitales-inverse': { fr: (p) => `${p.capitale?.fr} est la capitale de quel pays ?`, en: (p) => `${p.capitale?.en} is the capital of which country?` },
}

export function genererPartie(opts: {
  tous: Pays[]; sousTheme: SousThemeId; difficulte: 1 | 2 | 3 | 4; nombre: number; mode: Mode; lang: Lang; ids?: string[]
}): Question[] {
  const { tous, sousTheme, difficulte, nombre, lang } = opts
  const avecCapitale = sousTheme.startsWith('capitales')
  const valide = (p: Pays) => !avecCapitale || !!p.capitale
  const pool = tous.filter(valide).slice(0, TAILLE_POOL[difficulte])
  const cibles = opts.ids ? tous.filter((p) => opts.ids!.includes(p.id)) : melanger(pool).slice(0, nombre)
  // Le choix d'un drapeau parmi 4 n'a de sens qu'en QCM
  const mode = sousTheme === 'drapeaux-inverse' ? 'qcm' : opts.mode

  return cibles.map((p) => {
    const nomPays = (x: Pays) => x.nom[lang]
    const q: Question = {
      pays: p,
      enonce: enonces[sousTheme][lang](p, lang),
      reponse: '',
      acceptees: [],
      options: [],
      imagesOnly: false,
    }
    const autres = mode === 'qcm' ? distracteurs(p, pool.length >= 4 ? pool : tous, 3, valide) : []
    switch (sousTheme) {
      case 'drapeaux':
      case 'capitales-inverse':
        if (sousTheme === 'drapeaux') q.image = drapeau(p.id, 640)
        q.reponse = nomPays(p)
        q.acceptees = [p.nom.fr, p.nom.en, ...(p.alias ?? [])]
        q.options = melanger([p, ...autres]).map((x) => ({ label: nomPays(x) }))
        break
      case 'drapeaux-inverse':
        q.reponse = nomPays(p)
        q.imagesOnly = true
        q.options = melanger([p, ...autres]).map((x) => ({ label: nomPays(x), image: drapeau(x.id) }))
        break
      case 'capitales':
        q.reponse = p.capitale![lang]
        q.acceptees = [p.capitale!.fr, p.capitale!.en]
        q.options = melanger([p, ...autres]).map((x) => ({ label: x.capitale![lang] }))
        break
    }
    if (mode === 'libre') q.options = []
    return q
  })
}

// XP : 10 par bonne réponse, ×1.5 en saisie libre, + bonus de difficulté
export function calculerXp(bonnes: number, mode: Mode, difficulte: number) {
  return Math.round(bonnes * 10 * (mode === 'libre' ? 1.5 : 1) * (1 + (difficulte - 1) * 0.25))
}
