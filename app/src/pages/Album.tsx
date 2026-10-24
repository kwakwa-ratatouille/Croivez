import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth'
import { usePrefs } from '../i18n'
import { FAMILLES, type Famille } from '../themes'
import { chargerPays, drapeau, estCulture, packCulture, type ItemCulture } from '../quiz/engine'
import { RARETES, type Rarete } from '../progression'
import { useCouverture } from '../components/CarteCouverture'
import Img from '../components/Img'
import Illustration from '../components/Illustration'
import { ICONS, Icon } from '../components/ui'

type Carte = { id: string; nom: string; img?: string }
const PAR_PAGE = 9

// Contenu d'un quiz pour l'album (les cartes possibles, des plus connues aux plus pointues)
async function cartesDe(s: string, lang: 'fr' | 'en'): Promise<Carte[]> {
  if (estCulture(s)) {
    const items = (await (await fetch(`./packs/culture/${packCulture(s)}.json`)).json()) as ItemCulture[]
    return items.map((it) => ({ id: it.id, nom: it.n[lang], img: it.img }))
  }
  if (['drapeaux', 'drapeaux-inverse', 'capitales', 'capitales-inverse', 'pays-carte'].includes(s)) {
    return (await chargerPays()).map((p) => ({ id: p.id, nom: p.nom[lang], img: drapeau(p.id) }))
  }
  return []
}

// Rareté d'une carte selon son rang de notoriété : les plus célèbres sont les plus précieuses
const rareteCarte = (i: number, total: number): Rarete => {
  const r = i / Math.max(1, total)
  return r < 0.05 ? 'legendaire' : r < 0.2 ? 'epique' : r < 0.5 ? 'rare' : 'commun'
}

// Couverture d'un album (une famille) : photo, nom, cartes obtenues
function CouvertureAlbum({ k, onOuvrir }: { k: Famille; onOuvrir: () => void }) {
  const { lang } = usePrefs()
  const { profile } = useAuth()
  const f = FAMILLES.find((x) => x.k === k)!
  const subs = f.subs.filter((s) => s.jouable && !s.id.startsWith('villes'))
  const album = profile?.album ?? {}
  const src = useCouverture(subs[0]?.id ?? '')
  const total = subs.reduce((a, s) => a + (album[s.id]?.length ?? 0), 0)
  return (
    <button type="button" className="album-livre" onClick={onOuvrir} style={{ ['--k' as string]: `var(--${k})`, ['--ki' as string]: `var(--${k}-i)`, ['--kt' as string]: `var(--${k}-t)` }}>
      {src ? <Img src={src} alt="" loading="lazy" className="album-livre-photo" /> : <span className="album-livre-photo"><Illustration k={k} taille={120} fond={false} /></span>}
      <span className="album-livre-dos" />
      <span className="album-livre-titre"><Icon d={f.icon} size={16} />{f.nom[lang]}</span>
      <span className="album-livre-compte">{total} {lang === 'fr' ? 'cartes' : 'cards'}</span>
    </button>
  )
}

// Une carte à collectionner : photo, numéro, nom, liseré de rareté ; manquante = emplacement numéroté
function CarteAlbum({ c, n, rarete, eue }: { c: Carte; n: number; rarete: Rarete; eue: boolean }) {
  const r = RARETES[rarete]
  if (!eue) return <div className="album-carte vide"><span>#{n}</span></div>
  return (
    <div className={`album-carte ${rarete}`} style={{ ['--r' as string]: r.couleur }}>
      <span className="album-carte-photo">{c.img ? <Img src={c.img} alt="" loading="lazy" /> : null}</span>
      <span className="album-carte-nom">{c.nom}</span>
      <span className="album-carte-pied"><span>#{n}</span><span>{r.nom.fr}</span></span>
    </div>
  )
}

