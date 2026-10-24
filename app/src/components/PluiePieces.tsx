import { useEffect, useState } from 'react'
import { Piece } from './ui'
import { retourFin } from '../retour'

// Pluie de pièces quand on récupère une récompense : `pleuvoirPieces(25)` depuis n'importe quel écran
export const pleuvoirPieces = (n: number) => window.dispatchEvent(new CustomEvent('croivez:pieces', { detail: n }))

type Pluie = { id: number; n: number; pieces: { x: number; d: number; t: number; s: number; r: number }[] }

export default function PluiePieces() {
  const [pluies, setPluies] = useState<Pluie[]>([])
  useEffect(() => {
    const h = (e: Event) => {
      const n = (e as CustomEvent<number>).detail
      const id = Date.now() + Math.random()
      const nb = Math.min(40, 12 + n / 2)
      setPluies((l) => [...l, { id, n, pieces: Array.from({ length: nb }, () => ({ x: Math.random() * 100, d: Math.random() * 0.5, t: 1.1 + Math.random() * 0.9, s: 18 + Math.random() * 18, r: Math.random() * 720 - 360 })) }])
      retourFin(true)
      setTimeout(() => setPluies((l) => l.filter((p) => p.id !== id)), 2600)
    }
    window.addEventListener('croivez:pieces', h)
    return () => window.removeEventListener('croivez:pieces', h)
  }, [])
  if (!pluies.length) return null
  return (
    <div className="pluie" aria-hidden="true">
      {pluies.map((p) => (
        <div key={p.id}>
          <span className="pluie-gain t">+{p.n}</span>
          {p.pieces.map((c, i) => (
            <span key={i} className="pluie-piece" style={{ left: `${c.x}%`, animationDelay: `${c.d}s`, animationDuration: `${c.t}s`, ['--r' as string]: `${c.r}deg` }}><Piece size={c.s} /></span>
          ))}
        </div>
      ))}
    </div>
  )
}
