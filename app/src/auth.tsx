import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { doc, getDoc, onSnapshot, serverTimestamp, setDoc, increment } from 'firebase/firestore'
import { auth, db } from './firebase'

export type Profile = {
  pseudo: string
  xp: number
  serie: number
  dernierJour: string // AAAA-MM-JJ
  maitrise: Record<string, number> // sous-thème → 0..100
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

const jour = (d = new Date()) => d.toLocaleDateString('sv') // AAAA-MM-JJ en heure locale

// Enregistre une partie : XP, série quotidienne, maîtrise du sous-thème
export async function enregistrerPartie(uid: string, profile: Profile, sousTheme: string, xp: number, taux: number) {
  const today = jour()
  const hier = jour(new Date(Date.now() - 864e5))
  const serie = profile.dernierJour === today ? profile.serie : profile.dernierJour === hier ? profile.serie + 1 : 1
  const ancienne = profile.maitrise?.[sousTheme] ?? 0
  // Moyenne glissante : la maîtrise progresse sans sauter à 100 % après une seule partie
  const maitrise = Math.round(ancienne * 0.7 + taux * 100 * 0.3)
  await setDoc(doc(db, 'users', uid), {
    xp: increment(xp), serie, dernierJour: today, maitrise: { [sousTheme]: maitrise },
  }, { merge: true })
}
