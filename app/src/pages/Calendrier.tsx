import { Link } from 'react-router-dom'
import { useAuth } from '../auth'
import { CALENDRIERS, cadeau, calendrierActif, casesOuvertes, jourCalendrier, prochainCalendrier, urlCase } from '../calendriers'
import { ICONS, Icon, Piece } from '../components/ui'

// Calendrier à cases : la case du jour s'ouvre avec un mini-quiz ; les cases passées se rattrapent (cadeau réduit)
export default function Calendrier() {
  const { profile } = useAuth()
  const actif = calendrierActif()
  const prochain = prochainCalendrier()
  const c = actif ?? prochain.c
  const aujourdhui = actif ? jourCalendrier(actif) : 0
  const ouvertes = casesOuvertes(profile, c)
  const jours = Math.ceil((prochain.date.getTime() - Date.now()) / 864e5)
  return (
    <>
      <Link to="/" className="lien-retour"><Icon d={ICONS.arrowL} />Accueil</Link>
      <header className="cal-hero" style={{ background: c.fond }}>
        <span className="cal-emoji" aria-hidden="true">{c.emoji}</span>
        <div>
          <h1 className="t">{c.nom}</h1>
          <p>{actif ? `Jour ${aujourdhui} sur ${c.cases} · ${ouvertes.length} case${ouvertes.length > 1 ? 's' : ''} ouverte${ouvertes.length > 1 ? 's' : ''}` : `Ouvre dans ${jours} jour${jours > 1 ? 's' : ''}`}</p>
          <small>🎁 Toutes les cases (ou presque) : {c.final}</small>
        </div>
      </header>
      {!actif && <p className="cal-info">Le calendrier n’est pas encore ouvert : voici un aperçu. Chaque jour, une case = un mini-quiz de 5 questions et un cadeau.</p>}
      <div className="cal-grille">
        {Array.from({ length: c.cases }, (_, i) => {
          const n = i + 1
          const ouverte = ouvertes.includes(n)
          const etat = !actif || n > aujourdhui ? 'fermee' : ouverte ? 'ouverte' : n === aujourdhui ? 'jour' : 'retard'
          const contenu = <><span className="cal-num t">{n}</span>{etat === 'ouverte' ? <span className="cal-ico">✓</span> : etat === 'fermee' ? <span className="cal-ico">🔒</span> : <span className="cal-gain"><Piece size={12} />{etat === 'retard' ? Math.round(cadeau(c, n) / 2) : cadeau(c, n)}</span>}</>
          return etat === 'jour' || etat === 'retard'
            ? <Link key={n} to={urlCase(c, n)} className={`cal-case ${etat}${n === c.cases ? ' finale' : ''}`}>{contenu}</Link>
            : <div key={n} className={`cal-case ${etat}${n === c.cases ? ' finale' : ''}`}>{contenu}</div>
        })}
      </div>
      {!actif && CALENDRIERS.length > 1 && <p className="cal-info">Calendriers de l’année : {CALENDRIERS.map((x) => `${x.emoji} ${x.nom}`).join(' · ')}</p>}
    </>
  )
}
