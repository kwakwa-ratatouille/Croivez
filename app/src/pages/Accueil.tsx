import { Link } from 'react-router-dom'
import { useAuth } from '../auth'
import { usePrefs } from '../i18n'
import { FAMILLES, type Famille, type SousTheme } from '../themes'
import { defiDuJour } from '../quiz/defi'
import { aReviser } from '../quiz/revision'
import { accesQuiz } from '../progression'
import { Coche, ICONS, Icon } from '../components/ui'
import Illustration from '../components/Illustration'
import { ouvrirFiche } from '../components/FicheLancement'

// Derniers quiz joués sur cet appareil (d'après la mémoire des questions), du plus récent au plus ancien
function quizRecents(): string[] {
  try {
    return Object.keys(localStorage)
      .filter((k) => k.startsWith('memoire:') && k !== 'memoire:mix')
      .map((k) => {
        const m = JSON.parse(localStorage.getItem(k) ?? '{}') as Record<string, [number, number]>
        return { s: k.slice(8), t: Math.max(0, ...Object.values(m).map((v) => v[0])) }
      })
      .sort((a, b) => b.t - a.t)
      .map((x) => x.s)
  } catch { return [] }
}

// Carte compacte d'un quiz dans un carrousel : un appui ouvre la fiche de lancement
function CarteQuiz({ s, k, pct }: { s: SousTheme; k: Famille; pct: number }) {
  const { lang } = usePrefs()
  return (
    <button type="button" onClick={() => ouvrirFiche(s.id)} className="famille" style={{ width: 168, padding: '10px 12px 14px', borderRadius: 22, border: 0, cursor: 'pointer', textAlign: 'left', font: 'inherit', background: `var(--${k}-t)`, color: `var(--${k}-i)`, display: 'flex', flexDirection: 'column', gap: 6 }}>
      <Illustration k={k} taille={144} fond={false} />
      <span className="t" style={{ fontWeight: 800, fontSize: 15, lineHeight: 1.25, minHeight: 38 }}>{s.nom[lang]}</span>
      <div className="bar" style={{ height: 6, background: 'var(--surface)' }}><span style={{ width: `${pct}%`, background: `var(--${k})` }} /></div>
    </button>
  )
}

function Rangee({ titre, lien, children }: { titre: string; lien?: { to: string; label: string }; children: React.ReactNode }) {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
        <h2 className="t" style={{ fontSize: 20, fontWeight: 900 }}>{titre}</h2>
        {lien && <Link to={lien.to} style={{ fontWeight: 600, fontSize: 14, minHeight: 44, display: 'inline-flex', alignItems: 'center', color: 'var(--muted)' }}>{lien.label}</Link>}
      </div>
      <div className="carrousel">{children}</div>
    </section>
  )
}

