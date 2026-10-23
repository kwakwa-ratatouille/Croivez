import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { deleteField, doc, getDoc, onSnapshot, serverTimestamp, setDoc, increment } from 'firebase/firestore'
import { auth, db } from './firebase'
import { cleRevision, planifier, type CarteRevision } from './quiz/revision'
import type { SousThemeId } from './quiz/engine'

export type Profile = {
  pseudo: string
  xp: number
  serie: number
  meilleureSerie?: number
  dernierJour: string // AAAA-MM-JJ
  maitrise: Record<string, number> // sous-thème → 0..100
  parties?: number
  bonnes?: number
  defis?: number
  defiJour?: string // dernier défi du jour réussi
  sansFaute?: number
  revision?: Record<string, CarteRevision>
}

type Ctx = { user: User | null; profile: Profile | null; loading: boolean }
const AuthCtx = createContext<Ctx>({ user: null, profile: null, loading: true })

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => onAuthStateChanged(auth, (u) => { setUser(u); if (!u) { setProfile(null); setLoading(false) } }), [])

  useEffect(() => {
    if (!user) return
    return onSnapshot(doc(db, 'users', user.uid), (snap) => {
      setProfile(snap.exists() ? (snap.data() as Profile) : null)
      setLoading(false)
    })
  }, [user])

  return <AuthCtx.Provider value={{ user, profile, loading }}>{children}</AuthCtx.Provider>
}

export const useAuth = () => useContext(AuthCtx)

export async function ensureProfile(user: User, pseudo?: string) {
  const ref = doc(db, 'users', user.uid)
  if ((await getDoc(ref)).exists()) return
  await setDoc(ref, {
    pseudo: pseudo || user.displayName || user.email?.split('@')[0] || 'Explorateur',
    xp: 0, serie: 0, dernierJour: '', maitrise: {}, creeLe: serverTimestamp(),
  })
}

export const niveau = (xp: number) => Math.floor(Math.sqrt(xp / 100)) + 1
export const xpPourNiveau = (n: number) => (n - 1) ** 2 * 100

export const jour = (d = new Date()) => d.toLocaleDateString('sv') // AAAA-MM-JJ en heure locale

type Partie = {
  sousTheme: SousThemeId
  xp: number
  resultats: { id: string; juste: boolean }[]
  revision?: boolean // partie de révision : ne compte pas dans la maîtrise
  defi?: boolean
}

// Enregistre une partie : XP, série, maîtrise, statistiques des badges et cartes de révision
export async function enregistrerPartie(uid: string, profile: Profile, p: Partie) {
  const today = jour()
  const hier = jour(new Date(Date.now() - 864e5))
  const serie = profile.dernierJour === today ? profile.serie : profile.dernierJour === hier ? profile.serie + 1 : 1
  const bonnes = p.resultats.filter((r) => r.juste).length
  const taux = bonnes / p.resultats.length
  const ancienne = profile.maitrise?.[p.sousTheme] ?? 0
  // Moyenne glissante : la maîtrise progresse sans sauter à 100 % après une seule partie
  const maitrise = Math.round(ancienne * 0.7 + taux * 100 * 0.3)

  const revision: Record<string, unknown> = {}
  for (const r of p.resultats) {
    const cle = cleRevision(p.sousTheme, r.id)
    const carte = profile.revision?.[cle]
    const suite = planifier(carte, p.sousTheme, r.id, r.juste)
    if (suite) revision[cle] = suite
    else if (carte) revision[cle] = deleteField()
  }

  const defiReussi = p.defi && taux >= 0.5 && profile.defiJour !== today
  await setDoc(doc(db, 'users', uid), {
    xp: increment(p.xp),
    serie,
    meilleureSerie: Math.max(serie, profile.meilleureSerie ?? 0),
    dernierJour: today,
    parties: increment(1),
    bonnes: increment(bonnes),
    ...(taux === 1 && p.resultats.length >= 10 ? { sansFaute: increment(1) } : {}),
    ...(p.revision ? {} : { maitrise: { [p.sousTheme]: maitrise } }),
    ...(defiReussi ? { defis: increment(1), defiJour: today } : {}),
    ...(Object.keys(revision).length ? { revision } : {}),
  }, { merge: true })
}
