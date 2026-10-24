import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../auth'
import { usePrefs } from '../i18n'
import { FAMILLES, type Famille, type SousTheme } from '../themes'
import { ICONS, Icon, Piece } from '../components/ui'
import { PRIX_CAISSE, accesQuiz, familleOuverte, ouvrirCaisse, quizVerrouilles } from '../progression'
import Caisse from '../components/Caisse'
import { evenementDeLaSemaine } from '../meta'
import { ouvrirFiche } from '../components/FicheLancement'
import Illustration from '../components/Illustration'
import CarteCouverture from '../components/CarteCouverture'
import { normaliser } from '../quiz/match'

const pctFamille = (subs: SousTheme[], maitrise: Record<string, number> = {}) => {
  const j = subs.filter((s) => s.jouable)
  return j.length ? Math.round(j.reduce((a, s) => a + (maitrise[s.id] ?? 0), 0) / j.length) : 0
}

// Tuile d'un quiz : nom, maîtrise, et un appui pour lancer
function Tuile({ s, pct, verrou = false }: { s: SousTheme; k: string; pct: number; verrou?: boolean }) {
  const { lang } = usePrefs()
  if (!s.jouable) {
    return (
      <div style={{ padding: 18, borderRadius: 20, border: '1.5px dashed var(--line)', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 10, fontWeight: 600 }}>
        <Icon d={ICONS.timer} size={18} />{s.nom[lang]} · {lang === 'fr' ? 'bientôt' : 'soon'}
      </div>
    )
  }
  return <CarteCouverture id={s.id} pct={pct} verrou={verrou} />
}

