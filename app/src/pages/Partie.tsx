import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { enregistrerPartie, jour, useAuth } from '../auth'
import { usePrefs } from '../i18n'
import { trouverSousTheme } from '../themes'
import { calculerXp, difficulteAuto, distanceKm, genererPartie, type Difficulte, type Mode, type Question, type SousThemeId } from '../quiz/engine'
import { estCorrect } from '../quiz/match'
import { retourFin, retourReponse } from '../retour'
import { PRIX_INDICE, payerIndice, piecesGagnees, plafonner } from '../progression'
import { Coche, Croix, ICONS, Icon, Logo, Piece } from '../components/ui'
import Extrait from '../components/Extrait'
import Img from '../components/Img'
import CarteQuiz, { type Clic } from '../components/CarteQuiz'
import Illustration from '../components/Illustration'
import ImageWiki from '../components/ImageWiki'
import type { Famille } from '../themes'

type Reponse = { q: Question; donnee: string; juste: boolean; clic?: Clic; km?: number }

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
  const defi = params.get('defi') === '1'
  const revision = params.get('rev') === '1'
  const rapide = params.get('r') === '1' // mode rapide : pas de fiche, question suivante automatique
  const seed = defi ? Number(jour().replace(/-/g, '')) : undefined
  const difficulte = diffChoisie || plafonner(difficulteAuto(profile?.maitrise?.[sousTheme]), profile)
  const k = trouverSousTheme(sousTheme)?.famille.k ?? 'geo'

  const [questions, setQuestions] = useState<Question[] | null>(null)
  const [i, setI] = useState(0)
  const [reponses, setReponses] = useState<Reponse[]>([])
  const [saisie, setSaisie] = useState('')
  const [restant, setRestant] = useState(chrono)
  const [fini, setFini] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const debutTouche = useRef<{ x: number; y: number } | null>(null)
  const [indice, setIndice] = useState<{ i: number; masques?: string[]; lettre?: string } | null>(null)
  const [msgIndice, setMsgIndice] = useState('')

  const demarrer = useCallback((ids?: string[]) => {
    setQuestions(null)
    setI(0)
    setReponses([])
    setSaisie('')
    setRestant(chrono)
    setFini(false)
    genererPartie({ sousTheme, difficulte, nombre, mode, lang, ids, seed: ids ? undefined : seed }).then(setQuestions)
  }, [sousTheme, difficulte, nombre, mode, lang, chrono, seed])

  // Une partie est générée une seule fois, à l'ouverture
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => demarrer(params.get('ids')?.split(',')), [])

  const q = questions?.[i]
  const courante = reponses[i] as Reponse | undefined

  const enregistrer = useCallback((r: Omit<Reponse, 'q'>) => {
    if (!q || reponses[i]) return
    setReponses((prev) => [...prev, { q, ...r }])
    retourReponse(r.juste)
  }, [q, i, reponses])

  const repondre = useCallback((donnee: string) => {
    if (!q) return
    const juste = !!donnee && (q.options.length ? donnee === q.reponse : estCorrect(donnee, q.acceptees))
    enregistrer({ donnee, juste })
  }, [q, enregistrer])

  const repondreCarte = useCallback((clic: Clic) => {
    if (!q?.carte) return
    if (q.carte.trouverPays) {
      enregistrer({ donnee: '', juste: clic.paysId === q.carte.trouverPays, clic })
    } else if (q.carte.cible) {
      const km = Math.round(distanceKm(clic.latlng, q.carte.cible))
      enregistrer({ donnee: `${km} km`, juste: km <= q.carte.seuilKm, clic, km })
    }
  }, [q, enregistrer])

  const suivant = useCallback(() => {
    if (!questions) return
    if (i + 1 >= questions.length) { setFini(true); retourFin(reponses.filter((x) => x.juste).length >= questions.length / 2); return }
    setI(i + 1)
    setSaisie('')
    setRestant(chrono)
  }, [i, questions, chrono, reponses])

  // Chrono : à zéro, la question compte comme ratée
  useEffect(() => {
    if (!chrono || courante || fini || !q) return
    if (restant <= 0) { enregistrer({ donnee: '', juste: false }); return }
    const id = setTimeout(() => setRestant((r) => r - 0.1), 100)
    return () => clearTimeout(id)
  }, [chrono, restant, courante, fini, q, enregistrer])

  useEffect(() => { if (q && !q.options.length && !q.carte && !courante) inputRef.current?.focus() }, [q, courante])

  // Mode rapide : on laisse juste le temps de voir ✓ ou ✗ (un peu plus en cas d'erreur, pour lire la bonne réponse)
  useEffect(() => {
    if (!rapide || !courante) return
    const t = setTimeout(suivant, courante.juste ? 650 : q?.carte ? 1800 : 1400)
    return () => clearTimeout(t)
  }, [rapide, courante, suivant, q])

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
  // Les questions sur carte valent autant que la saisie libre
  // Défi du jour : XP doublés
  const pieces = piecesGagnees(bonnes, questions?.length ?? 0, defi)
  const xp = calculerXp(bonnes, q?.carte && !q.options.length ? 'libre' : mode, difficulte) * (defi ? 2 : 1)
  const enregistre = useRef(false)
  useEffect(() => {
    if (!fini || enregistre.current || !user || !profile || !questions) return
    enregistre.current = true
    enregistrerPartie(user.uid, profile, { sousTheme, xp, pieces, defi, revision, resultats: reponses.map((r) => ({ id: r.q.id, juste: r.juste })) }).catch(console.error)
  }, [fini, user, profile, sousTheme, xp, pieces, defi, revision, reponses, questions])

  if (!questions) return <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}><Logo width={72} /></div>
  if (!q) return <div style={{ padding: 48, textAlign: 'center' }}><p>{lang === 'fr' ? 'Aucune question disponible.' : 'No questions available.'}</p><Link className="btn btn-p" to="/">{t('res.home')}</Link></div>

  if (fini) return <Resultat reponses={reponses} xp={xp} pieces={pieces} k={k} onReplay={(ids) => {
    enregistre.current = false
    const p = new URLSearchParams(params)
    if (ids) p.set('ids', ids.join(',')); else p.delete('ids')
    nav(`/partie?${p}`, { replace: true })
    demarrer(ids)
  }} />

  // Balayer vers la gauche (après avoir répondu) passe à la question suivante
  const toucher = (e: React.TouchEvent) => { debutTouche.current = { x: e.touches[0].clientX, y: e.touches[0].clientY } }
  const relacher = (e: React.TouchEvent) => {
    const d = debutTouche.current
    if (!d || !courante || q?.carte) return
    const dx = e.changedTouches[0].clientX - d.x
    const dy = e.changedTouches[0].clientY - d.y
    if (dx < -70 && Math.abs(dy) < 50) suivant()
  }

  // Indice : payé en pièces (transaction : refusé si le solde ne suffit pas)
  async function demanderIndice() {
    if (!user || !q) return
    setMsgIndice('')
    if (!(await payerIndice(user.uid).catch(() => false))) { setMsgIndice(lang === 'fr' ? 'Pas assez de pièces.' : 'Not enough coins.'); return }
    if (q.options.length) {
      const faux = q.options.map((o) => o.label).filter((l) => l !== q.reponse).sort(() => Math.random() - 0.5).slice(0, 2)
      setIndice({ i, masques: faux })
    } else {
      const r = q.reponse
      setIndice({ i, lettre: lang === 'fr' ? `Commence par « ${r[0]} », ${r.replace(/s/g, '').length} lettres` : `Starts with “${r[0]}”, ${r.replace(/s/g, '').length} letters` })
    }
  }

  const submit = (e: FormEvent) => { e.preventDefault(); if (saisie.trim()) repondre(saisie) }

  return (
    <div className="partie" onTouchStart={toucher} onTouchEnd={relacher} style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '28px 40px 48px', gap: 24 }}>
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
        <div style={{ width: '100%', maxWidth: 1040, height: 4, borderRadius: 4, background: 'var(--surface2)', marginTop: -16, overflow: 'hidden' }}>
          <span style={{ display: 'block', height: '100%', width: `${(Math.max(0, restant) / chrono) * 100}%`, background: restant <= 5 ? 'var(--ko)' : `var(--${k})`, transition: 'width .1s linear, background-color .3s ease-out' }} />
        </div>
      )}

      <section key={i} className="rise" style={{ width: '100%', maxWidth: 1040, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
        <h1 className="t" style={{ fontSize: 30, fontWeight: 900, textAlign: 'center', maxWidth: 760 }}>{q.enonce}</h1>
        {q.image && (
          <Img src={q.image} alt="" style={{ height: 220, maxWidth: '100%', borderRadius: 18, boxShadow: 'var(--shadow)', border: '1px solid var(--line)', objectFit: 'contain', background: 'var(--surface)' }} />
        )}
        {/* Question sans image : illustration de la famille pour garder l'écran vivant (sans dévoiler la réponse) */}
        {!q.image && !q.carte && !q.audio && <div className="illus-question"><Illustration k={k as Famille} taille={170} /></div>}
        {q.carte && <CarteQuiz carte={q.carte} clic={courante?.clic} repondu={!!courante} onClic={repondreCarte} />}
        {q.audio && <Extrait id={q.audio} />}

        {q.options.length > 0 ? (
          <div style={{ width: '100%', display: 'grid', gridTemplateColumns: q.imagesOnly ? 'repeat(auto-fit, minmax(200px, 1fr))' : 'repeat(2, minmax(0, 1fr))', gap: 14 }}>
            {q.options.map((o, n) => {
              const estBonne = o.label === q.reponse
              const choisie = courante?.donnee === o.label
              const masque = indice?.i === i && indice.masques?.includes(o.label)
              const etat = !courante ? (masque ? 'dim' : 'idle') : estBonne ? 'ok' : choisie ? 'ko' : 'dim'
              return (
                <button key={o.label} type="button" onClick={() => repondre(o.label)} disabled={!!courante || masque}
                  aria-label={q.imagesOnly ? `Option ${n + 1}` : undefined}
                  style={{
                    display: 'flex', flexDirection: q.imagesOnly ? 'column' : 'row', alignItems: 'center', gap: 14, padding: q.imagesOnly ? 16 : '0 20px', minHeight: 72,
                    borderRadius: 20, cursor: courante ? 'default' : 'pointer', textAlign: 'left', font: "600 18px 'DM Sans', sans-serif", color: 'var(--text)',
                    background: etat === 'ok' ? 'var(--ok-t)' : etat === 'ko' ? 'var(--ko-t)' : 'var(--surface)',
                    border: `2px solid ${etat === 'ok' ? 'var(--ok)' : etat === 'ko' ? 'var(--ko)' : 'var(--line)'}`,
                    opacity: etat === 'dim' ? .55 : 1, transition: 'all .2s ease-out',
                  }}>
                  <span className="kbd" style={{ flex: 'none' }}>{n + 1}</span>
                  {o.image && <Img src={o.image} alt="" style={{ width: '100%', aspectRatio: '3 / 2', objectFit: 'contain', borderRadius: 10 }} />}
                  {(!q.imagesOnly || courante) && <span style={{ flex: 1 }}>{o.label}</span>}
                  {etat === 'ok' && <Coche />}
                  {etat === 'ko' && <Croix />}
                </button>
              )
            })}
          </div>
        ) : !q.carte && (
          <form onSubmit={submit} style={{ width: '100%', maxWidth: 620, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <label htmlFor="rep" className="sr">{t('q.placeholder')}</label>
            <input id="rep" ref={inputRef} className="input" value={saisie} onChange={(e) => setSaisie(e.target.value)} disabled={!!courante} placeholder={t('q.placeholder')} autoComplete="off" spellCheck={false}
              style={{ flex: '1 1 260px', width: 'auto', fontSize: 20, minHeight: 64, borderColor: courante ? (courante.juste ? 'var(--ok)' : 'var(--ko)') : undefined }} />
            {!courante && <button className="btn btn-p" style={{ minHeight: 64 }}>{t('q.validate')}</button>}
            {!courante && <button type="button" className="btn btn-g" style={{ minHeight: 64 }} onClick={() => repondre('')}>{t('q.skip')}</button>}
          </form>
        )}

        {/* Indice payant : 50/50 en QCM, première lettre en saisie libre */}
        {!courante && !q.carte && (indice?.i === i ? (
          indice.lettre && <p className="rise" style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, color: 'var(--his-i)' }}><Icon d={ICONS.bulb} size={20} />{indice.lettre}</p>
        ) : (
          <button type="button" className="btn btn-s" onClick={demanderIndice} style={{ minHeight: 44, gap: 8 }}>
            <Icon d={ICONS.bulb} size={18} />{q.options.length ? (lang === 'fr' ? 'Indice 50/50' : '50/50 hint') : (lang === 'fr' ? 'Indice' : 'Hint')} · <Piece size={16} />{PRIX_INDICE}
          </button>
        ))}
        {msgIndice && !courante && <p role="status" style={{ fontSize: 14, color: 'var(--ko-i)' }}>{msgIndice}</p>}

        {courante && rapide && (
          <p className="rise" role="status" style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 800, fontSize: 20, color: courante.juste ? 'var(--ok-i)' : 'var(--ko-i)' }}>
            {courante.juste ? <Coche size={32} /> : <Croix size={28} />}
            {courante.juste ? t('q.right') : `${t('q.answerWas')} ${courante.q.reponse}`}
          </p>
        )}
        {courante && !rapide && <Fiche r={courante} onNext={suivant} dernier={i + 1 >= questions.length} k={k} />}
        {/* Sur téléphone : bouton Suivant toujours à portée de pouce, la fiche reste à lire en faisant défiler */}
        {courante && !rapide && (
          <div className="barre-suivant">
            <button className="btn btn-p btn-lg" onClick={suivant} style={{ width: '100%' }}>{i + 1 >= questions.length ? t('res.title') : t('q.next')}<Icon d={ICONS.arrowR} /></button>
          </div>
        )}
      </section>
    </div>
  )
}

