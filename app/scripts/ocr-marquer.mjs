// Marque les éléments dont la réponse se lit sur l'image (x.nomVisible = 1) à partir du texte lu par ocr.ps1.
// Le moteur les écarte des quiz « en image » (on ne demande pas « quel est ce logo ? » quand le nom est écrit dessus).
// Usage : node scripts/ocr-marquer.mjs <pack> <fichier ocr.json>
import { readFile, writeFile } from 'node:fs/promises'

const [pack, fichierOcr] = process.argv.slice(2)
const chemin = `public/packs/culture/${pack}.json`
const items = JSON.parse(await readFile(chemin, 'utf8'))
const lu = JSON.parse((await readFile(fichierOcr, 'utf8')).replace(/^﻿/, ''))
const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim()
// Mots du nom assez distinctifs (pas « FC », « the », « club »…)
const VIDES = new Set(['the', 'les', 'des', 'club', 'football', 'fc', 'sc', 'ac', 'group', 'groupe', 'company', 'inc', 'ltd', 'sa', 'ag', 'de', 'du', 'la', 'le', 'et', 'and', 'of'])
let n = 0
items.forEach((it, i) => {
  const texte = norm(`${lu[`${i}-c.png`] ?? ''} ${lu[`${i}-s.png`] ?? ''}`)
  if (!texte) { delete it.x?.nomVisible; return }
  const colle = texte.replace(/ /g, '')
  const mots = [...new Set([it.n.fr, it.n.en].flatMap((s) => norm(s).split(' ')))].filter((m) => m.length >= 3 && !VIDES.has(m))
  const visible = mots.some((m) => colle.includes(m)) || colle.includes(norm(it.n.fr).replace(/ /g, ''))
  if (visible) { it.x = { ...it.x, nomVisible: 1 }; n++ } else if (it.x?.nomVisible) delete it.x.nomVisible
})
await writeFile(chemin, JSON.stringify(items))
console.log(`${pack} : ${n} / ${items.length} images où le nom se lit`)
