import { useMemo } from 'react'
import { choukySvg, type Humeur } from '../chouky'

// Chouky, la chouette mascotte : dessin animé (flotte, cligne des yeux, étincelles)
export default function Chouky({ taille = 120, stade = 3, humeur = 'content', skin = 'classique', className = '' }: { taille?: number; stade?: number; humeur?: Humeur; skin?: string; className?: string }) {
  const svg = useMemo(() => choukySvg({ t: taille, stade, humeur, skin }), [taille, stade, humeur, skin])
  return <span className={`chouky ${className}`} role="img" aria-label="Chouky" style={{ width: taille, height: taille }} dangerouslySetInnerHTML={{ __html: svg }} />
}
