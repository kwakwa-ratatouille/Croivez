import { useEffect, useState, type ImgHTMLAttributes } from 'react'

// Cache d'images hors ligne (Cache Storage) : chaque image vue est gardée, et un thème peut être
// téléchargé d'avance depuis les paramètres. Sans réseau, l'image vient du cache.
const NOM = 'croivez-images'
const urls = new Map<string, string>() // url distante → url locale (blob) déjà résolue

async function depuisCache(src: string) {
  if (urls.has(src)) return urls.get(src)!
  if (!('caches' in window)) return null
  const rep = await (await caches.open(NOM)).match(src)
  if (!rep) return null
  const local = URL.createObjectURL(await rep.blob())
  urls.set(src, local)
  return local
}

export async function mettreEnCache(src: string, cache?: Cache) {
  if (!('caches' in window)) return false
  const c = cache ?? (await caches.open(NOM))
  if (await c.match(src)) return true
  try {
    const rep = await fetch(src, { mode: 'cors' })
    if (!rep.ok) return false
    await c.put(src, rep)
    return true
  } catch {
    return false // serveur sans CORS ou hors ligne : l'image restera en ligne seulement
  }
}

export async function telechargerImages(srcs: string[], progres: (fait: number) => void, parallele = 6) {
  const c = await caches.open(NOM)
  let fait = 0
  const file = [...srcs]
  // Plusieurs téléchargements en parallèle (6 par défaut : rapide sans saturer la connexion)
  await Promise.all(Array.from({ length: parallele }, async () => {
    while (file.length) {
      await mettreEnCache(file.shift()!, c)
      progres(++fait)
    }
  }))
}

export async function tailleCache() {
  if (!navigator.storage?.estimate) return null
  const e = await navigator.storage.estimate()
  return e.usage ?? null
}

export const viderCache = () => caches.delete(NOM)

export default function Img({ src, ...props }: ImgHTMLAttributes<HTMLImageElement> & { src?: string }) {
  const [affiche, setAffiche] = useState(src)
  useEffect(() => {
    if (!src) return
    let vivant = true
    setAffiche(urls.get(src) ?? src)
    depuisCache(src).then((local) => {
      if (local && vivant) setAffiche(local)
      else if (!local) mettreEnCache(src)
    }).catch(() => {})
    return () => { vivant = false }
  }, [src])
  return <img src={affiche} {...props} />
}
