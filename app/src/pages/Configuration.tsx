import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../auth'
import { usePrefs, type Key } from '../i18n'
import { trouverSousTheme } from '../themes'
import { difficulteAuto, type Difficulte, type Mode } from '../quiz/engine'
import { ICONS, Icon, Toggle } from '../components/ui'

const DIFFS: { v: Difficulte; k: Key; h: Key }[] = [
  { v: 0, k: 'diff.auto', h: 'diff.autoHint' },
  { v: 1, k: 'diff.1', h: 'diff.1h' },
  { v: 2, k: 'diff.2', h: 'diff.2h' },
  { v: 3, k: 'diff.3', h: 'diff.3h' },
  { v: 4, k: 'diff.4', h: 'diff.4h' },
]

export default function Configuration() {
  const { sous = 'drapeaux' } = useParams()
  const { t, lang } = usePrefs()
  const { profile } = useAuth()
  const nav = useNavigate()
  const found = trouverSousTheme(sous)
  const famille = found?.famille
  const jouables = famille?.subs.filter((s) => s.jouable) ?? []

  const [sub, setSub] = useState(found?.sous.jouable ? sous : jouables[0]?.id ?? 'drapeaux')
  const [diff, setDiff] = useState<Difficulte>(0)
  const [nombre, setNombre] = useState(10)
  const [mode, setMode] = useState<Mode>('qcm')
  const [chrono, setChrono] = useState(false)
  const [duree, setDuree] = useState(20)
  const [rapide, setRapide] = useState(() => { try { return localStorage.getItem('rapide') === '1' } catch { return false } })

  const qcmSeul = sub === 'drapeaux-inverse'
  const carteSeule = sub.startsWith('villes') // on place toujours la ville sur la carte
  const surCarte = sub === 'pays-carte'
  const modeEffectif = qcmSeul ? 'qcm' : carteSeule ? 'libre' : mode
  const labelMode = (id: Mode) => carteSeule
    ? (lang === 'fr' ? 'Placer sur la carte' : 'Place on the map')
    : surCarte && id === 'libre' ? (lang === 'fr' ? 'Cliquer sur la carte' : 'Click on the map')
    : surCarte ? (lang === 'fr' ? 'Nommer le pays surligné' : 'Name the highlighted country')
    : t(id === 'qcm' ? 'cfg.qcm' : 'cfg.free')
  const diffAuto = difficulteAuto(profile?.maitrise?.[sub])
  const lancer = () => {
    try { localStorage.setItem('rapide', rapide ? '1' : '0') } catch { /* stockage indisponible */ }
    nav(`/partie?s=${sub}&m=${modeEffectif}&n=${nombre}&d=${diff}&t=${chrono ? duree : 0}${rapide ? '&r=1' : ''}`)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Enter' && !(e.target instanceof HTMLButtonElement)) lancer() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const titreSub = jouables.find((s) => s.id === sub)?.nom[lang] ?? sub
  const k = famille?.k ?? 'geo'

  return (
    <>
      <Link to="/themes" style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 8, minHeight: 44, fontWeight: 600, textDecoration: 'none', color: 'var(--muted)' }}><Icon d={ICONS.arrowL} />{t('nav.themes')}</Link>
      <header style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: -12 }}>
        <div style={{ width: 64, height: 64, borderRadius: 20, background: `var(--${k}-t)`, color: `var(--${k}-i)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon d={famille?.icon ?? ''} size={32} /></div>
        <div><span className="eyebrow" style={{ color: `var(--${k}-i)` }}>{famille?.nom[lang]}</span><h1 className="t" style={{ fontSize: 34, fontWeight: 900 }}>{t('cfg.new')}</h1></div>
      </header>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'flex-start' }}>
        <div className="card" style={{ flex: '999 1 560px', minWidth: 0, padding: 32, display: 'flex', flexDirection: 'column', gap: 30 }}>
          <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
            <legend className="t" style={{ fontSize: 20, fontWeight: 800, padding: 0, marginBottom: 14 }}>{t('cfg.sub')}</legend>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {jouables.map((s) => <button key={s.id} type="button" className="pill" aria-pressed={sub === s.id} onClick={() => setSub(s.id)}>{s.nom[lang]}</button>)}
            </div>
          </fieldset>

          <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
            <legend className="t" style={{ fontSize: 20, fontWeight: 800, padding: 0, marginBottom: 14 }}>{t('cfg.diff')}</legend>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(118px, 1fr))', gap: 12 }}>
              {DIFFS.map((d) => (
                <button key={d.v} type="button" className="choice" aria-pressed={diff === d.v} onClick={() => setDiff(d.v)} style={{ minHeight: 104 }}>
                  <span style={{ display: 'flex', gap: 4, color: 'var(--muted)', fontSize: 13, letterSpacing: 2 }}>
                    {d.v === 0 ? <Icon d={ICONS.sparkle} size={18} /> : '●'.repeat(d.v) + '○'.repeat(4 - d.v)}
                  </span>
                  <span className="t" style={{ fontSize: 18, fontWeight: 800 }}>{t(d.k)}</span>
                  <span style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 500 }}>{d.v === 0 ? `${t(d.h)} · ${t(`diff.${diffAuto}` as Key)}` : t(d.h)}</span>
                </button>
              ))}
            </div>
          </fieldset>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 30 }}>
            <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
              <legend className="t" style={{ fontSize: 20, fontWeight: 800, padding: 0, marginBottom: 14 }}>{t('cfg.count')}</legend>
              <div style={{ display: 'flex', gap: 10 }}>
                {[10, 20, 30].map((n) => <button key={n} type="button" className="pill" aria-pressed={nombre === n} onClick={() => setNombre(n)} style={{ minWidth: 72 }}>{n}</button>)}
              </div>
            </fieldset>
            <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
              <legend className="t" style={{ fontSize: 20, fontWeight: 800, padding: 0, marginBottom: 14 }}>{t('cfg.timer')}</legend>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, minHeight: 48, flexWrap: 'wrap' }}>
                <Toggle on={chrono} onChange={setChrono} label={t('cfg.timer')} />
                {chrono
                  ? [10, 20, 30].map((s) => <button key={s} type="button" className="pill" aria-pressed={duree === s} onClick={() => setDuree(s)}>{s} s</button>)
                  : <span style={{ color: 'var(--muted)', fontWeight: 500 }}>{t('cfg.zen')}</span>}
              </div>
            </fieldset>
            <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
              <legend className="t" style={{ fontSize: 20, fontWeight: 800, padding: 0, marginBottom: 14 }}>{lang === 'fr' ? 'Mode rapide' : 'Quick mode'}</legend>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, minHeight: 48 }}>
                <Toggle on={rapide} onChange={setRapide} label={lang === 'fr' ? 'Mode rapide' : 'Quick mode'} />
                <span style={{ color: 'var(--muted)', fontWeight: 500 }}>{rapide ? (lang === 'fr' ? 'Pas de fiche : réponse, puis question suivante' : 'No card: answer, then next question') : (lang === 'fr' ? 'Fiche après chaque réponse' : 'Card after each answer')}</span>
              </div>
            </fieldset>
          </div>

          {!carteSeule && <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
            <legend className="t" style={{ fontSize: 20, fontWeight: 800, padding: 0, marginBottom: 14 }}>{t('cfg.mode')}</legend>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
              {([['qcm', 'cfg.qcm', 'cfg.qcmHint', '1  2  3  4'], ['libre', 'cfg.free', 'cfg.freeHint', 'Aa']] as const).map(([id, l, h, keys]) => (
                <button key={id} type="button" className="choice" aria-pressed={modeEffectif === id} disabled={qcmSeul && id === 'libre'} onClick={() => setMode(id)} style={{ minHeight: 120, opacity: qcmSeul && id === 'libre' ? .45 : 1 }}>
                  <span className="kbd">{keys}</span>
                  <span className="t" style={{ fontSize: 19, fontWeight: 800 }}>{surCarte ? labelMode(id) : t(l)}</span>
                  {!surCarte && <span style={{ fontSize: 14, lineHeight: 1.45, color: 'var(--muted)', fontWeight: 500 }}>{t(h)}</span>}
                </button>
              ))}
            </div>
          </fieldset>}
        </div>

        <aside className="card" style={{ flex: '1 1 300px', padding: 28, display: 'flex', flexDirection: 'column', gap: 18, background: `var(--${k}-t)`, borderColor: 'transparent', color: `var(--${k}-i)`, position: 'sticky', top: 24 }}>
          <span className="eyebrow" style={{ color: `var(--${k}-i)` }}>{t('cfg.yours')}</span>
          <p className="t" style={{ fontSize: 26, fontWeight: 900, lineHeight: 1.2 }}>{titreSub}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 16, fontWeight: 600 }}>
            <span>{nombre} questions · {diff === 0 ? `${t('diff.auto')} (${t(`diff.${diffAuto}` as Key)})` : t(DIFFS[diff].k)}</span>
            <span>{labelMode(modeEffectif)}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Icon d={ICONS.timer} size={18} />{chrono ? `${duree} s / question` : t('cfg.zen')}</span>
          </div>
          <button className="btn btn-p btn-lg" onClick={lancer}>{t('cfg.go')}<span className="kbd">Entrée</span></button>
        </aside>
      </div>
    </>
  )
}
