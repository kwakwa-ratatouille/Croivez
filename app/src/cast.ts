// Chromecast : le téléphone (Android, ou un ordi avec Chrome) lance le récepteur Croivez sur la télé (public/cast.html),
// qui crée une partie en mode télé et renvoie son code ; le téléphone rejoint alors la partie tout seul.
// L'identifiant vient de la console Google Cast (application « Custom Receiver » pointant vers cast.html).
export const CAST_APP_ID = '93E135C6'
export const NS_CAST = 'urn:x-cast:fr.croivez.tv'

/* eslint-disable @typescript-eslint/no-explicit-any */
type Fenetre = Window & { cast?: any; chrome?: any; __onGCastApiAvailable?: (ok: boolean) => void }
const w = window as Fenetre

export const estAndroid = () => /Android/i.test(navigator.userAgent)
export const estIos = () => /iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
// Le SDK de diffusion ne marche que dans Chrome (ordinateur ou Android), pas dans une appli ni sur iPhone
export const chromeCompatible = () => /Chrome\//.test(navigator.userAgent) && !/Edg\/|OPR\/|SamsungBrowser|wv\)/.test(navigator.userAgent) && !estIos()

let pret: Promise<boolean> | null = null
export function chargerCast(): Promise<boolean> {
  if (pret) return pret
  pret = new Promise((ok) => {
    if (!CAST_APP_ID || !chromeCompatible()) return ok(false)
    w.__onGCastApiAvailable = (dispo) => {
      if (!dispo) return ok(false)
      w.cast.framework.CastContext.getInstance().setOptions({ receiverApplicationId: CAST_APP_ID, autoJoinPolicy: w.chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED })
      ok(true)
    }
    const s = document.createElement('script')
    s.src = 'https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1'
    s.onerror = () => ok(false)
    document.head.appendChild(s)
    setTimeout(() => ok(false), 10000)
  })
  return pret
}

// Ouvre le choix de l'appareil (Chromecast de la maison), puis attend le code du salon créé sur la télé
export async function caster(surCode: (code: string) => void) {
  const ctx = w.cast.framework.CastContext.getInstance()
  if (!ctx.getCurrentSession()) await ctx.requestSession()
  const session = ctx.getCurrentSession()
  if (!session) throw new Error('pas de session')
  session.addMessageListener(NS_CAST, (_ns: string, msg: string) => {
    try { const m = typeof msg === 'string' ? JSON.parse(msg) : msg; if (m?.type === 'salon' && m.code) surCode(m.code) } catch { /* message inconnu */ }
  })
  // Si la télé a déjà créé la partie (reconnexion), elle renvoie le code
  session.sendMessage(NS_CAST, { type: 'code' }).catch(() => {})
}
export const arreterCast = () => w.cast?.framework?.CastContext.getInstance().endCurrentSession(true)
