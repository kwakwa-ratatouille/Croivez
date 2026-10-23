import { useEffect, useState } from 'react'
import Img from './Img'

// Photo d'illustration tirée de Wikipédia (résumé de l'article) pour les fiches sans image.
// Mise en cache comme les autres images, donc disponible hors ligne une fois vue.
const memo = new Map<string, string | null>()

async function vignette(wiki: string): Promise<string | null> {
  if (memo.has(wiki)) return memo.get(wiki)!
  const m = wiki.match(/^https:\/\/(\w+)\.wikipedia\.org\/wiki\/(.+)$/)
  if (!m) return null
  try {
    const r = await fetch(`https://${m[1]}.wikipedia.org/api/rest_v1/page/summary/${m[2]}`)
    const src = r.ok ? ((await r.json()).thumbnail?.source as string | undefined) ?? null : null
    memo.set(wiki, src)
    return src
  } catch {
    return null
  }
}

export default function ImageWiki({ wiki, largeur = 160 }: { wiki: string; largeur?: number }) {
  const [src, setSrc] = useState<string | null>(memo.get(wiki) ?? null)
  useEffect(() => { let vivant = true; vignette(wiki).then((s) => vivant && setSrc(s)); return () => { vivant = false } }, [wiki])
  if (!src) return null
  return <Img src={src} alt="" className="rise" style={{ width: largeur, maxHeight: 200, objectFit: 'cover', borderRadius: 14, border: '1px solid var(--line)', flex: 'none' }} />
}