export default function Album() {
  const { lang } = usePrefs()
  const fr = lang === 'fr'
  const { profile } = useAuth()
  const album = profile?.album ?? {}
  const [famille, setFamille] = useState<Famille | null>(null)
  const [quiz, setQuiz] = useState<string | null>(null)
  const [cartes, setCartes] = useState<Carte[] | null>(null)
  const [page, setPage] = useState(0)
  const [sens, setSens] = useState<'g' | 'd'>('d')
  const toucher = useRef(0)
  const [large, setLarge] = useState(() => window.matchMedia('(min-width: 900px)').matches)
  useEffect(() => { const m = window.matchMedia('(min-width: 900px)'); const h = () => setLarge(m.matches); m.addEventListener('change', h); return () => m.removeEventListener('change', h) }, [])

  useEffect(() => { if (quiz) { setCartes(null); setPage(0); cartesDe(quiz, lang).then(setCartes).catch(() => setCartes([])) } }, [quiz, lang])

  // ——— Étagère : un album par famille ———
  if (!famille) return (
    <>
      <Link to="/profil" style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 8, minHeight: 44, fontWeight: 600, textDecoration: 'none', color: 'var(--muted)' }}><Icon d={ICONS.arrowL} />{fr ? 'Profil' : 'Profile'}</Link>
      <header>
        <h1 className="t" style={{ fontSize: 30, fontWeight: 900 }}>{fr ? 'Mes albums' : 'My albums'}</h1>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>{fr ? 'Chaque bonne réponse colle sa carte. Les plus célèbres sont les plus rares !' : 'Every correct answer adds its card.'}</p>
      </header>
      <section className="album-etagere">{FAMILLES.map((f) => <CouvertureAlbum key={f.k} k={f.k} onOuvrir={() => { setFamille(f.k); setQuiz(f.subs.find((s) => s.jouable && !s.id.startsWith('villes'))?.id ?? null) }} />)}</section>
    </>
  )

  const f = FAMILLES.find((x) => x.k === famille)!
  const subs = f.subs.filter((s) => s.jouable && !s.id.startsWith('villes'))
  const eues = new Set(album[quiz ?? ''] ?? [])
  const liste = cartes ?? []
  const pages = Math.max(1, Math.ceil(liste.length / PAR_PAGE))
  const pas = large ? 2 : 1
  const tourner = (d: number) => { const p = Math.min(pages - 1, Math.max(0, page + d * pas)); const q = large ? p - (p % 2) : p; if (q !== page) { setSens(d > 0 ? 'd' : 'g'); setPage(q) } }
  const pageCartes = (p: number) => liste.slice(p * PAR_PAGE, p * PAR_PAGE + PAR_PAGE).map((c, j) => { const i = p * PAR_PAGE + j; return <CarteAlbum key={c.id} c={c} n={i + 1} rarete={rareteCarte(i, liste.length)} eue={eues.has(c.id)} /> })

  // ——— Un album ouvert : onglets des quiz, pages de 9 cartes qu'on feuillette ———
  return (
    <div className="album" style={{ ['--k' as string]: `var(--${famille})`, ['--ki' as string]: `var(--${famille}-i)`, ['--kt' as string]: `var(--${famille}-t)` }}>
      <button type="button" onClick={() => setFamille(null)} className="mag-retour"><Icon d={ICONS.arrowL} />{fr ? 'Mes albums' : 'My albums'}</button>
      <h1 className="t" style={{ fontSize: 26, fontWeight: 900, color: 'var(--ki)' }}>{f.nom[lang]}</h1>
      <div className="album-onglets">
        {subs.map((s) => <button key={s.id} type="button" className="pill" aria-pressed={quiz === s.id} onClick={() => setQuiz(s.id)}>{s.nom[lang]} <small>{album[s.id]?.length ?? 0}</small></button>)}
      </div>
      <div className="album-classeur" onTouchStart={(e) => { toucher.current = e.touches[0].clientX }} onTouchEnd={(e) => { const dx = e.changedTouches[0].clientX - toucher.current; if (Math.abs(dx) > 50) tourner(dx < 0 ? 1 : -1) }}>
        {!cartes && <p style={{ color: 'var(--muted)', padding: 30 }}>…</p>}
        {cartes && liste.length === 0 && <p style={{ color: 'var(--muted)', padding: 30 }}>{fr ? 'Pas de cartes pour ce quiz.' : 'No cards for this quiz.'}</p>}
        {cartes && liste.length > 0 && (
          <div key={`${quiz}-${page}`} className={`album-double tourne-${sens}`}>
            <div className="album-page gauche">{pageCartes(page)}<span className="album-folio">{page + 1}</span></div>
            {large && <div className="album-page droite">{page + 1 < pages ? pageCartes(page + 1) : null}<span className="album-folio">{page + 2 <= pages ? page + 2 : ''}</span></div>}
          </div>
        )}
      </div>
      {cartes && liste.length > 0 && (
        <div className="album-nav">
          <button className="btn btn-g" disabled={page === 0} onClick={() => tourner(-1)} aria-label={fr ? 'Page précédente' : 'Previous page'}><Icon d={ICONS.arrowL} /></button>
          <span>{fr ? 'Page' : 'Page'} {large && page + 1 < pages ? `${page + 1}-${page + 2}` : page + 1} / {pages} · {[...eues].filter((id) => liste.some((c) => c.id === id)).length} / {liste.length}</span>
          <button className="btn btn-g" disabled={page + pas > pages - 1} onClick={() => tourner(1)} aria-label={fr ? 'Page suivante' : 'Next page'}><Icon d={ICONS.arrowR} /></button>
        </div>
      )}
    </div>
  )
}
