// Logos : remplace l'image par l'icône sans texte de la marque quand Wikidata en a une (P8972),
// et marque comme « nom visible » les logos-textes repérés par leur nom de fichier (wordmark, logotype…).
// Usage : node scripts/logos-icones.mjs logos logos-tech applis marques-mode
import { readFile, writeFile } from 'node:fs/promises'

const UA = { 'User-Agent': 'Croivez/0.1 (app perso de quiz)', Accept: 'application/sparql-results+json' }
const TEXTE = /wordmark|logotype|word[_ ]?mark|text|lettering|signature|name[_ ]?logo|schriftzug|wortmarke/i

for (const pack of process.argv.slice(2)) {
  const f = `public/packs/culture/${pack}.json`
  const items = JSON.parse(await readFile(f, 'utf8'))
  let icones = 0, textes = 0
  for (let i = 0; i < items.length; i += 150) {
    const lot = items.slice(i, i + 150).filter((it) => /^Q\d+$/.test(it.id))
    if (!lot.length) continue
    const q = `SELECT ?item ?ico WHERE { VALUES ?item { ${lot.map((it) => 'wd:' + it.id).join(' ')} } ?item wdt:P8972 ?ico }`
    const r = await fetch('https://query.wikidata.org/sparql', { method: 'POST', headers: { ...UA, 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'query=' + encodeURIComponent(q) }).then((x) => (x.ok ? x.json() : null)).catch(() => null)
    const ico = new Map((r?.results?.bindings ?? []).map((b) => [b.item.value.split('/').pop(), b.ico.value.replace('http://', 'https://') + '?width=480']))
    for (const it of lot) {
      const v = ico.get(it.id)
      // Une icône (symbole seul) remplace le logo, et n'est plus considérée comme « nom visible »
      if (v && !TEXTE.test(decodeURIComponent(v))) { it.img = v; it.x = { ...it.x, nomVisible: undefined, icone: true }; icones++ }
    }
    await new Promise((ok) => setTimeout(ok, 1200))
  }
  for (const it of items) {
    if (!it.x?.icone && it.img && TEXTE.test(decodeURIComponent(it.img)) && !it.x?.nomVisible) { it.x = { ...it.x, nomVisible: true }; textes++ }
    if (it.x && it.x.nomVisible === undefined) delete it.x.nomVisible
  }
  await writeFile(f, JSON.stringify(items))
  console.log(pack, ': icônes', icones, '· logos-textes écartés en plus', textes, '· jouables', items.filter((x) => !x.x?.nomVisible).length, '/', items.length)
}
