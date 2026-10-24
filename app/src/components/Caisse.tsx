import { useEffect, useMemo, useRef, useState } from 'react'
import { ouvrirFiche } from './FicheLancement'
import { usePrefs } from '../i18n'
import type { Famille, SousTheme } from '../themes'
import { prefsRetour, retourFin } from '../retour'
import Illustration from './Illustration'
import { ICONS, Icon } from './ui'

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
export default function Caisse({ k, possibles, gain, onFermer }: { k: Famille; possibles: SousTheme[]; gain: SousTheme; onFermer: () => void }) {
  const { lang } = usePrefs()
  const fr = lang === 'fr'
  const fenetre = useRef<HTMLDivElement>(null)
  const bande = useRef<HTMLDivElement>(null)
  const [fini, setFini] = useState(false)

  // Bande : cases au hasard parmi les quiz possibles, le gain placé à la position prévue
  const cases = useMemo(() => Array.from({ length: GAGNANTE + 6 }, (_, i) => (i === GAGNANTE ? gain : possibles[Math.floor(Math.random() * possibles.length)])), [gain, possibles])
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
    const t = setTimeout(() => { cancelAnimationFrame(raf); setFini(true); retourFin(true) }, DUREE + 150)
    return () => { clearTimeout(t); cancelAnimationFrame(raf) }
  }, [decalage])

  return (
    <div role="dialog" aria-modal="true" aria-label={fr ? 'Ouverture de caisse' : 'Opening crate'} className="caisse-fond">
      <div className="caisse rise" style={{ ['--k' as string]: `var(--${k})`, ['--kt' as string]: `var(--${k}-t)`, ['--ki' as string]: `var(--${k}-i)` }}>
        <h2 className="t" style={{ fontSize: 24, fontWeight: 900, textAlign: 'center' }}>{fini ? (fr ? 'Quiz débloqué !' : 'Quiz unlocked!') : (fr ? 'Ouverture…' : 'Opening…')}</h2>

        <div ref={fenetre} className="caisse-fenetre">
          <div className="caisse-repere" />
          <div ref={bande} className="caisse-bande">
            {cases.map((s, i) => (
              <div key={i} className={`caisse-case${fini && i === GAGNANTE ? ' gagnante' : ''}`} style={{ width: CASE - 10 }}>
                <Illustration k={k} taille={90} fond={false} />
                <span>{s.nom[lang]}</span>
              </div>
            ))}
          </div>
        </div>

        {fini && (
          <div className="rise" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, textAlign: 'center' }}>
            <p className="t" style={{ fontSize: 26, fontWeight: 900, color: 'var(--ki)' }}>{gain.nom[lang]}</p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
              <button className="btn btn-p btn-lg" onClick={() => { onFermer(); ouvrirFiche(gain.id) }}>{fr ? 'Jouer maintenant' : 'Play now'}<Icon d={ICONS.arrowR} /></button>
              <button className="btn btn-g btn-lg" onClick={onFermer}>{fr ? 'Plus tard' : 'Later'}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
