import type { Lang } from '../i18n'
import type { Question } from './engine'

// Formats de réponse : le moteur fabrique un QCM, on le transforme ici question par question
export type Format = 'qcm' | 'libre' | 'assistee' | 'vf' | 'lettres' | 'auto'
export const FORMATS: { v: Format; fr: string; en: string }[] = [
  { v: 'auto', fr: 'Auto', en: 'Auto' }, { v: 'qcm', fr: 'QCM', en: 'Choices' }, { v: 'vf', fr: 'Vrai / faux', en: 'True / false' },
  { v: 'assistee', fr: 'Assistée', en: 'Assisted' }, { v: 'lettres', fr: 'Lettres', en: 'Letters' }, { v: 'libre', fr: 'Libre', en: 'Free' },
]

// Auto : plus c'est dur, moins on aide (Tout = un peu de chaque)
function formatAuto(d: number): Exclude<Format, 'auto'> {
  if (d === 0) return (['qcm', 'vf', 'assistee', 'lettres', 'libre'] as const)[Math.floor(Math.random() * 5)]
  if (d <= 1) return 'qcm'
  if (d === 2) return 'assistee'
  if (d === 3) return Math.random() < 0.5 ? 'lettres' : 'vf'
  return 'libre'
}

const melanger = (mot: string): string[] => {
  const l = [...mot.toUpperCase()].filter((c) => c.trim())
  for (let i = l.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [l[i], l[j]] = [l[j], l[i]] }
  return l.join('') === mot.toUpperCase().replace(/\s/g, '') && new Set(l).size > 1 ? melanger(mot) : l
}

export function appliquerFormat(q: Question, f: Format, d: number, lang: Lang): Question {
  // Cartes et choix en images restent tels quels
  if (q.carte || q.imagesOnly || !q.options.length) return q
  const fmt = f === 'auto' ? formatAuto(d) : f
  const leurres = q.options.map((o) => o.label).filter((l) => l !== q.reponse)
  if (fmt === 'qcm') return { ...q, format: 'qcm' }
  if (fmt === 'vf') {
    const vrai = Math.random() < 0.5 || !leurres.length
    const propose = vrai ? q.reponse : leurres[Math.floor(Math.random() * leurres.length)]
    const [v, x] = lang === 'fr' ? ['Vrai', 'Faux'] : ['True', 'False']
    return { ...q, format: 'vf', propose, vraie: q.reponse, reponse: vrai ? v : x, acceptees: [vrai ? v : x], options: [{ label: v }, { label: x }] }
  }
  return { ...q, format: fmt, options: [], leurres, lettres: fmt === 'lettres' ? melanger(q.reponse) : undefined }
}
