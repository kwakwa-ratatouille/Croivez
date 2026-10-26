import { appliquerMiniJeu, type MiniJeu } from '../quiz/formats'
import { memoriser, vuesRecemment } from '../quiz/memoire'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { onValue, ref } from 'firebase/database'
import { rtdb } from '../firebase'
import { enregistrerPartie, useAuth } from '../auth'
import { usePrefs } from '../i18n'
import { genererPartie, type Question } from '../quiz/engine'
import { QUESTIONS_DUEL, SECONDES_DUEL, marquerPret, repondreDuel, terminerDuel, type Duel as DuelT } from '../duel'
import { Coche, Croix, ICONS, Icon, Logo } from '../components/ui'
import Extrait from '../components/Extrait'
import Img from '../components/Img'
import CarteQuiz from '../components/CarteQuiz'
import { retourFin, retourReponse } from '../retour'

// Applique le type de quiz choisi (vrai ou faux, flash…) avec un hasard reproductible : mêmes questions pour les deux
function avecMiniJeu(qs: Question[], mj: string | undefined, seed: number, lang: 'fr' | 'en'): Question[] {
  if (!mj || mj === 'qcm') return qs
  let a = seed | 0
  const alea = () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
  const vrai = Math.random
  Math.random = alea
  try { return qs.map((q) => appliquerMiniJeu(q, mj as MiniJeu, lang)) } finally { Math.random = vrai }
}

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
  const exclus = duel?.etat === 'jeu' ? Object.values(duel.exclus ?? {}).flat().join(',') : null
  useEffect(() => {
    if (!seed || !theme || exclus === null) return
    genererPartie({ exclus: exclus ? exclus.split(',') : undefined, sousTheme: theme, seed, nombre: duel?.n ?? QUESTIONS_DUEL, difficulte: (duel?.d ?? 2) as 2, mode: 'qcm', lang }).then((q) => { setQuestions(avecMiniJeu(q, duel?.mj, seed, lang)); setDebut(Date.now()) })
  }, [seed, theme, lang, exclus]) // eslint-disable-line react-hooks/exhaustive-deps
  // Départ commun quand les deux ont dit « prêt »
  useEffect(() => { if (duel?.etat === 'jeu' && duel.debut) setDebut(Math.max(Date.now(), duel.debut)) }, [duel?.etat, duel?.debut])

  useEffect(() => { const t = setInterval(() => setMaintenant(Date.now()), 200); return () => clearInterval(t) }, [])

  const moi = duel?.joueurs?.[uid]
  const autreId = Object.keys(duel?.joueurs ?? {}).find((k) => k !== uid)
  const autre = autreId ? duel!.joueurs[autreId] : undefined
  const q = questions?.[i]
  const maReponse = moi?.r?.[i]
  const saReponse = autre?.r?.[i]
  const secondes = duel?.secondes ?? SECONDES_DUEL
  const restant = Math.max(0, secondes - (maintenant - debut) / 1000)
  const fini = !!questions && i >= questions.length

  const repondre = useCallback((label: string | null) => {
    if (!q || maReponse || !moi) return
    retourReponse(label === q.reponse)
    memoriser(theme ?? '', q.id, label === q.reponse)
    repondreDuel(id, uid, i, label === q.reponse, Date.now() - debut, moi.score, secondes)
  }, [q, maReponse, moi, id, uid, i, debut])

  // Temps écoulé : réponse vide
  useEffect(() => { if (duel?.etat === 'jeu' && q && !maReponse && restant <= 0) repondre(null) }, [duel?.etat, q, maReponse, restant, repondre])

  // Question suivante quand les deux ont répondu (ou quand le temps de l'adversaire est écoulé aussi)
  // (booléen : le chrono qui tourne ne doit pas relancer l'attente à chaque tic)
  const pret = !!maReponse && (!!saReponse || restant <= 0)
  useEffect(() => {
    if (!pret) return
    const t = setTimeout(() => { setI((x) => x + 1); setDebut(Date.now()) }, 1600)
    return () => clearTimeout(t)
  }, [pret, i])

  useEffect(() => {
    if (!fini || enregistre.current || !profile || !moi || !questions || !theme) return
    enregistre.current = true
    terminerDuel(id).catch(console.error)
    const gagne = moi.score > (autre?.score ?? 0)
    retourFin(gagne, 2) // victoire : grosse fête
    const resultats = questions.map((qq, n) => ({ id: qq.id, juste: !!moi.r?.[n]?.j }))
    enregistrerPartie(uid, profile, { sousTheme: theme, xp: (gagne ? 60 : 25) + resultats.filter((r) => r.juste).length * 5, pieces: gagne ? 50 : 20, resultats, revision: true, multi: { mode: 'duel', gagne } }).catch(console.error)
  }, [fini, profile, moi, autre, questions, theme, id, uid])

  if (!duel || !moi) return <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}><Logo width={72} /></div>

  // Salle d'attente : chacun confirme ; le duel ne part que quand les deux sont prêts
  if (duel.etat === 'pret' || duel.etat === 'attente') {
    const joueurs = Object.entries(duel.joueurs ?? {})
    return (
      <div className="partie" style={{ minHeight: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <section className="card rise duel-pret">
          <span className="eyebrow">{fr ? 'Duel' : 'Duel'}{duel.d === 5 ? ' · 👑 Légende' : ''}</span>
          <h1 className="t">{fr ? 'Prêts ?' : 'Ready?'}</h1>
          <div className="duel-pret-joueurs">
            {joueurs.map(([k, j]) => <div key={k} className={`duel-pret-joueur${j.pret ? ' ok' : ''}`}><strong>{j.pseudo}{k === uid ? (fr ? ' (toi)' : ' (you)') : ''}</strong><span>{j.pret ? '✅ ' + (fr ? 'Prêt' : 'Ready') : '⏳ ' + (fr ? 'En attente' : 'Waiting')}</span></div>)}
            {joueurs.length < 2 && <div className="duel-pret-joueur"><strong>…</strong><span>⏳ {fr ? 'L’adversaire arrive' : 'Opponent coming'}</span></div>}
          </div>
          {moi.pret
            ? <p style={{ color: 'var(--muted)', fontWeight: 700 }}>{fr ? 'En attente de l’autre joueur…' : 'Waiting for the other player…'}</p>
            : <button className="btn btn-p btn-lg" disabled={joueurs.length < 2} onClick={() => marquerPret(id, uid, vuesRecemment(duel.s))}>{fr ? 'Je suis prêt !' : 'I’m ready!'}</button>}
          <Link to="/duels" className="btn btn-g" onClick={() => terminerDuel(id).catch(() => {})}>{fr ? 'Annuler le duel' : 'Cancel'}</Link>
        </section>
      </div>
    )
  }
  if (!questions) return <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}><Logo width={72} /></div>


  const Score = ({ j, moiAussi }: { j?: { pseudo: string; score: number }; moiAussi?: boolean }) => (
    <div className="card duel-score" style={{ flex: 1, minWidth: 0, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, background: moiAussi ? 'var(--geo-t)' : 'var(--cine-t)', borderColor: 'transparent' }}>
      <span className="t duel-initiale" style={{ width: 40, height: 40, flex: 'none', borderRadius: '50%', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>{j?.pseudo?.[0]?.toUpperCase() ?? '?'}</span>
      <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{j?.pseudo ?? '…'}</div></div>
      <span className="t duel-points" style={{ fontSize: 26, fontWeight: 900 }}>{j?.score ?? 0}</span>
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
          <div style={{ display: 'flex', gap: 12, width: '100%' }}><Score j={moi} moiAussi />{autreId ? <Link to={`/joueur/${autreId}`} style={{ flex: 1, minWidth: 0, display: 'flex', color: 'inherit', textDecoration: 'none' }}><Score j={autre} /></Link> : <Score j={autre} />}</div>
          <div style={{ display: 'flex', gap: 12 }}>
            <Link className="btn btn-p" to="/duels">{fr ? 'Nouveau duel' : 'New duel'}</Link>
            <Link className="btn btn-g" to="/">{fr ? 'Accueil' : 'Home'}</Link>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="partie duel-page" style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '28px 40px 48px', gap: 20 }}>
      {/* Tableau de scores : toi (bleu) contre l'adversaire (rouge), VS au centre, une pastille par question */}
      <header className="duel-tableau">
        <Link to="/duels" className="duel-quitter" aria-label={fr ? 'Quitter' : 'Quit'}><Icon d={ICONS.close} size={18} /></Link>
        <div className="duel-joueur moi">
          <span className="duel-nom">{moi.pseudo}</span>
          <strong className="t duel-pts">{moi.score}</strong>
          <span className="duel-pastilles">{questions.map((_, n) => <i key={n} className={moi.r?.[n] ? (moi.r[n].j ? 'ok' : 'ko') : n === i ? 'ici' : ''} />)}</span>
        </div>
        <div className="duel-vs"><span className="t">VS</span><small>{Math.min(i + 1, questions.length)}/{questions.length}</small></div>
        <Link to={autreId ? `/joueur/${autreId}` : '#'} className="duel-joueur autre">
          <span className="duel-nom">{autre?.pseudo ?? '…'}</span>
          <strong className="t duel-pts">{autre?.score ?? 0}</strong>
          <span className="duel-pastilles">{questions.map((_, n) => <i key={n} className={autre?.r?.[n] ? (autre.r[n].j ? 'ok' : 'ko') : n === i ? 'ici' : ''} />)}</span>
        </Link>
      </header>
      <div style={{ width: '100%', maxWidth: 1040, display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontWeight: 600, color: 'var(--muted)', whiteSpace: 'nowrap' }}>{i + 1} / {questions.length}</span>
        <div className="bar" style={{ flex: 1, height: 6 }}><span style={{ width: `${(restant / secondes) * 100}%`, background: restant <= 5 ? 'var(--ko)' : 'var(--geo)', transition: 'width .2s linear' }} /></div>
        <span style={{ fontWeight: 700, minWidth: 40, color: restant <= 5 ? 'var(--ko-i)' : 'var(--text)' }}>{Math.ceil(restant)} s</span>
      </div>

      {q && (
        <section key={i} className="rise" style={{ width: '100%', maxWidth: 1040, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
          <h1 className="t" style={{ fontSize: 28, fontWeight: 900, textAlign: 'center' }}>{q.enonce}</h1>
          {q.format === 'vf' && <p className="t" style={{ fontSize: 22, fontWeight: 900, textAlign: 'center' }}>{q.propose} ?</p>}
          {q.image && <span className={q.effet === 'zoom' && !maReponse ? 'cadre-zoom' : 'cadre-image'}><Img src={q.image} alt="" className={`question-image${q.flou && !maReponse ? ' image-floue' : ''}${q.effet && !maReponse ? ` image-${q.effet}` : ''}`} style={{ height: 180, maxWidth: '100%', borderRadius: 16, border: '1px solid var(--line)', objectFit: 'contain' }} /></span>}
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
