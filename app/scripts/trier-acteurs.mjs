// Range le pack « acteurs » : ne garde que les vrais acteurs (description « acteur », « actrice », « comédien »).
// Les autres (Dalí, Castro, Pelé, Bob Dylan… classés « acteur » par Wikidata pour un caméo) vont aux personnalités,
// les réalisateurs au quiz « Réalisateurs en photo ». À relancer après `npm run data:culture acteurs realisateurs`.
import { readFile, writeFile } from 'node:fs/promises'

const lire = async (id) => JSON.parse(await readFile(`public/packs/culture/${id}.json`, 'utf8').catch(() => '[]'))
const ecrire = (id, l) => writeFile(`public/packs/culture/${id}.json`, JSON.stringify(l))
const desc = (it) => `${it.d?.fr ?? ''} ${it.d?.en ?? ''}`
const ESTACTEUR = /act(eur|rice|or|ress)|com[ée]dien/i
const ESTREALISATEUR = /r[ée]alisat|cin[ée]aste|director|filmmaker/i

const acteurs = await lire('acteurs'), perso = await lire('personnalites'), real = await lire('realisateurs')
const garder = acteurs.filter((it) => ESTACTEUR.test(desc(it)))
const autres = acteurs.filter((it) => !ESTACTEUR.test(desc(it)))
const idsReal = new Set(real.map((x) => x.id)), idsPerso = new Set(perso.map((x) => x.id))
const versReal = autres.filter((it) => ESTREALISATEUR.test(desc(it)) && !idsReal.has(it.id))
const versPerso = autres.filter((it) => !ESTREALISATEUR.test(desc(it)) && !idsPerso.has(it.id))
await ecrire('acteurs', garder)
await ecrire('realisateurs', [...real, ...versReal])
await ecrire('personnalites', [...perso, ...versPerso])
console.log(`acteurs : ${acteurs.length} → ${garder.length} · vers réalisateurs : ${versReal.length} · vers personnalités : ${versPerso.length}`)
