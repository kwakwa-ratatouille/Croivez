import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth'
import { usePrefs } from '../i18n'
import { FAMILLES, trouverSousTheme } from '../themes'
import { chargerPays, drapeau, estCulture, packCulture, type ItemCulture, type SousThemeId } from '../quiz/engine'
import Img from '../components/Img'
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

export default function Album() {
  const { lang } = usePrefs()
  const fr = lang === 'fr'
  const { profile } = useAuth()
  const album = profile?.album ?? {}
  const [ouvert, setOuvert] = useState<string | null>(null)
  const [cartes, setCartes] = useState<Carte[] | null>(null)

  useEffect(() => { if (ouvert) { setCartes(null); cartesDe(ouvert, lang).then(setCartes) } }, [ouvert, lang])

  // ——— Un album ouvert : cartes obtenues en couleur, les autres en silhouette ———
  if (ouvert) {
    const t = trouverSousTheme(ouvert)
    const obtenues = new Set(album[ouvert] ?? [])
    const liste = (cartes ?? []).sort((a, b) => Number(obtenues.has(b.id)) - Number(obtenues.has(a.id))).slice(0, 300)
    return (
      <>
        <button type="button" onClick={() => setOuvert(null)} style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 8, minHeight: 44, fontWeight: 600, border: 0, background: 'none', color: 'var(--muted)', cursor: 'pointer' }}><Icon d={ICONS.arrowL} />{fr ? 'Album' : 'Album'}</button>
        <h1 className="t" style={{ fontSize: 28, fontWeight: 900 }}>{t?.sous.nom[lang]} <span style={{ fontSize: 16, color: 'var(--muted)' }}>{obtenues.size} / {cartes?.length ?? '…'}</span></h1>
        <div className="grid-auto" style={{ ['--min' as string]: '110px', gap: 10 }}>
          {liste.map((c) => {
            const a = obtenues.has(c.id)
            return (
              <div key={c.id} className="card" style={{ padding: 8, display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center', textAlign: 'center', boxShadow: 'none', opacity: a ? 1 : 0.45 }}>
                {c.img ? <Img src={c.img} alt="" loading="lazy" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 10, filter: a ? 'none' : 'grayscale(1) blur(3px)' }} /> : <div style={{ width: '100%', aspectRatio: '1', borderRadius: 10, background: 'var(--surface2)' }} />}
                <span style={{ fontSize: 12, fontWeight: 700, lineHeight: 1.2 }}>{a ? c.nom : '?'}</span>
              </div>
            )
          })}
        </div>
      </>
    )
  }

  // ——— Vue d'ensemble : un album par quiz, regroupés par famille ———
  return (
    <>
      <Link to="/profil" style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 8, minHeight: 44, fontWeight: 600, textDecoration: 'none', color: 'var(--muted)' }}><Icon d={ICONS.arrowL} />{fr ? 'Profil' : 'Profile'}</Link>
      <h1 className="t" style={{ fontSize: 32, fontWeight: 900 }}>{fr ? 'Album' : 'Album'}</h1>
      <p style={{ color: 'var(--muted)' }}>{fr ? 'Chaque bonne réponse ajoute sa carte. Complétez vos albums !' : 'Every correct answer adds its card. Complete your albums!'}</p>
      {FAMILLES.map((f) => (
        <section key={f.k} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <h2 className="t" style={{ fontSize: 19, fontWeight: 900, color: `var(--${f.k}-i)` }}>{f.nom[lang]}</h2>
          <div className="carrousel">
            {f.subs.filter((s) => s.jouable && !s.id.startsWith('villes')).map((s) => (
              <button key={s.id} type="button" onClick={() => setOuvert(s.id as SousThemeId)} className="famille" style={{ width: 150, padding: 14, borderRadius: 20, border: 0, cursor: 'pointer', textAlign: 'left', font: 'inherit', background: `var(--${f.k}-t)`, color: `var(--${f.k}-i)`, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span className="t" style={{ fontWeight: 800, fontSize: 14, lineHeight: 1.25, minHeight: 36 }}>{s.nom[lang]}</span>
                <span className="t" style={{ fontSize: 24, fontWeight: 900 }}>{album[s.id]?.length ?? 0}</span>
                <span style={{ fontSize: 12, fontWeight: 600 }}>{fr ? 'cartes' : 'cards'}</span>
              </button>
            ))}
          </div>
        </section>
      ))}
    </>
  )
}
