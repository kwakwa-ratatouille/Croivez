import { arrayRemove, arrayUnion, collection, doc, getDoc, getDocs, increment, limit, orderBy, query, runTransaction, setDoc, where, documentId } from 'firebase/firestore'
import { db } from './firebase'
import { niveau, type Profile } from './auth'
import { FAMILLES } from './themes'

// Profil public (lisible par tous les joueurs connectés) : sert aux classements et à la recherche d'amis
export type ProfilPublic = { uid: string; pseudo: string; xp: number; niveau: number; serie: number; avatar?: string; cadre?: string; vitrine?: string[]; favori?: string; familles?: Record<string, number>; parties?: number; bonnes?: number; meilleureSerie?: number; erudition?: number }

// ——— Érudition : le classement global récompense le savoir, pas le temps passé ———
// Chaque niveau réussi au sans-faute rapporte des points (les niveaux sautés en payant ne comptent pas),
// chaque Légende ouverte en vrai rapporte un gros bonus. Jouer beaucoup sans progresser ne fait pas monter.
export const POINTS_NIVEAU: Record<number, number> = { 1: 10, 2: 20, 3: 35, 4: 50 }
export const BONUS_LEGENDE = 250
export function erudition(p: Pick<Profile, 'paliers'>) {
  const paliers = p.paliers ?? {}
  let n = 0
  for (const l of Object.values(paliers)) for (const d of new Set(l)) n += POINTS_NIVEAU[d] ?? 0
  for (const f of FAMILLES) {
    const j = f.subs.filter((s) => s.jouable)
    if (j.length && j.every((s) => [1, 2, 3, 4].every((d) => paliers[s.id]?.includes(d)))) n += BONUS_LEGENDE
  }
  return n
}

// Ce que les autres voient : maîtrise moyenne par famille (pas par quiz, trop nombreux), vitrine, thème favori, stats
export function resumePublic(p: Profile) {
  const familles: Record<string, number> = {}
  for (const f of FAMILLES) {
    const j = f.subs.filter((s) => s.jouable)
    familles[f.k] = j.length ? Math.round(j.reduce((a, s) => a + (p.maitrise?.[s.id] ?? 0), 0) / j.length) : 0
  }
  return { familles, vitrine: p.vitrine ?? [], favori: p.favori ?? '', parties: p.parties ?? 0, bonnes: p.bonnes ?? 0, meilleureSerie: p.meilleureSerie ?? p.serie ?? 0, erudition: erudition(p) }
}
export const publierVitrine = (uid: string, p: Profile, maj: { vitrine?: string[]; favori?: string }) => Promise.all([
  setDoc(doc(db, 'users', uid), maj, { merge: true }),
  setDoc(doc(db, 'profils', uid), { ...resumePublic({ ...p, ...maj }) }, { merge: true }),
])
export async function profilPublic(uid: string): Promise<ProfilPublic | null> {
  const d = await getDoc(doc(db, 'profils', uid))
  return d.exists() ? ({ uid, ...d.data() } as ProfilPublic) : null
}

export const pseudoCle = (p: string) => p.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9_-]/g, '')

// Semaine ISO « 2026-W43 » : clé du classement hebdomadaire
export function semaine(d = new Date()) {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  const jour = t.getUTCDay() || 7
  t.setUTCDate(t.getUTCDate() + 4 - jour)
  const debut = new Date(Date.UTC(t.getUTCFullYear(), 0, 1))
  const n = Math.ceil(((t.getTime() - debut.getTime()) / 864e5 + 1) / 7)
  return `${t.getUTCFullYear()}-W${String(n).padStart(2, '0')}`
}

