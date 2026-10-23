import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { enregistrerPartie, useAuth } from '../auth'
import { usePrefs } from '../i18n'
import { trouverSousTheme } from '../themes'
import { calculerXp, chargerPays, difficulteAuto, drapeau, genererPartie, type Difficulte, type Mode, type Pays, type Question, type SousThemeId } from '../quiz/engine'
import { estCorrect } from '../quiz/match'
import { Coche, Croix, ICONS, Icon, Logo } from '../components/ui'

type Reponse = { q: Question; donnee: string; juste: boolean }

export default function Partie() {
  const [params] = useSearchParams()
  const nav = useNavigate()
  const { t, lang } = usePrefs()
  const { user, profile } = useAuth()

  const sousTheme = (params.get('s') ?? 'drapeaux') as SousThemeId
  const mode = (params.get('m') ?? 'qcm') as Mode
  const nombre = Number(params.get('n') ?? 10)
  const diffChoisie = Number(params.get('d') ?? 0) as Difficulte
  const chrono = Number(params.get('t') ?? 0)
  const ids = params.get('ids')?.split(',')
  const difficulte = diffChoisie || difficulteAuto(profile?.maitrise?.[sousTheme])
  const k = trouverSousTheme(sousTheme)?.famille.k ?? 'geo'

  const [tous, setTous] = useState<Pays[] | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [i, setI] = useState(0)
  const [reponses, setReponses] = useState<Reponse[]>([])
  const [saisie, setSaisie] = useState('')
  const [restant, setRestant] = useState(chrono)
  const [fini, setFini] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    chargerPays().then((p) => {
      setTous(p)
      setQuestions(genererPartie({ tous: p, sousTheme, difficulte, nombre, mode, lang, ids }))
    })
    // Une partie est générée une seule fois, à l'ouverture
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const q = questions[i]
  const courante = reponses[i] as Reponse | undefined

  const repondre = useCallback((donnee: string) => {
    if (!q || reponses[i]) return
    const juste = q.options.length ? donnee === q.reponse : estCorrect(donnee, q.acceptees)
    setReponses((r) => [...r, { q, donnee, juste }])
  }, [q, i, reponses])

  const suivant = useCallback(() => {
    if (i + 1 >= questions.length) { setFini(true); return }
    setI(i + 1)
    setSaisie('')
    setRestant(chrono)
  }, [i, questions.length, chrono])

  // Chrono : à zéro, la question compte comme ratée
  useEffect(() => {
    if (!chrono || courante || fini || !q) return
    if (restant <= 0) { repondre(''); return }
    const id = setTimeout(() => setRestant((r) => r - 0.1), 100)
    return () => clearTimeout(id)
  }, [chrono, restant, courante, fini, q, repondre])

  useEffect(() => { if (q && !q.options.length && !courante) inputRef.current?.focus() }, [q, courante])

  // Raccourcis : 1-4 pour répondre, Entrée pour passer à la suite
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!q || fini) return
      if (courante && e.key === 'Enter') { e.preventDefault(); suivant(); return }
      const n = Number(e.key)
      if (!courante && q.options.length && n >= 1 && n <= q.options.length) repondre(q.options[n - 1].label)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [q, courante, fini, repondre, suivant])

  const bonnes = reponses.filter((r) => r.juste).length
  const xp = calculerXp(bonnes, mode, difficulte)
  const enregistre = useRef(false)
  useEffect(() => {
    if (!fini || enregistre.current || !user || !profile) return
    enregistre.current = true
    enregistrerPartie(user.uid, profile, sousTheme, xp, bonnes / questions.length).catch(console.error)
  }, [fini, user, profile, sousTheme, xp, bonnes, questions.length])

  if (!tous || !q) return <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}><Logo width={72} /></div>

  if (fini) return <Resultat reponses={reponses} xp={xp} k={k} onReplay={(errIds) => {
    const p = new URLSearchParams(params)
    if (errIds) p.set('ids', errIds.join(',')); else p.delete('ids')
    nav(`/partie?${p}`, { replace: true }); window.location.reload()
  }} />

  const submit = (e: FormEvent) => { e.preventDefault(); if (saisie.trim()) repondre(saisie) }

  return (
    <div className="partie" style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '28px 40px 48px', gap: 28 }}>
      <header style={{ width: '100%', maxWidth: 1040, display: 'flex', alignItems: 'center', gap: 20 }}>
        <Link to="/" className="btn btn-g" aria-label={t('q.quit')} style={{ minHeight: 44, padding: '0 14px' }}><Icon d={ICONS.close} /></Link>
        <div className="bar" style={{ flex: 1 }}><span style={{ width: `${((i + (courante ? 1 : 0)) / questions.length) * 100}%`, background: `var(--${k})` }} /></div>
        <span style={{ fontWeight: 600, color: 'var(--muted)', whiteSpace: 'nowrap' }}>{i + 1} {t('q.of')} {questions.length}</span>
        {chrono > 0 && (
          <span aria-label={`${Math.ceil(restant)} s`} style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, minWidth: 64, color: restant <= 5 && !courante ? 'var(--ko-i)' : 'var(--text)', transition: 'color .3s ease-out' }}>
            <Icon d={ICONS.timer} size={20} />{Math.max(0, Math.ceil(restant))} s
          </span>
        )}
      </header>
      {chrono > 0 && (
        <div style={{ width: '100%', maxWidth: 1040, height: 4, borderRadius: 4, background: 'var(--surface2)', marginTop: -20, overflow: 'hidden' }}>
          <span style={{ display: 'block', height: '100%', width: `${(Math.max(0, restant) / chrono) * 100}%`, background: restant <= 5 ? 'var(--ko)' : `var(--${k})`, transition: 'width .1s linear, background-color .3s ease-out' }} />
        </div>
      )}

      <section key={i} className="rise" style={{ width: '100%', maxWidth: 1040, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28 }}>
        <h1 className="t" style={{ fontSize: 30, fontWeight: 900, textAlign: 'center', maxWidth: 760 }}>{q.enonce}</h1>
        {q.image && (
          <img src={q.image} alt="" style={{ height: 220, maxWidth: '100%', borderRadius: 18, boxShadow: 'var(--shadow)', border: '1px solid var(--line)', objectFit: 'contain', background: 'var(--surface)' }} />
        )}

        {q.options.length > 0 ? (
          <div style={{ width: '100%', display: 'grid', gridTemplateColumns: q.imagesOnly ? 'repeat(auto-fit, minmax(200px, 1fr))' : 'repeat(2, minmax(0, 1fr))', gap: 14 }}>
            {q.options.map((o, n) => {
              const estBonne = o.label === q.reponse
              const choisie = courante?.donnee === o.label
              const etat = !courante ? 'idle' : estBonne ? 'ok' : choisie ? 'ko' : 'dim'
              return (
                <button key={o.label} type="button" onClick={() => repondre(o.label)} disabled={!!courante}
                  aria-label={q.imagesOnly ? `Option ${n + 1}` : undefined}
                  style={{
                    display: 'flex', flexDirection: q.imagesOnly ? 'column' : 'row', alignItems: 'center', gap: 14, padding: q.imagesOnly ? 16 : '0 20px', minHeight: 72,
                    borderRadius: 20, cursor: courante ? 'default' : 'pointer', textAlign: 'left', font: "600 18px 'DM Sans', sans-serif", color: 'var(--text)',
                    background: etat === 'ok' ? 'var(--ok-t)' : etat === 'ko' ? 'var(--ko-t)' : 'var(--surface)',
                    border: `2px solid ${etat === 'ok' ? 'var(--ok)' : etat === 'ko' ? 'var(--ko)' : 'var(--line)'}`,
                    opacity: etat === 'dim' ? .55 : 1, transition: 'all .2s ease-out',
                  }}>
                  <span className="kbd" style={{ flex: 'none' }}>{n + 1}</span>
                  {o.image && <img src={o.image} alt="" style={{ width: '100%', aspectRatio: '3 / 2', objectFit: 'contain', borderRadius: 10 }} />}
                  {(!q.imagesOnly || courante) && <span style={{ flex: 1 }}>{o.label}</span>}
                  {etat === 'ok' && <Coche />}
                  {etat === 'ko' && <Croix />}
                </button>
              )
            })}
          </div>
        ) : (
          <form onSubmit={submit} style={{ width: '100%', maxWidth: 620, display: 'flex', gap: 12 }}>
            <label htmlFor="rep" className="sr">{t('q.placeholder')}</label>
            <input id="rep" ref={inputRef} className="input" value={saisie} onChange={(e) => setSaisie(e.target.value)} disabled={!!courante} placeholder={t('q.placeholder')} autoComplete="off" spellCheck={false}
              style={{ fontSize: 20, minHeight: 64, borderColor: courante ? (courante.juste ? 'var(--ok)' : 'var(--ko)') : undefined }} />
            {!courante && <button className="btn btn-p" style={{ minHeight: 64 }}>{t('q.validate')}</button>}
            {!courante && <button type="button" className="btn btn-g" style={{ minHeight: 64 }} onClick={() => repondre('')}>{t('q.skip')}</button>}
          </form>
        )}

        {courante && <Fiche r={courante} tous={tous} onNext={suivant} dernier={i + 1 >= questions.length} k={k} />}
      </section>
    </div>
  )
}

