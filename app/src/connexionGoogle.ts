import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth'
import { onValue, ref, remove, serverTimestamp, set } from 'firebase/database'
import { auth, natif, rtdb } from './firebase'

// Connexion Google dans les applis (iPhone, Android, .exe) : Google refuse sa fenêtre de connexion dans une appli.
// On ouvre donc la page « relais » du site dans le vrai navigateur ; elle connecte le joueur avec Google, chiffre
// le jeton obtenu et le dépose dans la base temps réel sous un numéro aléatoire. L'appli, qui attend sur ce numéro,
// le déchiffre et se connecte avec. La clé ne passe que par l'adresse (après le #, jamais envoyée à un serveur).
const SITE = 'https://kwakwa-ratatouille.github.io/Croivez/'
export const googleViaNavigateur = natif || navigator.userAgent.includes('Electron')

const b64 = (o: ArrayBuffer | Uint8Array) => btoa(String.fromCharCode(...new Uint8Array(o))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
const deB64 = (s: string) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0))
const cle = (brute: Uint8Array, usage: KeyUsage) => crypto.subtle.importKey('raw', brute, 'AES-GCM', false, [usage])

type Jetons = { i?: string | null; a?: string | null }

// Côté appli : ouvre le navigateur et attend le jeton. Renvoie une fonction pour annuler l'attente.
export async function connexionParNavigateur(fini: (e?: unknown) => void): Promise<() => void> {
  const id = b64(crypto.getRandomValues(new Uint8Array(18)))
  const brute = crypto.getRandomValues(new Uint8Array(32))
  const k = await cle(brute, 'decrypt')
  const noeud = ref(rtdb, `relaisGoogle/${id}`)
  let ok = false
  const stop = onValue(noeud, async (snap) => {
    const d = snap.val()?.d as string | undefined
    if (!d || ok) return
    ok = true
    stop()
    try {
      const tout = deB64(d)
      const clair = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: tout.slice(0, 12) }, k, tout.slice(12))
      const j = JSON.parse(new TextDecoder().decode(clair)) as Jetons
      await signInWithCredential(auth, GoogleAuthProvider.credential(j.i, j.a))
      remove(noeud).catch(() => {})
      fini()
    } catch (e) { remove(noeud).catch(() => {}); fini(e) }
  })
  // Electron : window.open part dans le navigateur par défaut ; iPhone/Android : Capacitor ouvre Safari/Chrome
  window.open(`${SITE}#/relais-google?id=${id}&k=${b64(brute)}`, '_blank')
  return () => { ok = true; stop() }
}

// Côté page relais (navigateur) : chiffre les jetons Google et les dépose pour l'appli
export async function deposerJetons(id: string, k: string, j: Jetons) {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const chiffre = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await cle(deB64(k), 'encrypt'), new TextEncoder().encode(JSON.stringify(j)))
  const tout = new Uint8Array(12 + chiffre.byteLength)
  tout.set(iv)
  tout.set(new Uint8Array(chiffre), 12)
  await set(ref(rtdb, `relaisGoogle/${id}`), { d: b64(tout), t: serverTimestamp() })
}
