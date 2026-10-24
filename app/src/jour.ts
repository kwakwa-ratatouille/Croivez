import { collection, doc, getDoc, getDocs, limit, orderBy, query, setDoc } from 'firebase/firestore'
import { db } from './firebase'

// Quiz du jour commun : même tirage pour tout le monde, classement du jour (meilleur score gardé)
export type ScoreJour = { uid: string; pseudo: string; score: number; bonnes: number; total: number; avatar?: string; cadre?: string; grille?: string }

export async function publierScoreJour(date: string, s: ScoreJour) {
  const ref = doc(db, 'jours', date, 'scores', s.uid)
  const avant = await getDoc(ref).catch(() => null)
  if (avant?.exists() && (avant.data().score as number) >= s.score) return
  await setDoc(ref, s)
}

export async function classementJour(date: string): Promise<ScoreJour[]> {
  const snap = await getDocs(query(collection(db, 'jours', date, 'scores'), orderBy('score', 'desc'), limit(100)))
  return snap.docs.map((d) => d.data() as ScoreJour)
}