function Fiche({ r, onNext, dernier, k }: { r: Reponse; onNext: () => void; dernier: boolean; k: string }) {
  const { t, lang } = usePrefs()
  const f = r.q.fiche
  const seuil = r.q.carte?.seuilKm
  return (
    <div className="card rise" role="status" style={{ width: '100%', padding: 28, display: 'flex', gap: 28, flexWrap: 'wrap', alignItems: 'center', borderColor: r.juste ? 'var(--ok)' : 'var(--ko)', borderWidth: 2 }}>
      {f.image ? <Img src={f.image} alt="" style={{ width: 160, borderRadius: 12, border: '1px solid var(--line)', flex: 'none' }} /> : <ImageWiki wiki={f.wiki} />}
      <div style={{ flex: '1 1 340px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {r.juste ? <Coche size={30} /> : <Croix size={26} />}
          <span className="t" style={{ fontSize: 22, fontWeight: 900, color: r.juste ? 'var(--ok-i)' : 'var(--ko-i)' }}>{r.juste ? t('q.right') : t('q.wrong')}</span>
          {r.km !== undefined
            ? <span style={{ color: 'var(--muted)' }}>· {lang === 'fr' ? `à ${r.km} km` : `${r.km} km away`} ({lang === 'fr' ? 'objectif' : 'target'} : {seuil} km)</span>
            : !r.juste && <span style={{ color: 'var(--muted)' }}>· {t('q.answerWas')} <strong style={{ color: 'var(--text)' }}>{r.q.reponse}</strong></span>}
        </div>
        <div style={{ display: 'flex', gap: 22, flexWrap: 'wrap' }}>
          {f.faits.map((x) => <div key={x.l} style={{ display: 'flex', flexDirection: 'column' }}><span className="eyebrow" style={{ fontSize: 11 }}>{x.l}</span><span style={{ fontWeight: 700 }}>{x.v}</span></div>)}
        </div>
        <p style={{ fontSize: 15, color: `var(--${k}-i)`, background: `var(--${k}-t)`, padding: '10px 14px', borderRadius: 12 }}><strong>{t('q.didyouknow')}</strong> {f.saviez}</p>
        <a href={f.wiki} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 600, fontSize: 14, color: 'var(--muted)', alignSelf: 'flex-start', minHeight: 32 }}>
          <Icon d={ICONS.link} size={16} />{t('q.more')}
        </a>
      </div>
      <button className="btn btn-p btn-lg btn-suivant-fiche" onClick={onNext} autoFocus>{dernier ? t('res.title') : t('q.next')}<span className="kbd">Entrée</span></button>
    </div>
  )
}

