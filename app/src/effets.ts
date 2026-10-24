import type { Lang } from './i18n'
import { confettis } from './confettis'

// Effets achetables en boutique : thème de couleur de l'appli, fête de victoire et son des bonnes réponses.
// Tout est dessiné ou synthétisé sur place : aucun fichier à télécharger.
export type Sorte = 'couleur' | 'victoire' | 'son'
export type Effet = { id: string; sorte: Sorte; nom: Record<Lang, string>; prix: number; emoji: string; luxe?: 1 | 2 }

export const EFFETS: Effet[] = [
  // Thèmes de couleur (palette complète de l'appli)
  { id: 'couleur-defaut', sorte: 'couleur', nom: { fr: 'Croivez (classique)', en: 'Croivez (classic)' }, prix: 0, emoji: '🎨' },
  { id: 'couleur-ocean', sorte: 'couleur', nom: { fr: 'Océan', en: 'Ocean' }, prix: 600, emoji: '🌊' },
  { id: 'couleur-menthe', sorte: 'couleur', nom: { fr: 'Menthe', en: 'Mint' }, prix: 600, emoji: '🌿' },
  { id: 'couleur-lavande', sorte: 'couleur', nom: { fr: 'Lavande', en: 'Lavender' }, prix: 600, emoji: '💜' },
  { id: 'couleur-bonbon', sorte: 'couleur', nom: { fr: 'Bonbon', en: 'Candy' }, prix: 800, emoji: '🍬' },
  { id: 'couleur-papier', sorte: 'couleur', nom: { fr: 'Parchemin', en: 'Parchment' }, prix: 900, emoji: '📜' },
  { id: 'couleur-foret', sorte: 'couleur', nom: { fr: 'Forêt de nuit', en: 'Night forest' }, prix: 1200, emoji: '🌲' },
  { id: 'couleur-neon', sorte: 'couleur', nom: { fr: 'Néon', en: 'Neon' }, prix: 1500, emoji: '🌃' },
  { id: 'couleur-or', sorte: 'couleur', nom: { fr: 'Minuit doré', en: 'Golden midnight' }, prix: 4000, emoji: '👑', luxe: 1 },
  // Fêtes de victoire (fin de partie réussie, duel gagné)
  { id: 'victoire-confettis', sorte: 'victoire', nom: { fr: 'Confettis', en: 'Confetti' }, prix: 0, emoji: '🎊' },
  { id: 'victoire-pieces', sorte: 'victoire', nom: { fr: 'Pluie de pièces', en: 'Coin rain' }, prix: 500, emoji: '🪙' },
  { id: 'victoire-etoiles', sorte: 'victoire', nom: { fr: 'Étoiles filantes', en: 'Shooting stars' }, prix: 600, emoji: '🌠' },
  { id: 'victoire-coeurs', sorte: 'victoire', nom: { fr: 'Pluie de cœurs', en: 'Heart rain' }, prix: 500, emoji: '💖' },
  { id: 'victoire-emojis', sorte: 'victoire', nom: { fr: 'Explosion d’émojis', en: 'Emoji blast' }, prix: 700, emoji: '🤩' },
  { id: 'victoire-artifice', sorte: 'victoire', nom: { fr: 'Feu d’artifice', en: 'Fireworks' }, prix: 1200, emoji: '🎆' },
  { id: 'victoire-onde', sorte: 'victoire', nom: { fr: 'Onde de choc', en: 'Shockwave' }, prix: 1500, emoji: '💥' },
  { id: 'victoire-arc', sorte: 'victoire', nom: { fr: 'Arc-en-ciel', en: 'Rainbow' }, prix: 1800, emoji: '🌈' },
  { id: 'victoire-royale', sorte: 'victoire', nom: { fr: 'Sacre royal', en: 'Royal crowning' }, prix: 6000, emoji: '👑', luxe: 1 },
  // Sons des bonnes et mauvaises réponses
  { id: 'son-classique', sorte: 'son', nom: { fr: 'Classique', en: 'Classic' }, prix: 0, emoji: '🔔' },
  { id: 'son-arcade', sorte: 'son', nom: { fr: 'Arcade 8-bit', en: '8-bit arcade' }, prix: 400, emoji: '🕹️' },
  { id: 'son-cloche', sorte: 'son', nom: { fr: 'Clochettes', en: 'Chimes' }, prix: 400, emoji: '🎐' },
  { id: 'son-bulle', sorte: 'son', nom: { fr: 'Bulles', en: 'Bubbles' }, prix: 400, emoji: '🫧' },
  { id: 'son-boing', sorte: 'son', nom: { fr: 'Dessin animé', en: 'Cartoon' }, prix: 500, emoji: '🤪' },
  { id: 'son-canard', sorte: 'son', nom: { fr: 'Canard', en: 'Duck' }, prix: 500, emoji: '🦆' },
  { id: 'son-laser', sorte: 'son', nom: { fr: 'Laser', en: 'Laser' }, prix: 600, emoji: '🔫' },
  { id: 'son-caisse', sorte: 'son', nom: { fr: 'Tiroir-caisse', en: 'Cash register' }, prix: 700, emoji: '💰' },
  { id: 'son-piano', sorte: 'son', nom: { fr: 'Piano', en: 'Piano' }, prix: 700, emoji: '🎹' },
  { id: 'son-fanfare', sorte: 'son', nom: { fr: 'Fanfare', en: 'Fanfare' }, prix: 3000, emoji: '🎺', luxe: 1 },
]
export const CHAMP_EFFET: Record<Sorte, 'couleurApp' | 'victoire' | 'sonReponse'> = { couleur: 'couleurApp', victoire: 'victoire', son: 'sonReponse' }

