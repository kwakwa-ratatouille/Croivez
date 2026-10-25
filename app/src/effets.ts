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
  { id: 'victoire-tonnerre', sorte: 'victoire', nom: { fr: 'Coup de tonnerre', en: 'Thunderstrike' }, prix: 8000, emoji: '⚡', luxe: 1 },
  { id: 'victoire-galaxie', sorte: 'victoire', nom: { fr: 'Galaxie', en: 'Galaxy' }, prix: 12000, emoji: '🌌', luxe: 1 },
  { id: 'victoire-diamants', sorte: 'victoire', nom: { fr: 'Pluie de diamants', en: 'Diamond rain' }, prix: 15000, emoji: '💎', luxe: 1 },
  { id: 'victoire-supernova', sorte: 'victoire', nom: { fr: 'Supernova', en: 'Supernova' }, prix: 30000, emoji: '☀️', luxe: 2 },
  // Effets mignons
  { id: 'victoire-bonbons', sorte: 'victoire', nom: { fr: 'Pluie de bonbons', en: 'Candy rain' }, prix: 600, emoji: '🍭' },
  { id: 'victoire-bulles', sorte: 'victoire', nom: { fr: 'Bulles de savon', en: 'Soap bubbles' }, prix: 700, emoji: '🫧' },
  { id: 'victoire-chatons', sorte: 'victoire', nom: { fr: 'Pluie de chatons', en: 'Kitten rain' }, prix: 800, emoji: '😻' },
  { id: 'victoire-fleurs', sorte: 'victoire', nom: { fr: 'Pétales de sakura', en: 'Sakura petals' }, prix: 1000, emoji: '🌸' },
  { id: 'victoire-ballons', sorte: 'victoire', nom: { fr: 'Lâcher de ballons', en: 'Balloon release' }, prix: 1200, emoji: '🎈' },
  { id: 'victoire-papillons', sorte: 'victoire', nom: { fr: 'Envol de papillons', en: 'Butterflies' }, prix: 2000, emoji: '🦋' },
  { id: 'victoire-licorne', sorte: 'victoire', nom: { fr: 'Licorne arc-en-ciel', en: 'Rainbow unicorn' }, prix: 7000, emoji: '🦄', luxe: 1 },
  { id: 'victoire-aurore', sorte: 'victoire', nom: { fr: 'Aurore boréale', en: 'Northern lights' }, prix: 10000, emoji: '🌌', luxe: 1 },
  { id: 'victoire-kawaii', sorte: 'victoire', nom: { fr: 'Fête kawaii', en: 'Kawaii party' }, prix: 25000, emoji: '🥳', luxe: 2 },
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
  { id: 'son-harpe', sorte: 'son', nom: { fr: 'Harpe céleste', en: 'Celestial harp' }, prix: 5000, emoji: '🪕', luxe: 1 },
  { id: 'son-cristal', sorte: 'son', nom: { fr: 'Cristal', en: 'Crystal' }, prix: 7000, emoji: '💠', luxe: 1 },
  { id: 'son-jackpot', sorte: 'son', nom: { fr: 'Jackpot', en: 'Jackpot' }, prix: 9000, emoji: '🎰', luxe: 1 },
  { id: 'son-orchestre', sorte: 'son', nom: { fr: 'Orchestre royal', en: 'Royal orchestra' }, prix: 20000, emoji: '🎻', luxe: 2 },
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
  'son-harpe': { ok: [523, 659, 784, 1047, 1319, 1568].map((f, i) => N(f, .35, i * .045, 'triangle', .045)), ko: [N(392, .4, 0, 'triangle', .05), N(349, .5, .12, 'triangle', .05)] },
  'son-cristal': { ok: [N(2093, .8, 0, 'sine', .05), N(2637, .9, .06, 'sine', .045), N(3136, 1, .12, 'sine', .04), N(4186, 1.1, .18, 'sine', .03)], ko: [N(1046, .5, 0, 'sine', .05, 700)] },
  'son-jackpot': { ok: [...[1047, 1319, 1568, 2093].map((f, i) => N(f, .06, i * .06, 'square', .035)), ...[2093, 2637, 2093, 2637].map((f, i) => N(f, .05, .26 + i * .05, 'triangle', .05))], ko: [N(300, .3, 0, 'square', .04, 150)] },
  'son-orchestre': { ok: [N(262, .9, 0, 'sawtooth', .025), N(330, .9, 0, 'sawtooth', .022), N(392, .9, 0, 'sawtooth', .022), N(523, .9, .25, 'triangle', .05), N(659, .9, .25, 'triangle', .04), N(784, 1.2, .5, 'triangle', .05), N(1047, 1.2, .5, 'sine', .04)], ko: [N(220, .7, 0, 'sawtooth', .03), N(207, .8, .25, 'sawtooth', .03)] },
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
// Seuls transform/translate/scale/opacity sont animés (calculés par la carte graphique) : pas de lag sur téléphone.
const COULEURS = ['#FF4FD8', '#5B8DEF', '#4FAE6A', '#FFE08A', '#E3574B', '#A35BE0', '#2FB5B0']
const PASTELS = ['#F9A8D4', '#A5B4FC', '#86EFAC', '#FDE68A', '#FCA5A5', '#C4B5FD', '#67E8F9']
const PLUIES: Record<string, string[]> = {
  'victoire-pieces': ['🪙', '💰', '🪙'], 'victoire-diamants': ['💎', '💠', '✨', '💎'], 'victoire-galaxie': ['✦', '✧', '⭐'],
  'victoire-emojis': ['🤩', '🔥', '👏', '🎉', '💯', '🥳'], 'victoire-royale': ['👑', '💎', '✨'],
  'victoire-bonbons': ['🍬', '🍭', '🧁', '🍩', '🍫'], 'victoire-chatons': ['🐱', '😺', '😻', '🐾', '😸'],
}
// Ce qui monte en se balançant (au lieu de tomber)
const ENVOLS: Record<string, string[]> = { 'victoire-coeurs': ['💖', '💕', '💗', '💘', '💝'], 'victoire-ballons': ['🎈'] }
const SPECIAUX = ['victoire-artifice', 'victoire-onde', 'victoire-arc', 'victoire-tonnerre', 'victoire-galaxie', 'victoire-supernova', 'victoire-etoiles',
  'victoire-bulles', 'victoire-fleurs', 'victoire-papillons', 'victoire-licorne', 'victoire-aurore', 'victoire-kawaii']
