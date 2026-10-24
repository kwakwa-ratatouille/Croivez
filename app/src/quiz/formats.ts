import type { Lang } from '../i18n'
import { natureQuiz, type Question } from './engine'

// Formats de réponse : le moteur fabrique un QCM, on le transforme ici question par question
// « surprise » : un mini-jeu tiré au hasard, le même pour toute la série
export type Format = 'qcm' | 'libre' | 'assistee' | 'vf' | 'lettres' | 'auto' | 'surprise'
export const FORMATS: { v: Format; fr: string; en: string }[] = [
  { v: 'qcm', fr: 'QCM', en: 'Choices' }, { v: 'auto', fr: 'Auto', en: 'Auto' }, { v: 'surprise', fr: 'Mini-jeu surprise', en: 'Surprise mini-game' }, { v: 'vf', fr: 'Vrai / faux', en: 'True / false' },
  { v: 'assistee', fr: 'Assistée', en: 'Assisted' }, { v: 'lettres', fr: 'Lettres', en: 'Letters' }, { v: 'libre', fr: 'Libre', en: 'Free' },
]

// ——— Mini-jeux : une série entière se joue avec la même règle, tirée au hasard ———
export type MiniJeu = 'qcm' | 'vf' | 'duo' | 'lettres' | 'flou' | 'eclair' | 'assistee' | 'avantapres' | 'flash' | 'zoom'
export type InfoMiniJeu = { v: MiniJeu; nom: Record<Lang, string>; desc: Record<Lang, string>; icone: string; chrono?: number; nature?: 'image' | 'annee' }
export const MINI_JEUX: InfoMiniJeu[] = [
  { v: 'qcm', nom: { fr: 'Quiz classique', en: 'Classic quiz' }, desc: { fr: 'Quatre propositions, une seule est la bonne.', en: 'Four choices, one is right.' }, icone: '🎯' },
  { v: 'vf', nom: { fr: 'Vrai ou faux', en: 'True or false' }, desc: { fr: 'Une réponse est proposée : vraie ou fausse ? Fie-toi à ton instinct.', en: 'An answer is suggested: true or false?' }, icone: '⚖️' },
  { v: 'duo', nom: { fr: 'Pile ou face', en: 'Heads or tails' }, desc: { fr: 'Deux choix seulement… mais 7 secondes pour trancher.', en: 'Only two choices… but 7 seconds to decide.' }, icone: '🪙', chrono: 7 },
  { v: 'eclair', nom: { fr: 'Éclair', en: 'Lightning' }, desc: { fr: 'Quatre propositions, 5 secondes par question. Pas le temps de réfléchir !', en: 'Four choices, 5 seconds each. No time to think!' }, icone: '⚡', chrono: 5 },
  { v: 'flou', nom: { fr: 'Photo floue', en: 'Blurry photo' }, desc: { fr: 'L’image se dévoile peu à peu : plus tu réponds tôt, plus tu marques.', en: 'The picture sharpens slowly: answer early to score more.' }, icone: '🔍', nature: 'image' },
  { v: 'flash', nom: { fr: 'Flash', en: 'Flash' }, desc: { fr: 'L’image n’apparaît qu’une seconde et demie : ouvre grand les yeux, puis réponds de mémoire.', en: 'The picture shows for 1.5 s only: answer from memory.' }, icone: '📸', nature: 'image' },
  { v: 'zoom', nom: { fr: 'Zoom', en: 'Zoom' }, desc: { fr: 'On part d’un très gros plan qui se dézoome peu à peu : devine le plus tôt possible.', en: 'Starts as an extreme close-up that slowly zooms out.' }, icone: '🔎', nature: 'image' },
  { v: 'avantapres', nom: { fr: 'Avant ou après ?', en: 'Before or after?' }, desc: { fr: 'Une année est proposée : la bonne réponse est-elle avant ou après ?', en: 'A year is shown: is the answer before or after?' }, icone: '⏳', nature: 'annee' },
  { v: 'lettres', nom: { fr: 'Lettres mélangées', en: 'Scrambled letters' }, desc: { fr: 'Les lettres de la réponse sont données en vrac : remets-les dans l’ordre.', en: 'Unscramble the letters of the answer.' }, icone: '🔤' },
  { v: 'assistee', nom: { fr: 'À toi d’écrire', en: 'Type it' }, desc: { fr: 'Tape la réponse, des suggestions (parfois pièges) t’aident.', en: 'Type the answer, with (sometimes tricky) suggestions.' }, icone: '⌨️' },
]
export const infoMiniJeu = (v?: string | null) => MINI_JEUX.find((m) => m.v === v)

