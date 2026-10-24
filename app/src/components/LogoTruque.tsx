import { useEffect, useState } from 'react'

// Faux logos : on retouche UNE partie du vrai logo, pixel par pixel (canvas), pour que les quatre propositions
// aient exactement le même rendu et que seul un détail change. force : 0 = Facile (bien visible) … 3 = Expert (fin).
export type Truc = 'aucun' | 'teinte' | 'echange' | 'ecrase' | 'decale' | 'gomme' | 'gras' | 'miroir' | 'maigre'
export type EffetLogo = { truc: Truc; force: number; graine: number; secours?: string }

const L = 480, H = 300 // taille de rendu commune
const cache = new Map<string, Promise<string | null>>()
const charger = (src: string) => new Promise<HTMLImageElement>((ok, ko) => { const i = new Image(); i.crossOrigin = 'anonymous'; i.onload = () => ok(i); i.onerror = ko; i.src = src })

function hasard(graine: number) { let a = graine || 1; return () => { a = (a * 1103515245 + 12345) & 0x7fffffff; return a / 0x7fffffff } }
function rgbVersTsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2
  if (max === min) return [0, 0, l]
  const d = max - min, s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4
  return [h * 60, s, l]
}
function tslVersRgb(h: number, s: number, l: number): [number, number, number] {
  h = ((h % 360) + 360) % 360 / 360
  if (s === 0) return [l * 255, l * 255, l * 255]
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q
  const f = (t: number) => { t = (t + 1) % 1; return t < 1 / 6 ? p + (q - p) * 6 * t : t < 1 / 2 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p }
  return [f(h + 1 / 3) * 255, f(h) * 255, f(h - 1 / 3) * 255]
}

// Teintes dominantes (par tranches de 30°) parmi les pixels colorés et opaques
function teintes(d: Uint8ClampedArray) {
  const c = new Array(12).fill(0)
  for (let i = 0; i < d.length; i += 16) {
    if (d[i + 3] < 128) continue
    const [h, s, l] = rgbVersTsl(d[i], d[i + 1], d[i + 2])
    if (s > 0.3 && l > 0.15 && l < 0.9) c[Math.floor(h / 30) % 12]++
  }
  return c.map((n, k) => ({ k, n })).filter((x) => x.n > 20).sort((a, b) => b.n - a.n)
}
const dansTranche = (h: number, k: number) => Math.abs(((h - (k * 30 + 15) + 540) % 360) - 180) <= 22

