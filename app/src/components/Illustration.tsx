import { FAMILLES, type Famille } from '../themes'

// Visuel d'une famille : icône au trait, épurée, dans une pastille douce (remplace les anciens dessins).
// Même repère 240 × 180 qu'avant pour ne rien décaler dans les mises en page.
export default function Illustration({ k, taille = 200, fond = true }: { k: Famille; taille?: number; fond?: boolean }) {
  const f = FAMILLES.find((x) => x.k === k)
  return (
    <svg viewBox="0 0 240 180" width={taille} height={taille * 0.75} aria-hidden="true" style={{ display: 'block', flex: 'none' }}>
      {fond && <rect width="240" height="180" rx="28" fill={`var(--${k}-t)`} />}
      <circle cx="120" cy="90" r="58" fill={`var(--${k})`} opacity=".22" />
      <g transform="translate(84 54) scale(3)" fill="none" stroke={`var(--${k}-i)`} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d={f?.icon} />
      </g>
    </svg>
  )
}
