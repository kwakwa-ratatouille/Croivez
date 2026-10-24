import { Link } from 'react-router-dom'
import { niveau, useAuth, xpPourNiveau } from '../auth'
import { usePrefs } from '../i18n'
import { FAMILLES } from '../themes'
import { BADGES, PALIERS, palierAtteint } from '../badges'
import { Icon, ICONS } from '../components/ui'

export default function Profil() {
  const { lang } = usePrefs()
  const { profile } = useAuth()
  if (!profile) return null
  const fr = lang === 'fr'
  const nv = niveau(profile.xp)
  const debut = xpPourNiveau(nv)
  const fin = xpPourNiveau(nv + 1)
  const pct = Math.round(((profile.xp - debut) / (fin - debut)) * 100)
  const fmt = new Intl.NumberFormat(fr ? 'fr-FR' : 'en-GB')
  const stats = [
    [fmt.format(profile.parties ?? 0), fr ? 'parties' : 'games'],
    [fmt.format(profile.bonnes ?? 0), fr ? 'bonnes réponses' : 'correct answers'],
    [profile.meilleureSerie ?? profile.serie ?? 0, fr ? 'meilleure série' : 'best streak'],
    [profile.defis ?? 0, fr ? 'défis réussis' : 'challenges won'],
  ]
  const sousJouables = FAMILLES.flatMap((f) => f.subs.filter((s) => s.jouable).map((s) => ({ ...s, k: f.k })))

  return (
    <>
      <section className="card" style={{ padding: 32, display: 'flex', alignItems: 'center', gap: 28, flexWrap: 'wrap' }}>
        <span className="t" style={{ width: 96, height: 96, borderRadius: '50%', background: 'var(--sci-t)', color: 'var(--sci-i)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 40, flex: 'none' }}>{profile.pseudo[0]?.toUpperCase()}</span>
        <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <h1 className="t" style={{ fontSize: 32, fontWeight: 900 }}>{profile.pseudo}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span className="chip" style={{ background: 'var(--mus-t)', color: 'var(--mus-i)' }}>{fr ? 'Niveau' : 'Level'} {nv}</span>
            <div className="bar" style={{ flex: 1 }}><span style={{ width: `${pct}%`, background: 'var(--mus)' }} /></div>
            <span style={{ fontSize: 14, color: 'var(--muted)', whiteSpace: 'nowrap' }}>{fmt.format(profile.xp - debut)} / {fmt.format(fin - debut)} XP</span>
          </div>
        </div>
        <Link className="btn btn-g" to="/parametres"><Icon d={ICONS.settings} />{fr ? 'Paramètres' : 'Settings'}</Link>
      </section>

      <section className="grid-auto" style={{ ['--min' as string]: '180px', gap: 16 }}>
        {stats.map(([v, l]) => (
          <div key={l} className="card" style={{ padding: 22 }}>
            <div className="t" style={{ fontSize: 32, fontWeight: 900 }}>{v}</div>
            <div style={{ color: 'var(--muted)', fontWeight: 600 }}>{l}</div>
          </div>
        ))}
      </section>

      <section className="card" style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <h2 className="t" style={{ fontSize: 22, fontWeight: 800 }}>{fr ? 'Maîtrise par thème' : 'Mastery by topic'}</h2>
        {sousJouables.map((s) => {
          const v = profile.maitrise?.[s.id] ?? 0
          return (
            <div key={s.id} style={{ display: 'grid', gridTemplateColumns: 'minmax(140px, 220px) 1fr 52px', alignItems: 'center', gap: 16 }}>
              <span style={{ fontWeight: 600 }}>{s.nom[lang]}</span>
              <div className="bar"><span style={{ width: `${v}%`, background: `var(--${s.k})` }} /></div>
              <span style={{ textAlign: 'right', color: 'var(--muted)', fontWeight: 600 }}>{v} %</span>
            </div>
          )
        })}
      </section>

      <section style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <h2 className="t" style={{ fontSize: 22, fontWeight: 800 }}>{fr ? 'Badges' : 'Badges'} <span style={{ color: 'var(--muted)', fontWeight: 600, fontSize: 16 }}>{BADGES.reduce((a, b) => a + palierAtteint(b, profile), 0)} / {BADGES.length * 3} {fr ? 'paliers' : 'tiers'}</span></h2>
        <div className="grid-auto" style={{ ['--min' as string]: '170px', gap: 12 }}>
          {/* Badges entamés d'abord, puis ceux à commencer */}
          {[...BADGES].sort((a, b) => palierAtteint(b, profile) - palierAtteint(a, profile)).map((b) => {
            const n = palierAtteint(b, profile)
            const v = b.valeur(profile)
            const prochain = b.paliers[Math.min(n, 2)]
            const prec = n ? b.paliers[n - 1] : 0
            const medaille = n ? PALIERS[n - 1].couleur : 'var(--line)'
            return (
              <div key={b.id} className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start', background: n ? `var(--${b.couleur}-t)` : 'var(--surface)', borderColor: n ? 'transparent' : 'var(--line)' }}>
                <div style={{ position: 'relative', width: 48, height: 48, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface)', border: `3px solid ${medaille}`, color: n ? `var(--${b.couleur}-i)` : 'var(--muted)' }}>
                  <Icon d={b.icon} size={24} />
                </div>
                <span className="t" style={{ fontWeight: 800, fontSize: 15.5, lineHeight: 1.2, color: n ? `var(--${b.couleur}-i)` : 'var(--text)' }}>{b.nom[lang]}</span>
                {/* 3 pastilles : bronze, argent, or */}
                <div style={{ display: 'flex', gap: 4 }} aria-label={n ? PALIERS[n - 1].nom[lang] : (fr ? 'Pas encore' : 'Not yet')}>
                  {PALIERS.map((pl, i) => <span key={i} style={{ width: 14, height: 14, borderRadius: '50%', background: i < n ? pl.couleur : 'var(--surface2)', border: `1.5px solid ${pl.couleur}` }} />)}
                </div>
                <span style={{ fontSize: 12.5, color: 'var(--muted)' }}>{n === 3 ? b.desc[lang](b.paliers[2]) + ' ✓' : b.desc[lang](prochain)}</span>
                {n < 3 && <div className="bar" style={{ width: '100%', height: 6 }}><span style={{ width: `${Math.min(100, ((v - prec) / Math.max(1, prochain - prec)) * 100)}%`, background: `var(--${b.couleur})` }} /></div>}
              </div>
            )
          })}
        </div>
      </section>
    </>
  )
}