function Fiche({ r, tous, onNext, dernier, k }: { r: Reponse; tous: Pays[]; onNext: () => void; dernier: boolean; k: string }) {
  const { t, lang } = usePrefs()
  const p = r.q.pays
  const fmt = new Intl.NumberFormat(lang === 'fr' ? 'fr-FR' : 'en-GB')
  const rang = tous.indexOf(p) + 1
  const saviez = lang === 'fr'
    ? `${p.nom.fr} est le ${rang === 1 ? '1er' : `${rang}e`} pays le plus peuplé du monde${p.superficie ? `, pour ${fmt.format(p.superficie)} km²` : ''}.`
    : `${p.nom.en} is the world's ${rang}${['th', 'st', 'nd', 'rd'][rang % 100 > 10 && rang % 100 < 14 ? 0 : Math.min(rang % 10, 4) % 4] ?? 'th'} most populous country${p.superficie ? `, covering ${fmt.format(p.superficie)} km²` : ''}.`
  const faits = [
    p.capitale && { l: t('q.capital'), v: p.capitale[lang] },
    { l: t('q.continent'), v: p.region[lang] },
    p.population > 0 && { l: t('q.population'), v: fmt.format(p.population) },
  ].filter(Boolean) as { l: string; v: string }[]

  return (
    <div className="card rise" role="status" style={{ width: '100%', padding: 28, display: 'flex', gap: 28, flexWrap: 'wrap', alignItems: 'center', borderColor: r.juste ? 'var(--ok)' : 'var(--ko)', borderWidth: 2 }}>
      <img src={drapeau(p.id, 320)} alt="" style={{ width: 180, borderRadius: 12, border: '1px solid var(--line)', flex: 'none' }} />
      <div style={{ flex: '1 1 340px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {r.juste ? <Coche size={30} /> : <Croix size={26} />}
          <span className="t" style={{ fontSize: 22, fontWeight: 900, color: r.juste ? 'var(--ok-i)' : 'var(--ko-i)' }}>{r.juste ? t('q.right') : t('q.wrong')}</span>
          {!r.juste && <span style={{ color: 'var(--muted)' }}>· {t('q.answerWas')} <strong style={{ color: 'var(--text)' }}>{r.q.reponse}</strong></span>}
        </div>
        <div style={{ display: 'flex', gap: 22, flexWrap: 'wrap' }}>
          {faits.map((f) => <div key={f.l} style={{ display: 'flex', flexDirection: 'column' }}><span className="eyebrow" style={{ fontSize: 11 }}>{f.l}</span><span style={{ fontWeight: 700 }}>{f.v}</span></div>)}
        </div>
        <p style={{ fontSize: 15, color: `var(--${k}-i)`, background: `var(--${k}-t)`, padding: '10px 14px', borderRadius: 12 }}><strong>{t('q.didyouknow')}</strong> {saviez}</p>
        <a href={`https://${lang}.wikipedia.org/wiki/${encodeURIComponent(p.nom[lang])}`} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 600, fontSize: 14, color: 'var(--muted)', alignSelf: 'flex-start', minHeight: 32 }}>
          <Icon d={ICONS.link} size={16} />{t('q.more')}
        </a>
      </div>
      <button className="btn btn-p btn-lg" onClick={onNext} autoFocus>{dernier ? t('res.title') : t('q.next')}<span className="kbd">Entrée</span></button>
    </div>
  )
}