const hasard = (a: number, b: number) => a + Math.random() * (b - a)

export function feter(id = portes.victoire, intensite: 1 | 2 = 1) {
  try {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (!PLUIES[id] && !ENVOLS[id] && !SPECIAUX.includes(id)) { confettis(intensite); return }
    const zone = document.createElement('div')
    zone.className = `confettis fete-${id.replace('victoire-', '')}`
    zone.setAttribute('aria-hidden', 'true')
    const ajoute = (css: string, txt = '', cls = '') => { const c = document.createElement('i'); c.style.cssText = css; if (txt) c.textContent = txt; if (cls) c.className = cls; zone.appendChild(c); return c }
    const fort = intensite === 2
    // Éclats qui partent d'un point (la lueur est dans le fond, pas d'ombre animée)
    const gerbe = (x: string, y: string, n: number, r0: number, r1: number, delai: number, couleurs = COULEURS) => {
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + hasard(-.15, .15), r = hasard(r0, r1)
        ajoute(`left:${x};top:${y};--c:${couleurs[i % couleurs.length]};--dx:${Math.cos(a) * r}px;--dy:${Math.sin(a) * r}px;animation-delay:${delai}s`, '', 'eclat')
      }
    }
    const envol = (emojis: string[], n: number, taille: [number, number]) => {
      for (let i = 0; i < n; i++) ajoute(`left:${hasard(2, 94)}%;font-size:${hasard(...taille)}px;animation-delay:${hasard(0, 1)}s,${hasard(0, 1)}s;animation-duration:${hasard(2.4, 3.4)}s,${hasard(.9, 1.5)}s;${id === 'victoire-ballons' ? `filter:hue-rotate(${Math.floor(hasard(0, 360))}deg)` : ''}`, emojis[i % emojis.length], 'monte')
    }
    const paillettes = (n: number, y0 = 10, y1 = 80, d0 = .2) => {
      for (let i = 0; i < n; i++) ajoute(`left:${hasard(3, 95)}%;top:${hasard(y0, y1)}%;color:${PASTELS[i % PASTELS.length]};animation-delay:${d0 + hasard(0, 1.2)}s`, i % 3 ? '✦' : '✧', 'paillette')
    }

    if (id === 'victoire-artifice') {
      for (let g = 0; g < (fort ? 6 : 4); g++) gerbe(`${hasard(15, 85)}%`, `${hasard(15, 55)}%`, 22, 70, 130, g * .35, [COULEURS[g % COULEURS.length], '#fff'])
    } else if (id === 'victoire-onde') {
      ajoute('', '', 'flash doux')
      for (let i = 0; i < 4; i++) ajoute(`animation-delay:${i * .22}s;border-color:${COULEURS[i]}`, '', 'onde')
      gerbe('50%', '50%', 24, 140, 320, .1)
    } else if (id === 'victoire-arc') {
      ajoute('', '', 'arc')
      paillettes(30, 20, 70, .3)
    } else if (id === 'victoire-etoiles') {
      // Vraies étoiles filantes : une traînée qui traverse l'écran en diagonale
      for (let i = 0; i < (fort ? 14 : 9); i++) ajoute(`left:${hasard(30, 110)}%;top:${hasard(-10, 45)}%;animation-delay:${hasard(0, 1.6)}s`, '', 'filante')
      paillettes(18, 5, 70, 0)
    } else if (id === 'victoire-bulles') {
      for (let i = 0; i < (fort ? 30 : 20); i++) { const t = hasard(24, 70); ajoute(`left:${hasard(2, 94)}%;width:${t}px;height:${t}px;animation-delay:${hasard(0, 1.2)}s,${hasard(0, 1)}s;animation-duration:${hasard(2.6, 3.6)}s,${hasard(1, 1.8)}s`, '', 'bulle') }
    } else if (id === 'victoire-fleurs') {
      for (let i = 0; i < (fort ? 36 : 24); i++) ajoute(`left:${hasard(0, 100)}%;font-size:${hasard(16, 30)}px;animation-delay:${hasard(0, 1.4)}s,${hasard(0, 1)}s;animation-duration:${hasard(2.8, 3.8)}s,${hasard(1.2, 2)}s`, ['🌸', '🌸', '💮', '🌺', '🌷'][i % 5], 'petale')
    } else if (id === 'victoire-papillons') {
      for (let i = 0; i < (fort ? 12 : 8); i++) ajoute(`left:${hasard(5, 90)}%;top:${hasard(55, 95)}%;font-size:${hasard(26, 40)}px;--x1:${hasard(-120, 120)}px;--y1:${hasard(-120, -60)}px;--x2:${hasard(-160, 160)}px;--y2:${hasard(-280, -180)}px;--x3:${hasard(-200, 200)}px;--y3:${hasard(-520, -400)}px;animation-delay:${hasard(0, .8)}s,0s;filter:hue-rotate(${Math.floor(hasard(0, 360))}deg)`, '🦋', 'papillon')
      paillettes(14, 20, 90, .3)
    } else if (id === 'victoire-licorne') {
      // Une licorne traverse l'écran en sautillant, un arc-en-ciel de paillettes derrière elle
      ajoute('', '🦄', 'licorne')
      for (let i = 0; i < 26; i++) ajoute(`left:${4 + i * 3.6}%;top:${44 + Math.sin(i * .9) * 6}%;color:${['#EF4444', '#F97316', '#FACC15', '#22C55E', '#3B82F6', '#A855F7'][i % 6]};animation-delay:${.08 + i * .075}s`, '★', 'trainee')
      envol(['💖', '✨', '⭐'], 14, [16, 26])
    } else if (id === 'victoire-aurore') {
      for (let i = 0; i < 3; i++) ajoute(`top:${8 + i * 12}%;animation-delay:${i * .3}s;--teinte:${i * 50}deg`, '', 'aurore')
      paillettes(26, 5, 60, .4)
    } else if (id === 'victoire-kawaii') {
      ajoute('', '', 'flash pastel')
      ajoute('', '🥳', 'vedette')
      gerbe('50%', '45%', 26, 120, 260, .35, PASTELS)
      envol(['💖', '🎀', '⭐', '🍭', '🌸', '🫧'], fort ? 30 : 22, [18, 30])
      paillettes(16, 10, 80, .6)
    }

    const pluie = PLUIES[id]
    if (pluie) {
      for (let i = 0; i < (fort ? 36 : 22); i++) ajoute(`left:${hasard(0, 100)}%;font-size:${hasard(18, 34)}px;animation-delay:${hasard(0, .7)}s;animation-duration:${hasard(1.8, 3.2)}s;--rot:${hasard(-360, 360)}deg`, pluie[i % pluie.length], 'goutte')
    }
    const env = ENVOLS[id]
    if (env) {
      envol(env, id === 'victoire-ballons' ? (fort ? 22 : 15) : (fort ? 30 : 20), id === 'victoire-ballons' ? [36, 54] : [18, 32])
      if (id === 'victoire-coeurs') { ajoute('', '💗', 'vedette coeur'); paillettes(12, 20, 70, .5) }
    }
    if (id === 'victoire-royale') ajoute('', '👑', 'couronne')
    if (id === 'victoire-tonnerre') { ajoute('', '', 'flash'); for (let i = 0; i < 3; i++) ajoute(`left:${15 + i * 32 + hasard(0, 10)}%;animation-delay:${i * .28}s`, '', 'eclair') }
    if (id === 'victoire-galaxie') ajoute('', '', 'galaxie')
    if (id === 'victoire-supernova') {
      ajoute('', '', 'nova')
      ajoute('', '', 'rayons-nova')
      for (let i = 0; i < 4; i++) ajoute(`animation-delay:${.15 + i * .2}s;border-color:${['#fff', '#FDE047', '#F472B6', '#22D3EE'][i]}`, '', 'onde')
      gerbe('50%', '50%', fort ? 36 : 28, 140, 380, .2, ['#fff', '#FDE047', '#F472B6', '#22D3EE', '#A78BFA'])
      paillettes(16, 10, 85, .7)
    }
    document.body.appendChild(zone)
    setTimeout(() => zone.remove(), 4600)
  } catch { /* pas de DOM */ }
}