// Effets portés sur cet appareil (mis à jour par Layout à partir du profil)
export const portes = { son: 'son-classique', victoire: 'victoire-confettis' }
export function appliquerEffets(p: { couleurApp?: string; victoire?: string; sonReponse?: string } | null | undefined) {
  portes.son = p?.sonReponse || 'son-classique'
  portes.victoire = p?.victoire || 'victoire-confettis'
  const c = (p?.couleurApp || 'couleur-defaut').replace('couleur-', '')
  if (c === 'defaut') delete document.documentElement.dataset.couleur
  else document.documentElement.dataset.couleur = c
}

// ——— Sons synthétisés ———
type Note = { f: number; f2?: number; d: number; t?: number; type?: OscillatorType; v?: number }
const N = (f: number, d: number, t: number, type: OscillatorType = 'sine', v = 0.08, f2?: number): Note => ({ f, f2, d, t, type, v })
const SONS: Record<string, { ok: Note[]; ko: Note[] }> = {
  'son-classique': { ok: [N(660, .12, 0), N(880, .12, .12)], ko: [N(220, .2, 0, 'triangle', .06)] },
  'son-arcade': { ok: [N(988, .07, 0, 'square', .05), N(1319, .16, .07, 'square', .05)], ko: [N(392, .1, 0, 'square', .05), N(262, .1, .1, 'square', .05), N(196, .2, .2, 'square', .05)] },
  'son-cloche': { ok: [N(1568, .5, 0, 'sine', .07), N(2093, .6, .09, 'sine', .06), N(2637, .7, .18, 'sine', .04)], ko: [N(415, .5, 0, 'sine', .07), N(392, .6, .15, 'sine', .06)] },
  'son-bulle': { ok: [N(400, .08, 0, 'sine', .1, 1200), N(600, .08, .1, 'sine', .1, 1600)], ko: [N(500, .15, 0, 'sine', .09, 150)] },
  'son-boing': { ok: [N(180, .35, 0, 'sine', .12, 900)], ko: [N(500, .18, 0, 'triangle', .1, 380), N(380, .18, .2, 'triangle', .1, 290), N(290, .4, .4, 'triangle', .1, 150)] },
  'son-canard': { ok: [N(820, .09, 0, 'sawtooth', .05, 560), N(820, .09, .13, 'sawtooth', .05, 560)], ko: [N(360, .25, 0, 'sawtooth', .05, 220)] },
  'son-laser': { ok: [N(1800, .18, 0, 'sawtooth', .04, 300), N(2400, .14, .16, 'square', .03, 600)], ko: [N(300, .35, 0, 'sawtooth', .05, 60)] },
  'son-caisse': { ok: [N(2637, .06, 0, 'triangle', .07), N(3136, .3, .07, 'triangle', .07), N(4186, .4, .14, 'sine', .04)], ko: [N(160, .12, 0, 'square', .05), N(160, .2, .16, 'square', .05)] },
  'son-piano': { ok: [N(523, .5, 0, 'triangle', .06), N(659, .5, 0, 'triangle', .05), N(784, .6, 0, 'triangle', .05)], ko: [N(311, .5, 0, 'triangle', .06), N(370, .5, 0, 'triangle', .05)] },
  'son-fanfare': { ok: [N(523, .1, 0, 'square', .04), N(659, .1, .1, 'square', .04), N(784, .1, .2, 'square', .04), N(1047, .4, .3, 'square', .045), N(784, .4, .3, 'triangle', .04)], ko: [N(392, .2, 0, 'square', .04), N(370, .2, .2, 'square', .04), N(349, .5, .4, 'square', .04)] },
}
let ctx: AudioContext | null = null
export function jouerNotes(notes: Note[]) {
  try {
    ctx ??= new AudioContext()
    const t0 = ctx.currentTime
    for (const n of notes) {
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      const t = t0 + (n.t ?? 0)
      o.type = n.type ?? 'sine'
      o.frequency.setValueAtTime(n.f, t)
      if (n.f2) o.frequency.exponentialRampToValueAtTime(n.f2, t + n.d)
      g.gain.setValueAtTime(0, t)
      g.gain.linearRampToValueAtTime(n.v ?? 0.08, t + 0.012)
      g.gain.exponentialRampToValueAtTime(0.0001, t + n.d * 1.8)
      o.connect(g).connect(ctx.destination)
      o.start(t)
      o.stop(t + n.d * 2)
    }
  } catch { /* audio indisponible */ }
}
export const sonReponse = (juste: boolean, id = portes.son) => jouerNotes((SONS[id] ?? SONS['son-classique'])[juste ? 'ok' : 'ko'])