function Resultat({ reponses, xp, k, onReplay }: { reponses: Reponse[]; xp: number; k: string; onReplay: (ids?: string[]) => void }) {
  const { t } = usePrefs()
  const bonnes = reponses.filter((r) => r.juste).length
  const erreurs = reponses.filter((r) => !r.juste)
  const taux = bonnes / reponses.length

  return (
    <div style={{ minHeight: '100%', display: 'flex', justifyContent: 'center', padding: '48px 40px' }}>
      <div style={{ width: '100%', maxWidth: 880, display: 'flex', flexDirection: 'column', gap: 24 }}>
        <section className="card rise" style={{ padding: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <svg viewBox="0 0 400 300" width="420" aria-hidden="true" style={{ position: 'absolute', right: -120, top: -100, opacity: .5 }}><path d="M210 30c80-10 170 40 160 120s-90 130-180 120S20 200 40 120 130 40 210 30Z" style={{ fill: `var(--${k}-t)` }} /></svg>
          {taux >= .5 ? <Coche size={64} /> : <Logo width={84} />}
          <h1 className="t" style={{ fontSize: 34, fontWeight: 900, position: 'relative' }}>{t('res.title')}</h1>
          <div style={{ display: 'flex', gap: 40, position: 'relative' }}>
            <div><div className="t" style={{ fontSize: 44, fontWeight: 900 }}>{bonnes}/{reponses.length}</div><div style={{ color: 'var(--muted)' }}>{t('res.score')}</div></div>
            <div><div className="t" style={{ fontSize: 44, fontWeight: 900, color: 'var(--ok-i)' }}>+{xp}</div><div style={{ color: 'var(--muted)' }}>{t('res.xp')}</div></div>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', position: 'relative' }}>
            {erreurs.length > 0 && <button className="btn btn-p" onClick={() => onReplay(erreurs.map((r) => r.q.pays.id))}>{t('res.errors')}</button>}
            <button className="btn btn-s" onClick={() => onReplay()}>{t('res.replay')}</button>
            <Link className="btn btn-g" to="/">{t('res.home')}</Link>
          </div>
        </section>
        {erreurs.length > 0 && (
          <section className="card" style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <h2 className="t" style={{ fontSize: 22, fontWeight: 800 }}>{t('res.review')}</h2>
            {erreurs.map((r) => (
              <div key={r.q.pays.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 12, borderRadius: 16, background: 'var(--surface2)' }}>
                <img src={drapeau(r.q.pays.id, 80)} alt="" style={{ width: 54, borderRadius: 6 }} />
                <div style={{ flex: 1 }}><div style={{ fontWeight: 700 }}>{r.q.reponse}</div><div style={{ fontSize: 14, color: 'var(--muted)' }}>{r.q.enonce}</div></div>
                {r.donnee && <span style={{ fontSize: 14, color: 'var(--ko-i)', textDecoration: 'line-through' }}>{r.donnee}</span>}
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  )
}