// Carte de progression : un chemin d'étapes (un quiz = une étape), validée à 60 % de maîtrise
function CheminProgression({ subs, k, m, ouvert }: { subs: SousTheme[]; k: string; m: Record<string, number>; ouvert: (id: string) => boolean }) {
  const { lang } = usePrefs()
  const faites = subs.filter((s) => (m[s.id] ?? 0) >= 60).length
  const actuelle = subs.findIndex((s) => ouvert(s.id) && (m[s.id] ?? 0) < 60)
  const pas = 96
  const largeur = Math.max(1, subs.length) * pas
  // Sentier ondulé : les étapes alternent haut / bas
  const y = (i: number) => (i % 2 ? 78 : 34)
  const chemin = subs.map((_, i) => `${i ? 'S' : 'M'} ${i * pas + pas / 2 - (i ? pas / 2 : 0)} ${i ? (y(i) + y(i - 1)) / 2 : y(0)} ${i * pas + pas / 2} ${y(i)}`).join(' ')
  return (
    <section className="card" style={{ padding: '14px 0 8px', overflow: 'hidden' }}>
      <div style={{ padding: '0 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <strong className="t" style={{ fontSize: 17 }}>{lang === 'fr' ? 'Ton chemin' : 'Your path'}</strong>
        <span style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600 }}>{faites} / {subs.length} {lang === 'fr' ? 'étapes' : 'steps'}</span>
      </div>
      <div className="carrousel" style={{ margin: 0, padding: '0 18px' }}>
        <svg width={largeur} height={130} viewBox={`0 0 ${largeur} 130`} role="img" aria-label={`${faites} / ${subs.length}`} style={{ flex: 'none' }}>
          <path d={chemin} fill="none" stroke="var(--line)" strokeWidth="6" strokeLinecap="round" strokeDasharray="2 12" />
          {subs.map((s, i) => {
            const fait = (m[s.id] ?? 0) >= 60
            const bloque = !ouvert(s.id)
            const ici = i === actuelle
            return (
              <g key={s.id} transform={`translate(${i * pas + pas / 2} ${y(i)})`} style={{ cursor: bloque ? 'default' : 'pointer' }} onClick={() => !bloque && ouvrirFiche(s.id)}>
                {ici && <circle r="27" fill={`var(--${k})`} opacity=".25"><animate attributeName="r" values="22;29;22" dur="2s" repeatCount="indefinite" /></circle>}
                <circle r="20" fill={fait ? `var(--${k})` : bloque ? 'var(--surface2)' : 'var(--surface)'} stroke={bloque ? 'var(--line)' : `var(--${k})`} strokeWidth="3" />
                {fait
                  ? <path d="M-8 1 L-2 7 L9 -6" fill="none" stroke="var(--surface)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                  : <text textAnchor="middle" dy="5" fontFamily="Nunito, sans-serif" fontWeight="900" fontSize="15" fill={bloque ? 'var(--muted)' : `var(--${k}-i)`}>{bloque ? '•' : i + 1}</text>}
                <text textAnchor="middle" y={i % 2 ? -30 : 38} fontFamily="DM Sans, sans-serif" fontWeight="600" fontSize="11" fill="var(--muted)">{s.nom[lang].length > 14 ? s.nom[lang].slice(0, 13) + '…' : s.nom[lang]}</text>
              </g>
            )
          })}
        </svg>
      </div>
    </section>
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
  const [caisse, setCaisse] = useState<{ gain: SousTheme; possibles: SousTheme[] } | null>(null)
  // Caisse : quiz tiré au hasard parmi ceux encore verrouillés de la famille
  const ouvrir = async (fk: Famille) => {
    if (!user) return
    setMsg('')
    const possibles = quizVerrouilles(fk, profile)
    const gain = await ouvrirCaisse(user.uid, fk, profile).catch(() => false as const)
    if (gain) setCaisse({ gain, possibles })
    else setMsg(fr ? `Il vous faut ${PRIX_CAISSE} pièces : jouez aux quiz déjà ouverts pour en gagner.` : `You need ${PRIX_CAISSE} coins: play your open quizzes to earn more.`)
  }

  // ——— Page d'une famille ———
  if (famille) {
    const jouables = famille.subs.filter((s) => s.jouable)
    const restants = quizVerrouilles(famille.k, profile)
    return (
      <>
        {caisse && <Caisse k={famille.k} possibles={caisse.possibles} gain={caisse.gain} onFermer={() => setCaisse(null)} />}
        <Link to="/themes" style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 8, minHeight: 44, fontWeight: 600, textDecoration: 'none', color: 'var(--muted)' }}><Icon d={ICONS.arrowL} />{fr ? 'Tous les thèmes' : 'All topics'}</Link>
        <header className="rise" style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap', padding: 24, borderRadius: 28, background: `var(--${famille.k}-t)`, color: `var(--${famille.k}-i)` }}>
          <Illustration k={famille.k} taille={180} fond={false} />
          <div style={{ flex: '1 1 220px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <h1 className="t" style={{ fontSize: 34, fontWeight: 900 }}>{famille.nom[lang]}</h1>
            <span style={{ fontWeight: 600 }}>{jouables.length} quiz · {pctFamille(famille.subs, m)} % {fr ? 'maîtrisé' : 'mastered'}</span>
            <div className="bar" style={{ background: 'var(--surface)', maxWidth: 320 }}><span style={{ width: `${pctFamille(famille.subs, m)}%`, background: `var(--${famille.k})` }} /></div>
            {restants.length > 0 && (
              <button className="btn btn-p" onClick={() => ouvrir(famille.k)} style={{ alignSelf: 'flex-start', marginTop: 6 }}>
                <Icon d={ICONS.sparkle} size={18} />{fr ? 'Ouvrir une caisse' : 'Open a crate'} · <Piece size={18} />{PRIX_CAISSE}
              </button>
            )}
            {restants.length > 0 && <span style={{ fontSize: 13, fontWeight: 600 }}>{fr ? `${restants.length} quiz à gagner dans cette famille` : `${restants.length} quizzes to win in this family`}</span>}
            {msg && <p role="status" style={{ fontSize: 14 }}>{msg}</p>}
          </div>
        </header>
        <CheminProgression subs={jouables} k={famille.k} m={m} ouvert={(id) => accesQuiz(id, profile)} />
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(165px, 1fr))', gap: 14 }}>
          {famille.subs.map((s) => <Tuile key={s.id} s={s} k={famille.k} pct={m[s.id] ?? 0} verrou={!accesQuiz(s.id, profile)} />)}
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
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(165px, 1fr))', gap: 14 }}>
          {resultats.length === 0 && <p style={{ color: 'var(--muted)' }}>{fr ? 'Aucun quiz ne correspond.' : 'No quiz matches.'}</p>}
          {resultats.map(({ s, k: fk }) => <Tuile key={s.id} s={s} k={fk} pct={m[s.id] ?? 0} verrou={!accesQuiz(s.id, profile)} />)}
        </section>
      ) : (
        <section className="grille-familles">
          {FAMILLES.map((f, i) => {
            const pct = pctFamille(f.subs, m)
            const ouverte = familleOuverte(f.k, profile)
            const nbOuverts = f.subs.filter((s) => s.jouable && accesQuiz(s.id, profile)).length
            return (
              <Link key={f.k} to={`/themes/${f.k}`} className="famille rise" style={{ animationDelay: `${i * 40}ms`, filter: ouverte || nbOuverts ? 'none' : 'grayscale(.55)', borderRadius: 28, padding: '18px 20px 20px', background: `var(--${f.k}-t)`, color: `var(--${f.k}-i)`, textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: 10, position: 'relative', overflow: 'hidden' }}>
                <div className="illus-famille"><Illustration k={f.k} taille={190} fond={false} /></div>
                {evenementDeLaSemaine().k === f.k && <span className="chip" style={{ position: 'absolute', top: 10, right: 10, background: 'var(--his)', color: 'var(--surface)' }}>×2</span>}
                <h2 className="t" style={{ fontSize: 21, fontWeight: 900 }}>{f.nom[lang]}</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div className="bar" style={{ flex: 1, height: 8, background: 'var(--surface)' }}><span style={{ width: `${pct}%`, background: `var(--${f.k})` }} /></div>
                  {ouverte
                    ? <span style={{ fontSize: 13, fontWeight: 700 }}>{f.subs.filter((s) => s.jouable).length} quiz</span>
                    : <span style={{ fontSize: 13, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}><Icon d={ICONS.lock} size={15} />{nbOuverts} / {f.subs.filter((s) => s.jouable).length}</span>}
                </div>
              </Link>
            )
          })}
        </section>
      )}
    </>
  )
}
