import { Capacitor } from '@capacitor/core'
import { Network } from '@capacitor/network'
import { FAMILLES, type Famille } from './themes'
import { imagesDe, type SousThemeId } from './quiz/engine'
import { telechargerImages } from './components/Img'

// Téléchargement en arrière-plan des images des thèmes, uniquement en Wi-Fi :
// d'abord les familles ouvertes (celles qu'on joue), puis les autres pendant qu'on gagne de quoi les débloquer.
const CLE = 'hors-ligne'
const lus = (): Set<string> => { try { return new Set(JSON.parse(localStorage.getItem(CLE) ?? '[]')) } catch { return new Set() } }
const noter = (k: string) => { const s = lus(); s.add(k); try { localStorage.setItem(CLE, JSON.stringify([...s])) } catch { /* rien */ } }

async function enWifi() {
  if (Capacitor.isPluginAvailable('Network')) return (await Network.getStatus()).connectionType === 'wifi'
  // Sans le module réseau (ancienne version native, ou PC) : on ne télécharge pas d'office
  const c = (navigator as unknown as { connection?: { type?: string } }).connection
  return c?.type === 'wifi'
}

let enCours = false
export async function telechargerEnFond(ouvertes: (k: Famille) => boolean) {
  if (enCours || !Capacitor.isNativePlatform()) return
  enCours = true
  try {
    const ordre = [...FAMILLES].sort((a, b) => Number(ouvertes(b.k)) - Number(ouvertes(a.k)))
    for (const f of ordre) {
      if (lus().has(f.k)) continue
      if (!(await enWifi())) break // passage en 4G : on s'arrête, on reprendra au prochain Wi-Fi
      const srcs = [...new Set((await Promise.all(f.subs.filter((s) => s.jouable).map((s) => imagesDe(s.jouable as SousThemeId)))).flat())]
      await telechargerImages(srcs, () => {}, 2) // 2 à la fois : discret, ne ralentit pas le jeu
      noter(f.k)
    }
  } catch { /* hors ligne ou erreur : nouvel essai plus tard */ }
  enCours = false
}

// Reprend dès que le téléphone repasse en Wi-Fi
export function surveillerWifi(relancer: () => void) {
  if (!Capacitor.isPluginAvailable('Network')) return () => {}
  const h = Network.addListener('networkStatusChange', (s) => { if (s.connectionType === 'wifi') relancer() })
  return () => { h.then((x) => x.remove()) }
}
