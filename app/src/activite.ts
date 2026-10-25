import { doc, getDoc, setDoc } from 'firebase/firestore'
import { ref as rref, set } from 'firebase/database'
import { db, rtdb } from './firebase'
import { profilsDe, type ProfilPublic } from './social'

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
