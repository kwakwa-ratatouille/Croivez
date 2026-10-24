import AFaire from '../components/AFaire'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../auth'
import { usePrefs } from '../i18n'
import { FAMILLES, type SousTheme } from '../themes'
import { ICONS, Icon, Piece } from '../components/ui'
import { prixCaisse, accesQuiz, legendeOuverte, progresFamille, progresLegende } from '../progression'
import { evenementDeLaSemaine } from '../meta'
import CarteCouverture, { proposerCaisse, useCouverture } from '../components/CarteCouverture'
import Img from '../components/Img'
import Defileur from '../components/Defileur'
import { normaliser } from '../quiz/match'

const pctFamille = (subs: SousTheme[], maitrise: Record<string, number> = {}) => {
  const j = subs.filter((s) => s.jouable)
  return j.length ? Math.round(j.reduce((a, s) => a + (maitrise[s.id] ?? 0), 0) / j.length) : 0
}
type Filtre = 'tous' | 'ouverts' | 'fermes'
// Saut vers une famille : défilement doux, puis direct si le navigateur ne l'a pas fait (animations coupées)
function allerA(k: string) {
  const el = document.getElementById(`famille-${k}`)
  if (!el) return
  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  setTimeout(() => { if (Math.abs(el.getBoundingClientRect().top - 70) > 120) el.scrollIntoView({ block: 'start' }) }, 800)
}

// Une famille sur la page d'index : en-tête coloré + ses quiz qui défilent (débloqués d'abord)
function RangeeFamille({ f, filtre }: { f: (typeof FAMILLES)[number]; filtre: Filtre }) {
  const { lang } = usePrefs()
  const fr = lang === 'fr'
  const { profile } = useAuth()
  const m = profile?.maitrise ?? {}
  const { possedes, total } = progresFamille(f.k, profile)
  const quiz = f.subs.filter((s) => s.jouable)
    .filter((s) => filtre === 'tous' || (filtre === 'ouverts') === accesQuiz(s.id, profile))
    .sort((a, b) => Number(!accesQuiz(a.id, profile)) - Number(!accesQuiz(b.id, profile)))
  if (!quiz.length) return null
  const event = evenementDeLaSemaine().k === f.k
  return (
    <section id={`famille-${f.k}`} className="rangee-famille" style={{ ['--k' as string]: `var(--${f.k})`, ['--kt' as string]: `var(--${f.k}-t)`, ['--ki' as string]: `var(--${f.k}-i)` }}>
      <Link to={`/themes/${f.k}`} className="rangee-famille-tete">
        <span className="rangee-famille-icone"><Icon d={f.icon} size={22} /></span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <strong className="t">{f.nom[lang]}</strong>
          <span className="rangee-famille-stats">
            {possedes}/{total} quiz · {pctFamille(f.subs, m)} % {fr ? 'maîtrisé' : 'mastered'}
            {legendeOuverte(f.k, profile) && <span className="chip mini-legende">{fr ? 'Légende' : 'Legend'}</span>}
            {event && <span className="chip mini-event">×2</span>}
          </span>
        </span>
        <span className="lien-voir">{fr ? 'Voir' : 'See'}<Icon d={ICONS.arrowR} size={15} /></span>
      </Link>
      <Defileur>
        {quiz.map((s) => <CarteCouverture key={s.id} id={s.id} pct={m[s.id] ?? 0} verrou={!accesQuiz(s.id, profile)} largeur={156} />)}
      </Defileur>
    </section>
  )
}