function Resultat({ reponses, xp, pieces, k, onReplay }: { reponses: Reponse[]; xp: number; pieces: number; k: string; onReplay: (ids?: string[]) => void }) {
  const { t, lang } = usePrefs()
  const bonnes = reponses.filter((r) => r.juste).length
  const erreurs = reponses.filter((r) => !r.juste)
  const taux = bonnes / reponses.length

  return (
    <div className="partie" style={{ minHeight: '100%', display: 'flex', justifyContent: 'center', padding: '48px 40px' }}>
      <div style={{ width: '100%', maxWidth: 880, display: 'flex', flexDirection: 'column', gap: 24 }}>
        <section className="card rise" style={{ padding: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <svg viewBox="0 0 400 300" width="420" aria-hidden="true" style={{ position: 'absolute', right: -120, top: -100, opacity: .5 }}><path d="M210 30c80-10 170 40 160 120s-90 130-180 120S20 200 40 120 130 40 210 30Z" style={{ fill: `var(--${k}-t)` }} /></svg>
          <div style={{ position: 'relative' }}><Illustration k={k as Famille} taille={190} /><span style={{ position: 'absolute', right: -6, bottom: -4 }}>{taux >= .5 ? <Coche size={52} /> : <Croix size={40} />}</span></div>
          <h1 className="t" style={{ fontSize: 34, fontWeight: 900, position: 'relative' }}>{t('res.title')}</h1>
          <div style={{ display: 'flex', gap: 40, position: 'relative' }}>
            <div><div className="t" style={{ fontSize: 44, fontWeight: 900 }}>{bonnes}/{reponses.length}</div><div style={{ color: 'var(--muted)' }}>{t('res.score')}</div></div>
            <div><div className="t" style={{ fontSize: 44, fontWeight: 900, color: 'var(--ok-i)' }}>+{xp}</div><div style={{ color: 'var(--muted)' }}>{t('res.xp')}</div></div>
            <div><div className="t" style={{ fontSize: 44, fontWeight: 900, color: 'var(--his-i)', display: 'flex', alignItems: 'center', gap: 8 }}><Piece size={36} />+{pieces}</div><div style={{ color: 'var(--muted)' }}>{lang === 'fr' ? 'pièces' : 'coins'}</div></div>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', position: 'relative' }}>
            {erreurs.length > 0 && <button className="btn btn-p" onClick={() => onReplay(erreurs.map((r) => r.q.id))}>{t('res.errors')}</button>}
            <button className="btn btn-s" onClick={() => onReplay()}>{t('res.replay')}</button>
            <Link className="btn btn-g" to="/">{t('res.home')}</Link>
          </div>
        </section>
        {erreurs.length > 0 && (
          <section className="card" style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <h2 className="t" style={{ fontSize: 22, fontWeight: 800 }}>{t('res.review')}</h2>
            {erreurs.map((r) => (
              <div key={r.q.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 12, borderRadius: 16, background: 'var(--surface2)' }}>
                {r.q.fiche.image && <Img src={r.q.fiche.image} alt="" style={{ width: 54, borderRadius: 6 }} />}
                <div style={{ flex: 1 }}><div style={{ fontWeight: 700 }}>{r.q.reponse}</div><div style={{ fontSize: 14, color: 'var(--muted)' }}>{r.q.enonce}</div></div>
                {r.donnee && <span style={{ fontSize: 14, color: 'var(--ko-i)', textDecoration: r.km === undefined ? 'line-through' : 'none' }}>{r.donnee}</span>}
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  )
}
