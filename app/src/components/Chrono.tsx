// Chrono de partie : un anneau qui se vide, de plus en plus voyant à mesure que le temps file.
// > 50 % : calme · 50-25 % : orange · < 25 % : rouge, il pulse, grossit et tremble ;
// sous 5 s, un halo rouge envahit les bords de l'écran (de plus en plus fort).
export default function Chrono({ restant, total, actif }: { restant: number; total: number; actif: boolean }) {
  const r = Math.max(0, Math.min(1, restant / total))
  const s = Math.max(0, Math.ceil(restant))
  const niveau = !actif ? 0 : r > 0.5 ? 0 : r > 0.25 ? 1 : restant > 3 ? 2 : 3
  const couleur = ['var(--ok-i)', '#E8912E', '#E5484D', '#E5484D'][niveau]
  const C = 2 * Math.PI * 26
  return (
    <>
      <div className={`chrono chrono-${niveau}`} role="timer" aria-label={`${s} secondes`} style={{ ['--cc' as string]: couleur }}>
        <svg viewBox="0 0 64 64" aria-hidden="true">
          <circle cx="32" cy="32" r="26" className="chrono-fond" />
          <circle cx="32" cy="32" r="26" className="chrono-arc" strokeDasharray={C} strokeDashoffset={C * (1 - r)} />
        </svg>
        {/* La clé relance l'animation « tic » à chaque seconde */}
        <span key={niveau >= 2 ? s : 'calme'} className="t chrono-chiffre">{s}</span>
      </div>
      {actif && restant <= 5 && restant > 0 && <div className="chrono-alerte" aria-hidden="true" style={{ opacity: 0.25 + (1 - restant / 5) * 0.75 }} />}
    </>
  )
}

// Barre fine sous l'en-tête, même code couleur que l'anneau
export function BarreChrono({ restant, total, actif }: { restant: number; total: number; actif: boolean }) {
  const r = Math.max(0, Math.min(1, restant / total))
  const couleur = !actif || r > 0.5 ? 'var(--ok)' : r > 0.25 ? '#E8912E' : '#E5484D'
  return (
    <div className={`barre-chrono${actif && r <= 0.25 ? ' urgente' : ''}`}>
      <span style={{ width: `${r * 100}%`, background: couleur }} />
    </div>
  )
}
