import { BOUTIQUE, possede } from '../meta'
import { trouverSousTheme } from '../themes'
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
  // Bilan de la semaine : 7 derniers jours comparés aux 7 d'avant
  const xpDe = (debut: number) => Array.from({ length: 7 }, (_, i) => histo[jour(new Date(Date.now() - (debut + i) * 864e5))]?.xp ?? 0).reduce((a, x) => a + x, 0)
  const sem = xpDe(0), avant = xpDe(7)
  const evol = avant ? Math.round(((sem - avant) / avant) * 100) : sem ? 100 : 0
  const meilleurJour = jours.reduce((m, j) => ((histo[j]?.xp ?? 0) > (histo[m]?.xp ?? 0) ? j : m), jours[0])
  const moyenne = actifs30 ? Math.round(jours.reduce((a, j) => a + (histo[j]?.xp ?? 0), 0) / actifs30) : 0
  // Meilleurs quiz (maîtrise) et collection
  const top = Object.entries(profile.maitrise ?? {}).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([id, v]) => ({ id, v, t: trouverSousTheme(id) }))
  const collection = (['avatar', 'cadre', 'fond', 'titre', 'effet'] as const).map((t) => { const l = BOUTIQUE.filter((o) => o.type === t && !o.cache); return { t, a: l.filter((o) => possede(profile, o)).length, n: l.length } })
  const NOMS_COLL = { avatar: fr ? 'Avatars' : 'Avatars', cadre: fr ? 'Cadres' : 'Frames', fond: fr ? 'Vitrines' : 'Showcases', titre: fr ? 'Titres' : 'Titles', effet: fr ? 'Effets' : 'Effects' }
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

      <section className="card stats-bloc">
        <h2 className="t">{fr ? 'Ta semaine' : 'Your week'}</h2>
        <div className="stats-semaine">
          <div><strong className="t">{fmt.format(sem)}</strong><small>{fr ? 'XP sur 7 jours' : 'XP in 7 days'}</small></div>
          <div className={evol >= 0 ? 'hausse' : 'baisse'}><strong className="t">{evol >= 0 ? '▲' : '▼'} {Math.abs(evol)} %</strong><small>{fr ? 'vs semaine d’avant' : 'vs last week'}</small></div>
          <div><strong className="t">{fmt.format(moyenne)}</strong><small>{fr ? 'XP par jour joué' : 'XP per active day'}</small></div>
          <div><strong className="t">{histo[meilleurJour]?.xp ? new Date(meilleurJour).toLocaleDateString(fr ? 'fr-FR' : 'en-GB', { day: 'numeric', month: 'short' }) : '—'}</strong><small>{fr ? 'meilleur jour' : 'best day'}</small></div>
        </div>
      </section>

      <section className="card stats-bloc">
        <h2 className="t">{fr ? 'Tes records' : 'Your records'}</h2>
        <div className="stats-semaine">
          <div><strong className="t">⚡ {profile.records?.express ?? '—'}</strong><small>Express</small></div>
          <div><strong className="t">❤️ {profile.records?.survie ?? '—'}</strong><small>{fr ? 'Survie' : 'Survival'}</small></div>
          <div><strong className="t">🔥 {profile.meilleureSerie ?? profile.serie ?? 0}</strong><small>{fr ? 'jours de suite' : 'day streak'}</small></div>
          <div><strong className="t">💯 {profile.sansFaute ?? 0}</strong><small>{fr ? 'sans-fautes' : 'perfect'}</small></div>
        </div>
      </section>

      {top.length > 0 && (
        <section className="card stats-bloc">
          <h2 className="t">{fr ? 'Tes meilleurs quiz' : 'Your best quizzes'}</h2>
          {top.map(({ id, v, t }, i) => (
            <Link key={id} to={`/jouer/${id}`} className="stats-top">
              <span className="stats-top-rang">{['🥇', '🥈', '🥉'][i] ?? i + 1}</span>
              <span className="stats-top-nom">{t?.sous.nom[lang] ?? id}</span>
              <span className="bar" style={{ height: 7 }}><span style={{ width: `${Math.min(100, v)}%`, background: t ? `var(--${t.famille.k})` : 'var(--ok)' }} /></span>
              <strong>{Math.round(Math.min(100, v))} %</strong>
            </Link>
          ))}
        </section>
      )}

      <section className="card stats-bloc">
        <h2 className="t">{fr ? 'Ta collection' : 'Your collection'}</h2>
        {collection.map(({ t, a, n }) => (
          <Link key={t} to={`/boutique?o=${t}`} className="stats-top">
            <span className="stats-top-nom">{NOMS_COLL[t]}</span>
            <span className="bar" style={{ height: 7 }}><span style={{ width: `${n ? (a / n) * 100 : 0}%`, background: 'var(--his)' }} /></span>
            <strong>{a} / {n}</strong>
          </Link>
        ))}
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
