import { get, onDisconnect, push, ref, remove, runTransaction, serverTimestamp, set, update } from 'firebase/database'
import { rtdb } from './firebase'
import type { SousThemeId } from './quiz/engine'

// Un duel : 10 questions générées des deux côtés avec la même graine, donc identiques
export type JoueurDuel = { pseudo: string; score: number; r?: Record<string, { j: boolean; ms: number }> }
export type Duel = {
  etat: 'attente' | 'jeu' | 'fini'
  createur: string
  invite?: string
  s: SousThemeId
  seed: number
  n: number
  joueurs: Record<string, JoueurDuel>
  cree: number
}

export const QUESTIONS_DUEL = 10
export const SECONDES_DUEL = 15
const THEMES: SousThemeId[] = ['drapeaux', 'capitales', 'drapeaux-inverse', 'capitales-inverse', 'pays-carte', 'acteurs', 'films', 'artistes', 'logos', 'animaux', 'personnalites', 'monuments', 'elements', 'extraits', 'plats', 'films-annee', 'personnalites-pays', 'tableaux', 'monnaies']

function nouveauDuel(uid: string, pseudo: string, invite?: string): Duel {
  return {
    etat: 'attente', createur: uid, s: THEMES[Math.floor(Math.random() * THEMES.length)],
    seed: Math.floor(Math.random() * 2 ** 31), n: QUESTIONS_DUEL,
    joueurs: { [uid]: { pseudo, score: 0 } }, cree: Date.now(),
    ...(invite ? { invite } : {}),
  }
}

// Invitation d'un ami : le duel attend, l'ami le voit dans ses invitations
export async function inviter(uid: string, pseudo: string, ami: string) {
  const r = push(ref(rtdb, 'duels'))
  await set(r, nouveauDuel(uid, pseudo, ami))
  await set(ref(rtdb, `invitations/${ami}/${r.key}`), { de: pseudo, uid, t: serverTimestamp() })
  return r.key!
}

// Renvoie false si le duel n'attend plus personne (annulé entre-temps)
export async function rejoindre(id: string, uid: string, pseudo: string) {
  await remove(ref(rtdb, `invitations/${uid}/${id}`))
  const d = (await get(ref(rtdb, `duels/${id}`))).val() as Duel | null
  if (d?.etat !== 'attente') return false
  await update(ref(rtdb, `duels/${id}`), { [`joueurs/${uid}`]: { pseudo, score: 0 }, etat: 'jeu' })
  return true
}

export const refuser = (id: string, uid: string) => Promise.all([remove(ref(rtdb, `invitations/${uid}/${id}`)), update(ref(rtdb, `duels/${id}`), { etat: 'fini' })])

// Adversaire au hasard : une seule place d'attente, prise ou libérée par transaction (pas de doublon)
export async function chercherAdversaire(uid: string, pseudo: string): Promise<string> {
  const placeRef = ref(rtdb, 'attente')
  let monDuel = ''
  let rejoint = ''
  const res = await runTransaction(placeRef, (place: { uid: string; duel: string; t: number } | null) => {
    // Place libre, à moi, ou abandonnée depuis plus de 2 min : je l'occupe
    if (!place || place.uid === uid || Date.now() - place.t > 120_000) {
      monDuel = monDuel || push(ref(rtdb, 'duels')).key!
      rejoint = ''
      return { uid, duel: monDuel, t: Date.now() }
    }
    rejoint = place.duel
    return null
  })
  // Duel trouvé mais annulé entre-temps : on retente, cette fois en occupant la place
  if (rejoint) return (await rejoindre(rejoint, uid, pseudo)) ? rejoint : chercherAdversaire(uid, pseudo)
  if (res.committed) {
    await set(ref(rtdb, `duels/${monDuel}`), nouveauDuel(uid, pseudo))
    onDisconnect(placeRef).remove()
  }
  return monDuel
}

export async function annulerRecherche(uid: string, duel: string) {
  await runTransaction(ref(rtdb, 'attente'), (place: { uid: string } | null) => (place?.uid === uid ? null : place))
  await update(ref(rtdb, `duels/${duel}`), { etat: 'fini' })
}

// Réponse : 100 points si juste, + jusqu'à 50 de bonus de rapidité
export async function repondreDuel(id: string, uid: string, i: number, juste: boolean, ms: number, scoreActuel: number) {
  const points = juste ? 100 + Math.round(50 * Math.max(0, 1 - ms / (SECONDES_DUEL * 1000))) : 0
  await update(ref(rtdb, `duels/${id}/joueurs/${uid}`), { [`r/${i}`]: { j: juste, ms }, score: scoreActuel + points })
}

export const terminerDuel = (id: string) => update(ref(rtdb, `duels/${id}`), { etat: 'fini' })
