import { Link } from 'react-router-dom'
import { jour, useAuth } from '../auth'
import { usePrefs } from '../i18n'
import { FAMILLES } from '../themes'
import { legendeOuverte } from '../progression'
import { ICONS, Icon } from '../components/ui'

// Statistiques : chiffres clés, activité des 30 derniers jours, forces et faiblesses par famille
export default function Stats() {
  const { lang } = usePrefs()
  const fr = lang === 'fr'
  const { profile } = useAuth()
  if (!profile) return null
  const fmt = new Intl.NumberFormat(fr ? 'fr-FR' : 'en-GB')
  const histo = profile.histo ?? {}
  const jours = Array.from({ length: 30 }, (_, i) => jour(new Date(Date.now() - (29 - i) * 864e5)))
  const maxXp = Math.max(1, ...jours.map((j) => histo[j]?.xp ?? 0))
  const totalT = Object.values(profile.precision ?? {}).reduce((a, x) => a + x.t, 0)
  const totalB = Object.values(profile.precision ?? {}).reduce((a, x) => a + x.b, 0)
  const paliers = Object.values(profile.paliers ?? {}).reduce((n, l) => n + l.length, 0)
  const cartes = Object.values(profile.album ?? {}).reduce((n, l) => n + l.length, 0)
  const actifs30 = jours.filter((j) => histo[j]?.p).length
  // Précision par famille (au moins 10 questions jouées pour compter)
  const familles = FAMILLES.map((f) => { const x = profile.precision?.[f.k]; return { f, t: x?.t ?? 0, pct: x?.t ? Math.round((x.b / x.t) * 100) : 0 } }).filter((x) => x.t >= 10).sort((a, b) => b.pct - a.pct)
  const COUL = ['his', 'ok', 'cine', 'mus', 'geo', 'ani', 'nat', 'esp']
  const EMO = ['🎮', '🎯', '🔥', '💯', '🪜', '👑', '🃏', '📅']
  const chiffres: [string, string][] = [
    [fmt.format(profile.parties ?? 0), fr ? 'parties' : 'games'], [totalT ? `${Math.round((totalB / totalT) * 100)} %` : '—', fr ? 'précision' : 'accuracy'],
    [String(profile.meilleureSerie ?? profile.serie ?? 0), fr ? 'série max' : 'best streak'], [String(profile.sansFaute ?? 0), fr ? 'sans-fautes' : 'perfect games'],
    [String(paliers), fr ? 'niveaux réussis' : 'levels passed'], [String(FAMILLES.filter((f) => legendeOuverte(f.k, profile)).length), fr ? 'Légendes' : 'Legends'],
    [fmt.format(cartes), fr ? 'cartes d’album' : 'album cards'], [`${actifs30} / 30`, fr ? 'jours actifs' : 'active days'],
  ]
  return (
    <>
      <Link to="/profil" style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 8, minHeight: 44, fontWeight: 600, textDecoration: 'none', color: 'var(--muted)' }}><Icon d={ICONS.arrowL} />{fr ? 'Profil' : 'Profile'}</Link>
      <h1 className="t" style={{ fontSize: 30, fontWeight: 900 }}>{fr ? 'Mes statistiques' : 'My stats'}</h1>
      <section className="stats-chiffres">{chiffres.map(([v, l], i) => <div key={l} className="stats-tuile" style={{ ['--c' as string]: `var(--${COUL[i]})`, ['--ct' as string]: `var(--${COUL[i]}-t)` }}><span className="stats-emo">{EMO[i]}</span><strong className="t">{v}</strong><span>{l}</span></div>)}</section>

      {/* Précision globale (anneau) et répartition des questions par famille (donut) */}
      <section className="stats-duo">
        <div className="card stats-anneau-bloc">
          <div className="stats-anneau" style={{ ['--p' as string]: `${totalT ? Math.round((totalB / totalT) * 100) : 0}%` }}><strong className="t">{totalT ? Math.round((totalB / totalT) * 100) : 0}%</strong><small>{fr ? 'de bonnes réponses' : 'correct'}</small></div>
        </div>
        <div className="card stats-donut-bloc">
          {(() => {
            const rep = FAMILLES.map((f) => ({ f, t: profile.precision?.[f.k]?.t ?? 0 })).filter((x) => x.t > 0).sort((a, b) => b.t - a.t)
            const tot = rep.reduce((a, x) => a + x.t, 0)
            let acc = 0
            const fond = rep.length ? `conic-gradient(${rep.map((x) => { const d = acc; acc += (x.t / tot) * 100; return `var(--${x.f.k}) ${d}% ${acc}%` }).join(', ')})` : 'var(--surface2)'
            return (<>
              <div className="stats-donut" style={{ background: fond }}><span className="t">{fmt.format(tot)}<small>{fr ? 'questions' : 'questions'}</small></span></div>
              <ul className="stats-legende">{rep.slice(0, 6).map((x) => <li key={x.f.k}><i style={{ background: `var(--${x.f.k})` }} />{x.f.nom[lang]}<b>{Math.round((x.t / tot) * 100)} %</b></li>)}</ul>
            </>)
          })()}
        </div>
      </section>

      <section className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <h2 className="t" style={{ fontSize: 17, fontWeight: 900 }}>{fr ? 'XP des 30 derniers jours' : 'XP over 30 days'}</h2>
        <div className="stats-barres" role="img" aria-label={fr ? 'Activité des 30 derniers jours' : 'Last 30 days activity'}>
          {jours.map((j, i) => <span key={j} title={`${j} · ${histo[j]?.xp ?? 0} XP`} style={{ height: `${Math.max(3, ((histo[j]?.xp ?? 0) / maxXp) * 100)}%`, opacity: histo[j]?.xp ? 1 : 0.25, background: `linear-gradient(180deg, hsl(${260 - i * 4} 70% 68%), hsl(${200 - i * 3} 70% 58%))` }} />)}
        </div>
      </section>

      <section className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <h2 className="t" style={{ fontSize: 17, fontWeight: 900 }}>{fr ? 'Précision par famille' : 'Accuracy by family'}</h2>
        {familles.length === 0 && <p style={{ color: 'var(--muted)', fontSize: 14 }}>{fr ? 'Joue quelques parties pour voir tes forces et tes faiblesses.' : 'Play a few games to see your strengths.'}</p>}
        {familles.map(({ f, pct, t }, i) => (
          <Link key={f.k} to={`/themes/${f.k}`} style={{ display: 'grid', gridTemplateColumns: '22px minmax(0, 1fr) 90px 44px', gap: 8, alignItems: 'center', color: 'inherit', textDecoration: 'none' }}>
            <span style={{ color: `var(--${f.k}-i)` }}><Icon d={f.icon} size={18} /></span>
            <span style={{ fontWeight: 700, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{i === 0 ? '💪 ' : i === familles.length - 1 && familles.length > 2 ? '🎯 ' : ''}{f.nom[lang]} <small style={{ color: 'var(--muted)', fontWeight: 600 }}>· {t} q.</small></span>
            <span className="bar" style={{ height: 7 }}><span style={{ width: `${pct}%`, background: `var(--${f.k})` }} /></span>
            <span style={{ textAlign: 'right', fontWeight: 800, fontSize: 13 }}>{pct} %</span>
          </Link>
        ))}
        {familles.length > 2 && <p style={{ fontSize: 13, color: 'var(--muted)' }}>💪 {fr ? 'ton point fort' : 'strength'} · 🎯 {fr ? 'à travailler : touche pour t’entraîner' : 'to work on'}</p>}
      </section>
    </>
  )
}