// ——— Fêtes de victoire (DOM + animations CSS, retirées toutes seules) ———
const COULEURS = ['#FF4FD8', '#5B8DEF', '#4FAE6A', '#FFE08A', '#E3574B', '#A35BE0', '#2FB5B0']
const PLUIES: Record<string, string[]> = {
  'victoire-pieces': ['🪙', '💰', '🪙'], 'victoire-etoiles': ['⭐', '🌟', '✨'], 'victoire-coeurs': ['💖', '💕', '💗', '💘'],
  'victoire-emojis': ['🤩', '🔥', '👏', '🎉', '💯', '🥳'], 'victoire-royale': ['👑', '💎', '✨'],
}
export function feter(id = portes.victoire, intensite: 1 | 2 = 1) {
  try {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (!PLUIES[id] && !['victoire-artifice', 'victoire-onde', 'victoire-arc'].includes(id)) { confettis(intensite); return }
    const zone = document.createElement('div')
    zone.className = `confettis fete-${id.replace('victoire-', '')}`
    zone.setAttribute('aria-hidden', 'true')
    const ajoute = (css: string, txt = '', cls = '') => { const c = document.createElement('i'); c.style.cssText = css; if (txt) c.textContent = txt; if (cls) c.className = cls; zone.appendChild(c) }
    const pluie = PLUIES[id]
    if (id === 'victoire-artifice') {
      // Gerbes : des étincelles partent du même point dans toutes les directions
      for (let g = 0; g < (intensite === 2 ? 6 : 4); g++) {
        const x = 15 + Math.random() * 70, y = 15 + Math.random() * 40, coul = COULEURS[g % COULEURS.length]
        for (let i = 0; i < 26; i++) {
          const a = (i / 26) * Math.PI * 2, r = 70 + Math.random() * 60
          ajoute(`left:${x}%;top:${y}%;background:${coul};box-shadow:0 0 6px ${coul};--dx:${Math.cos(a) * r}px;--dy:${Math.sin(a) * r}px;animation-delay:${g * .35}s`, '', 'eclat')
        }
      }
    } else if (id === 'victoire-onde') {
      for (let i = 0; i < 4; i++) ajoute(`animation-delay:${i * .25}s;border-color:${COULEURS[i]}`, '', 'onde')
    } else if (id === 'victoire-arc') {
      ajoute('', '', 'arc')
      for (let i = 0; i < 30; i++) ajoute(`left:${Math.random() * 100}%;top:${20 + Math.random() * 50}%;animation-delay:${.3 + Math.random() * .8}s`, '✦', 'paillette')
    }
    if (pluie) {
      const n = intensite === 2 ? 40 : 24
      for (let i = 0; i < n; i++) {
        ajoute(`left:${Math.random() * 100}%;font-size:${18 + Math.random() * 16}px;animation-delay:${Math.random() * .7}s;animation-duration:${1.8 + Math.random() * 1.4}s;--rot:${Math.random() * 720 - 360}deg`, pluie[i % pluie.length], 'goutte')
      }
    }
    if (id === 'victoire-royale') ajoute('', '👑', 'couronne')
    document.body.appendChild(zone)
    setTimeout(() => zone.remove(), 4200)
  } catch { /* pas de DOM */ }
}
