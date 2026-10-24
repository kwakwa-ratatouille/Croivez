import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth'
import { usePrefs } from '../i18n'
import { FAMILLES, trouverSousTheme, type Famille } from '../themes'
import { chargerPays, drapeau, estCulture, packCulture, type ItemCulture, type SousThemeId } from '../quiz/engine'
import { useCouverture } from '../components/CarteCouverture'
import Img from '../components/Img'
import Illustration from '../components/Illustration'
import { ICONS, Icon } from '../components/ui'

type Carte = { id: string; nom: string; img?: string }

// Contenu d'un quiz pour l'album (les cartes possibles)
async function cartesDe(s: string, lang: 'fr' | 'en'): Promise<Carte[]> {
  if (estCulture(s)) {
    const pack = packCulture(s)
    const items = (await (await fetch(`./packs/culture/${pack}.json`)).json()) as ItemCulture[]
    return items.map((it) => ({ id: it.id, nom: it.n[lang], img: it.img }))
  }
  if (['drapeaux', 'drapeaux-inverse', 'capitales', 'capitales-inverse', 'pays-carte'].includes(s)) {
    return (await chargerPays()).map((p) => ({ id: p.id, nom: p.nom[lang], img: drapeau(p.id) }))
  }
  return []
}

const MOIS = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(new Date())

