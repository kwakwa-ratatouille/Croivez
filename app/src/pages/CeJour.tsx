import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth'
import { usePrefs } from '../i18n'
import { evenementsDu, questionsAnnee, recompenser } from '../histoire'
import { retourFin, retourReponse } from '../retour'
import { noterActivite } from '../activite'
import { ICONS, Icon, Piece } from '../components/ui'

type Q = ReturnType<typeof questionsAnnee>[number]

// Ce jour-là : 10 événements qui se sont passés à la date d'aujourd'hui, retrouver l'année
export default function CeJour() {
  const { lang } = usePrefs()
  const fr = lang === 'fr'
  const { user, profile } = useAuth()
  const auj = new Date()
  const titre = auj.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })
  const [qs, setQs] = useState<Q[] | null>(null)
  const [erreur, setErreur] = useState(false)
  const [i, setI] = useState(0)
  const [choix, setChoix] = useState<number | null>(null)
  const [bonnes, setBonnes] = useState(0)
  const [gain, setGain] = useState<{ pieces: number; xp: number } | null | undefined>(undefined)
  const charger = () => { setQs(null); setErreur(false); setI(0); setChoix(null); setBonnes(0); setGain(undefined); evenementsDu(auj.getMonth() + 1, auj.getDate()).then((e) => setQs(questionsAnnee(e))).catch(() => setErreur(true)) }
  useEffect(charger, []) // eslint-disable-line react-hooks/exhaustive-deps
  const fini = !!qs && i >= qs.length
  useEffect(() => {
    if (!fini || gain !== undefined || !user || !profile || !qs) return
    retourFin(bonnes / qs.length >= .6)
    recompenser(user.uid, profile, 'ceJour', bonnes, qs.length).then(setGain).catch(() => setGain(null))
    if (bonnes >= 8) noterActivite(user.uid, '📅', `a fait ${bonnes}/${qs.length} au quiz « Ce jour-là »`).catch(() => {})
  }, [fini]) // eslint-disable-line react-hooks/exhaustive-deps

  const repondre = (a: number) => {
    if (choix !== null || !qs) return
    setChoix(a)
    const juste = a === qs[i].annee
    retourReponse(juste)
    if (juste) setBonnes((b) => b + 1)
  }
  const q = qs?.[i]
  return (
    <>
      <Link to="/" className="lien-retour"><Icon d={ICONS.arrowL} />{fr ? 'Accueil' : 'Home'}</Link>
      <header className="cejour-tete">
        <span className="cejour-calendrier"><small>{auj.toLocaleDateString('fr-FR', { month: 'short' })}</small><strong>{auj.getDate()}</strong></span>
        <div><h1 className="t">{fr ? 'Ce jour-là' : 'On this day'}</h1><p>{fr ? `Ce qui s’est passé un ${titre}… mais en quelle année ?` : `What happened on ${titre}?`}</p></div>
      </header>
      {erreur && <div className="card cejour-carte"><p>{fr ? 'Impossible de charger l’histoire du jour (connexion ?).' : 'Could not load.'}</p><button className="btn btn-p" onClick={charger}>{fr ? 'Réessayer' : 'Retry'}</button></div>}
      {!qs && !erreur && <p style={{ color: 'var(--muted)' }}>{fr ? 'On feuillette les livres d’histoire…' : 'Loading…'}</p>}
      {q && (
        <section className="card cejour-carte rise" key={i}>
          <div className="cejour-progres"><span>{i + 1} / {qs!.length}</span><span>✅ {bonnes}</span></div>
          {q.image && <img src={q.image} alt="" className="cejour-image" loading="lazy" />}
          <p className="cejour-texte">{q.texte}</p>
          <div className="cejour-options">
            {q.options.map((a) => <button key={a} type="button" className={`cejour-option${choix !== null && a === q.annee ? ' ok' : ''}${choix === a && a !== q.annee ? ' ko' : ''}`} disabled={choix !== null} onClick={() => repondre(a)}>{a}</button>)}
          </div>
          {choix !== null && <button className="btn btn-p btn-lg" autoFocus onClick={() => { setChoix(null); setI(i + 1) }}>{i + 1 < qs!.length ? (fr ? 'Suivant' : 'Next') : (fr ? 'Résultat' : 'Result')}<Icon d={ICONS.arrowR} /></button>}
        </section>
      )}
      {fini && (
        <section className="card cejour-carte rise" style={{ textAlign: 'center', alignItems: 'center' }}>
          <span style={{ fontSize: 56 }}>{bonnes >= 8 ? '🏆' : bonnes >= 5 ? '📜' : '🕰️'}</span>
          <h2 className="t" style={{ fontSize: 30 }}>{bonnes} / {qs!.length}</h2>
          {gain && <p className="cejour-gain"><Piece size={18} /> +{gain.pieces} · +{gain.xp} XP</p>}
          {gain === null && <p style={{ color: 'var(--muted)' }}>{fr ? 'Récompense déjà reçue aujourd’hui : reviens demain pour une nouvelle date !' : 'Reward already claimed today.'}</p>}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button className="btn btn-p" onClick={charger}>{fr ? 'Rejouer' : 'Replay'}</button>
            <Link className="btn btn-s" to="/frise">🧭 {fr ? 'Mode Frise' : 'Timeline'}</Link>
          </div>
        </section>
      )}
    </>
  )
}
