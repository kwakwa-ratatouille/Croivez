import { Link } from 'react-router-dom'
import { useAuth } from '../auth'
import { usePrefs } from '../i18n'
import { FAMILLES } from '../themes'
import { defiDuJour } from '../quiz/defi'
import { Coche, ICONS, Icon } from '../components/ui'
import Illustration from '../components/Illustration'

export default function Accueil() {
  const { t, lang } = usePrefs()
  const { profile } = useAuth()
  const serie = profile?.serie ?? 0
  const today = new Date().toLocaleDateString('sv')
  const joueAujourdhui = profile?.dernierJour === today
  const defi = defiDuJour(today)

  // Semaine en cours (lundi → dimanche) : on coche les jours couverts par la série
  const jourSemaine = (new Date().getDay() + 6) % 7
  const semaine = ['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((l, i) => {
    const ecart = jourSemaine - i
    const fait = ecart >= 0 && (joueAujourdhui ? ecart < serie : ecart > 0 && ecart <= serie)
    return { l, fait, aujourdhui: ecart === 0 }
  })

  const maitrise = (k: string) => {
    const f = FAMILLES.find((x) => x.k === k)!
    const vals = f.subs.map((s) => profile?.maitrise?.[s.id] ?? 0)
    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)
  }

  return (
    <>
      <svg viewBox="0 0 400 300" width="460" aria-hidden="true" style={{ position: 'absolute', right: -120, top: -110, opacity: .55, pointerEvents: 'none' }}><path d="M210 30c80-10 170 40 160 120s-90 130-180 120S20 200 40 120 130 40 210 30Z" style={{ fill: 'var(--geo-t)' }} /></svg>

      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap', position: 'relative' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <h1 className="t" style={{ fontSize: 36, fontWeight: 900 }}>{t('home.hello')} {profile?.pseudo}</h1>
          <p style={{ fontSize: 17, color: 'var(--muted)' }}>{t('home.sub')}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderRadius: 999, background: 'var(--surface)', border: '1px solid var(--line)' }}>
          <Icon d={ICONS.flame} style={{ color: 'var(--cine-i)' }} /><span style={{ fontWeight: 700 }}>{serie}</span><span style={{ color: 'var(--muted)', fontSize: 14 }}>{t('home.streak')}</span>
        </div>
      </header>

      <section className="card" style={{ padding: 32, display: 'flex', alignItems: 'center', gap: 32, flexWrap: 'wrap', position: 'relative' }}>
        <Illustration k="geo" taille={150} />
        <div style={{ flex: '1 1 320px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <span className="chip" style={{ alignSelf: 'flex-start', background: 'var(--geo-t)', color: 'var(--geo-i)' }}>{lang === 'fr' ? 'Géographie · Drapeaux' : 'Geography · Flags'}</span>
          <h2 className="t" style={{ fontSize: 26, fontWeight: 800 }}>{lang === 'fr' ? 'Les drapeaux du monde' : 'Flags of the world'}</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div className="bar" style={{ flex: 1 }}><span style={{ width: `${profile?.maitrise?.drapeaux ?? 0}%`, background: 'var(--geo)' }} /></div>
            <span style={{ fontSize: 14, color: 'var(--muted)', whiteSpace: 'nowrap' }}>{profile?.maitrise?.drapeaux ?? 0} % {t('mastered')}</span>
          </div>
        </div>
        <Link className="btn btn-p btn-lg" to="/jouer/drapeaux">{t('home.start')}<Icon d={ICONS.arrowR} /></Link>
      </section>

      <section className="grid-auto">
        <div className="card" style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <h2 className="t" style={{ fontSize: 22, fontWeight: 800 }}>{lang === 'fr' ? 'Série du jour' : 'Daily streak'}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: 10 }}>
            {semaine.map((d, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: d.fait ? 'var(--ok-t)' : 'transparent', border: `2px ${d.aujourdhui && !d.fait ? 'dashed var(--ok)' : d.fait ? 'solid var(--ok-t)' : 'solid var(--line)'}` }}>
                  {d.fait && <Coche size={22} anim={false} />}
                </span>
                <span style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600 }}>{d.l}</span>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 15, color: 'var(--muted)' }}>
            {joueAujourdhui
              ? (lang === 'fr' ? 'Bravo, la série est assurée pour aujourd’hui.' : 'Well done, your streak is safe today.')
              : (lang === 'fr' ? `Une partie aujourd’hui pour passer à ${serie + 1} jour${serie ? 's' : ''}.` : `Play once today to reach ${serie + 1} days.`)}
          </p>
        </div>
        <div className="card" style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 16, background: 'var(--his-t)', borderColor: 'transparent', position: 'relative', overflow: 'hidden' }}>
          <svg viewBox="0 0 120 120" width="150" aria-hidden="true" style={{ position: 'absolute', right: -24, bottom: -30, opacity: .6 }}><path d="m60 10 14 30 32 4-24 22 6 32-28-16-28 16 6-32-24-22 32-4Z" style={{ fill: 'none', stroke: 'var(--his)', strokeWidth: 3, strokeLinejoin: 'round' }} /></svg>
          <span className="eyebrow" style={{ color: 'var(--his-i)' }}>{t('home.daily')}</span>
          <h2 className="t" style={{ fontSize: 24, fontWeight: 800, color: 'var(--his-i)' }}>{defi.titre[lang]}</h2>
          <p style={{ fontSize: 15, color: 'var(--his-i)' }}>{defi.texte[lang]} {lang === 'fr' ? 'XP doublés.' : 'Double XP.'}</p>
          {profile?.defiJour === today
            ? <span className="btn" style={{ alignSelf: 'flex-start', background: 'var(--surface)', color: 'var(--ok-i)', position: 'relative', cursor: 'default' }}><Coche size={22} anim={false} />{lang === 'fr' ? 'Défi réussi, à demain !' : 'Done, see you tomorrow!'}</span>
            : <Link className="btn" to={defi.url} style={{ alignSelf: 'flex-start', background: 'var(--surface)', color: 'var(--his-i)', position: 'relative' }}>{t('home.dailyGo')}<Icon d={ICONS.arrowR} /></Link>}
        </div>
      </section>

      <section style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <h2 className="t" style={{ fontSize: 22, fontWeight: 800 }}>{t('home.favorites')}</h2>
          <Link to="/themes" style={{ fontWeight: 600, fontSize: 15, minHeight: 44, display: 'inline-flex', alignItems: 'center' }}>{t('home.all')}</Link>
        </div>
        <div className="grid-auto" style={{ ['--min' as string]: '200px', gap: 16 }}>
          {FAMILLES.slice(0, 4).map((f) => (
            <Link key={f.k} to={`/themes/${f.k}`} className="card famille" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14, textDecoration: 'none', background: `var(--${f.k}-t)`, color: `var(--${f.k}-i)`, borderColor: 'transparent', boxShadow: 'none' }}>
              <Illustration k={f.k} taille={130} fond={false} />
              <span className="t" style={{ fontSize: 19, fontWeight: 800 }}>{f.nom[lang]}</span>
              <div className="bar" style={{ background: 'var(--surface)' }}><span style={{ width: `${maitrise(f.k)}%`, background: `var(--${f.k})` }} /></div>
              <span style={{ fontSize: 13 }}>{maitrise(f.k)} % {t('mastered')}</span>
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}
