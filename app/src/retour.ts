import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics'
import { natif } from './firebase'

// Préférences sons et vibrations (par appareil)
const lire = (k: string) => { try { return localStorage.getItem(k) !== '0' } catch { return true } }
export const prefsRetour = { son: lire('son'), vibration: lire('vibration') }
export function reglerRetour(k: 'son' | 'vibration', v: boolean) {
  prefsRetour[k] = v
  try { localStorage.setItem(k, v ? '1' : '0') } catch { /* stockage indisponible */ }
}

// Sons doux synthétisés (pas de fichier à charger) : deux notes montantes si juste, une note grave si faux
let ctx: AudioContext | null = null
function notes(freqs: number[], duree = 0.12, type: OscillatorType = 'sine', volume = 0.08) {
  if (!prefsRetour.son) return
  try {
    ctx ??= new AudioContext()
    const t0 = ctx.currentTime
    freqs.forEach((f, i) => {
      const o = ctx!.createOscillator()
      const g = ctx!.createGain()
      o.type = type
      o.frequency.value = f
      const t = t0 + i * duree
      g.gain.setValueAtTime(0, t)
      g.gain.linearRampToValueAtTime(volume, t + 0.015)
      g.gain.exponentialRampToValueAtTime(0.0001, t + duree * 1.8)
      o.connect(g).connect(ctx!.destination)
      o.start(t)
      o.stop(t + duree * 2)
    })
  } catch { /* audio indisponible */ }
}

async function vibrer(juste: boolean | 'fin') {
  if (!prefsRetour.vibration) return
  try {
    if (natif) {
      if (juste === 'fin') await Haptics.impact({ style: ImpactStyle.Medium })
      else await Haptics.notification({ type: juste ? NotificationType.Success : NotificationType.Warning })
    } else navigator.vibrate?.(juste === true ? 15 : juste === 'fin' ? [20, 60, 20] : [30, 40, 30])
  } catch { /* pas de vibreur */ }
}

export function retourReponse(juste: boolean) {
  if (juste) notes([660, 880]); else notes([220], 0.2, 'triangle', 0.06)
  vibrer(juste)
}

// Fin du chrono : plus de bip (jugé pénible), seulement une légère vibration sur téléphone dans les 3 dernières secondes
export function retourTic(secondes: number) {
  if (secondes <= 3 && prefsRetour.vibration) {
    try { if (natif) Haptics.impact({ style: ImpactStyle.Light }); else navigator.vibrate?.(12) } catch { /* pas de vibreur */ }
  }
}

export function retourFin(bon: boolean) {
  notes(bon ? [523, 659, 784, 1047] : [392, 330], 0.11)
  vibrer('fin')
}
