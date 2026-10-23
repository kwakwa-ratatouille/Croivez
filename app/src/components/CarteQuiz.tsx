import { useEffect, useMemo, useRef, useState, type PointerEvent, type WheelEvent } from 'react'
import { geoConicConformal, geoContains, geoNaturalEarth1, geoPath, type GeoProjection } from 'd3-geo'
import { feature } from 'topojson-client'
import type { Feature, FeatureCollection, Geometry } from 'geojson'
import type { Carte } from '../quiz/engine'

type Geo = FeatureCollection<Geometry, { name?: string; nom?: string }>
const W = 960
const H = 600

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

export default function CarteQuiz({ carte, clic, repondu, onClic }: { carte: Carte; clic?: Clic; repondu: boolean; onClic: (c: Clic) => void }) {
  const [geo, setGeo] = useState<Geo | null>(null)
  const [vue, setVue] = useState({ k: 1, x: 0, y: 0 })
  const svgRef = useRef<SVGSVGElement>(null)
  const drag = useRef<{ x: number; y: number; moved: boolean } | null>(null)

  useEffect(() => { chargerFond(carte.vue).then(setGeo) }, [carte.vue])
  useEffect(() => { setVue({ k: 1, x: 0, y: 0 }) }, [carte])

  const idDe = (f: Feature) => String(f.id ?? '').padStart(3, '0')

  const projection = useMemo<GeoProjection | null>(() => {
    if (!geo) return null
    if (carte.vue === 'france') return geoConicConformal().parallels([44, 49]).rotate([-3, 0]).fitExtent([[20, 20], [W - 20, H - 20]], geo)
    const proj = geoNaturalEarth1()
    const focus = carte.zoomPays ?? carte.surligne
    const f = focus ? geo.features.find((x) => idDe(x) === focus) : null
    if (!f) return proj.fitExtent([[10, 10], [W - 10, H - 10]], { type: 'Sphere' })
    // Pays surligné : petit au centre pour garder ses voisins comme repères ; pays à zoomer : plein cadre
    const marge = carte.surligne ? [W * 0.36, H * 0.36] : [W * 0.12, H * 0.12]
    return proj.fitExtent([[marge[0], marge[1]], [W - marge[0], H - marge[1]]], f)
  }, [geo, carte])

  const path = useMemo(() => (projection ? geoPath(projection) : null), [projection])
  if (!geo || !projection || !path) return <div style={{ aspectRatio: `${W} / ${H}`, borderRadius: 24, background: 'var(--surface2)' }} />

  // Coordonnées écran → SVG (viewBox) → carte (en défaisant le zoom)
  const versCarte = (e: PointerEvent | WheelEvent) => {
    const r = svgRef.current!.getBoundingClientRect()
    const sx = ((e.clientX - r.left) / r.width) * W
    const sy = ((e.clientY - r.top) / r.height) * H
    return { sx, sy, mx: (sx - vue.x) / vue.k, my: (sy - vue.y) / vue.k }
  }

  const onWheel = (e: WheelEvent) => {
    const { sx, sy } = versCarte(e)
    const k = Math.min(12, Math.max(1, vue.k * (e.deltaY < 0 ? 1.25 : 0.8)))
    setVue({ k, x: sx - ((sx - vue.x) / vue.k) * k, y: sy - ((sy - vue.y) / vue.k) * k })
  }
  const onDown = (e: PointerEvent) => { drag.current = { x: e.clientX, y: e.clientY, moved: false } }
  const onMove = (e: PointerEvent) => {
    const d = drag.current
    if (!d || !e.buttons) return
    const dx = e.clientX - d.x
    const dy = e.clientY - d.y
    if (!d.moved && Math.hypot(dx, dy) < 5) return
    d.moved = true
    const r = svgRef.current!.getBoundingClientRect()
    setVue((v) => ({ ...v, x: v.x + (dx / r.width) * W, y: v.y + (dy / r.height) * H }))
    d.x = e.clientX
    d.y = e.clientY
  }
  const onUp = (e: PointerEvent) => {
    const d = drag.current
    drag.current = null
    if (repondu || !d || d.moved || carte.surligne) return
    const { mx, my } = versCarte(e)
    const ll = projection.invert?.([mx, my])
    if (!ll) return
    const pays = carte.trouverPays ? geo.features.find((f) => geoContains(f, ll)) : undefined
    onClic({ latlng: [ll[1], ll[0]], paysId: pays ? idDe(pays) : undefined })
  }

  const pt = (ll?: [number, number]) => (ll ? projection([ll[1], ll[0]]) : null)
  const cible = pt(carte.cible)
  const pose = pt(clic?.latlng)
  const s = 1 / vue.k // épaisseurs constantes quel que soit le zoom

  const remplissage = (f: Feature) => {
    const id = idDe(f)
    if (carte.surligne === id) return 'var(--geo)'
    if (carte.trouverPays && repondu) {
      if (id === carte.trouverPays) return 'var(--ok)'
      if (id === clic?.paysId) return 'var(--ko)'
    }
    if (carte.zoomPays === id) return 'var(--surface)'
    return carte.zoomPays ? 'var(--surface2)' : 'var(--surface)'
  }

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Carte"
        onWheel={onWheel} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp}
        style={{ width: '100%', display: 'block', borderRadius: 24, background: 'var(--geo-t)', border: '1px solid var(--line)', cursor: repondu || carte.surligne ? 'grab' : 'crosshair', touchAction: 'none', userSelect: 'none' }}>
        <g transform={`translate(${vue.x} ${vue.y}) scale(${vue.k})`}>
          {geo.features.map((f, i) => (
            <path key={i} d={path(f) ?? ''} fill={remplissage(f)} stroke="var(--line)" strokeWidth={0.8 * s} style={{ transition: 'fill .3s ease-out' }} />
          ))}
          {repondu && cible && pose && (
            <line x1={pose[0]} y1={pose[1]} x2={cible[0]} y2={cible[1]} stroke="var(--muted)" strokeWidth={2 * s} strokeDasharray={`${6 * s} ${5 * s}`} />
          )}
          {pose && !carte.trouverPays && <circle cx={pose[0]} cy={pose[1]} r={8 * s} fill={repondu ? 'var(--lx)' : 'var(--text)'} stroke="var(--surface)" strokeWidth={3 * s} />}
          {repondu && cible && <circle className="rise" cx={cible[0]} cy={cible[1]} r={9 * s} fill="var(--lv)" stroke="var(--surface)" strokeWidth={3 * s} />}
        </g>
      </svg>
      <div style={{ position: 'absolute', right: 14, bottom: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {[['+', 1.5], ['−', 1 / 1.5]].map(([l, f]) => (
          <button key={l} type="button" className="btn btn-s" aria-label={l === '+' ? 'Zoomer' : 'Dézoomer'} style={{ minHeight: 40, width: 40, padding: 0, fontSize: 20 }}
            onClick={() => setVue((v) => {
              const k = Math.min(12, Math.max(1, v.k * (f as number)))
              return { k, x: W / 2 - ((W / 2 - v.x) / v.k) * k, y: H / 2 - ((H / 2 - v.y) / v.k) * k }
            })}>{l}</button>
        ))}
      </div>
    </div>
  )
}
