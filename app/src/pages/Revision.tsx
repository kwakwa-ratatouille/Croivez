import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { deleteField, doc, setDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../auth'
import { usePrefs } from '../i18n'
import { trouverSousTheme } from '../themes'
import { aReviser, type CarteRevision } from '../quiz/revision'
import { useCouverture } from '../components/CarteCouverture'
import Img from '../components/Img'
import { Coche, ICONS, Icon } from '../components/ui'

const urlMelange = (l: CarteRevision[], n: number) => `/partie?s=tout&m=qcm&n=${Math.min(n, l.length)}&d=4&rev=1&ids=${encodeURIComponent([...l].sort(() => Math.random() - 0.5).slice(0, n).map((c) => `${c.s}~${c.id}`).join(','))}`

// Une ligne du carnet : photo du quiz, nom, nombre à revoir ; un appui lance la révision de ce quiz
function LigneQuiz({ s, cartes }: { s: string; cartes: CarteRevision[] }) {
  const { lang } = usePrefs()
  const t = trouverSousTheme(s)
  const src = useCouverture(s)
  const k = t?.famille.k ?? 'geo'
  const lot = cartes.slice(0, 20)
  const url = `/partie?s=${s}&m=${s.startsWith('villes') ? 'libre' : 'qcm'}&n=${lot.length}&d=4&rev=1&ids=${encodeURIComponent(lot.map((c) => c.id).join(','))}`
  return (
    <Link to={url} className="rev-ligne" style={{ ['--k' as string]: `var(--${k})`, ['--kt' as string]: `var(--${k}-t)`, ['--ki' as string]: `var(--${k}-i)` }}>
      <span className="rev-photo">{src ? <Img src={src} alt="" loading="lazy" /> : <Icon d={t?.famille.icon ?? ''} size={22} />}</span>
      <span className="rev-texte"><strong>{t?.sous.nom[lang] ?? s}</strong><small>{t?.famille.nom[lang]}</small></span>
      <span className="rev-compte">{cartes.length}</span>
      <Icon d={ICONS.arrowR} size={18} />
    </Link>
  )
}

export default function Revision() {
  const { lang } = usePrefs()
  const fr = lang === 'fr'
  const { user, profile } = useAuth()
  // Cartes rangées sous un faux quiz (« tout », mix… : anciennes révisions mélangées) : ignorées puis effacées
  const valides = Object.fromEntries(Object.entries(profile?.revision ?? {}).filter(([, c]) => !!trouverSousTheme(c.s)))
  const fausses = Object.keys(profile?.revision ?? {}).filter((k) => !valides[k])
  useEffect(() => { if (user && fausses.length) setDoc(doc(db, 'users', user.uid), { revision: Object.fromEntries(fausses.map((k) => [k, deleteField()])) }, { merge: true }).catch(() => {}) }, [user, fausses.join(',')]) // eslint-disable-line react-hooks/exhaustive-deps
  const toutes = Object.values(valides)
  const dues = aReviser(valides)
  const parTheme = Object.entries(dues.reduce<Record<string, CarteRevision[]>>((acc, c) => ((acc[c.s] ??= []).push(c), acc), {})).sort((a, b) => b[1].length - a[1].length)
  const prochaine = toutes.filter((c) => c.due > Date.now()).sort((a, b) => a.due - b.due)[0]
  const acquises = toutes.filter((c) => c.reps >= 3).length
  // Points faibles : les quiz déjà joués où tu rates le plus (erreurs à revoir) et que tu maîtrises le moins
  const erreurs = toutes.reduce<Record<string, number>>((a, c) => ((a[c.s] = (a[c.s] ?? 0) + (c.reps < 3 ? 1 : 0)), a), {})
  const faibles = Object.entries(profile?.maitrise ?? {})
    .filter(([s]) => !!trouverSousTheme(s))
    .map(([s, m]) => ({ s, m, e: erreurs[s] ?? 0, poids: (100 - Math.min(100, m)) + (erreurs[s] ?? 0) * 6 }))
    .filter((x) => x.m < 90 || x.e > 0)
    .sort((a, b) => b.poids - a.poids).slice(0, 4)

  return (
    <>
      <h1 className="t" style={{ fontSize: 30, fontWeight: 900 }}>{fr ? 'Révision' : 'Review'}</h1>

      {/* Points faibles : un quiz mélangé sur les 4 thèmes où tu galères le plus */}
      {faibles.length >= 2 && (
        <section className="card faibles">
          <div className="faibles-tete"><span>🎯</span><div><strong className="t">{fr ? 'Tes points faibles' : 'Your weak spots'}</strong><small>{fr ? 'Les thèmes où tu rates le plus. Un quiz de 10 questions pour les travailler.' : 'Where you miss the most.'}</small></div></div>
          <ul className="faibles-liste">
            {faibles.map((x) => { const t = trouverSousTheme(x.s)!; return (
              <li key={x.s} style={{ ['--k' as string]: `var(--${t.famille.k})` }}>
                <span className="faibles-nom">{t.sous.nom[lang]}</span>
                <span className="bar" style={{ height: 6 }}><span style={{ width: `${Math.min(100, x.m)}%`, background: 'var(--k)' }} /></span>
                <small>{Math.round(Math.min(100, x.m))} %{x.e ? ` · ${x.e} ${fr ? 'erreur' : 'miss'}${x.e > 1 ? 's' : ''}` : ''}</small>
              </li>
            ) })}
          </ul>
          <Link to={`/partie?jeu=mix&d=0&m=qcm&n=10&q=${faibles.map((x) => x.s).join(',')}`} className="btn btn-p btn-lg">🎯 {fr ? 'Travailler mes points faibles' : 'Train my weak spots'}<Icon d={ICONS.arrowR} /></Link>
        </section>
      )}

      {/* Bloc principal : combien à revoir, et un seul gros bouton */}
      <section className={`rev-hero${dues.length ? '' : ' calme'}`}>
        <div className="rev-anneau" style={{ ['--p' as string]: `${toutes.length ? Math.round((acquises / toutes.length) * 100) : 100}%` }}>
          <strong className="t">{dues.length || <Coche size={34} anim={false} />}</strong>
          <small>{dues.length ? (fr ? 'à revoir' : 'due') : (fr ? 'à jour' : 'done')}</small>
        </div>
        <div className="rev-hero-texte">
          <strong className="t">{dues.length ? (fr ? 'Tes erreurs t’attendent' : 'Your mistakes are waiting') : (fr ? 'Rien d’urgent !' : 'All caught up!')}</strong>
          <span>{dues.length
            ? (fr ? 'Elles reviennent au bon moment, de plus en plus espacées, jusqu’à être acquises.' : 'They come back at the right time until learned.')
            : prochaine ? (fr ? `Prochaine révision ${new Date(prochaine.due).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}.` : `Next review on ${new Date(prochaine.due).toLocaleDateString('en-GB')}.`)
              : (fr ? 'Joue quelques parties : tes erreurs arriveront ici.' : 'Play a few games first.')}</span>
          <span className="rev-chips"><span>🧠 {toutes.length} {fr ? 'en apprentissage' : 'learning'}</span><span>✅ {acquises} {fr ? 'presque acquises' : 'nearly learned'}</span></span>
          <div className="rev-boutons">
            {dues.length > 0 && <Link className="btn btn-p btn-lg" to={urlMelange(dues, 30)}>{fr ? 'Tout réviser' : 'Review all'}<Icon d={ICONS.arrowR} /></Link>}
            {dues.length === 0 && toutes.length > 0 && <Link className="btn btn-p btn-lg" to={urlMelange(toutes, 20)}>{fr ? 'S’entraîner quand même' : 'Practice anyway'}<Icon d={ICONS.arrowR} /></Link>}
            {dues.length === 0 && toutes.length === 0 && <Link className="btn btn-p btn-lg" to="/themes">{fr ? 'Jouer' : 'Play'}<Icon d={ICONS.arrowR} /></Link>}
            {toutes.length > 0 && <Link className="btn btn-s btn-lg" to="/fiches">🃏 {fr ? 'Fiches' : 'Flashcards'}</Link>}
          </div>
        </div>
      </section>

      {parTheme.length > 0 && (
        <section style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <h2 className="t" style={{ fontSize: 17, fontWeight: 900 }}>{fr ? 'Par quiz' : 'By quiz'}</h2>
          <div className="rev-liste">{parTheme.map(([s, cartes]) => <LigneQuiz key={s} s={s} cartes={cartes} />)}</div>
        </section>
      )}
    </>
  )
}
