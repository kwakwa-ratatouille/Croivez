import { useEffect, useRef, useState, type ReactNode } from 'react'
import { ICONS, Icon } from './ui'

// Rangée qui défile horizontalement : cliquer-glisser (géré pour toute l’appli dans glisser.ts),
// flèches sur les côtés, et doigt sur téléphone. La molette reste à la page. Les cartes hors de la rangée sont coupées net.
export default function Defileur({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
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
    const ro = new ResizeObserver(majBords)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const pousser = (sens: number) => ref.current?.scrollBy({ left: sens * ref.current.clientWidth * 0.8, behavior: 'smooth' })

  return (
    <div className={`defileur${bords.debut ? ' au-debut' : ''}${bords.fin ? ' a-la-fin' : ''}`}>
      <button type="button" className="defileur-fleche gauche" aria-label="Précédent" onClick={() => pousser(-1)} tabIndex={-1}><Icon d={ICONS.arrowL} size={20} /></button>
      <div
        ref={ref}
        className="carrousel"
        onScroll={majBords}
      >
        {children}
      </div>
      <button type="button" className="defileur-fleche droite" aria-label="Suivant" onClick={() => pousser(1)} tabIndex={-1}><Icon d={ICONS.arrowR} size={20} /></button>
    </div>
  )
}