export default function Accueil() {
  const { t, lang } = usePrefs()
  const fr = lang === 'fr'
  const { profile } = useAuth()
  const serie = profile?.serie ?? 0
  const today = new Date().toLocaleDateString('sv')
  const defi = defiDuJour(today)
  const m = profile?.maitrise ?? {}
  const dues = aReviser(profile?.revision).length

  const tous = FAMILLES.flatMap((f) => f.subs.filter((s) => s.jouable && accesQuiz(s.id, profile)).map((s) => ({ s, k: f.k })))
  const recents = quizRecents().map((id) => tous.find((x) => x.s.id === id)).filter((x): x is { s: SousTheme; k: Famille } => !!x).slice(0, 10)
  // À découvrir : quiz ouverts jamais joués
  const nouveaux = tous.filter((x) => !(m[x.s.id] > 0) && !recents.some((r) => r.s.id === x.s.id)).sort(() => Math.random() - 0.5).slice(0, 10)

  const MODES = [
    { jeu: 'mix', titre: 'Mix', texte: fr ? '10 questions, tous thèmes' : '10 questions, all topics', k: 'jv' as Famille, record: undefined },
    { jeu: 'express', titre: 'Express', texte: fr ? 'Le max en 1 minute' : 'Most in 1 minute', k: 'cine' as Famille, record: profile?.records?.express },
    { jeu: 'survie', titre: fr ? 'Survie' : 'Survival', texte: fr ? '3 vies, de plus en plus dur' : '3 lives, ever harder', k: 'nat' as Famille, record: profile?.records?.survie },
  ]

  return (
    <>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <h1 className="t" style={{ fontSize: 32, fontWeight: 900 }}>{t('home.hello')} {profile?.pseudo}</h1>
          <p style={{ fontSize: 16, color: 'var(--muted)' }}>{t('home.sub')}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 999, background: 'var(--surface)', border: '1px solid var(--line)' }}>
          <Icon d={ICONS.flame} style={{ color: 'var(--cine-i)' }} /><span style={{ fontWeight: 800 }}>{serie}</span><span style={{ color: 'var(--muted)', fontSize: 14 }}>{t('home.streak')}</span>
        </div>
      </header>

      {/* Modes de jeu : un appui, la partie démarre */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10 }}>
        {MODES.map((x) => (
          <Link key={x.jeu} to={`/partie?jeu=${x.jeu}&d=0&m=qcm`} className="famille" style={{ padding: '14px 12px', borderRadius: 22, textDecoration: 'none', background: `var(--${x.k}-t)`, color: `var(--${x.k}-i)`, display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
            <span className="t" style={{ fontSize: 20, fontWeight: 900 }}>{x.titre}</span>
            <span style={{ fontSize: 12.5, fontWeight: 600, lineHeight: 1.3 }}>{x.texte}</span>
            {x.record !== undefined && <span style={{ fontSize: 12, fontWeight: 800, marginTop: 2 }}>{fr ? 'Record' : 'Best'} : {x.record}</span>}
          </Link>
        ))}
      </section>

      {/* Défi du jour + révision */}
      <section className="carrousel">
        <div className="card" style={{ width: 300, padding: 20, display: 'flex', flexDirection: 'column', gap: 10, background: 'var(--his-t)', borderColor: 'transparent', color: 'var(--his-i)' }}>
          <span className="eyebrow" style={{ color: 'var(--his-i)' }}>{t('home.daily')} · XP ×2</span>
          <strong className="t" style={{ fontSize: 18 }}>{defi.titre[lang]}</strong>
          {profile?.defiJour === today
            ? <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, color: 'var(--ok-i)' }}><Coche size={20} anim={false} />{fr ? 'Réussi, à demain !' : 'Done, see you tomorrow!'}</span>
            : <Link className="btn" to={defi.url} style={{ alignSelf: 'flex-start', minHeight: 44, background: 'var(--surface)', color: 'var(--his-i)' }}>{t('home.dailyGo')}<Icon d={ICONS.arrowR} size={18} /></Link>}
        </div>
        {dues > 0 && (
          <Link to="/revision" className="card" style={{ width: 240, padding: 20, display: 'flex', flexDirection: 'column', gap: 8, textDecoration: 'none', background: 'var(--ko-t)', borderColor: 'transparent', color: 'var(--ko-i)' }}>
            <span className="eyebrow" style={{ color: 'var(--ko-i)' }}>{fr ? 'À revoir' : 'To review'}</span>
            <strong className="t" style={{ fontSize: 30 }}>{dues}</strong>
            <span style={{ fontWeight: 600 }}>{fr ? 'questions ratées reviennent' : 'missed questions are back'}</span>
          </Link>
        )}
      </section>

      {recents.length > 0 && (
        <Rangee titre={fr ? 'Reprendre' : 'Continue'}>
          {recents.map(({ s, k }) => <CarteQuiz key={s.id} s={s} k={k} pct={m[s.id] ?? 0} />)}
        </Rangee>
      )}
      {nouveaux.length > 0 && (
        <Rangee titre={fr ? 'À découvrir' : 'Discover'} lien={{ to: '/themes', label: fr ? 'Tous les thèmes' : 'All topics' }}>
          {nouveaux.map(({ s, k }) => <CarteQuiz key={s.id} s={s} k={k} pct={m[s.id] ?? 0} />)}
        </Rangee>
      )}
      {FAMILLES.map((f) => {
        const quiz = f.subs.filter((s) => s.jouable && accesQuiz(s.id, profile))
        if (!quiz.length) return null
        return (
          <Rangee key={f.k} titre={f.nom[lang]} lien={{ to: `/themes/${f.k}`, label: fr ? 'Voir tout' : 'See all' }}>
            {quiz.map((s) => <CarteQuiz key={s.id} s={s} k={f.k} pct={m[s.id] ?? 0} />)}
          </Rangee>
        )
      })}
    </>
  )
}
