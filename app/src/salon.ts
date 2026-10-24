import { get, onDisconnect, onValue, ref, runTransaction, serverTimestamp, set, update } from 'firebase/database'
import { rtdb } from './firebase'
import { genererPartie, type Difficulte, type Question, type SousThemeId } from './quiz/engine'
import { appliquerMiniJeu, type MiniJeu } from './quiz/formats'
import type { Lang } from './i18n'

// ——— Salons multijoueur : jusqu'à 12 joueurs, un code à 5 caractères ———
// Stockés sous « duels/salon-CODE » : les règles de la base temps réel ouvrent déjà ce chemin aux joueurs connectés.
// Tout le monde génère les mêmes questions avec la même graine ; l'hôte fait avancer les questions
// (si l'hôte part, n'importe quel joueur prend le relais une fois le temps largement écoulé).
export const MAX_JOUEURS = 12
export const REVELATION_MS = 3500 // temps pour voir la bonne réponse et le classement entre deux questions
const chemin = (code: string) => `duels/salon-${code}`

export type JoueurSalon = { pseudo: string; avatar?: string; cadre?: string; score: number; parti?: boolean; rejoint: number; r?: Record<string, { j: boolean; ms: number; pts: number }> }
export type ReglesSalon = { s: string; n: number; d: 1 | 2 | 3 | 4; mj: MiniJeu; secondes: number }
export type Salon = {
  hote: string
  etat: 'attente' | 'jeu' | 'fini'
  regles: ReglesSalon
  seed: number
  etape?: { q: number; debut: number }
  joueurs: Record<string, JoueurSalon>
  cree: number
}
export const REGLES_DEFAUT: ReglesSalon = { s: 'mix', n: 10, d: 2, mj: 'qcm', secondes: 15 }
// Mini-jeux jouables à plusieurs (pas de saisie : tout le monde répond au même rythme)
export const MINI_JEUX_SALON: MiniJeu[] = ['qcm', 'vf', 'duo', 'eclair']

// Thèmes de la partie « Aléatoire » en salon : les quiz les plus connus, pour que tout le monde ait une chance
export const MIX_SALON: SousThemeId[] = ['drapeaux', 'capitales', 'films', 'acteurs', 'artistes', 'logos', 'animaux', 'personnalites', 'monuments', 'youtubeurs', 'emojis-films', 'repliques', 'fruits', 'desserts', 'sportifs', 'clubs', 'persos-jeux', 'series', 'superheros', 'idees-recues', 'dessins-animes', 'plats', 'chiens', 'affiches', 'voitures-photo', 'slogans', 'expressions', 'jeux-societe', 'dinosaures'] as SousThemeId[]

type Moi = { uid: string; pseudo: string; avatar?: string; cadre?: string }
const joueur = (m: Moi): JoueurSalon => ({ pseudo: m.pseudo, score: 0, rejoint: Date.now(), parti: false, ...(m.avatar ? { avatar: m.avatar } : {}), ...(m.cadre ? { cadre: m.cadre } : {}) })

const LETTRES = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // sans I, O, 0, 1 : impossible de confondre
const nouveauCode = () => Array.from({ length: 5 }, () => LETTRES[Math.floor(Math.random() * LETTRES.length)]).join('')
export const normaliserCode = (c: string) => c.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5)

// Présence : si l'appli se ferme, le joueur est marqué parti (on ne l'attend plus)
function surveillerPresence(code: string, uid: string) {
  onDisconnect(ref(rtdb, `${chemin(code)}/joueurs/${uid}/parti`)).set(true)
}

export async function creerSalon(m: Moi) {
  for (let essai = 0; essai < 8; essai++) {
    const code = nouveauCode()
    const r = ref(rtdb, chemin(code))
    if ((await get(r)).exists()) continue
    const salon: Salon = { hote: m.uid, etat: 'attente', regles: REGLES_DEFAUT, seed: 0, joueurs: { [m.uid]: joueur(m) }, cree: Date.now() }
    await set(r, salon)
    surveillerPresence(code, m.uid)
    return code
  }
  throw new Error('code')
}

export async function rejoindreSalon(code: string, m: Moi): Promise<'ok' | 'introuvable' | 'commence' | 'plein'> {
  const s = (await get(ref(rtdb, chemin(code)))).val() as Salon | null
  if (!s) return 'introuvable'
  const deja = s.joueurs?.[m.uid]
  if (!deja && s.etat !== 'attente') return 'commence'
  if (!deja && Object.values(s.joueurs ?? {}).filter((j) => !j.parti).length >= MAX_JOUEURS) return 'plein'
  await update(ref(rtdb, `${chemin(code)}/joueurs/${m.uid}`), deja ? { parti: false } : joueur(m))
  surveillerPresence(code, m.uid)
  return 'ok'
}

