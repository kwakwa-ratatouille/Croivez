import { useEffect, useMemo, useRef, useState } from 'react'
import { RARETES, POIDS, rareteDe, tirerGain } from '../progression'
import { useCouverture } from './CarteCouverture'
import Img from './Img'
import Revelation from './Revelation'
import { usePrefs } from '../i18n'
import type { Famille, SousTheme } from '../themes'
import { prefsRetour, retourFin } from '../retour'
import Illustration from './Illustration'

const CASE = 150 // largeur d'une case (px), espace compris
const GAGNANTE = 34 // position de la case gagnante dans la bande
const DUREE = 5600 // ms

// Petit « tic » à chaque case qui passe sous le repère (son synthétisé, très court)
let ctx: AudioContext | null = null
function tic() {
  if (!prefsRetour.son) return
  try {
    ctx ??= new AudioContext()
    const o = ctx.createOscillator(), g = ctx.createGain()
    o.frequency.value = 1400
    g.gain.setValueAtTime(0.04, ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.03)
    o.connect(g).connect(ctx.destination)
    o.start(); o.stop(ctx.currentTime + 0.04)
  } catch { /* audio indisponible */ }
}

// Ouverture de caisse : une bande de quiz défile, ralentit et s'arrête sur le gain sous le repère central
// Une case de la bande : photo du quiz, liseré et fond de sa rareté
function Case({ s, k, gagnante }: { s: SousTheme; k: Famille; gagnante: boolean }) {
  const { lang } = usePrefs()
  const src = useCouverture(s.id)
  const rr = RARETES[rareteDe(s.id)]
  return (
    <div className={`caisse-case${gagnante ? ' gagnante' : ''}`} style={{ width: CASE - 10, ['--r' as string]: rr.couleur }}>
      <span className="caisse-photo">{src ? <Img src={src} alt="" /> : <Illustration k={k} taille={80} fond={false} />}</span>
      <span>{s.nom[lang]}</span>
    </div>
  )
}

export default function Caisse({ k, possibles, gain, onFermer }: { k: Famille; possibles: SousTheme[]; gain: SousTheme; onFermer: () => void }) {
  const { lang } = usePrefs()
  const fr = lang === 'fr'
  const fenetre = useRef<HTMLDivElement>(null)
  const bande = useRef<HTMLDivElement>(null)
  const [fini, setFini] = useState(false)
  const [revele, setRevele] = useState(false)

  // Bande : cases au hasard parmi les quiz possibles, le gain placé à la position prévue
  // Les cases suivent les mêmes chances que le tirage : beaucoup de communs, quelques légendaires qui frôlent le repère
  const cases = useMemo(() => Array.from({ length: GAGNANTE + 6 }, (_, i) => (i === GAGNANTE ? gain : tirerGain(possibles))), [gain, possibles])
  // Arrêt légèrement décalé dans la case gagnante, comme une vraie roue
  const decalage = useMemo(() => (Math.random() - 0.5) * CASE * 0.6, [])

  useEffect(() => {
    const b = bande.current, f = fenetre.current
    if (!b || !f) return
    const cible = GAGNANTE * CASE + CASE / 2 - f.clientWidth / 2 + decalage
    b.style.transition = 'none'
    b.style.transform = 'translateX(0)'
    requestAnimationFrame(() => requestAnimationFrame(() => {
      b.style.transition = `transform ${DUREE}ms cubic-bezier(.08,.6,.12,1)`
      b.style.transform = `translateX(${-cible}px)`
    }))
    // Tic à chaque changement de case sous le repère
    let derniere = -1, raf = 0
    const suivre = () => {
      const x = -new DOMMatrix(getComputedStyle(b).transform).m41 + f.clientWidth / 2
      const n = Math.floor(x / CASE)
      if (n !== derniere) { derniere = n; tic() }
      raf = requestAnimationFrame(suivre)
    }
    raf = requestAnimationFrame(suivre)
    const t = setTimeout(() => { cancelAnimationFrame(raf); setFini(true); retourFin(true); setTimeout(() => setRevele(true), 900) }, DUREE + 150)
    return () => { clearTimeout(t); cancelAnimationFrame(raf) }
  }, [decalage])

  if (revele) return <Revelation id={gain.id} onFermer={onFermer} />
  return (
    <div role="dialog" aria-modal="true" aria-label={fr ? 'Ouverture de caisse' : 'Opening crate'} className="caisse-fond">
      <div className="caisse rise" style={{ ['--k' as string]: `var(--${k})`, ['--kt' as string]: `var(--${k}-t)`, ['--ki' as string]: `var(--${k}-i)` }}>
        <h2 className="t" style={{ fontSize: 24, fontWeight: 900, textAlign: 'center' }}>{fini ? (fr ? 'Quiz débloqué !' : 'Quiz unlocked!') : (fr ? 'Ouverture…' : 'Opening…')}</h2>

        <div ref={fenetre} className="caisse-fenetre">
          <div className="caisse-repere" />
          <div ref={bande} className="caisse-bande">
            {cases.map((s, i) => (
              <Case key={i} s={s} k={k} gagnante={fini && i === GAGNANTE} />
            ))}
          </div>
        </div>

        <div className="caisse-chances">{(Object.keys(RARETES) as (keyof typeof RARETES)[]).map((x) => <span key={x} style={{ color: RARETES[x].couleur }}>{RARETES[x].nom[lang]} {POIDS[x]} %</span>)}</div>
      </div>
    </div>
  )
}
