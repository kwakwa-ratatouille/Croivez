import { useEffect, useMemo, useRef, useState, type PointerEvent, type WheelEvent } from 'react'
import { geoConicConformal, geoContains, geoNaturalEarth1, geoPath, type GeoProjection } from 'd3-geo'
import { feature } from 'topojson-client'
import type { Feature, FeatureCollection, Geometry } from 'geojson'
import type { Carte } from '../quiz/engine'
import { usePrefs } from '../i18n'

type Geo = FeatureCollection<Geometry, { name?: string; nom?: string }>
const W = 960
const H = 600
const ZOOM_MAX = 16

const fonds = new Map<string, Promise<Geo>>()
function chargerFond(vue: Carte['vue']) {
  if (!fonds.has(vue)) {
    fonds.set(vue, vue === 'france'
      ? fetch('./packs/france.geojson').then((r) => r.json())
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      : fetch('./packs/monde.json').then((r) => r.json()).then((topo: any) => feature(topo, topo.objects.countries) as unknown as Geo))
  }
  return fonds.get(vue)!
}

export type Clic = { latlng: [number, number]; paysId?: string }

// Carte de jeu : un appui pose l'épingle (ou choisit un pays), on peut la déplacer, puis « Valider ».
// Déplacement à un doigt, zoom à deux doigts (ou molette / boutons sur PC).
export default function CarteQuiz({ carte, clic, repondu, onClic }: { carte: Carte; clic?: Clic; repondu: boolean; onClic: (c: Clic) => void }) {
  const { lang } = usePrefs()
  const [geo, setGeo] = useState<Geo | null>(null)
  const [vue, setVue] = useState({ k: 1, x: 0, y: 0 })
  const [provisoire, setProvisoire] = useState<Clic | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const doigts = useRef(new Map<number, { x: number; y: number }>())
  const geste = useRef<{ bouge: boolean; ecart?: number; centre?: { x: number; y: number } }>({ bouge: false })

  useEffect(() => { chargerFond(carte.vue).then(setGeo) }, [carte.vue])
  useEffect(() => { setVue({ k: 1, x: 0, y: 0 }); setProvisoire(null) }, [carte])

  const idDe = (f: Feature) => String(f.id ?? '').padStart(3, '0')

  const projection = useMemo<GeoProjection | null>(() => {
    if (!geo) return null
    if (carte.vue === 'france') return geoConicConformal().parallels([44, 49]).rotate([-3, 0]).fitExtent([[20, 20], [W - 20, H - 20]], geo)
    const proj = geoNaturalEarth1()
    const focus = carte.zoomPays ?? carte.surligne
    const f = focus ? geo.features.find((x) => idDe(x) === focus) : null
    if (!f) return proj.fitExtent([[10, 10], [W - 10, H - 10]], { type: 'Sphere' })
    const marge = carte.surligne ? [W * 0.36, H * 0.36] : [W * 0.12, H * 0.12]
    return proj.fitExtent([[marge[0], marge[1]], [W - marge[0], H - marge[1]]], f)
  }, [geo, carte])

  const path = useMemo(() => (projection ? geoPath(projection) : null), [projection])
  if (!geo || !projection || !path) return <div style={{ aspectRatio: `${W} / ${H}`, borderRadius: 24, background: 'var(--surface2)' }} />

  // Écran → repère SVG
  const versSvg = (cx: number, cy: number) => {
    const r = svgRef.current!.getBoundingClientRect()
    return { sx: ((cx - r.left) / r.width) * W, sy: ((cy - r.top) / r.height) * H }
  }
  // Zoom autour d'un point (en repère SVG), borné
  const zoomer = (facteur: number, sx: number, sy: number) => setVue((v) => {
    const k = Math.min(ZOOM_MAX, Math.max(1, v.k * facteur))
    return { k, x: sx - ((sx - v.x) / v.k) * k, y: sy - ((sy - v.y) / v.k) * k }
  })

  const onWheel = (e: WheelEvent) => { const { sx, sy } = versSvg(e.clientX, e.clientY); zoomer(e.deltaY < 0 ? 1.25 : 0.8, sx, sy) }

  const onDown = (e: PointerEvent) => {
    svgRef.current?.setPointerCapture(e.pointerId)
    doigts.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    geste.current = { bouge: doigts.current.size > 1 }
  }
  const onMove = (e: PointerEvent) => {
    const avant = doigts.current.get(e.pointerId)
    if (!avant) return
    doigts.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    const pts = [...doigts.current.values()]
    if (pts.length >= 2) {
      // Pincement : l'écart entre les deux doigts règle le zoom, leur milieu sert de centre
      const [a, b] = pts
      const ecart = Math.hypot(a.x - b.x, a.y - b.y)
      const c = versSvg((a.x + b.x) / 2, (a.y + b.y) / 2)
      const g = geste.current
      if (g.ecart && g.centre) {
        zoomer(ecart / g.ecart, c.sx, c.sy)
        setVue((v) => ({ ...v, x: v.x + (c.sx - g.centre!.x), y: v.y + (c.sy - g.centre!.y) }))
      }
      geste.current = { bouge: true, ecart, centre: { x: c.sx, y: c.sy } }
      return
    }
    const dx = e.clientX - avant.x, dy = e.clientY - avant.y
    if (!geste.current.bouge && Math.hypot(dx, dy) < 6) { doigts.current.set(e.pointerId, avant); return }
    geste.current.bouge = true
    const r = svgRef.current!.getBoundingClientRect()
    setVue((v) => ({ ...v, x: v.x + (dx / r.width) * W, y: v.y + (dy / r.height) * H }))
  }
  const onUp = (e: PointerEvent) => {
    const seul = doigts.current.size === 1
    doigts.current.delete(e.pointerId)
    if (!seul || geste.current.bouge || repondu || carte.surligne) return
    // Simple appui : on pose (ou déplace) l'épingle provisoire
    const { sx, sy } = versSvg(e.clientX, e.clientY)
    const ll = projection.invert?.([(sx - vue.x) / vue.k, (sy - vue.y) / vue.k])
    if (!ll) return
    const pays = carte.trouverPays ? geo.features.find((f) => geoContains(f, ll)) : undefined
    setProvisoire({ latlng: [ll[1], ll[0]], paysId: pays ? idDe(pays) : undefined })
  }

  const pt = (ll?: [number, number]) => (ll ? projection([ll[1], ll[0]]) : null)
  const cible = pt(carte.cible)
  const affiche = repondu ? clic : provisoire ?? undefined
  const pose = pt(affiche?.latlng)
  const s = 1 / vue.k // épaisseurs constantes quel que soit le zoom

  const remplissage = (f: Feature) => {
    const id = idDe(f)
    if (carte.surligne === id) return 'var(--geo)'
    if (carte.trouverPays) {
      if (repondu && id === carte.trouverPays) return 'var(--ok)'
      if (id === affiche?.paysId) return repondu ? 'var(--ko)' : 'var(--geo)'
    }
    if (carte.zoomPays === id) return 'var(--surface)'
    return carte.zoomPays ? 'var(--surface2)' : 'var(--surface)'
  }

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={lang === 'fr' ? 'Carte' : 'Map'}
        onWheel={onWheel} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
        style={{ width: '100%', display: 'block', borderRadius: 24, background: 'var(--geo-t)', border: '1px solid var(--line)', cursor: repondu || carte.surligne ? 'grab' : 'crosshair', touchAction: 'none', userSelect: 'none' }}>
        <g transform={`translate(${vue.x} ${vue.y}) scale(${vue.k})`}>
          {geo.features.map((f, i) => (
            <path key={i} d={path(f) ?? ''} fill={remplissage(f)} stroke="var(--line)" strokeWidth={0.8 * s} style={{ transition: 'fill .2s ease-out' }} />
          ))}
          {repondu && cible && pose && (
            <line x1={pose[0]} y1={pose[1]} x2={cible[0]} y2={cible[1]} stroke="var(--muted)" strokeWidth={2 * s} strokeDasharray={`${6 * s} ${5 * s}`} />
          )}
          {pose && !carte.trouverPays && (
            <g transform={`translate(${pose[0]} ${pose[1]}) scale(${s})`}>
              {/* Épingle : bien visible, pointe sur le lieu choisi */}
              <path d="M0 0c-7-10-12-15-12-22a12 12 0 0 1 24 0c0 7-5 12-12 22Z" fill={repondu ? 'var(--lx)' : 'var(--text)'} stroke="var(--surface)" strokeWidth="2.5" />
              <circle cy="-22" r="4.5" fill="var(--surface)" />
            </g>
          )}
          {repondu && cible && <circle className="rise" cx={cible[0]} cy={cible[1]} r={10 * s} fill="var(--lv)" stroke="var(--surface)" strokeWidth={3 * s} />}
        </g>
      </svg>

      <div style={{ position: 'absolute', right: 12, top: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {[['+', 1.5], ['−', 1 / 1.5]].map(([l, f]) => (
          <button key={l} type="button" className="btn btn-s" aria-label={l === '+' ? 'Zoomer' : 'Dézoomer'} style={{ minHeight: 40, width: 40, padding: 0, fontSize: 20, boxShadow: 'var(--shadow)' }}
            onClick={() => zoomer(f as number, W / 2, H / 2)}>{l}</button>
        ))}
      </div>

      {!repondu && !carte.surligne && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
          {provisoire && (!carte.trouverPays || provisoire.paysId)
            ? <button type="button" className="btn btn-p btn-lg rise" onClick={() => onClic(provisoire)} style={{ minWidth: 220 }}>{lang === 'fr' ? 'Valider' : 'Confirm'}</button>
            : <p style={{ color: 'var(--muted)', fontWeight: 600, textAlign: 'center' }}>
                {carte.trouverPays
                  ? (lang === 'fr' ? 'Touchez le pays, puis validez · deux doigts pour zoomer' : 'Tap the country, then confirm · pinch to zoom')
                  : (lang === 'fr' ? 'Touchez la carte pour poser l’épingle, puis validez · deux doigts pour zoomer' : 'Tap to drop the pin, then confirm · pinch to zoom')}
              </p>}
        </div>
      )}
    </div>
  )
}
