import { limitToLast, onValue, push, query, ref, remove, set } from 'firebase/database'
import { rtdb } from './firebase'

// Messagerie entre amis : une conversation par paire de joueurs, dans la base temps réel.
// Rangée sous « duels/chat-A_B » : les règles existantes ouvrent ce chemin aux joueurs connectés.
export type Message = { de: string; txt: string; t: number }
const chemin = (a: string, b: string) => `duels/chat-${[a, b].sort().join('_')}/m`

// Chaque message laisse aussi un « non lu » chez l'ami (un par expéditeur) : bulle sur Multi tant qu'il n'a pas ouvert la conversation
export const envoyerMessage = async (moi: string, ami: string, txt: string, pseudo = '', notifier = true) => {
  const propre = txt.trim().slice(0, 500)
  await push(ref(rtdb, chemin(moi, ami)), { de: moi, txt: propre, t: Date.now() })
  if (notifier) await set(ref(rtdb, `invitations/${ami}/msg-${moi}`), { type: 'msg', de: pseudo || '?', uid: moi, txt: propre.slice(0, 80), t: Date.now() }).catch(() => {})
}
// Quiz du jour envoyé à un ami : une invitation (bouton « Jouer ») et une trace dans la conversation
export const envoyerQuizJour = async (moi: string, pseudo: string, ami: string, titre: string, score: { bonnes: number; total: number } | null) => {
  await set(ref(rtdb, `invitations/${ami}/jour-${moi}`), { type: 'jour', de: pseudo, uid: moi, txt: titre, ...(score ? { bonnes: score.bonnes, total: score.total } : {}), t: Date.now() })
  await envoyerMessage(moi, ami, `🗓️ Quiz du jour (${titre}) : ${score ? `j’ai fait ${score.bonnes}/${score.total}, tu fais mieux ?` : 'on le fait ?'} 👉 Accueil → Quiz du jour`, pseudo, false)
}

// Conversation ouverte : les messages de cet ami sont lus
export const marquerLu = (moi: string, ami: string) => remove(ref(rtdb, `invitations/${moi}/msg-${ami}`)).catch(() => {})
// Expéditeurs des messages non lus
export const ecouterNonLus = (moi: string, cb: (uids: string[]) => void) =>
  onValue(ref(rtdb, `invitations/${moi}`), (s) => cb(Object.entries((s.val() ?? {}) as Record<string, { type?: string; uid?: string }>).filter(([, v]) => v?.type === 'msg' && v.uid).map(([, v]) => v.uid!)))

export const ecouterMessages = (moi: string, ami: string, cb: (l: Message[]) => void) =>
  onValue(query(ref(rtdb, chemin(moi, ami)), limitToLast(60)), (s) => cb(Object.values((s.val() ?? {}) as Record<string, Message>).sort((x, y) => x.t - y.t)))
