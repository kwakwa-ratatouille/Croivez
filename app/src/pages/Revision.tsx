import { Link } from 'react-router-dom'
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
  const { profile } = useAuth()
  const toutes = Object.values(profile?.revision ?? {})
  const dues = aReviser(profile?.revision)
  const parTheme = Object.entries(dues.reduce<Record<string, CarteRevision[]>>((acc, c) => ((acc[c.s] ??= []).push(c), acc), {})).sort((a, b) => b[1].length - a[1].length)
  const prochaine = toutes.filter((c) => c.due > Date.now()).sort((a, b) => a.due - b.due)[0]
  const acquises = toutes.filter((c) => c.reps >= 3).length

  return (
    <>
      <h1 className="t" style={{ fontSize: 30, fontWeight: 900 }}>{fr ? 'Révision' : 'Review'}</h1>

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
