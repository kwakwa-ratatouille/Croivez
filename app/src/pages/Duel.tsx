import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { onValue, ref } from 'firebase/database'
import { rtdb } from '../firebase'
import { enregistrerPartie, useAuth } from '../auth'
import { usePrefs } from '../i18n'
import { genererPartie, type Question } from '../quiz/engine'
import { QUESTIONS_DUEL, SECONDES_DUEL, repondreDuel, terminerDuel, type Duel as DuelT } from '../duel'
import { Coche, Croix, ICONS, Icon, Logo } from '../components/ui'
import Extrait from '../components/Extrait'
import Img from '../components/Img'
import CarteQuiz from '../components/CarteQuiz'
import { retourReponse } from '../retour'

export default function Duel() {
  const { id = '' } = useParams()
  const { lang } = usePrefs()
  const fr = lang === 'fr'
  const { user, profile } = useAuth()
  const uid = user!.uid
  const [duel, setDuel] = useState<DuelT | null>(null)
  const [questions, setQuestions] = useState<Question[] | null>(null)
  const [i, setI] = useState(0)
  const [debut, setDebut] = useState(Date.now())
  const [maintenant, setMaintenant] = useState(Date.now())
  const enregistre = useRef(false)

  useEffect(() => onValue(ref(rtdb, `duels/${id}`), (s) => setDuel(s.val())), [id])

  // Mêmes graine et thème des deux côtés : les questions sont identiques
  const seed = duel?.seed
  const theme = duel?.s
  useEffect(() => {
    if (!seed || !theme) return
    genererPartie({ sousTheme: theme, seed, nombre: QUESTIONS_DUEL, difficulte: 2, mode: 'qcm', lang }).then((q) => { setQuestions(q); setDebut(Date.now()) })
  }, [seed, theme, lang])

  useEffect(() => { const t = setInterval(() => setMaintenant(Date.now()), 200); return () => clearInterval(t) }, [])

  const moi = duel?.joueurs?.[uid]
  const autreId = Object.keys(duel?.joueurs ?? {}).find((k) => k !== uid)
  const autre = autreId ? duel!.joueurs[autreId] : undefined
  const q = questions?.[i]
  const maReponse = moi?.r?.[i]
  const saReponse = autre?.r?.[i]
  const restant = Math.max(0, SECONDES_DUEL - (maintenant - debut) / 1000)
  const fini = !!questions && i >= questions.length

  const repondre = useCallback((label: string | null) => {
    if (!q || maReponse || !moi) return
    retourReponse(label === q.reponse)
    repondreDuel(id, uid, i, label === q.reponse, Date.now() - debut, moi.score)
  }, [q, maReponse, moi, id, uid, i, debut])

  // Temps écoulé : réponse vide
  useEffect(() => { if (q && !maReponse && restant <= 0) repondre(null) }, [q, maReponse, restant, repondre])

  // Question suivante quand les deux ont répondu (ou quand le temps de l'adversaire est écoulé aussi)
  useEffect(() => {
    if (!maReponse) return
    const tempsFini = restant <= 0
    if (!saReponse && !tempsFini) return
    const t = setTimeout(() => { setI((x) => x + 1); setDebut(Date.now()) }, 1600)
    return () => clearTimeout(t)
  }, [maReponse, saReponse, restant])

  useEffect(() => {
    if (!fini || enregistre.current || !profile || !moi || !questions || !theme) return
    enregistre.current = true
    terminerDuel(id).catch(console.error)
    const gagne = moi.score > (autre?.score ?? 0)
    const resultats = questions.map((qq, n) => ({ id: qq.id, juste: !!moi.r?.[n]?.j }))
    enregistrerPartie(uid, profile, { sousTheme: theme, xp: (gagne ? 60 : 25) + resultats.filter((r) => r.juste).length * 5, pieces: gagne ? 30 : 10, resultats, revision: true }).catch(console.error)
  }, [fini, profile, moi, autre, questions, theme, id, uid])

  if (!duel || !questions || !moi) return <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}><Logo width={72} /></div>

  const Score = ({ j, moiAussi }: { j?: { pseudo: string; score: number }; moiAussi?: boolean }) => (
    <div className="card" style={{ flex: 1, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, background: moiAussi ? 'var(--geo-t)' : 'var(--cine-t)', borderColor: 'transparent' }}>
      <span className="t" style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>{j?.pseudo?.[0]?.toUpperCase() ?? '?'}</span>
      <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis' }}>{j?.pseudo ?? '…'}</div></div>
      <span className="t" style={{ fontSize: 26, fontWeight: 900 }}>{j?.score ?? 0}</span>
    </div>
  )

  if (fini) {
    const gagne = moi.score > (autre?.score ?? 0)
    const egal = moi.score === (autre?.score ?? 0)
    return (
      <div className="partie" style={{ minHeight: '100%', display: 'flex', justifyContent: 'center', padding: '48px 40px' }}>
        <section className="card rise" style={{ width: '100%', maxWidth: 640, padding: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, textAlign: 'center' }}>
          {gagne ? <Coche size={72} /> : egal ? <Logo width={90} /> : <Croix size={60} />}
          <h1 className="t" style={{ fontSize: 34, fontWeight: 900 }}>{gagne ? (fr ? 'Victoire !' : 'Victory!') : egal ? (fr ? 'Égalité' : 'Draw') : (fr ? 'Défaite, de peu' : 'So close')}</h1>
          <div style={{ display: 'flex', gap: 12, width: '100%' }}><Score j={moi} moiAussi /><Score j={autre} /></div>
          <div style={{ display: 'flex', gap: 12 }}>
            <Link className="btn btn-p" to="/duels">{fr ? 'Nouveau duel' : 'New duel'}</Link>
            <Link className="btn btn-g" to="/">{fr ? 'Accueil' : 'Home'}</Link>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="partie" style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '28px 40px 48px', gap: 20 }}>
      <header style={{ width: '100%', maxWidth: 1040, display: 'flex', alignItems: 'center', gap: 12 }}>
        <Link to="/duels" className="btn btn-g" aria-label={fr ? 'Quitter' : 'Quit'} style={{ minHeight: 44, padding: '0 14px' }}><Icon d={ICONS.close} /></Link>
        <Score j={moi} moiAussi />
        <span className="t" style={{ fontWeight: 900, color: 'var(--muted)' }}>VS</span>
        <Score j={autre} />
      </header>
      <div style={{ width: '100%', maxWidth: 1040, display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontWeight: 600, color: 'var(--muted)', whiteSpace: 'nowrap' }}>{i + 1} / {questions.length}</span>
        <div className="bar" style={{ flex: 1, height: 6 }}><span style={{ width: `${(restant / SECONDES_DUEL) * 100}%`, background: restant <= 5 ? 'var(--ko)' : 'var(--geo)', transition: 'width .2s linear' }} /></div>
        <span style={{ fontWeight: 700, minWidth: 40, color: restant <= 5 ? 'var(--ko-i)' : 'var(--text)' }}>{Math.ceil(restant)} s</span>
      </div>

      {q && (
        <section key={i} className="rise" style={{ width: '100%', maxWidth: 1040, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
          <h1 className="t" style={{ fontSize: 28, fontWeight: 900, textAlign: 'center' }}>{q.enonce}</h1>
          {q.image && <Img src={q.image} alt="" style={{ height: 180, maxWidth: '100%', borderRadius: 16, border: '1px solid var(--line)', objectFit: 'contain' }} />}
          {q.carte && <CarteQuiz carte={q.carte} repondu={!!maReponse} onClic={() => {}} />}
          {q.audio && <Extrait id={q.audio} />}
          <div style={{ width: '100%', display: 'grid', gridTemplateColumns: q.imagesOnly ? 'repeat(auto-fit, minmax(180px, 1fr))' : 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
            {q.options.map((o, n) => {
              const etat = !maReponse ? 'idle' : o.label === q.reponse ? 'ok' : 'dim'
              return (
                <button key={o.label} type="button" disabled={!!maReponse} onClick={() => repondre(o.label)}
                  style={{ display: 'flex', flexDirection: q.imagesOnly ? 'column' : 'row', alignItems: 'center', gap: 12, padding: q.imagesOnly ? 14 : '0 18px', minHeight: 64, borderRadius: 18, cursor: maReponse ? 'default' : 'pointer', font: "600 17px 'DM Sans', sans-serif", color: 'var(--text)', textAlign: 'left',
                    background: etat === 'ok' ? 'var(--ok-t)' : 'var(--surface)', border: `2px solid ${etat === 'ok' ? 'var(--ok)' : 'var(--line)'}`, opacity: etat === 'dim' ? .55 : 1, transition: 'all .2s ease-out' }}>
                  <span className="kbd">{n + 1}</span>
                  {o.image && <Img src={o.image} alt="" style={{ width: '100%', aspectRatio: '3 / 2', objectFit: 'contain', borderRadius: 8 }} />}
                  {(!q.imagesOnly || maReponse) && <span style={{ flex: 1 }}>{o.label}</span>}
                </button>
              )
            })}
          </div>
          {maReponse && (
            <p className="rise" style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 700, color: maReponse.j ? 'var(--ok-i)' : 'var(--ko-i)' }}>
              {maReponse.j ? <Coche size={26} /> : <Croix size={22} />}
              {maReponse.j ? (fr ? 'Bonne réponse !' : 'Correct!') : (fr ? `C’était ${q.reponse}` : `It was ${q.reponse}`)}
              {!saReponse && <span style={{ color: 'var(--muted)', fontWeight: 500 }}>· {fr ? 'en attente de l’adversaire…' : 'waiting for opponent…'}</span>}
            </p>
          )}
        </section>
      )}
    </div>
  )
}