async function fabriquer(src: string, e: EffetLogo): Promise<string | null> {
  const img = await charger(src)
  const cv = document.createElement('canvas'); cv.width = L; cv.height = H
  const cx = cv.getContext('2d', { willReadFrequently: true })!
  const k = Math.min((L - 40) / img.width, (H - 40) / img.height)
  const w = img.width * k, h = img.height * k, x0 = (L - w) / 2, y0 = (H - h) / 2
  const r = hasard(e.graine)
  const f = e.force
  if (e.truc === 'gras' || e.truc === 'maigre') {
    // Trait plus épais : le logo est redessiné légèrement décalé tout autour
    const rayon = [5, 3.5, 2.2, 1.4][f]
    if (e.truc === 'gras') for (let a = 0; a < 16; a++) cx.drawImage(img, x0 + Math.cos(a / 16 * Math.PI * 2) * rayon, y0 + Math.sin(a / 16 * Math.PI * 2) * rayon, w, h)
    cx.drawImage(img, x0, y0, w, h)
    if (e.truc === 'maigre') { cx.globalCompositeOperation = 'destination-in'; for (let a = 0; a < 16; a++) cx.drawImage(img, x0 + Math.cos(a / 16 * Math.PI * 2) * rayon, y0 + Math.sin(a / 16 * Math.PI * 2) * rayon, w, h); cx.globalCompositeOperation = 'source-over' }
  } else if (e.truc === 'ecrase' || e.truc === 'decale' || e.truc === 'miroir') {
    // Une partie seulement du logo (à droite d'une coupure) est écrasée, décalée ou retournée
    const coupe = 0.42 + r() * 0.16
    const cw = img.width * coupe
    cx.drawImage(img, 0, 0, cw, img.height, x0, y0, cw * k, h)
    const reste = img.width - cw
    if (e.truc === 'ecrase') {
      const fac = [0.6, 0.74, 0.84, 0.91][f]
      cx.drawImage(img, cw, 0, reste, img.height, x0 + cw * k, y0, reste * k * fac, h)
    } else if (e.truc === 'decale') {
      const dy = h * [0.18, 0.11, 0.065, 0.04][f] * (r() < 0.5 ? -1 : 1)
      cx.drawImage(img, cw, 0, reste, img.height, x0 + cw * k, y0 + dy, reste * k, h)
    } else {
      cx.save(); cx.translate(x0 + cw * k + reste * k, y0); cx.scale(-1, 1)
      cx.drawImage(img, cw, 0, reste, img.height, 0, 0, reste * k, h); cx.restore()
    }
  } else cx.drawImage(img, x0, y0, w, h)

  if (e.truc === 'teinte' || e.truc === 'echange' || e.truc === 'gomme') {
    const data = cx.getImageData(0, 0, L, H)
    const d = data.data
    const t = teintes(d)
    if (e.truc === 'gomme') {
      // Un morceau du logo disparaît : bloc placé sur une zone qui contient du dessin
      const taille = [0.3, 0.2, 0.13, 0.08][f] * w
      for (let essai = 0; essai < 40; essai++) {
        const bx = Math.floor(x0 + r() * (w - taille)), by = Math.floor(y0 + r() * (h - taille))
        let plein = 0
        for (let yy = by; yy < by + taille; yy += 3) for (let xx = bx; xx < bx + taille; xx += 3) if (d[(yy * L + xx) * 4 + 3] > 128) plein++
        if (plein < (taille / 3) ** 2 * 0.25 && essai < 39) continue
        for (let yy = by; yy < by + taille; yy++) for (let xx = bx; xx < bx + taille; xx++) d[(yy * L + xx) * 4 + 3] = 0
        break
      }
    } else if (t.length) {
      // Teinte : seule la couleur principale change ; échange : les deux couleurs principales s'inversent
      const delta = [160, 95, 50, 28][f] * (r() < 0.5 ? -1 : 1)
      const a = t[0].k, b = t[1]?.k
      for (let i = 0; i < d.length; i += 4) {
        if (d[i + 3] < 20) continue
        const [hh, s, l] = rgbVersTsl(d[i], d[i + 1], d[i + 2])
        if (s < 0.25) continue
        let nh: number | null = null
        // Une seule couleur : l'échange devient un changement de teinte (jamais de faux identique au vrai)
        if ((e.truc === 'teinte' || b === undefined) && dansTranche(hh, a)) nh = hh + delta
        else if (e.truc === 'echange' && b !== undefined) { if (dansTranche(hh, a)) nh = hh + (b - a) * 30; else if (dansTranche(hh, b)) nh = hh + (a - b) * 30 }
        if (nh === null) continue
        const [R, G, B] = tslVersRgb(nh, s, l); d[i] = R; d[i + 1] = G; d[i + 2] = B
      }
    } else {
      // Logo sans couleur (noir, blanc) : on éclaircit ou fonce le dessin
      const fac = [0.45, 0.3, 0.2, 0.12][f]
      for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 20) for (let c = 0; c < 3; c++) d[i + c] = d[i + c] < 128 ? d[i + c] + 255 * fac : d[i + c] - 255 * fac
    }
    cx.putImageData(data, 0, 0)
  }
  return cv.toDataURL('image/png')
}

export function useLogoTruque(src: string | undefined, e: EffetLogo) {
  const cle = `${src}|${e.truc}|${e.force}|${e.graine}`
  const [url, setUrl] = useState<string | null | undefined>(undefined)
  useEffect(() => {
    if (!src) return
    let vivant = true
    setUrl(undefined)
    if (!cache.has(cle)) cache.set(cle, fabriquer(src, e).catch(() => null))
    cache.get(cle)!.then((u) => vivant && setUrl(u))
    return () => { vivant = false }
  }, [cle]) // eslint-disable-line react-hooks/exhaustive-deps
  return url
}

export default function LogoTruque({ src, effet, style }: { src?: string; effet: EffetLogo; style?: React.CSSProperties }) {
  const url = useLogoTruque(src, effet)
  // Pendant la fabrication : un cadre vide (montrer l'original révélerait la bonne réponse)
  if (url === undefined) return <span className="logo-attente" style={style} />
  // Image impossible à retoucher (serveur sans autorisation) : l'original, avec une retouche CSS approchante
  if (url === null) return <img src={effet.secours ?? src} alt="" style={{ ...style, objectFit: 'contain', ...(effet.truc === 'aucun' ? {} : { filter: `hue-rotate(${[150, 90, 45, 25][effet.force]}deg)` }) }} />
  return <img src={url} alt="" style={{ ...style, objectFit: 'contain' }} />
}
