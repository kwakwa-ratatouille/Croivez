import { doc, getDoc, setDoc } from 'firebase/firestore'
import { get, ref as rref, remove, set, update } from 'firebase/database'
import { db, rtdb } from './firebase'
import { profilsDe, semaine, type ProfilPublic } from './social'

// ——— Fil d'activité ———
// Chaque joueur publie ses derniers exploits dans son profil public (12 au plus) ; le fil réunit ceux de ses amis.
export type Ev = { e: string; txt: string; t: number }
export type EvAmi = Ev & { uid: string; pseudo: string; avatar?: string; cadre?: string }

export async function noterActivite(uid: string, e: string, txt: string) {
  const r = doc(db, 'profils', uid)
  const avant = ((await getDoc(r)).data()?.activite ?? []) as Ev[]
  await setDoc(r, { activite: [{ e, txt, t: Date.now() }, ...avant].slice(0, 12) }, { merge: true })
}

export async function filAmis(amis: string[]): Promise<EvAmi[]> {
  const profils = await profilsDe(amis) as (ProfilPublic & { activite?: Ev[] })[]
  return profils.flatMap((p) => (p.activite ?? []).map((ev) => ({ ...ev, uid: p.uid, pseudo: p.pseudo, avatar: p.avatar, cadre: p.cadre })))
    .sort((a, b) => b.t - a.t).slice(0, 60)
}

// Réaction à l'exploit d'un ami : elle lui arrive comme une petite invitation
export const reagir = (moi: string, pseudo: string, ami: string, emoji: string, txt: string) =>
  set(rref(rtdb, `invitations/${ami}/react-${moi}-${Date.now()}`), { type: 'reaction', de: pseudo, uid: moi, emoji, txt, t: Date.now() })

// ——— Défi de score ———
// Les mêmes questions (par leurs identifiants) sont envoyées à l'ami, avec le score à battre.
export type Defi = { s: string; m: string; d: number; ids: string[]; score: number; bonnes: number; total: number; quiz: string }
export const urlDefi = (d: Defi, de: string, uid: string) =>
  `/partie?s=${d.s}&m=${d.m}&d=${d.d}&n=${d.total}&ids=${d.ids.join(',')}&contre=${encodeURIComponent(de)}&cuid=${uid}&cscore=${d.score}&cbonnes=${d.bonnes}`
export const envoyerDefi = (moi: string, pseudo: string, ami: string, d: Defi) =>
  set(rref(rtdb, `invitations/${ami}/defi-${moi}-${Date.now()}`), { type: 'defi', de: pseudo, uid: moi, url: urlDefi(d, pseudo, moi), quiz: d.quiz, bonnes: d.bonnes, total: d.total, t: Date.now() })
export const repondreDefi = (moi: string, pseudo: string, ami: string, gagne: boolean | null, bonnes: number, total: number) =>
  set(rref(rtdb, `invitations/${ami}/defires-${moi}-${Date.now()}`), { type: 'defi-res', de: pseudo, uid: moi, gagne, bonnes, total, t: Date.now() })

// ——— Clans ———
// Rangés sous duels/clan-<CODE> (chemin ouvert aux joueurs connectés), le code sert à rejoindre.
export type Membre = { pseudo: string; avatar?: string; cadre?: string; depuis: number }
export type Clan = { code: string; nom: string; embleme: string; couleur: string; chef: string; membres: Record<string, Membre>; cree: number }
export const EMBLEMES = ['🦁', '🐺', '🦅', '🐉', '🦊', '🐙', '🦉', '🐝', '🔥', '⚡', '🌙', '🌿', '💎', '🚀', '🧠', '👑']
export const COULEURS_CLAN = ['#7C3AED', '#2563EB', '#0EA5E9', '#16A34A', '#F59E0B', '#EA580C', '#DC2626', '#DB2777']
export const MAX_MEMBRES = 20
export const OBJECTIF_CLAN = 3000 // XP collective visée chaque semaine

const chemin = (code: string) => `duels/clan-${code}`
const nouveauCode = () => Array.from({ length: 5 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 31)]).join('')
const marquer = (uid: string, code: string | null) => Promise.all([
  setDoc(doc(db, 'users', uid), { clan: code ?? '' }, { merge: true }),
  setDoc(doc(db, 'profils', uid), { clan: code ?? '' }, { merge: true }),
])

export async function lireClan(code: string): Promise<Clan | null> {
  const s = await get(rref(rtdb, chemin(code.toUpperCase())))
  return s.exists() ? { ...(s.val() as Clan), code: code.toUpperCase() } : null
}

export async function creerClan(uid: string, moi: Membre, nom: string, embleme: string, couleur: string) {
  let code = nouveauCode()
  while (await lireClan(code)) code = nouveauCode()
  await set(rref(rtdb, chemin(code)), { nom: nom.trim().slice(0, 24), embleme, couleur, chef: uid, membres: { [uid]: moi }, cree: Date.now() })
  await marquer(uid, code)
  return code
}

export async function rejoindreClan(uid: string, moi: Membre, code: string): Promise<'ok' | 'introuvable' | 'plein'> {
  const c = await lireClan(code)
  if (!c) return 'introuvable'
  if (Object.keys(c.membres ?? {}).length >= MAX_MEMBRES && !c.membres?.[uid]) return 'plein'
  await update(rref(rtdb, `${chemin(c.code)}/membres`), { [uid]: moi })
  await marquer(uid, c.code)
  return 'ok'
}

export async function quitterClan(uid: string, code: string) {
  const c = await lireClan(code)
  if (c) {
    const restants = Object.keys(c.membres ?? {}).filter((u) => u !== uid)
    if (!restants.length) await remove(rref(rtdb, chemin(c.code)))
    else {
      await remove(rref(rtdb, `${chemin(c.code)}/membres/${uid}`))
      if (c.chef === uid) await set(rref(rtdb, `${chemin(c.code)}/chef`), restants[0]) // le plus ancien prend la tête
    }
  }
  await marquer(uid, null)
}

// XP de la semaine de chaque membre (classement de la semaine), du meilleur au moins bon
export async function scoresClan(c: Clan) {
  const uids = Object.keys(c.membres ?? {})
  const xp = await Promise.all(uids.map((u) => getDoc(doc(db, 'semaines', semaine(), 'scores', u)).then((d) => (d.data()?.xp as number) ?? 0).catch(() => 0)))
  return uids.map((uid, i) => ({ uid, ...c.membres[uid], xp: xp[i] })).sort((a, b) => b.xp - a.xp)
}
