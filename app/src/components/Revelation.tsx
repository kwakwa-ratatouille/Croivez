import { useEffect, useMemo, useState } from 'react'
import { usePrefs } from '../i18n'
import { trouverSousTheme } from '../themes'
import { RARETES, rareteDe } from '../progression'
import { prefsRetour, retourFin } from '../retour'
import { useCouverture } from './CarteCouverture'
import { ouvrirFiche } from './FicheLancement'
import Img from './Img'
import Illustration from './Illustration'
import { ICONS, Icon } from './ui'

// Montée de notes : plus la rareté est haute, plus l'arpège est long et brillant
function fanfare(niveau: number) {
  if (!prefsRetour.son) return
  try {
    const ctx = new AudioContext()
    const notes = [523, 659, 784, 1047, 1319, 1568].slice(0, 3 + niveau)
    notes.forEach((f, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime + 0.35 + i * 0.09
      o.type = niveau >= 2 ? 'triangle' : 'sine'
      o.frequency.value = f
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.07, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5)
      o.connect(g).connect(ctx.destination); o.start(t); o.stop(t + 0.55)
    })
  } catch { /* audio indisponible */ }
}

// Révélation d'un quiz débloqué : carte retournée, halo et rayons aux couleurs de la rareté, confettis
export default function Revelation({ id, onFermer }: { id: string; onFermer: () => void }) {
  const { lang } = usePrefs()
  const fr = lang === 'fr'
  const t = trouverSousTheme(id)
  const src = useCouverture(id)
  const rarete = rareteDe(id)
  const r = RARETES[rarete]
  const niveau = ['commun', 'rare', 'epique', 'legendaire'].indexOf(rarete)
  const [face, setFace] = useState(false)
  // Plus de confettis pour les raretés hautes
  const confettis = useMemo(() => Array.from({ length: 14 + niveau * 14 }, (_, i) => ({
    x: Math.random() * 100, d: Math.random() * 0.8, r: Math.random() * 360, c: [r.couleur, 'var(--lx)', 'var(--lv)', '#fff'][i % 4], s: 6 + Math.random() * 6,
  })), [niveau, r.couleur])

  useEffect(() => {
    const a = setTimeout(() => { setFace(true); fanfare(niveau); retourFin(true) }, 650 + niveau * 250)
    return () => clearTimeout(a)
  }, [niveau])

  if (!t) return null
  const k = t.famille.k
  return (
    <div className="revelation" role="dialog" aria-modal="true" aria-label={fr ? 'Quiz débloqué' : 'Quiz unlocked'} style={{ ['--r' as string]: r.couleur }} onClick={() => face && onFermer()}>
      <div className={`revelation-rayons niveau-${niveau}`} />
      {face && confettis.map((c, i) => <span key={i} className="confetti" style={{ left: `${c.x}%`, animationDelay: `${c.d}s`, background: c.c, width: c.s, height: c.s * 0.5, transform: `rotate(${c.r}deg)` }} />)}
      <div className="revelation-contenu" onClick={(e) => e.stopPropagation()}>
        <span className={`revelation-rarete${face ? ' visible' : ''}`}>{r.nom[lang]}</span>
        <div className={`revelation-carte${face ? ' retournee' : ''}`}>
          <div className="revelation-dos"><Icon d={ICONS.sparkle} size={46} /></div>
          <div className="revelation-face" style={{ background: `var(--${k}-t)`, color: `var(--${k}-i)` }}>
            <div className="revelation-photo">{src ? <Img src={src} alt="" /> : <Illustration k={k} taille={160} fond={false} />}</div>
            <span className="t" style={{ fontSize: 20, fontWeight: 900, padding: '10px 14px 0' }}>{t.sous.nom[lang]}</span>
            <span style={{ fontSize: 13, fontWeight: 600, padding: '2px 14px 14px' }}>{t.famille.nom[lang]}</span>
          </div>
        </div>
        {face && (
          <div className="rise" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <strong className="t" style={{ color: '#fff', fontSize: 22 }}>{fr ? 'Nouveau quiz débloqué !' : 'New quiz unlocked!'}</strong>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-p btn-lg" onClick={() => { onFermer(); ouvrirFiche(id) }}>{fr ? 'Jouer' : 'Play'}<Icon d={ICONS.arrowR} /></button>
              <button className="btn btn-lg" style={{ background: 'rgba(255,255,255,.15)', color: '#fff' }} onClick={onFermer}>{fr ? 'Plus tard' : 'Later'}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
