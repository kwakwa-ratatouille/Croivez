import { limitToLast, onValue, push, query, ref } from 'firebase/database'
import { rtdb } from './firebase'

// Messagerie entre amis : une conversation par paire de joueurs, dans la base temps réel.
// Rangée sous « duels/chat-A_B » : les règles existantes ouvrent ce chemin aux joueurs connectés.
export type Message = { de: string; txt: string; t: number }
const chemin = (a: string, b: string) => `duels/chat-${[a, b].sort().join('_')}/m`

export const envoyerMessage = (moi: string, ami: string, txt: string) =>
  push(ref(rtdb, chemin(moi, ami)), { de: moi, txt: txt.trim().slice(0, 500), t: Date.now() })

export const ecouterMessages = (moi: string, ami: string, cb: (l: Message[]) => void) =>
  onValue(query(ref(rtdb, chemin(moi, ami)), limitToLast(60)), (s) => cb(Object.values((s.val() ?? {}) as Record<string, Message>).sort((x, y) => x.t - y.t)))