// Couverture d'un numéro (une famille) : titre de revue, photo pleine page, gros titres, code-barres
function Couverture({ k, n, onOuvrir }: { k: Famille; n: number; onOuvrir: () => void }) {
  const { lang } = usePrefs()
  const { profile } = useAuth()
  const f = FAMILLES.find((x) => x.k === k)!
  const subs = f.subs.filter((s) => s.jouable && !s.id.startsWith('villes'))
  const album = profile?.album ?? {}
  // La une : le quiz le plus collectionné de la famille
  const une = [...subs].sort((a, b) => (album[b.id]?.length ?? 0) - (album[a.id]?.length ?? 0))[0]
  const src = useCouverture(une?.id ?? '')
  const total = subs.reduce((a, s) => a + (album[s.id]?.length ?? 0), 0)
  return (
    <button type="button" className="mag-couv" onClick={onOuvrir} style={{ ['--k' as string]: `var(--${k})`, ['--ki' as string]: `var(--${k}-i)`, ['--kt' as string]: `var(--${k}-t)` }}>
      {src ? <Img src={src} alt="" loading="lazy" className="mag-couv-photo" /> : <span className="mag-couv-photo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--kt)' }}><Illustration k={k} taille={160} fond={false} /></span>}
      <span className="mag-titre">CROIVEZ</span>
      <span className="mag-numero">N°{n} · {MOIS}</span>
      <span className="mag-dossier">{f.nom[lang]}</span>
      <span className="mag-titres">
        {subs.slice(0, 3).map((s) => <span key={s.id}>{s.nom[lang]} <b>{album[s.id]?.length ?? 0}</b></span>)}
      </span>
      <span className="mag-barre"><span>{total}</span></span>
    </button>
  )
}

// Un article : une page par quiz, la une en grand, les cartes en colonnes, les manquantes en emplacements numérotés
function Article({ s, k, obtenues }: { s: SousThemeId; k: Famille; obtenues: Set<string> }) {
  const { lang } = usePrefs()
  const fr = lang === 'fr'
  const [cartes, setCartes] = useState<Carte[] | null>(null)
  const [tout, setTout] = useState(false)
  useEffect(() => { cartesDe(s, lang).then(setCartes).catch(() => setCartes([])) }, [s, lang])
  const t = trouverSousTheme(s)
  if (!t) return null
  const liste = cartes ?? []
  const eues = liste.filter((c) => obtenues.has(c.id))
  const manquantes = liste.length - eues.length
  const [une, ...autres] = eues
  const pct = liste.length ? Math.round((eues.length / liste.length) * 100) : 0
  return (
    <article className="mag-page" style={{ ['--k' as string]: `var(--${k})`, ['--ki' as string]: `var(--${k}-i)` }}>
      <header className="mag-entete">
        <span className="mag-rubrique">{t.famille.nom[lang]}</span>
        <h2 className="mag-h">{t.sous.nom[lang]}</h2>
        <p className="mag-chapeau">{fr ? `${eues.length} pièces de collection sur ${liste.length || '…'} — ${pct} % du dossier.` : `${eues.length} of ${liste.length || '…'} collected — ${pct}%.`}</p>
      </header>
      {une ? (
        <figure className="mag-une">
          {une.img ? <Img src={une.img} alt="" loading="lazy" /> : <span />}
          <figcaption><b>{fr ? 'À la une' : 'Cover story'}</b> {une.nom}</figcaption>
        </figure>
      ) : <p className="mag-vide">{fr ? 'Pas encore de pièce : chaque bonne réponse ajoute sa photo à ce dossier.' : 'Nothing yet: every correct answer adds its picture.'}</p>}
      <div className="mag-colonnes">
        {(tout ? autres : autres.slice(0, 23)).map((c) => (
          <figure key={c.id} className="mag-vignette">
            {c.img ? <Img src={c.img} alt="" loading="lazy" /> : <span className="mag-sans" />}
            <figcaption>{c.nom}</figcaption>
          </figure>
        ))}
        {/* Emplacements vides, façon album d'autocollants */}
        {manquantes > 0 && Array.from({ length: Math.min(manquantes, tout ? 60 : 8) }, (_, i) => (
          <div key={'v' + i} className="mag-emplacement"><span>{eues.length + i + 1}</span></div>
        ))}
      </div>
      {(autres.length > 23 || manquantes > 8) && <button type="button" className="btn btn-g" style={{ alignSelf: 'center' }} onClick={() => setTout((x) => !x)}>{tout ? (fr ? 'Réduire' : 'Less') : (fr ? 'Tourner les pages' : 'More')}</button>}
    </article>
  )
}

export default function Album() {
  const { lang } = usePrefs()
  const fr = lang === 'fr'
  const { profile } = useAuth()
  const album = profile?.album ?? {}
  const [numero, setNumero] = useState<Famille | null>(null)

  // ——— Un numéro ouvert : sommaire puis articles ———
  if (numero) {
    const f = FAMILLES.find((x) => x.k === numero)!
    const subs = f.subs.filter((s) => s.jouable && !s.id.startsWith('villes'))
    return (
      <div className="mag">
        <button type="button" onClick={() => setNumero(null)} className="mag-retour"><Icon d={ICONS.arrowL} />{fr ? 'Kiosque' : 'Newsstand'}</button>
        <nav className="mag-sommaire" aria-label={fr ? 'Sommaire' : 'Contents'}>
          <span className="mag-titre" style={{ position: 'static', color: `var(--${f.k}-i)` }}>CROIVEZ</span>
          <strong>{fr ? 'Sommaire' : 'Contents'}</strong>
          {subs.map((s, i) => <a key={s.id} href={`#art-${s.id}`} onClick={(e) => { e.preventDefault(); document.getElementById(`art-${s.id}`)?.scrollIntoView({ behavior: 'smooth' }) }}><span>{s.nom[lang]}</span><i />{String(i + 2).padStart(2, '0')}</a>)}
        </nav>
        {subs.map((s) => <div key={s.id} id={`art-${s.id}`}><Article s={s.id as SousThemeId} k={f.k} obtenues={new Set(album[s.id] ?? [])} /></div>)}
      </div>
    )
  }

  // ——— Kiosque : un numéro par famille ———
  return (
    <>
      <Link to="/profil" style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 8, minHeight: 44, fontWeight: 600, textDecoration: 'none', color: 'var(--muted)' }}><Icon d={ICONS.arrowL} />{fr ? 'Profil' : 'Profile'}</Link>
      <header>
        <h1 className="t" style={{ fontSize: 30, fontWeight: 900 }}>{fr ? 'Le kiosque' : 'Newsstand'}</h1>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>{fr ? 'Chaque bonne réponse ajoute sa photo à la revue de sa famille.' : 'Every correct answer adds its picture to the family magazine.'}</p>
      </header>
      <section className="mag-kiosque">
        {FAMILLES.map((f, i) => <Couverture key={f.k} k={f.k} n={i + 1} onOuvrir={() => setNumero(f.k)} />)}
      </section>
    </>
  )
}
