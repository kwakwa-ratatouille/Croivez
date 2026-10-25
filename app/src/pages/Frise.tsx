import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth'
import { usePrefs } from '../i18n'
import { evenementsDu, manche, melanger, recompenser, type Evenement } from '../histoire'
import { retourFin, retourReponse } from '../retour'
import { noterActivite } from '../activite'
import { ICONS, Icon, Piece } from '../components/ui'

const MANCHES = 3

// Frise chronologique : 5 événements à toucher du plus ancien au plus récent, 3 manches
export default function Frise() {
  const { lang } = usePrefs()
  const fr = lang === 'fr'
  const { user, profile } = useAuth()
  const [evs, setEvs] = useState<Evenement[] | null>(null)
  const [ordre, setOrdre] = useState<number[]>([]) // indices touchés, dans l'ordre
  const [verifie, setVerifie] = useState(false)
  const [n, setN] = useState(0)
  const [points, setPoints] = useState(0)
  const [erreur, setErreur] = useState(false)
  const [gain, setGain] = useState<{ pieces: number; xp: number } | null | undefined>(undefined)

  // Chaque manche pioche une date au hasard de l'année
  const nouvelle = () => {
    setEvs(null); setOrdre([]); setVerifie(false); setErreur(false)
    const d = new Date(2024, 0, 1 + Math.floor(Math.random() * 366))
    evenementsDu(d.getMonth() + 1, d.getDate()).then((l) => setEvs(melanger(manche(l)))).catch(() => setErreur(true))
  }
  useEffect(nouvelle, [])
  const fini = n >= MANCHES
  useEffect(() => {
    if (!fini || gain !== undefined || !user || !profile) return
    retourFin(points >= 9)
    recompenser(user.uid, profile, 'frise', points, MANCHES * 5).then(setGain).catch(() => setGain(null))
    if (points >= 13) noterActivite(user.uid, '🧭', `a remis l’histoire dans l’ordre (${points}/${MANCHES * 5}) en mode Frise`).catch(() => {})
  }, [fini]) // eslint-disable-line react-hooks/exhaustive-deps

  const toucher = (i: number) => {
    if (verifie) return
    setOrdre((o) => (o.includes(i) ? o.filter((x) => x !== i) : [...o, i]))
  }
  const juste = evs ? [...evs].map((e, i) => ({ e, i })).sort((a, b) => a.e.annee - b.e.annee).map((x) => x.i) : []
  const valider = () => {
    const bons = ordre.filter((x, k) => juste[k] === x).length
    setPoints((p) => p + bons); setVerifie(true); retourReponse(bons === 5)
  }
  const recommencer = () => { setN(0); setPoints(0); setGain(undefined); nouvelle() }

  return (
    <>
      <Link to="/" className="lien-retour"><Icon d={ICONS.arrowL} />{fr ? 'Accueil' : 'Home'}</Link>
      <header className="cejour-tete">
        <span className="cejour-calendrier frise-icone">🧭</span>
        <div><h1 className="t">{fr ? 'Frise chronologique' : 'Timeline'}</h1><p>{fr ? 'Touche les événements du plus ancien au plus récent.' : 'Tap events from oldest to newest.'}</p></div>
      </header>
      {!fini && <div className="cejour-progres"><span>{fr ? 'Manche' : 'Round'} {n + 1} / {MANCHES}</span><span>⭐ {points}</span></div>}
      {erreur && <div className="card cejour-carte"><p>{fr ? 'Impossible de charger les événements (connexion ?).' : 'Could not load.'}</p><button className="btn btn-p" onClick={nouvelle}>{fr ? 'Réessayer' : 'Retry'}</button></div>}
      {!evs && !erreur && !fini && <p style={{ color: 'var(--muted)' }}>{fr ? 'On déroule la frise…' : 'Loading…'}</p>}
      {evs && !fini && (
        <section className="frise rise" key={n}>
          {(verifie ? juste : evs.map((_, i) => i)).map((i, pos) => {
            const e = evs[i]
            const rang = ordre.indexOf(i)
            const bien = verifie && ordre[pos] === i
            return (
              <button key={i} type="button" className={`frise-ev${rang >= 0 && !verifie ? ' choisi' : ''}${verifie ? (bien ? ' ok' : ' ko') : ''}`} onClick={() => toucher(i)}>
                <span className="frise-rang">{verifie ? e.annee : rang >= 0 ? rang + 1 : ''}</span>
                {e.image && <img src={e.image} alt="" loading="lazy" />}
                <span className="frise-texte">{e.texte}</span>
              </button>
            )
          })}
          {!verifie
            ? <button className="btn btn-p btn-lg" disabled={ordre.length < evs.length} onClick={valider}>{fr ? 'Valider l’ordre' : 'Check order'}</button>
            : <button className="btn btn-p btn-lg" autoFocus onClick={() => { setN(n + 1); if (n + 1 < MANCHES) nouvelle() }}>{n + 1 < MANCHES ? (fr ? 'Manche suivante' : 'Next round') : (fr ? 'Résultat' : 'Result')}<Icon d={ICONS.arrowR} /></button>}
          {verifie && <p style={{ color: 'var(--muted)', fontSize: 13.5, margin: 0 }}>{fr ? 'Le bon ordre est affiché : vert = bien placé.' : 'Correct order shown.'}</p>}
        </section>
      )}
      {fini && (
        <section className="card cejour-carte rise" style={{ textAlign: 'center', alignItems: 'center' }}>
          <span style={{ fontSize: 56 }}>{points >= 13 ? '🏆' : points >= 8 ? '🧭' : '🕰️'}</span>
          <h2 className="t" style={{ fontSize: 30 }}>{points} / {MANCHES * 5}</h2>
          {gain && <p className="cejour-gain"><Piece size={18} /> +{gain.pieces} · +{gain.xp} XP</p>}
          {gain === null && <p style={{ color: 'var(--muted)' }}>{fr ? 'Récompense déjà reçue aujourd’hui.' : 'Reward already claimed today.'}</p>}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button className="btn btn-p" onClick={recommencer}>{fr ? 'Rejouer' : 'Replay'}</button>
            <Link className="btn btn-s" to="/cejour">📅 {fr ? 'Ce jour-là' : 'On this day'}</Link>
          </div>
        </section>
      )}
    </>
  )
}
