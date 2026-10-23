import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../auth'
import { usePrefs } from '../i18n'
import { FAMILLES, type Famille, type SousTheme } from '../themes'
import { ICONS, Icon, Piece } from '../components/ui'
import { PRIX_FAMILLE, acheterFamille, familleOuverte } from '../progression'
import Illustration from '../components/Illustration'
import { normaliser } from '../quiz/match'

const pctFamille = (subs: SousTheme[], maitrise: Record<string, number> = {}) => {
  const j = subs.filter((s) => s.jouable)
  return j.length ? Math.round(j.reduce((a, s) => a + (maitrise[s.id] ?? 0), 0) / j.length) : 0
}

// Tuile d'un quiz : nom, maîtrise, et un appui pour lancer
function Tuile({ s, k, pct, verrou = false }: { s: SousTheme; k: string; pct: number; verrou?: boolean }) {
  const { lang } = usePrefs()
  if (!s.jouable || verrou) {
    return (
      <div style={{ padding: 18, borderRadius: 20, border: '1.5px dashed var(--line)', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 10, fontWeight: 600 }}>
        <Icon d={verrou ? ICONS.lock : ICONS.timer} size={18} />{s.nom[lang]}{verrou ? '' : ` · ${lang === 'fr' ? 'bientôt' : 'soon'}`}
      </div>
    )
  }
  return (
    <Link to={`/jouer/${s.id}`} className="card tuile" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 12, textDecoration: 'none', boxShadow: 'none' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <span className="t" style={{ fontSize: 17, fontWeight: 800, lineHeight: 1.25 }}>{s.nom[lang]}</span>
        <span style={{ width: 36, height: 36, borderRadius: 12, flex: 'none', background: `var(--${k}-t)`, color: `var(--${k}-i)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon d={ICONS.arrowR} size={18} /></span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div className="bar" style={{ flex: 1, height: 6 }}><span style={{ width: `${pct}%`, background: `var(--${k})` }} /></div>
        <span style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600, minWidth: 34, textAlign: 'right' }}>{pct} %</span>
      </div>
    </Link>
  )
}

export default function Themes() {
  const { k } = useParams()
  const { lang } = usePrefs()
  const fr = lang === 'fr'
  const { user, profile } = useAuth()
  const [q, setQ] = useState('')
  const m = profile?.maitrise ?? {}
  const famille = FAMILLES.find((f) => f.k === k)
  const [msg, setMsg] = useState('')
  const acheter = async (fk: Famille) => {
    if (!user) return
    setMsg('')
    if (!(await acheterFamille(user.uid, fk).catch(() => false))) setMsg(fr ? `Il vous faut ${PRIX_FAMILLE} pièces : jouez aux familles déjà ouvertes pour en gagner.` : `You need ${PRIX_FAMILLE} coins: play your open families to earn more.`)
  }

  // ——— Page d'une famille ———
  if (famille) {
    const jouables = famille.subs.filter((s) => s.jouable)
    const ouverte = familleOuverte(famille.k, profile)
    return (
      <>
        <Link to="/themes" style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 8, minHeight: 44, fontWeight: 600, textDecoration: 'none', color: 'var(--muted)' }}><Icon d={ICONS.arrowL} />{fr ? 'Tous les thèmes' : 'All topics'}</Link>
        <header className="rise" style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap', padding: 24, borderRadius: 28, background: `var(--${famille.k}-t)`, color: `var(--${famille.k}-i)` }}>
          <Illustration k={famille.k} taille={180} fond={false} />
          <div style={{ flex: '1 1 220px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <h1 className="t" style={{ fontSize: 34, fontWeight: 900 }}>{famille.nom[lang]}</h1>
            <span style={{ fontWeight: 600 }}>{jouables.length} quiz · {pctFamille(famille.subs, m)} % {fr ? 'maîtrisé' : 'mastered'}</span>
            <div className="bar" style={{ background: 'var(--surface)', maxWidth: 320 }}><span style={{ width: `${pctFamille(famille.subs, m)}%`, background: `var(--${famille.k})` }} /></div>
            {!ouverte && (
              <button className="btn btn-p" onClick={() => acheter(famille.k)} style={{ alignSelf: 'flex-start', marginTop: 6 }}>
                <Icon d={ICONS.lock} size={18} />{fr ? 'Débloquer' : 'Unlock'} · <Piece size={18} />{PRIX_FAMILLE}
              </button>
            )}
            {msg && <p role="status" style={{ fontSize: 14 }}>{msg}</p>}
          </div>
        </header>
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 14 }}>
          {famille.subs.map((s) => <Tuile key={s.id} s={s} k={famille.k} pct={m[s.id] ?? 0} verrou={!ouverte} />)}
        </section>
      </>
    )
  }

  // ——— Recherche : tous les quiz qui correspondent ———
  const n = normaliser(q)
  const resultats = n ? FAMILLES.flatMap((f) => f.subs.filter((s) => s.jouable && (normaliser(s.nom[lang]).includes(n) || normaliser(f.nom[lang]).includes(n))).map((s) => ({ s, k: f.k }))) : []

  return (
    <>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <h1 className="t" style={{ fontSize: 36, fontWeight: 900 }}>{fr ? 'Thèmes' : 'Topics'}</h1>
          <p style={{ fontSize: 16, color: 'var(--muted)' }}>{FAMILLES.reduce((a, f) => a + f.subs.filter((s) => s.jouable).length, 0)} quiz {fr ? 'dans' : 'across'} {FAMILLES.length} {fr ? 'familles' : 'families'}</p>
        </div>
        <div style={{ flex: '1 1 300px', maxWidth: 420, display: 'flex', alignItems: 'center', gap: 12, minHeight: 52, padding: '0 18px', borderRadius: 18, background: 'var(--surface)', border: '1.5px solid var(--line)' }}>
          <Icon d="M11 4a7 7 0 1 1 0 14a7 7 0 1 1 0-14ZM20 20l-3.5-3.5" style={{ color: 'var(--muted)' }} />
          <label htmlFor="th-search" className="sr">{fr ? 'Rechercher un quiz' : 'Search a quiz'}</label>
          <input id="th-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={fr ? 'Drapeaux, mangas, préfectures…' : 'Flags, manga, capitals…'}
            style={{ flex: 1, minWidth: 0, border: 0, outline: 0, background: 'transparent', font: "500 16px 'DM Sans', sans-serif", color: 'var(--text)' }} />
          {q && <button type="button" aria-label={fr ? 'Effacer' : 'Clear'} onClick={() => setQ('')} style={{ border: 0, background: 'none', color: 'var(--muted)', cursor: 'pointer', minHeight: 44 }}><Icon d={ICONS.close} size={18} /></button>}
        </div>
      </header>

      {n ? (
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 14 }}>
          {resultats.length === 0 && <p style={{ color: 'var(--muted)' }}>{fr ? 'Aucun quiz ne correspond.' : 'No quiz matches.'}</p>}
          {resultats.map(({ s, k: fk }) => <Tuile key={s.id} s={s} k={fk} pct={m[s.id] ?? 0} verrou={!familleOuverte(fk, profile)} />)}
        </section>
      ) : (
        <section className="grille-familles">
          {FAMILLES.map((f, i) => {
            const pct = pctFamille(f.subs, m)
            const ouverte = familleOuverte(f.k, profile)
            return (
              <Link key={f.k} to={`/themes/${f.k}`} className="famille rise" style={{ animationDelay: `${i * 40}ms`, filter: ouverte ? 'none' : 'grayscale(.55)', borderRadius: 28, padding: '18px 20px 20px', background: `var(--${f.k}-t)`, color: `var(--${f.k}-i)`, textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: 10, position: 'relative', overflow: 'hidden' }}>
                <div className="illus-famille"><Illustration k={f.k} taille={190} fond={false} /></div>
                <h2 className="t" style={{ fontSize: 21, fontWeight: 900 }}>{f.nom[lang]}</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div className="bar" style={{ flex: 1, height: 8, background: 'var(--surface)' }}><span style={{ width: `${pct}%`, background: `var(--${f.k})` }} /></div>
                  {ouverte
                    ? <span style={{ fontSize: 13, fontWeight: 700 }}>{f.subs.filter((s) => s.jouable).length} quiz</span>
                    : <span style={{ fontSize: 13, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}><Icon d={ICONS.lock} size={15} /><Piece size={16} />{PRIX_FAMILLE}</span>}
                </div>
              </Link>
            )
          })}
        </section>
      )}
    </>
  )
}