export const quitterSalon = (code: string, uid: string) => update(ref(rtdb, `${chemin(code)}/joueurs/${uid}`), { parti: true })
export const ecouterSalon = (code: string, cb: (s: Salon | null) => void) => onValue(ref(rtdb, chemin(code)), (snap) => cb(snap.val()))
export const majRegles = (code: string, regles: ReglesSalon) => set(ref(rtdb, `${chemin(code)}/regles`), regles)

export async function lancerSalon(code: string, s: Salon) {
  const maj: Record<string, unknown> = { etat: 'jeu', seed: Math.floor(Math.random() * 2 ** 31), etape: { q: 0, debut: serverTimestamp() } }
  // Les joueurs partis sont retirés, les scores repartent de zéro
  for (const [uid, j] of Object.entries(s.joueurs ?? {})) {
    if (j.parti) maj[`joueurs/${uid}`] = null
    else { maj[`joueurs/${uid}/score`] = 0; maj[`joueurs/${uid}/r`] = null }
  }
  await update(ref(rtdb, chemin(code)), maj)
}

// Réponse : 100 points si juste, + jusqu'à 100 de bonus de rapidité
export function pointsSalon(juste: boolean, ms: number, secondes: number) {
  return juste ? 100 + Math.round(100 * Math.max(0, 1 - ms / (secondes * 1000))) : 0
}
export const repondreSalon = (code: string, uid: string, i: number, juste: boolean, ms: number, pts: number, score: number) =>
  update(ref(rtdb, `${chemin(code)}/joueurs/${uid}`), { [`r/${i}`]: { j: juste, ms, pts }, score: score + pts })

// Question suivante : une transaction garantit qu'on n'avance qu'une fois, même si deux joueurs le demandent
export async function avancerSalon(code: string, i: number, n: number, maintenant: number) {
  const res = await runTransaction(ref(rtdb, `${chemin(code)}/etape`), (e: { q: number; debut: number } | null) => {
    if (!e || e.q !== i) return undefined // déjà avancé : on annule
    return i + 1 >= n ? { q: i + 1, debut: e.debut } : { q: i + 1, debut: maintenant }
  })
  if (res.committed && i + 1 >= n) await update(ref(rtdb, chemin(code)), { etat: 'fini' })
}

export const rejouerSalon = (code: string) => update(ref(rtdb, chemin(code)), { etat: 'attente', etape: null })

export async function inviterAuSalon(code: string, m: Moi, ami: string) {
  await set(ref(rtdb, `invitations/${ami}/salon-${code}`), { de: m.pseudo, uid: m.uid, t: serverTimestamp(), salon: code })
}

// Décalage entre l'horloge de l'appareil et celle du serveur (chrono identique pour tous)
export const ecouterDecalage = (cb: (ms: number) => void) => onValue(ref(rtdb, '.info/serverTimeOffset'), (s) => cb(Number(s.val() ?? 0)))

// Questions de la partie : mêmes pour tout le monde (même graine, quiz tirés avec un générateur reproductible)
export async function questionsSalon(r: ReglesSalon, seed: number, lang: Lang): Promise<Question[]> {
  let a = seed
  const alea = () => { a = (a * 1103515245 + 12345) & 0x7fffffff; return a / 0x7fffffff }
  const appliquer = (q: Question) => appliquerMiniJeu(q, r.mj, lang)
  if (r.s !== 'mix') {
    const qs = await genererPartie({ sousTheme: r.s as SousThemeId, difficulte: r.d as Difficulte, nombre: r.n, mode: 'qcm', lang, seed })
    return qs.map(appliquer)
  }
  const out: Question[] = []
  let precedent = ''
  for (let i = 0; i < r.n; i++) {
    const choix = MIX_SALON.filter((s) => s !== precedent)
    const s = choix[Math.floor(alea() * choix.length)]
    precedent = s
    const [q] = await genererPartie({ sousTheme: s, difficulte: r.d as Difficulte, nombre: 1, mode: 'qcm', lang, seed: seed + i * 7919 }).catch(() => [])
    if (q) out.push(appliquer({ ...q, s }))
  }
  return out
}
