import { collection, doc, getDocs, increment, query, setDoc, updateDoc, where } from 'firebase/firestore'
import { db } from './firebase'

// Parrainage : un lien « ?parrain=UID » offre 100 pièces au filleul à l'inscription,
// et 100 au parrain, qui les récupère lui-même à sa prochaine ouverture (on ne touche jamais au profil d'un autre)
export const BONUS_PARRAIN = 100

export function retenirParrain() {
  try {
    const p = new URLSearchParams(location.hash.split('?')[1] ?? location.search).get('parrain')
    if (p) localStorage.setItem('parrain', p)
  } catch { /* stockage indisponible */ }
}
export const parrainRetenu = () => { try { return localStorage.getItem('parrain') } catch { return null } }

export async function declarerFilleul(filleul: string, parrain: string) {
  if (parrain === filleul) return
  await setDoc(doc(db, 'parrainages', filleul), { parrain, reclame: false })
}

// Côté parrain : récupère les bonus des nouveaux filleuls
export async function reclamerParrainages(uid: string) {
  const snap = await getDocs(query(collection(db, 'parrainages'), where('parrain', '==', uid), where('reclame', '==', false)))
  for (const d of snap.docs) {
    await updateDoc(d.ref, { reclame: true })
    await setDoc(doc(db, 'users', uid), { pieces: increment(BONUS_PARRAIN), filleuls: increment(1) }, { merge: true })
  }
  return snap.size
}
