import { push, ref, serverTimestamp, set } from 'firebase/database'
import { auth, rtdb } from './firebase'

// Rapports de plantage automatiques : chaque erreur JavaScript non rattrapée est envoyée dans la base temps réel
// (sous « duels/plantages », chemin déjà ouvert aux joueurs connectés). Lecture côté développeur :
//   npx firebase-tools database:get /duels/plantages --project croivez
// Au plus 5 rapports par session, jamais deux fois le même message.
const WEB = String(import.meta.env.VITE_WEB ?? 'dev')
const envoyes = new Set<string>()

export function signalerPlantage(erreur: unknown, origine: string) {
  try {
    const e = erreur instanceof Error ? erreur : new Error(String((erreur as { message?: string })?.message ?? erreur))
    const cle = `${origine}:${e.message}`
    if (envoyes.has(cle) || envoyes.size >= 5 || import.meta.env.DEV) return
    envoyes.add(cle)
    set(push(ref(rtdb, 'duels/plantages')), {
      origine,
      message: e.message.slice(0, 500),
      pile: (e.stack ?? '').slice(0, 2500),
      ecran: location.hash || '/',
      contenu: WEB,
      appareil: navigator.userAgent.slice(0, 200),
      joueur: auth.currentUser?.uid ?? null,
      t: serverTimestamp(),
    }).catch(() => { /* hors ligne : tant pis */ })
  } catch { /* le signalement ne doit jamais planter lui-même */ }
}

export function surveillerPlantages() {
  window.addEventListener('error', (ev) => signalerPlantage(ev.error ?? ev.message, 'erreur'))
  window.addEventListener('unhandledrejection', (ev) => signalerPlantage(ev.reason, 'promesse'))
}
