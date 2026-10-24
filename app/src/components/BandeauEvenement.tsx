import { Link } from 'react-router-dom'
import { useAuth } from '../auth'
import { usePrefs } from '../i18n'
import { evenementActif, joursRestants, prochainEvenement, saisonDuMois } from '../evenements'
import Avatar from './Avatar'

// Bandeau de l'accueil : l'événement en cours (récompenses, quiz spécial, jours restants),
// sinon la saison du mois et le prochain événement annoncé
export default function BandeauEvenement() {
  const { lang } = usePrefs()
  const fr = lang === 'fr'
  const { profile } = useAuth()
  const e = evenementActif()
  if (!e) {
    const s = saisonDuMois()
    const p = prochainEvenement()
    return (
      <Link to="/saison" className="bandeau-evt rise" style={{ background: s.fond }}>
        <span className="bandeau-evt-emoji" aria-hidden="true">{s.emoji}</span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span className="eyebrow" style={{ color: 'rgba(255,255,255,.85)' }}>{fr ? 'Saison du mois' : 'Season of the month'}</span>
          <strong className="t" style={{ display: 'block', fontSize: 22 }}>{s.nom[lang]}</strong>
          <span style={{ fontSize: 13.5, opacity: .92 }}>{fr ? `Passe de combat : titre « ${s.titre.fr} » et cadre exclusif.` : `Battle pass: exclusive title and frame.`}{p && p.jours <= 30 ? (fr ? ` Prochain événement : ${p.e.emoji} ${p.e.nom.fr} dans ${p.jours} j.` : ` Next event: ${p.e.nom.en} in ${p.jours} d.`) : ''}</span>
        </span>
        <Avatar pseudo={profile?.pseudo} avatar={profile?.avatar} cadre={`cadre-s-${s.id}`} taille={64} anime />
      </Link>
    )
  }
  const n = Math.min(5, profile?.evenements?.[e.id] ?? (e.id === 'halloween' ? profile?.halloween ?? 0 : 0))
  return (
    <section className="bandeau-evt evt-actif rise" style={{ background: e.fond }}>
      <span className="bandeau-evt-emoji" aria-hidden="true">{e.emoji}</span>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span className="eyebrow" style={{ color: 'rgba(255,255,255,.9)' }}>{fr ? 'Événement' : 'Event'} · ⏳ {joursRestants(e)} {fr ? 'jours restants' : 'days left'}</span>
        <strong className="t" style={{ fontSize: 24, lineHeight: 1.1 }}>{e.emoji} {e.nom[lang]}</strong>
        <span style={{ fontSize: 13.5, opacity: .92 }}>{e.desc[lang]} · {fr ? 'quiz spécial XP ×2' : 'special quiz XP ×2'}</span>
        <div className="evt-recompenses">
          <span className={n >= 1 ? 'ok' : ''}>{n >= 1 ? '✓' : '1'} {fr ? 'partie : cadre' : 'game: frame'}</span>
          <span className={n >= 5 ? 'ok' : ''}>{n >= 5 ? '✓' : `${n}/5`} {fr ? 'parties : avatar + titre' : 'games: avatar + title'}</span>
        </div>
        <Link to={`/partie?s=${e.quiz}&d=0&m=auto`} className="btn evt-jouer">{fr ? 'Jouer le quiz spécial' : 'Play the special quiz'} {e.emoji}</Link>
      </div>
      <div className="evt-apercu">
        <Avatar pseudo={profile?.pseudo} avatar={e.avatar.id} cadre={e.cadre.id} taille={76} anime />
        <small>« {e.titre.nom[lang]} »</small>
      </div>
    </section>
  )
}
