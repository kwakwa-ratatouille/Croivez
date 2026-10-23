import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth'
import { usePrefs } from '../i18n'
import { FAMILLES } from '../themes'
import { ICONS, Icon } from '../components/ui'
import { normaliser } from '../quiz/match'

export default function Themes() {
  const { t, lang } = usePrefs()
  const { profile } = useAuth()
  const [q, setQ] = useState('')
  const n = normaliser(q)

  const familles = FAMILLES.map((f) => ({
    ...f,
    subs: f.subs.filter((s) => !n || normaliser(s.nom[lang]).includes(n) || normaliser(f.nom[lang]).includes(n)),
    pct: Math.round(f.subs.reduce((a, s) => a + (profile?.maitrise?.[s.id] ?? 0), 0) / f.subs.length),
  })).filter((f) => f.subs.length)

  return (
    <>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <h1 className="t" style={{ fontSize: 36, fontWeight: 900 }}>{t('themes.title')}</h1>
          <p style={{ fontSize: 17, color: 'var(--muted)' }}>{t('themes.sub')}</p>
        </div>
        <div style={{ flex: '0 1 420px', display: 'flex', alignItems: 'center', gap: 12, minHeight: 56, padding: '0 18px', borderRadius: 18, background: 'var(--surface)', border: '1.5px solid var(--line)' }}>
          <Icon d="M11 4a7 7 0 1 1 0 14a7 7 0 1 1 0-14ZM20 20l-3.5-3.5" style={{ color: 'var(--muted)' }} />
          <label htmlFor="th-search" className="sr">Rechercher un thème</label>
          <input id="th-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={lang === 'fr' ? 'Rechercher : capitales, insectes, logos…' : 'Search: capitals, insects, logos…'}
            style={{ flex: 1, minWidth: 0, border: 0, outline: 0, background: 'transparent', font: "500 16px 'DM Sans', sans-serif", color: 'var(--text)' }} />
        </div>
      </header>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: 20 }}>
        {familles.map((f) => (
          <article key={f.k} style={{ borderRadius: 24, padding: 24, background: `var(--${f.k}-t)`, color: `var(--${f.k}-i)`, display: 'flex', flexDirection: 'column', gap: 16, position: 'relative', overflow: 'hidden' }}>
            <svg viewBox="0 0 120 80" width="150" aria-hidden="true" style={{ position: 'absolute', right: -16, top: -8, opacity: .55 }}><path d={f.motif} style={{ fill: 'none', stroke: `var(--${f.k})`, strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }} /></svg>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, position: 'relative' }}>
              <div style={{ width: 52, height: 52, borderRadius: 16, background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon d={f.icon} size={28} /></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <h2 className="t" style={{ fontSize: 21, fontWeight: 800 }}>{f.nom[lang]}</h2>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{f.pct} % {t('mastered')}</span>
              </div>
            </div>
            <div className="bar" style={{ background: 'var(--surface)', height: 8, position: 'relative' }}><span style={{ width: `${f.pct}%`, background: `var(--${f.k})` }} /></div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, position: 'relative' }}>
              {f.subs.map((s) => s.jouable ? (
                <Link key={s.id} to={`/jouer/${s.id}`} style={{ display: 'inline-flex', alignItems: 'center', minHeight: 44, padding: '0 16px', borderRadius: 14, background: 'var(--surface)', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>{s.nom[lang]}</Link>
              ) : (
                <span key={s.id} title={t('themes.soon')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, minHeight: 44, padding: '0 16px', borderRadius: 14, border: '1.5px dashed currentColor', fontWeight: 600, fontSize: 14, opacity: .6 }}>
                  {s.nom[lang]}<Icon d={ICONS.timer} size={14} />
                </span>
              ))}
            </div>
          </article>
        ))}
      </section>
    </>
  )
}
