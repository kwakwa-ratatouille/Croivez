import { Link } from 'react-router-dom'
import { niveau, useAuth } from '../auth'
import { usePrefs } from '../i18n'
import { STADES, choukyDe, prochainStade } from '../chouky'
import Chouky from './Chouky'

// Carte de Chouky : sa bulle suit la série (accueil), ou son évolution et ses costumes (profil)
export default function CarteChouky({ vue = 'accueil' }: { vue?: 'accueil' | 'profil' }) {
  const { lang } = usePrefs()
  const fr = lang === 'fr'
  const { profile } = useAuth()
  const c = choukyDe(profile)
  const n = profile?.serie ?? 0
  const niv = niveau(profile?.xp ?? 0)
  const suite = prochainStade(niv)
  const bulle = !profile?.dernierJour
    ? (fr ? 'Salut, je suis Chouky ! Joue pour me faire éclore 🥚' : 'Hi, I’m Chouky! Play to hatch me 🥚')
    : c.humeur === 'fier' ? (fr ? `${n} jours d’affilée ! Je suis trop fière de toi 🔥` : `${n} days in a row! So proud of you 🔥`)
      : c.humeur === 'triste' ? (fr ? `Ta série de ${n} jour${n > 1 ? 's' : ''} s’éteint à minuit… Une petite partie ?` : `Your ${n}-day streak ends at midnight… one quick game?`)
        : c.humeur === 'endormi' ? (fr ? 'Zzz… Réveille-moi avec une partie !' : 'Zzz… wake me up with a game!')
          : (fr ? `Bravo, tu as joué aujourd’hui ! Série : ${n} jour${n > 1 ? 's' : ''} 🔥` : `Well done, you played today! Streak: ${n} 🔥`)
  if (vue === 'profil') {
    const debut = suite ? [1, 5, 15, 30, 50, 100, 250, 500, 1000][c.stade] : niv
    return (
      <section className="card carte-chouky profil">
        <Chouky taille={110} {...c} />
        <div className="carte-chouky-texte">
          <span className="eyebrow">🦉 {fr ? 'Ma chouette' : 'My owl'}</span>
          <strong className="t">Chouky · {STADES[c.stade][lang]}</strong>
          {suite
            ? <><small>{fr ? `Prochaine évolution : ${STADES[suite.stade].fr} au niveau ${suite.niveau}` : `Next: ${STADES[suite.stade].en} at level ${suite.niveau}`}</small>
              <span className="carte-chouky-barre"><span style={{ width: `${Math.min(100, ((niv - debut) / (suite.niveau - debut)) * 100)}%` }} /></span></>
            : <small>{fr ? 'Évolution ultime atteinte !' : 'Final evolution reached!'}</small>}
          <Link to="/boutique?o=chouky" className="btn btn-s">👗 {fr ? 'Ses costumes' : 'Outfits'}</Link>
        </div>
      </section>
    )
  }
  return (
    <section className={`card carte-chouky ${c.humeur}`}>
      <Chouky taille={92} {...c} />
      <div className="carte-chouky-texte">
        <p className="carte-chouky-bulle">{bulle}</p>
        {(c.humeur === 'triste' || c.humeur === 'endormi' || !profile?.dernierJour) && <Link to="/partie?jeu=mix&d=0&m=qcm" className="btn btn-p">{fr ? 'Jouer maintenant' : 'Play now'}</Link>}
      </div>
    </section>
  )
}
