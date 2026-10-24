import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth'
import { usePrefs } from '../i18n'
import { FAMILLES } from '../themes'
import { accesQuiz } from '../progression'
import { genererMix, type Difficulte, type Question, type SousThemeId } from '../quiz/engine'
import { retourReponse } from '../retour'
import Img from '../components/Img'
import { Coche, Croix, ICONS, Icon } from '../components/ui'

// Mode soirée : un seul téléphone qu'on se passe. Chacun répond à son tour, classement à la fin.
type Joueur = { nom: string; score: number }
type Etape = 'reglages' | 'passe' | 'question' | 'fin'

export default function Soiree() {
  const { lang } = usePrefs()
  const fr = lang === 'fr'
  const { profile } = useAuth()
  const [noms, setNoms] = useState<string[]>(['', ''])
  const [tours, setTours] = useState(5)
  const [familles, setFamilles] = useState<string[]>([])
  const [joueurs, setJoueurs] = useState<Joueur[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [n, setN] = useState(0)
  const [etape, setEtape] = useState<Etape>('reglages')
  const [choisie, setChoisie] = useState<string | null>(null)
  const [charge, setCharge] = useState(false)

  const lancer = async () => {
    const liste = noms.map((x) => x.trim()).filter(Boolean)
    if (liste.length < 2) return
    setCharge(true)
    // Quiz possédés (ou tous si compte ouvert), filtrés par familles choisies
    const quiz = FAMILLES.filter((f) => !familles.length || familles.includes(f.k)).flatMap((f) => f.subs.filter((s) => s.jouable && accesQuiz(s.id, profile)).map((s) => s.jouable as SousThemeId))
    const qs = await genererMix({ quiz, difficultes: Array.from({ length: liste.length * tours }, (_, i) => (1 + Math.min(3, Math.floor(i / (liste.length * 2)))) as Difficulte), lang }).catch(() => [])
    setJoueurs(liste.map((nom) => ({ nom, score: 0 })))
    setQuestions(qs.filter((q) => q.options.length))
    setN(0); setChoisie(null); setCharge(false); setEtape('passe')
  }

  const joueur = joueurs.length ? joueurs[n % joueurs.length] : undefined
  const q = questions[n]

  const repondre = (label: string) => {
    if (choisie || !q) return
    setChoisie(label)
    const juste = label === q.reponse
    retourReponse(juste)
    if (juste) setJoueurs((js) => js.map((j, i) => (i === n % js.length ? { ...j, score: j.score + 1 } : j)))
  }
  const suivant = () => {
    setChoisie(null)
    if (n + 1 >= questions.length) { setEtape('fin'); return }
    setN(n + 1); setEtape('passe')
  }

  // ——— Réglages ———
  if (etape === 'reglages') return (
    <>
      <Link to="/" style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 8, minHeight: 44, fontWeight: 600, textDecoration: 'none', color: 'var(--muted)' }}><Icon d={ICONS.arrowL} />{fr ? 'Accueil' : 'Home'}</Link>
      <header><h1 className="t" style={{ fontSize: 30, fontWeight: 900 }}>🎉 {fr ? 'Mode soirée' : 'Party mode'}</h1>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>{fr ? 'Un seul téléphone, qu’on se passe à chaque question. Le meilleur gagne.' : 'One phone, passed around. Best score wins.'}</p></header>
      <section className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <strong>{fr ? 'Joueurs' : 'Players'}</strong>
        {noms.map((v, i) => (
          <div key={i} style={{ display: 'flex', gap: 8 }}>
            <input className="input" value={v} placeholder={`${fr ? 'Joueur' : 'Player'} ${i + 1}`} onChange={(e) => setNoms(noms.map((x, j) => (j === i ? e.target.value : x)))} style={{ flex: 1, minHeight: 46 }} />
            {noms.length > 2 && <button className="btn btn-g" aria-label={fr ? 'Retirer' : 'Remove'} onClick={() => setNoms(noms.filter((_, j) => j !== i))}><Icon d={ICONS.close} size={16} /></button>}
          </div>
        ))}
        {noms.length < 10 && <button className="btn btn-s" style={{ alignSelf: 'flex-start' }} onClick={() => setNoms([...noms, ''])}>+ {fr ? 'Ajouter un joueur' : 'Add player'}</button>}
      </section>
      <section className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <strong>{fr ? 'Questions par joueur' : 'Questions per player'}</strong>
        <div className="fiche-grille">{[3, 5, 8, 10].map((t) => <button key={t} type="button" className="pill" aria-pressed={tours === t} onClick={() => setTours(t)}>{t}</button>)}</div>
        <strong>{fr ? 'Thèmes (tous si aucun)' : 'Topics (all if none)'}</strong>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {FAMILLES.map((f) => <button key={f.k} type="button" className="pill" aria-pressed={familles.includes(f.k)} onClick={() => setFamilles((l) => (l.includes(f.k) ? l.filter((x) => x !== f.k) : [...l, f.k]))}>{f.nom[lang]}</button>)}
        </div>
      </section>
      <button className="btn btn-p btn-lg" disabled={noms.filter((x) => x.trim()).length < 2 || charge} onClick={lancer}>{charge ? '…' : (fr ? 'C’est parti !' : 'Start!')}<Icon d={ICONS.arrowR} /></button>
    </>
  )

  // ——— Fin : podium ———
  if (etape === 'fin') {
    const classes = [...joueurs].sort((a, b) => b.score - a.score)
    return (
      <section className="card rise" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center', textAlign: 'center' }}>
        <span style={{ fontSize: 56 }}>🏆</span>
        <h1 className="t" style={{ fontSize: 28, fontWeight: 900 }}>{classes[0].nom} {fr ? 'gagne !' : 'wins!'}</h1>
        {classes.map((j, i) => <div key={j.nom + i} style={{ display: 'flex', gap: 12, width: '100%', maxWidth: 360, justifyContent: 'space-between', fontWeight: 700, fontSize: 17 }}><span>{['🥇', '🥈', '🥉'][i] ?? `${i + 1}.`} {j.nom}</span><span>{j.score} / {tours}</span></div>)}
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-p btn-lg" onClick={lancer}>{fr ? 'Revanche' : 'Rematch'}</button>
          <button className="btn btn-g btn-lg" onClick={() => setEtape('reglages')}>{fr ? 'Réglages' : 'Settings'}</button>
        </div>
      </section>
    )
  }

  // ——— Écran de passage : on tend le téléphone au suivant ———
  if (etape === 'passe' || !q) return (
    <button type="button" className="card soiree-passe rise" onClick={() => setEtape('question')}>
      <span style={{ color: 'var(--muted)', fontWeight: 700 }}>{fr ? 'Question' : 'Question'} {n + 1} / {questions.length}</span>
      <span style={{ fontSize: 54 }}>📱</span>
      <strong className="t" style={{ fontSize: 30 }}>{fr ? `Au tour de ${joueur?.nom}` : `${joueur?.nom}’s turn`}</strong>
      <span style={{ color: 'var(--muted)' }}>{fr ? 'Touche quand tu es prêt·e' : 'Tap when ready'}</span>
      <span style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>{joueurs.map((j) => <span key={j.nom} className="chip">{j.nom} · {j.score}</span>)}</span>
    </button>
  )

  // ——— Question ———
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center' }}>
      <span className="chip" style={{ fontWeight: 800 }}>{joueur?.nom}</span>
      <h1 className="t" style={{ fontSize: 22, fontWeight: 900, textAlign: 'center' }}>{q.enonce}</h1>
      {q.image && <Img src={q.image} alt="" style={{ maxHeight: 200, maxWidth: '100%', borderRadius: 16, objectFit: 'contain' }} />}
      <div style={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
        {q.options.map((o) => {
          const etat = !choisie ? '' : o.label === q.reponse ? 'ok' : o.label === choisie ? 'ko' : 'dim'
          return (
            <button key={o.label} type="button" onClick={() => repondre(o.label)} disabled={!!choisie} className="soiree-choix" data-etat={etat}>
              {o.image && <Img src={o.image} alt="" style={{ width: '100%', aspectRatio: '3 / 2', objectFit: 'contain' }} />}
              <span>{o.label}</span>{etat === 'ok' && <Coche size={22} />}{etat === 'ko' && <Croix size={18} />}
            </button>
          )
        })}
      </div>
      {choisie && <button className="btn btn-p btn-lg" onClick={suivant} autoFocus>{n + 1 >= questions.length ? (fr ? 'Résultats' : 'Results') : (fr ? 'Joueur suivant' : 'Next player')}<Icon d={ICONS.arrowR} /></button>}
    </section>
  )
}