// Mini-jeux autorisés en partie aléatoire (réglage de l'appareil)
export function miniJeuxAutorises(): MiniJeu[] {
  try {
    const l = JSON.parse(localStorage.getItem('miniJeux') ?? 'null') as MiniJeu[] | null
    const ok = (l ?? []).filter((v) => MINI_JEUX.some((m) => m.v === v))
    return ok.length ? ok : MINI_JEUX.map((m) => m.v)
  } catch { return MINI_JEUX.map((m) => m.v) }
}

// Tire un mini-jeu compatible : avec un quiz donné, on écarte ce qui n'a pas de sens
// (photo floue sans photo, avant / après sans année) ; jamais deux fois de suite le même
export function tirerMiniJeu(quiz?: string): MiniJeu {
  let precedent = ''
  try { precedent = localStorage.getItem('dernierMiniJeu') ?? '' } catch { /* stockage indisponible */ }
  const nature = quiz ? natureQuiz(quiz) : null
  const possibles = miniJeuxAutorises().filter((v) => {
    const m = infoMiniJeu(v)!
    if (nature === 'carte') return false
    if (m.nature && nature && m.nature !== nature) return false
    return v !== precedent
  })
  const choix = possibles[Math.floor(Math.random() * possibles.length)] ?? 'qcm'
  try { localStorage.setItem('dernierMiniJeu', choix) } catch { /* stockage indisponible */ }
  return choix
}

// Auto : le format change à chaque question, tiré au hasard avec des poids selon la difficulté
// (Facile : surtout des choix ; Expert : surtout de la saisie). Jamais deux fois de suite le même.
type Tirage = MiniJeu | 'libre'
const POIDS_AUTO: Record<number, Partial<Record<Tirage, number>>> = {
  0: { qcm: 3, vf: 2, duo: 2, flou: 2, flash: 2, zoom: 2, avantapres: 2, lettres: 2, assistee: 2, libre: 1 },
  1: { qcm: 4, vf: 3, duo: 3, flou: 2, avantapres: 2, lettres: 1 },
  2: { qcm: 3, vf: 2, duo: 1, flou: 2, flash: 1, zoom: 2, avantapres: 2, lettres: 2, assistee: 2 },
  3: { qcm: 2, vf: 2, flou: 2, flash: 2, zoom: 2, avantapres: 2, lettres: 3, assistee: 3, libre: 1 },
  4: { qcm: 1, vf: 1, flou: 1, avantapres: 1, lettres: 2, assistee: 3, libre: 4 },
  5: { qcm: 3, vf: 1, flou: 1, avantapres: 1, lettres: 2, assistee: 2, libre: 2 },
}
let dernierAuto = ''
function tirerAuto(q: Question, d: number): Tirage {
  const poids = POIDS_AUTO[d] ?? POIDS_AUTO[0]
  const annee = /^\d{3,4}$/.test(q.reponse)
  const cand = (Object.entries(poids) as [Tirage, number][]).filter(([v]) =>
    v !== dernierAuto && (!['flou', 'flash', 'zoom'].includes(v) || !!q.image) && (v !== 'avantapres' || annee)
    // Saisie et lettres : réponses trop longues (expressions, sigles…) → injouables
    && (!['libre', 'assistee', 'lettres'].includes(v) || q.reponse.length <= (v === 'lettres' ? 14 : 28)))
  let x = Math.random() * cand.reduce((n, [, p]) => n + p, 0)
  for (const [v, p] of cand) { x -= p; if (x <= 0) { dernierAuto = v; return v } }
  return 'qcm'
}

