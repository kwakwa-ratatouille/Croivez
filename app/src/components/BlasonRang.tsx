import { infoRang } from '../ligues'
import { usePrefs } from '../i18n'

// Blason d'un rang : bouclier aux couleurs du rang, emoji, et les divisions (1 à 4) en petites barres
export default function BlasonRang({ pts, taille = 60 }: { pts: number; taille?: number }) {
  const { lang } = usePrefs()
  const r = infoRang(pts, lang)
  return (
    <span className={`blason-rang${r.ultime ? ' ultime' : ''}`} title={r.nom} style={{ width: taille, height: taille * 1.12, ['--rc' as string]: r.rang.couleur, ['--rf' as string]: r.rang.fonce }}>
      <span className="blason-emoji" style={{ fontSize: taille * 0.42 }}>{r.rang.emoji}</span>
      {r.division && <span className="blason-divs">{Array.from({ length: 4 }, (_, i) => <i key={i} className={i < r.division! ? 'on' : ''} />)}</span>}
    </span>
  )
}
