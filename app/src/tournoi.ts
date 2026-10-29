import { arrayUnion, collection, doc, getDoc, getDocs, increment, limit, orderBy, query, setDoc } from 'firebase/firestore'
import { db } from './firebase'
import { semaine } from './social'
import type { Profile } from './auth'
import type { SousThemeId } from './quiz/engine'

// Tournoi de la semaine : un quiz commun (même thème, mêmes questions pour tous), 3 essais, meilleur score gardé.
// Le score est rangé dans le document de classement de la semaine du joueur (champ « tournoi »).
export const ESSAIS = 3
export const NB_QUESTIONS = 15
// Thèmes du tournoi : variés et accessibles, un par semaine en boucle
const THEMES: SousThemeId[] = ['drapeaux', 'capitales', 'films', 'monuments', 'logos', 'animaux', 'acteurs', 'personnalites', 'artistes', 'emojis-films', 'repliques', 'eco-eau', 'proverbes', 'jeux', 'clubs', 'idees-recues', 'sportifs', 'monuments', 'expressions', 'cris-animaux'] as SousThemeId[]

export type ScoreTournoi = { uid: string; pseudo: string; avatar?: string; cadre?: string; score: number; bonnes: number; total: number; essais: number }
const numeroSemaine = (s: string) => Number(s.replace('-W', ''))
export const themeTournoi = (s = semaine()) => THEMES[numeroSemaine(s) % THEMES.length]
export const graineTournoi = (s = semaine()) => numeroSemaine(s) * 7919 + 13
export const semainePrecedente = () => semaine(new Date(Date.now() - 7 * 864e5))
export const urlTournoi = () => `/partie?s=${themeTournoi()}&d=0&n=${NB_QUESTIONS}&m=qcm&tournoi=1`

// Fin de la semaine (lundi 0 h, heure locale) pour le compte à rebours
export function finSemaine() {
  const d = new Date(); d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + ((8 - (d.getDay() || 7)) % 7 || 7))
  return d
}

const ref = (uid: string, s = semaine()) => doc(db, 'semaines', s, 'scores', uid)
export async function monTournoi(uid: string, s = semaine()) {
  const d = await getDoc(ref(uid, s)).catch(() => null)
  return (d?.data()?.tournoi ?? null) as Omit<ScoreTournoi, 'uid' | 'pseudo'> | null
}
// Enregistre un essai : le meilleur score est gardé, le nombre d'essais augmente
export async function publierTournoi(uid: string, p: Profile, score: number, bonnes: number, total: number) {
  const avant = await monTournoi(uid)
  const essais = (avant?.essais ?? 0) + 1
  const meilleur = !avant || score > avant.score
  await setDoc(ref(uid), { pseudo: p.pseudo, ...(p.avatar ? { avatar: p.avatar } : {}), ...(p.cadre ? { cadre: p.cadre } : {}), tournoi: meilleur ? { score, bonnes, total, essais } : { ...avant, essais } }, { merge: true })
  return { essais, meilleur }
}
export async function classementTournoi(s = semaine(), n = 100): Promise<ScoreTournoi[]> {
  const snap = await getDocs(query(collection(db, 'semaines', s, 'scores'), orderBy('tournoi.score', 'desc'), limit(n)))
  return snap.docs.map((d) => ({ uid: d.id, pseudo: d.data().pseudo, avatar: d.data().avatar, cadre: d.data().cadre, ...d.data().tournoi }))
}

// Récompenses de la semaine passée, réclamées une fois : 1er 1 500, 2e 1 000, 3e 700, top 10 300, participation 50
export const recompense = (rang: number) => (rang === 1 ? 1500 : rang === 2 ? 1000 : rang === 3 ? 700 : rang <= 10 ? 300 : 50)
export async function reclamerTournoi(uid: string, s: string, rang: number) {
  await setDoc(doc(db, 'users', uid), { pieces: increment(recompense(rang)), tournoisRecus: arrayUnion(s), ...(rang <= 3 ? { tournoisPodiums: increment(1) } : {}), ...(rang === 1 ? { tournoisGagnes: increment(1) } : {}) }, { merge: true })
}
