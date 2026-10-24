import { useEffect, useState } from 'react'

// « Le saviez-vous ? » : quand la fiche n'a qu'un nom ou une description d'un mot, on va chercher
// le début de l'article Wikipédia (l'API REST de Wikipédia autorise l'appel depuis l'appli).
const cache = new Map<string, string | null>()

export const saviezFaible = (saviez: string, reponse: string) =>
  saviez.length < 60 || saviez.replace(/[.\s]/g, '') === reponse.replace(/[.\s]/g, '')

async function chercher(wiki: string): Promise<string | null> {
  if (cache.has(wiki)) return cache.get(wiki)!
  const m = wiki.match(/^https:\/\/(\w+)\.wikipedia\.org\/wiki\/(.+)$/)
  if (!m) return null
  try {
    const r = await fetch(`https://${m[1]}.wikipedia.org/api/rest_v1/page/summary/${m[2]}`)
    const j = r.ok ? await r.json() : null
    // Page d'homonymie : rien d'utile à montrer
    const extrait: string | undefined = j && j.type !== 'disambiguation' ? j.extract : undefined
    const phrases = extrait?.match(/[^.!?]+[.!?]+/g) ?? []
    let t = ''
    for (const p of phrases) { if ((t + p).length > 320) break; t += p }
    const out = (t || extrait?.slice(0, 320) || '').trim() || null
    cache.set(wiki, out)
    return out
  } catch { return null }
}

export function useResume(wiki: string, actif: boolean) {
  const [texte, setTexte] = useState<string | null>(null)
  useEffect(() => {
    setTexte(null)
    if (!actif) return
    let vivant = true
    chercher(wiki).then((t) => vivant && setTexte(t))
    return () => { vivant = false }
  }, [wiki, actif])
  return texte
}