// Réserve le pseudo (unique) et crée/actualise le profil public. Si le pseudo est pris, on ajoute un numéro.
export async function synchroniserProfilPublic(uid: string, p: Profile) {
  const pub = await getDoc(doc(db, 'profils', uid))
  if (!pub.exists()) {
    let pseudo = p.pseudo
    for (let essai = 0; essai < 20; essai++) {
      const cle = pseudoCle(pseudo) || `joueur${uid.slice(0, 5)}`
      const ok = await runTransaction(db, async (tx) => {
        const ref = doc(db, 'pseudos', cle)
        const existant = await tx.get(ref)
        if (existant.exists() && existant.data().uid !== uid) return false
        tx.set(ref, { uid })
        return true
      })
      if (ok) break
      pseudo = `${p.pseudo}${Math.floor(Math.random() * 900 + 100)}`
    }
    if (pseudo !== p.pseudo) await setDoc(doc(db, 'users', uid), { pseudo }, { merge: true })
    p = { ...p, pseudo }
  }
  await setDoc(doc(db, 'profils', uid), { pseudo: p.pseudo, xp: p.xp ?? 0, niveau: niveau(p.xp ?? 0), serie: p.serie ?? 0, ...resumePublic(p) }, { merge: true })
}

// Appelé après chaque partie : XP du profil public et du classement de la semaine
export async function publierXp(uid: string, pseudo: string, xp: number, xpTotal: number, serie: number, look: { avatar?: string; cadre?: string } = {}, resume: Record<string, unknown> = {}) {
  const apparence = { ...(look.avatar ? { avatar: look.avatar } : {}), ...(look.cadre ? { cadre: look.cadre } : {}) }
  await Promise.all([
    setDoc(doc(db, 'profils', uid), { pseudo, xp: xpTotal, niveau: niveau(xpTotal), serie, ...apparence, ...resume }, { merge: true }),
    setDoc(doc(db, 'semaines', semaine(), 'scores', uid), { pseudo, xp: increment(xp), ...apparence }, { merge: true }),
  ])
}

export async function trouverParPseudo(pseudo: string): Promise<ProfilPublic | null> {
  const ref = await getDoc(doc(db, 'pseudos', pseudoCle(pseudo)))
  if (!ref.exists()) return null
  const uid = ref.data().uid as string
  const pub = await getDoc(doc(db, 'profils', uid))
  return pub.exists() ? ({ uid, ...pub.data() } as ProfilPublic) : null
}

export const ajouterAmi = (moi: string, ami: string) => setDoc(doc(db, 'users', moi), { amis: arrayUnion(ami) }, { merge: true })
export const retirerAmi = (moi: string, ami: string) => setDoc(doc(db, 'users', moi), { amis: arrayRemove(ami) }, { merge: true })

export async function profilsDe(uids: string[]): Promise<ProfilPublic[]> {
  const out: ProfilPublic[] = []
  // Firestore limite « in » à 30 valeurs par requête
  for (let i = 0; i < uids.length; i += 30) {
    const snap = await getDocs(query(collection(db, 'profils'), where(documentId(), 'in', uids.slice(i, i + 30))))
    snap.forEach((d) => out.push({ uid: d.id, ...d.data() } as ProfilPublic))
  }
  return out
}

export async function classementGlobal(): Promise<ProfilPublic[]> {
  const snap = await getDocs(query(collection(db, 'profils'), orderBy('erudition', 'desc'), limit(50)))
  return snap.docs.map((d) => ({ uid: d.id, ...d.data() } as ProfilPublic))
}

// XP gagnée cette semaine (ligue hebdomadaire)
export async function monXpSemaine(uid: string) {
  const d = await getDoc(doc(db, 'semaines', semaine(), 'scores', uid))
  return (d.data()?.xp as number | undefined) ?? 0
}

export async function classementSemaine(): Promise<{ uid: string; pseudo: string; xp: number; avatar?: string; cadre?: string }[]> {
  const snap = await getDocs(query(collection(db, 'semaines', semaine(), 'scores'), orderBy('xp', 'desc'), limit(50)))
  return snap.docs.map((d) => ({ uid: d.id, ...(d.data() as { pseudo: string; xp: number; avatar?: string; cadre?: string }) }))
}
