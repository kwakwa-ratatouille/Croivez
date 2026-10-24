import { useEffect, useRef, useState, type ReactNode } from 'react'
import { ICONS, Icon } from './ui'

// Rangée qui défile horizontalement : molette de la souris (rendue à la page aux extrémités),
// cliquer-glisser, flèches sur les côtés, et doigt sur téléphone. Les cartes hors de la rangée sont coupées net.
export default function Defileur({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const glisse = useRef<{ x: number; gauche: number; bouge: boolean } | null>(null)
  const [bords, setBords] = useState({ debut: true, fin: false })

  const majBords = () => {
    const el = ref.current
    if (!el) return
    setBords({ debut: el.scrollLeft <= 4, fin: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 })
  }

  useEffect(() => {
    const el = ref.current
    if (!el) return
    majBords()
    // Molette verticale → défilement horizontal, sauf quand la rangée est déjà au bout (la page reprend la main)
    const molette = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY) || e.shiftKey) return
      const max = el.scrollWidth - el.clientWidth
      if (max <= 0) return
      if ((e.deltaY < 0 && el.scrollLeft <= 0) || (e.deltaY > 0 && el.scrollLeft >= max - 1)) return
      e.preventDefault()
      el.scrollLeft += e.deltaY
    }
    el.addEventListener('wheel', molette, { passive: false })
    const ro = new ResizeObserver(majBords)
    ro.observe(el)
    return () => { el.removeEventListener('wheel', molette); ro.disconnect() }
  }, [])

  const pousser = (sens: number) => ref.current?.scrollBy({ left: sens * ref.current.clientWidth * 0.8, behavior: 'smooth' })

  return (
    <div className={`defileur${bords.debut ? ' au-debut' : ''}${bords.fin ? ' a-la-fin' : ''}`}>
      <button type="button" className="defileur-fleche gauche" aria-label="Précédent" onClick={() => pousser(-1)} tabIndex={-1}><Icon d={ICONS.arrowL} size={20} /></button>
      <div
        ref={ref}
        className="carrousel"
        onScroll={majBords}
        // Cliquer-glisser à la souris (le doigt défile déjà nativement)
        onPointerDown={(e) => { if (e.pointerType !== 'mouse' || e.button !== 0) return; glisse.current = { x: e.clientX, gauche: ref.current!.scrollLeft, bouge: false } }}
        onPointerMove={(e) => {
          const g = glisse.current
          if (!g) return
          const dx = e.clientX - g.x
          if (Math.abs(dx) > 6) { g.bouge = true; ref.current!.classList.add('glisse') }
          if (g.bouge) ref.current!.scrollLeft = g.gauche - dx
        }}
        onPointerUp={() => { setTimeout(() => { glisse.current = null; ref.current?.classList.remove('glisse') }, 0) }}
        onPointerLeave={() => { glisse.current = null; ref.current?.classList.remove('glisse') }}
        // Après un glissé, le relâchement ne doit pas ouvrir la carte
        onClickCapture={(e) => { if (glisse.current?.bouge) { e.stopPropagation(); e.preventDefault() } }}
      >
        {children}
      </div>
      <button type="button" className="defileur-fleche droite" aria-label="Suivant" onClick={() => pousser(1)} tabIndex={-1}><Icon d={ICONS.arrowR} size={20} /></button>
    </div>
  )
}