const melanger = (mot: string): string[] => {
  const l = [...mot.toUpperCase()].filter((c) => c.trim())
  for (let i = l.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [l[i], l[j]] = [l[j], l[i]] }
  return l.join('') === mot.toUpperCase().replace(/\s/g, '') && new Set(l).size > 1 ? melanger(mot) : l
}

function vraiFaux(q: Question, lang: Lang): Question {
  const leurres = q.options.map((o) => o.label).filter((l) => l !== q.reponse)
  const vrai = Math.random() < 0.5 || !leurres.length
  const propose = vrai ? q.reponse : leurres[Math.floor(Math.random() * leurres.length)]
  const [v, x] = lang === 'fr' ? ['Vrai', 'Faux'] : ['True', 'False']
  return { ...q, format: 'vf', propose, vraie: q.reponse, reponse: vrai ? v : x, acceptees: [vrai ? v : x], options: [{ label: v }, { label: x }] }
}

export function appliquerFormat(q: Question, f: Format, d: number, lang: Lang): Question {
  // Cartes, choix en images et vrai / faux imposé restent tels quels
  if (q.carte || q.imagesOnly || q.fixe || !q.options.length) return q
  if (f === 'auto' || f === 'surprise') {
    const t = tirerAuto(q, d)
    const out = t === 'libre' ? { ...q, format: 'libre' as const, options: [] } : appliquerMiniJeu(q, t, lang)
    return { ...out, jeu: t } // affiché en pastille : on sait à quoi on joue à chaque question
  }
  const fmt = f
  const leurres = q.options.map((o) => o.label).filter((l) => l !== q.reponse)
  if (fmt === 'qcm') return { ...q, format: 'qcm' }
  if (fmt === 'vf') return vraiFaux(q, lang)
  return { ...q, format: fmt, options: [], leurres, lettres: fmt === 'lettres' ? melanger(q.reponse) : undefined }
}

export function appliquerMiniJeu(q: Question, mj: MiniJeu, lang: Lang): Question {
  if (q.carte || q.imagesOnly || q.fixe || !q.options.length) return q
  const leurres = q.options.map((o) => o.label).filter((l) => l !== q.reponse)
  switch (mj) {
    case 'vf': return vraiFaux(q, lang)
    case 'duo': {
      const autre = leurres[Math.floor(Math.random() * leurres.length)]
      return { ...q, format: 'qcm', options: (Math.random() < 0.5 ? [q.reponse, autre] : [autre, q.reponse]).map((label) => ({ label })) }
    }
    case 'flou': return { ...q, format: 'qcm', flou: !!q.image }
    case 'flash': return { ...q, format: 'qcm', effet: q.image ? 'flash' : undefined }
    case 'zoom': return { ...q, format: 'qcm', effet: q.image ? 'zoom' : undefined }
    case 'avantapres': {
      const y = Number(q.reponse)
      if (!/^\d{3,4}$/.test(q.reponse)) return { ...q, format: 'qcm' }
      const ecart = [1, 2, 3, 5, 8, 12][Math.floor(Math.random() * 6)] * (Math.random() < 0.5 ? -1 : 1)
      const pivot = y + ecart
      const [av, ap] = lang === 'fr' ? [`Avant ${pivot}`, `Après ${pivot}`] : [`Before ${pivot}`, `After ${pivot}`]
      return { ...q, format: 'qcm', vraie: q.reponse, reponse: y < pivot ? av : ap, acceptees: [y < pivot ? av : ap], options: [{ label: av }, { label: ap }] }
    }
    case 'lettres': case 'assistee':
      return { ...q, format: mj, options: [], leurres, lettres: mj === 'lettres' ? melanger(q.reponse) : undefined }
    default: return { ...q, format: 'qcm' }
  }
}