export default function Themes() {
  const { k } = useParams()
  const { lang } = usePrefs()
  const fr = lang === 'fr'
  const { profile } = useAuth()
  const [q, setQ] = useState('')
  const [filtre, setFiltre] = useState<Filtre>('tous')
  const m = profile?.maitrise ?? {}
  const famille = FAMILLES.find((f) => f.k === k)
  const banniere = useCouverture(famille?.subs.find((s) => s.jouable)?.id ?? '')

  // ——— Page d'une famille ———
  if (famille) {
    const { possedes, total } = progresFamille(famille.k, profile)
    const pl = progresLegende(famille.k, profile)
    const leg = legendeOuverte(famille.k, profile)
    const pct = pctFamille(famille.subs, m)
    const ouverts = famille.subs.filter((s) => s.jouable && accesQuiz(s.id, profile))
    const fermes = famille.subs.filter((s) => s.jouable && !accesQuiz(s.id, profile))
    return (
      <>
        <Link to="/themes" className="lien-retour"><Icon d={ICONS.arrowL} />{fr ? 'Tous les thèmes' : 'All topics'}</Link>
        <header className="famille-banniere rise" style={{ ['--k' as string]: `var(--${famille.k})`, ['--kt' as string]: `var(--${famille.k}-t)`, ['--ki' as string]: `var(--${famille.k}-i)` }}>
          {banniere && <Img src={banniere} alt="" className="famille-banniere-photo" />}
          <div className="famille-banniere-voile" />
          <div className="famille-banniere-contenu">
            <span className="rangee-famille-icone" style={{ background: 'rgba(255,255,255,.22)', color: '#fff' }}><Icon d={famille.icon} size={24} /></span>
            <h1 className="t" style={{ fontSize: 32, fontWeight: 900, lineHeight: 1.1 }}>{famille.nom[lang]}</h1>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span className="chip puce-verre"><Icon d={ICONS.lock} size={14} />{possedes}/{total} {fr ? 'débloqués' : 'unlocked'}</span>
              <span className="chip puce-verre">{pct} % {fr ? 'maîtrisé' : 'mastered'}</span>
            </div>
          </div>
        </header>

        <div className="famille-actions">
          {ouverts.length >= 2 && <Link className="btn btn-p" to={`/partie?jeu=mix&f=${famille.k}&d=0&m=qcm`}>🎲 {fr ? 'Jouer au hasard dans la famille' : 'Random game in this family'}</Link>}
          {fermes.length > 0 && <button className="btn btn-s" onClick={() => proposerCaisse(famille.k)}><Icon d={ICONS.sparkle} size={18} />{fr ? 'Ouvrir une caisse' : 'Open a crate'} · <Piece size={18} />{prixCaisse(profile)}</button>}
        </div>

        {/* Légende : ce qu'il reste à faire, en clair */}
        <section className={`card bloc-legende${leg ? ' ouverte' : ''}`}>
          <span style={{ fontSize: 30 }} aria-hidden="true">{leg ? '👑' : '🔒'}</span>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <strong className="t" style={{ fontSize: 17 }}>{leg ? (fr ? 'Légende ouverte !' : 'Legend unlocked!') : (fr ? 'Légende : la difficulté ultime' : 'Legend: the ultimate level')}</strong>
            <span style={{ fontSize: 13.5, color: 'var(--muted)' }}>{leg ? (fr ? '6 choix presque identiques (dont une faute d’orthographe piège), 12 secondes, XP et pièces ×3. Choisis « Légende » dans la fiche d’un quiz.' : '6 near-identical choices, 12 s, XP and coins ×3.') : (fr ? `Réussis les 4 niveaux (au sans-faute) de chaque quiz de la famille : ${pl.faits} / ${pl.total}.` : `Pass all 4 levels of every quiz: ${pl.faits} / ${pl.total}.`)}</span>
            {!leg && <span className="bar" style={{ height: 8 }}><span style={{ width: `${(pl.faits / Math.max(1, pl.total)) * 100}%`, background: 'linear-gradient(90deg, #E3A72F, #A35BE0)' }} /></span>}
          </div>
        </section>

        {ouverts.length > 0 && <h2 className="t titre-section">{fr ? 'Tes quiz' : 'Your quizzes'}</h2>}
        <section className="grille-quiz">
          {ouverts.map((s) => <CarteCouverture key={s.id} id={s.id} pct={m[s.id] ?? 0} />)}
        </section>
        {fermes.length > 0 && <h2 className="t titre-section">{fr ? 'À débloquer' : 'To unlock'} <span style={{ fontSize: 14, color: 'var(--muted)', fontWeight: 700 }}>· {fr ? 'en ouvrant des caisses' : 'by opening crates'}</span></h2>}
        <section className="grille-quiz">
          {fermes.map((s) => <CarteCouverture key={s.id} id={s.id} verrou />)}
        </section>
      </>
    )
  }

  // ——— Recherche : tous les quiz qui correspondent ———
  const n = normaliser(q)
  const resultats = n ? FAMILLES.flatMap((f) => f.subs.filter((s) => s.jouable && (normaliser(s.nom[lang]).includes(n) || normaliser(f.nom[lang]).includes(n)))) : []
  const nbQuiz = FAMILLES.reduce((a, f) => a + f.subs.filter((s) => s.jouable).length, 0)
  const FILTRES: [Filtre, string][] = [['tous', fr ? 'Tous' : 'All'], ['ouverts', fr ? 'Débloqués' : 'Unlocked'], ['fermes', fr ? 'À débloquer' : 'Locked']]

  return (
    <>
      <header style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <h1 className="t" style={{ fontSize: 34, fontWeight: 900 }}>{fr ? 'Thèmes' : 'Topics'}</h1>
          <p style={{ color: 'var(--muted)' }}>{nbQuiz} quiz {fr ? 'dans' : 'across'} {FAMILLES.length} {fr ? 'familles' : 'families'}</p>
        </div>
        <div className="recherche">
          <Icon d="M11 4a7 7 0 1 1 0 14a7 7 0 1 1 0-14ZM20 20l-3.5-3.5" style={{ color: 'var(--muted)' }} />
          <label htmlFor="th-search" className="sr">{fr ? 'Rechercher un quiz' : 'Search a quiz'}</label>
          <input id="th-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={fr ? 'Youtubeurs, drapeaux, Pokémon…' : 'YouTubers, flags, Pokémon…'} />
          {q && <button type="button" aria-label={fr ? 'Effacer' : 'Clear'} onClick={() => setQ('')} style={{ border: 0, background: 'none', color: 'var(--muted)', cursor: 'pointer', minHeight: 44 }}><Icon d={ICONS.close} size={18} /></button>}
        </div>
        {!n && <div role="tablist" className="onglets">{FILTRES.map(([id, l]) => <button key={id} role="tab" aria-selected={filtre === id} className="onglet" onClick={() => setFiltre(id)}>{l}</button>)}</div>}
      </header>
      {!n && <AFaire />}
      {/* Accès direct à une famille, sans tout faire défiler : la barre reste en haut de l'écran */}
      {!n && (
        <nav className="barre-familles" aria-label={fr ? 'Aller à une famille' : 'Jump to a family'}>
          {FAMILLES.map((f) => (
            <button key={f.k} type="button" className="famille-puce" style={{ ['--k' as string]: `var(--${f.k})`, ['--kt' as string]: `var(--${f.k}-t)`, ['--ki' as string]: `var(--${f.k}-i)` }}
              onClick={() => allerA(f.k)}>
              <span className="famille-puce-icone"><Icon d={f.icon} size={16} /></span>{f.nom[lang].split(/ [&,]/)[0]}
            </button>
          ))}
        </nav>
      )}

      {n ? (
        <section className="grille-quiz">
          {resultats.length === 0 && <p style={{ color: 'var(--muted)' }}>{fr ? 'Aucun quiz ne correspond.' : 'No quiz matches.'}</p>}
          {resultats.map((s) => <CarteCouverture key={s.id} id={s.id} pct={m[s.id] ?? 0} verrou={!accesQuiz(s.id, profile)} />)}
        </section>
      ) : (
        FAMILLES.map((f) => <RangeeFamille key={f.k} f={f} filtre={filtre} />)
      )}
    </>
  )
}
