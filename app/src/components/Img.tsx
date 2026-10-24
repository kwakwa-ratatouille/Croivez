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
    const rep = await fetch(src, { mode: 'cors', ...(src.includes('nocookie.net') ? { referrerPolicy: 'unsafe-url' as ReferrerPolicy } : {}) })
    if (!rep.ok) return false
    await c.put(src, rep)
    return true
  } catch {
    return false // serveur sans CORS ou hors ligne : l'image restera en ligne seulement
  }
}

// Préchargement des prochaines images du quiz : le navigateur les télécharge pendant qu'on répond,
// elles s'affichent donc tout de suite à la question suivante (et partent aussi dans le cache hors ligne)
const prechargees = new Set<string>()
export function prechargerImages(srcs: (string | undefined)[]) {
  for (const src of srcs) {
    if (!src || prechargees.has(src) || urls.has(src)) continue
    prechargees.add(src)
    const im = new Image()
    if (src.includes('nocookie.net')) im.referrerPolicy = 'unsafe-url'
    im.decoding = 'async'
    im.src = src
    mettreEnCache(src).catch(() => {})
  }
}

// Attend que des images soient chargées (avant un défi chronométré), avec un délai maximum
export function chargerImages(srcs: (string | undefined)[], progres: (fait: number, total: number) => void, maxMs = 10000) {
  const liste = [...new Set(srcs.filter((s): s is string => !!s))]
  let fait = 0
  progres(0, liste.length)
  const une = (src: string) => new Promise<void>((ok) => {
    prechargees.add(src)
    const im = new Image()
    if (src.includes('nocookie.net')) im.referrerPolicy = 'unsafe-url'
    im.onload = im.onerror = () => { progres(++fait, liste.length); ok() }
    im.src = urls.get(src) ?? src
    mettreEnCache(src).catch(() => {})
  })
  return Promise.race([Promise.all(liste.map(une)).then(() => {}), new Promise<void>((ok) => setTimeout(ok, maxMs))])
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
  // Images des wikis Fandom (jeux vidéo) : refusées sans « referer », on l'envoie toujours
  return <img src={affiche} referrerPolicy={src?.includes('nocookie.net') ? 'unsafe-url' : undefined} {...props} />
}
