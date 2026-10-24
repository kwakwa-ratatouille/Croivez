import { Link } from 'react-router-dom'
import { useAuth } from '../auth'
import { usePrefs } from '../i18n'
import { ETAPES, REGIONS, seuilEtape, urlEtape } from '../aventure'
import { ICONS, Icon } from '../components/ui'

// Mode aventure : un chemin d'étapes par région, la prochaine étape clignote, les boss ferment chaque région
export default function Aventure() {
  const { lang } = usePrefs()
  const fr = lang === 'fr'
  const { profile } = useAuth()
  const fait = profile?.aventure ?? 0
  let n = 0
  return (
    <>
      <header style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <h1 className="t" style={{ fontSize: 30, fontWeight: 900 }}>🗺️ {fr ? 'Aventure' : 'Adventure'}</h1>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>{fr ? `Un tour du monde en ${ETAPES.length} étapes. 7/10 pour passer une étape, 8/10 contre un boss.` : `A world tour in ${ETAPES.length} steps.`}</p>
        <div className="bar" style={{ height: 8 }}><span style={{ width: `${(fait / ETAPES.length) * 100}%`, background: 'var(--esp)' }} /></div>
      </header>
      {REGIONS.map((r) => {
        const debut = n
        const ouverte = fait >= debut
        return (
          <section key={r.k} className={`aventure-region${ouverte ? '' : ' fermee'}`}>
            <h2 className="t">{r.emoji} {r.nom[lang]} <small>{Math.min(r.etapes.length, Math.max(0, fait - debut))} / {r.etapes.length}</small></h2>
            <div className="aventure-chemin">
              {r.etapes.map((x) => {
                const i = n++
                const etat = i < fait ? 'faite' : i === fait ? 'actuelle' : 'fermee'
                const contenu = (
                  <>
                    <span className="aventure-rond">{etat === 'faite' ? '✓' : x.boss ? '👑' : i + 1}</span>
                    <span className="aventure-nom">{x.nom[lang]}{etat === 'actuelle' && <small>{fr ? `${seuilEtape(x)}/10 pour passer` : `${seuilEtape(x)}/10 to pass`}</small>}</span>
                  </>
                )
                return etat === 'fermee'
                  ? <div key={i} className={`aventure-etape ${etat}${x.boss ? ' boss' : ''}`}>{contenu}</div>
                  : <Link key={i} to={urlEtape(i)} className={`aventure-etape ${etat}${x.boss ? ' boss' : ''}`}>{contenu}</Link>
              })}
            </div>
          </section>
        )
      })}
      {fait >= ETAPES.length && <p className="t" style={{ textAlign: 'center', fontSize: 20, fontWeight: 900 }}>🏆 {fr ? 'Tour du monde terminé, bravo !' : 'World tour complete!'}</p>}
      <Link to="/" style={{ alignSelf: 'center', display: 'inline-flex', alignItems: 'center', gap: 8, minHeight: 44, color: 'var(--muted)', fontWeight: 600 }}><Icon d={ICONS.arrowL} />{fr ? 'Accueil' : 'Home'}</Link>
    </>
  )
}
