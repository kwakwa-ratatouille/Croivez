import { GAIN_ALBUM, GAIN_CARTE, GAIN_PAGE, lireCarte, reclamerAlbum, reclamerPage } from '../albumRecompenses'
import { feter } from '../effets'
import { retourReponse } from '../retour'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth'
import { usePrefs } from '../i18n'
import { FAMILLES, type Famille } from '../themes'
import { chargerPays, drapeau, estCulture, packCulture, type ItemCulture } from '../quiz/engine'
import { RARETES, type Rarete } from '../progression'

type RareteCarte = Rarete | 'exotique'
const RARETES_CARTE: Record<RareteCarte, { nom: { fr: string; en: string }; couleur: string }> = { ...RARETES, exotique: { nom: { fr: 'Exotique', en: 'Exotic' }, couleur: '#FF4FD8' } }
import { useCouverture } from '../components/CarteCouverture'
import Img from '../components/Img'
import Illustration from '../components/Illustration'
import { ICONS, Icon } from '../components/ui'

type Carte = { id: string; nom: string; img?: string }
const PAR_PAGE = 9

// Contenu d'un quiz pour l'album (les cartes possibles, des plus connues aux plus pointues)
export async function cartesDe(s: string, lang: 'fr' | 'en'): Promise<Carte[]> {
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
const rareteCarte = (i: number, total: number): RareteCarte => {
  const r = i / Math.max(1, total)
  return r < 0.01 ? 'exotique' : r < 0.05 ? 'legendaire' : r < 0.2 ? 'epique' : r < 0.5 ? 'rare' : 'commun'
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
function CarteAlbumBase({ c, n, rarete, eue, onOuvrir }: { c: Carte; n: number; rarete: RareteCarte; eue: boolean; onOuvrir: () => void }) {
  const r = RARETES_CARTE[rarete]
  if (!eue) return <div className="album-carte vide"><span>#{n}</span></div>
  return (
    <button type="button" onClick={onOuvrir} className={`album-carte ${rarete}`} style={{ ['--r' as string]: r.couleur }}>
      <span className="album-carte-photo">{c.img ? <Img src={c.img} alt="" loading="lazy" /> : null}</span>
      <span className="album-carte-nom">{c.nom}</span>
      <span className="album-carte-pied"><span>#{n}</span><span>{r.nom.fr}</span></span>
    </button>
  )
}

// Carte de l'album : une pastille de pièces tant qu'on n'a pas lu sa fiche
function CarteAlbum(props: Parameters<typeof CarteAlbumBase>[0] & { aLire?: boolean }) {
  const { aLire, ...reste } = props
  return <span className="album-carte-cadre">{CarteAlbumBase(reste)}{aLire && props.eue && <span className="album-pastille">🪙+{GAIN_CARTE[props.rarete]}</span>}</span>
}

function FicheCarte({ c, rarete, onFermer, aLire, onLu }: { c: Carte; rarete: RareteCarte; onFermer: () => void; aLire?: boolean; onLu?: () => void }) {
  const [lecture, setLecture] = useState(0) // les pièces se récupèrent après quelques secondes de lecture
  useEffect(() => { if (!aLire) return; const t = setInterval(() => setLecture((x) => Math.min(100, x + 4)), 160); return () => clearInterval(t) }, [aLire])
  const { lang } = usePrefs()
  const [w, setW] = useState<{ texte: string; lien: string } | null>(null)
  useEffect(() => {
    fetch(`https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(c.nom)}`).then((r) => (r.ok ? r.json() : null))
      .then((j) => setW({ texte: j?.extract ?? '', lien: j?.content_urls?.desktop?.page ?? `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(c.nom)}` })).catch(() => setW({ texte: '', lien: '' }))
  }, [c.nom, lang])
  const r = RARETES_CARTE[rarete]
  return (
    <div className="fiche-voile" onClick={onFermer}>
      <div className={`card album-fiche ${rarete}`} style={{ ['--r' as string]: r.couleur }} onClick={(e) => e.stopPropagation()}>
        <button type="button" className="btn btn-g fiche-fermer" aria-label={lang === 'fr' ? 'Fermer' : 'Close'} onClick={onFermer}><Icon d={ICONS.close} size={18} /></button>
        {c.img && <Img src={c.img} alt="" className="album-fiche-img" />}
        <span className="album-fiche-rarete">{r.nom[lang]}</span>
        <h2 className="t">{c.nom}</h2>
        <p>{w === null ? '…' : w.texte || (lang === 'fr' ? 'Pas de résumé disponible.' : 'No summary available.')}</p>
        {aLire && (lecture < 100
          ? <div className="album-lecture"><span style={{ width: `${lecture}%` }} /><small>{lang === 'fr' ? `📖 Lis la fiche… +${GAIN_CARTE[rarete]} pièces` : 'Reading…'}</small></div>
          : <button type="button" className="btn btn-p album-recolte" onClick={onLu}>🪙 {lang === 'fr' ? `Récupérer ${GAIN_CARTE[rarete]} pièces` : `Collect ${GAIN_CARTE[rarete]} coins`}</button>)}
        {w?.lien && <a href={w.lien} target="_blank" rel="noreferrer" className="btn btn-s"><Icon d={ICONS.link} size={16} />Wikipédia</a>}
      </div>
    </div>
  )
}

export default function Album() {
  const { lang } = usePrefs()
  const fr = lang === 'fr'
  const { user, profile } = useAuth()
  const album = profile?.album ?? {}
  const lus = new Set(profile?.albumLu ?? [])
  const [famille, setFamille] = useState<Famille | null>(null)
  const [quiz, setQuiz] = useState<string | null>(null)
  const [cartes, setCartes] = useState<Carte[] | null>(null)
  const [page, setPage] = useState(0)
  const [sens, setSens] = useState<'g' | 'd'>('d')
  const [feuille, setFeuille] = useState<{ de: number; sens: 'g' | 'd' } | null>(null)
  const toucher = useRef(0)
  const [ouverte, setOuverte] = useState<{ c: Carte; r: RareteCarte } | null>(null)
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
  const tourner = (d: number) => { const p = Math.min(pages - 1, Math.max(0, page + d * pas)); const q = large ? p - (p % 2) : p; if (q !== page && !feuille) { setSens(d > 0 ? 'd' : 'g'); setFeuille({ de: page, sens: d > 0 ? 'd' : 'g' }); setPage(q); setTimeout(() => setFeuille(null), 750) } }
  const pageComplete = (p: number) => liste.slice(p * PAR_PAGE, p * PAR_PAGE + PAR_PAGE).every((c) => eues.has(c.id))
  const pagesFaites = new Set(profile?.albumPages ?? [])
  const BonusPage = ({ p }: { p: number }) => !liste.length || p >= pages ? null : pageComplete(p)
    ? (pagesFaites.has(`${quiz}:${p}`) ? <span className="album-bonus fait">✓ {fr ? 'Page complète' : 'Page done'}</span> : <button type="button" className="album-bonus" onClick={() => { if (user && quiz) { reclamerPage(user.uid, quiz, p).catch(() => {}); feter(undefined, 1) } }}>🎁 {fr ? `Page complète : +${GAIN_PAGE}` : `Page done: +${GAIN_PAGE}`}</button>)
    : null
  const albumComplet = liste.length > 0 && liste.every((c) => eues.has(c.id))
  const pageCartes = (p: number) => liste.slice(p * PAR_PAGE, p * PAR_PAGE + PAR_PAGE).map((c, j) => { const i = p * PAR_PAGE + j; const rr = rareteCarte(i, liste.length); return <CarteAlbum key={c.id} c={c} n={i + 1} rarete={rr} aLire={!lus.has(`${quiz}:${c.id}`)} eue={eues.has(c.id)} onOuvrir={() => setOuverte({ c, r: rr })} /> })

  // ——— Un album ouvert : onglets des quiz, pages de 9 cartes qu'on feuillette ———
  return (
    <>
    {ouverte && <FicheCarte c={ouverte.c} rarete={ouverte.r} onFermer={() => setOuverte(null)} aLire={eues.has(ouverte.c.id) && !lus.has(`${quiz}:${ouverte.c.id}`)} onLu={() => { if (user && quiz) { lireCarte(user.uid, quiz, ouverte.c.id, GAIN_CARTE[ouverte.r]).catch(() => {}); retourReponse(true) } setOuverte(null) }} />}
    <div className="album" style={{ ['--k' as string]: `var(--${famille})`, ['--ki' as string]: `var(--${famille}-i)`, ['--kt' as string]: `var(--${famille}-t)` }}>
      <button type="button" onClick={() => setFamille(null)} className="mag-retour"><Icon d={ICONS.arrowL} />{fr ? 'Mes albums' : 'My albums'}</button>
      <h1 className="t" style={{ fontSize: 26, fontWeight: 900, color: 'var(--ki)' }}>{f.nom[lang]}</h1>
      <div className="album-onglets">
        {subs.map((s) => <button key={s.id} type="button" className="pill" aria-pressed={quiz === s.id} onClick={() => setQuiz(s.id)}>{s.nom[lang]} <small>{album[s.id]?.length ?? 0}</small></button>)}
      </div>
      <div className="album-recompenses">
        {albumComplet && !(profile?.albumsFinis ?? []).includes(quiz ?? '') && <button type="button" className="album-bonus grand" onClick={() => { if (user && quiz) { reclamerAlbum(user.uid, quiz).catch(() => {}); feter(undefined, 2) } }}>🏆 {fr ? `Album complet ! Récupérer ${GAIN_ALBUM} pièces` : `Album complete! +${GAIN_ALBUM}`}</button>}
        <Link to="/boutique?album=1" className="pill">📖 {fr ? 'Récompenses exclusives de l’album' : 'Album rewards'}</Link>
      </div>
      <div className="album-classeur" onPointerDown={(e) => { toucher.current = large ? e.clientX : e.clientY }} onPointerUp={(e) => { const d = (large ? e.clientX : e.clientY) - toucher.current; if (Math.abs(d) > 50) { tourner(d < 0 ? 1 : -1); toucher.current = -1e9 } }} onClickCapture={(e) => { if (toucher.current === -1e9) { e.stopPropagation(); toucher.current = 0 } }}>
        {!cartes && <p style={{ color: 'var(--muted)', padding: 30 }}>…</p>}
        {cartes && liste.length === 0 && <p style={{ color: 'var(--muted)', padding: 30 }}>{fr ? 'Pas de cartes pour ce quiz.' : 'No cards for this quiz.'}</p>}
        {cartes && liste.length > 0 && (
          large
            ? <div className="album-double carnet-fixe" data-sens={sens}>
                <div className="album-page gauche">{pageCartes(feuille?.sens === 'd' ? feuille.de : page)}<BonusPage p={feuille?.sens === 'd' ? feuille.de : page} /><span className="album-folio">{(feuille?.sens === 'd' ? feuille.de : page) + 1}</span></div>
                <div className="album-page droite">{(() => { const p = (feuille?.sens === 'g' ? feuille.de : page) + 1; return <>{p < pages ? pageCartes(p) : null}<BonusPage p={p} /><span className="album-folio">{p < pages ? p + 1 : ''}</span></> })()}</div>
                {feuille && (
                  <div key={`${feuille.de}-${page}`} className={`carnet-feuille ${feuille.sens === 'd' ? 'vers-gauche' : 'vers-droite'}`} aria-hidden="true">
                    {/* recto : la page qui s'en va ; verso : la page qui arrive de l'autre côté */}
                    <div className="album-page carnet-recto">{feuille.sens === 'd' ? (feuille.de + 1 < pages ? pageCartes(feuille.de + 1) : null) : pageCartes(feuille.de)}</div>
                    <div className="album-page carnet-verso">{feuille.sens === 'd' ? pageCartes(page) : (page + 1 < pages ? pageCartes(page + 1) : null)}</div>
                  </div>
                )}
              </div>
            : <div className="album-double carnet-tel">
                <div key={`${quiz}-${page}`} className={`album-page gauche carnet-page-tel vers-${sens === 'd' ? 'haut' : 'bas'}`}>{pageCartes(page)}<BonusPage p={page} /><span className="album-folio">{page + 1} / {pages}</span></div>
                <p className="carnet-astuce">{page + 1 < pages ? '↑ Glisse vers le haut pour la page suivante' : '↓ Glisse vers le bas pour revenir'}</p>
              </div>
        )}
      </div>
      {cartes && liste.length > 0 && large && (
        <div className="album-nav">
          <button className="btn btn-g" disabled={page === 0} onClick={() => tourner(-1)} aria-label={fr ? 'Page précédente' : 'Previous page'}><Icon d={ICONS.arrowL} /></button>
          <span>{fr ? 'Page' : 'Page'} {large && page + 1 < pages ? `${page + 1}-${page + 2}` : page + 1} / {pages} · {[...eues].filter((id) => liste.some((c) => c.id === id)).length} / {liste.length}</span>
          <button className="btn btn-g" disabled={page + pas > pages - 1} onClick={() => tourner(1)} aria-label={fr ? 'Page suivante' : 'Next page'}><Icon d={ICONS.arrowR} /></button>
        </div>
      )}
    </div>
    </>
  )
}
