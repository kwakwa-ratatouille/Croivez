// Construit public/packs/culture/<thème>.json à partir de Wikidata (gratuit, sans clé d'API).
// Chaque élément : { id, n: {fr,en}, d?: {fr,en} description, img?, r?: réponse, g?: groupe (distracteurs proches), f?: faits }
// Usage : npm run data:culture [thème...]   (sans argument : tous les thèmes)
import { writeFile, mkdir } from 'node:fs/promises'

const UA = { 'User-Agent': 'Croivez/0.1 (app perso de quiz)', Accept: 'application/sparql-results+json' }
const LIMITE = 600

async function sparql(requete, essais = 3) {
  for (let i = 1; i <= essais; i++) {
    const res = await fetch('https://query.wikidata.org/sparql', {
      method: 'POST',
      headers: { ...UA, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'query=' + encodeURIComponent(requete),
    })
    if (res.ok) return (await res.json()).results.bindings
    console.warn(`  Wikidata ${res.status}, essai ${i}/${essais}`)
    await new Promise((r) => setTimeout(r, 5000 * i))
  }
  throw new Error('Wikidata ne répond pas')
}

// Requête type : libellés FR/EN, description, notoriété (nombre d'articles Wikipédia)
const req = (corps, { sl = 40, extra = '', select = '' } = {}) => `
SELECT ?item ?sl ?nFr ?nEn ?dFr ?dEn ?img ${select} WHERE {
  ${corps}
  ?item wikibase:sitelinks ?sl. FILTER(?sl > ${sl})
  ?item rdfs:label ?nFr FILTER(LANG(?nFr) = "fr")
  OPTIONAL { ?item rdfs:label ?nEn FILTER(LANG(?nEn) = "en") }
  OPTIONAL { ?item schema:description ?dFr FILTER(LANG(?dFr) = "fr") }
  OPTIONAL { ?item schema:description ?dEn FILTER(LANG(?dEn) = "en") }
  ${extra}
} ORDER BY DESC(?sl) LIMIT ${LIMITE * 3}`

// Libellés FR/EN d'une variable liée (réalisateur, pays, artiste…)
const lib = (v) => `?${v} rdfs:label ?${v}Fr FILTER(LANG(?${v}Fr) = "fr") OPTIONAL { ?${v} rdfs:label ?${v}En FILTER(LANG(?${v}En) = "en") }`
const libSelect = (v) => `?${v}Fr ?${v}En`
const paire = (b, v) => (b[`${v}Fr`] ? { fr: b[`${v}Fr`].value, en: b[`${v}En`]?.value ?? b[`${v}Fr`].value } : undefined)
const annee = (b, v = 'date') => {
  const s = b[v]?.value
  if (!s) return undefined
  const y = parseInt(s.slice(0, s.indexOf('-', 1)), 10)
  return Number.isFinite(y) ? String(y) : undefined
}
const maj = (s) => s.charAt(0).toUpperCase() + s.slice(1)
const image = (b, v = 'img') => (b[v] ? b[v].value.replace('http://', 'https://') + '?width=480' : undefined)

function base(b) {
  const nFr = maj(b.nFr.value)
  return {
    id: b.item.value.split('/').pop(),
    n: { fr: nFr, en: maj(b.nEn?.value ?? nFr) },
    ...(b.dFr || b.dEn ? { d: { fr: b.dFr?.value ?? '', en: b.dEn?.value ?? '' } } : {}),
    sl: +b.sl.value,
  }
}

// Fusionne les lignes d'un même élément (plusieurs réalisateurs, images…) et garde les plus connus
function finaliser(lignes, map) {
  const out = new Map()
  for (const b of lignes) {
    if (!b.nFr || /^Q\d+$/.test(b.nFr.value)) continue
    const e = map(b)
    if (!e || out.has(e.id)) continue
    out.set(e.id, e)
  }
  return [...out.values()].sort((a, b) => b.sl - a.sl).slice(0, LIMITE).map(({ sl, ...e }) => e)
}

const GENRES = { Q6581097: 'm', Q6581072: 'f' }

// Regroupe toutes les valeurs ?x d'un élément : la première sert de réponse, les autres sont aussi acceptées
function avecAlternatives(lignes, map) {
  const valeurs = new Map()
  for (const b of lignes) {
    const v = paire(b, 'x')
    if (!v) continue
    const l = valeurs.get(b.item.value) ?? []
    if (!l.some((x) => x.fr === v.fr)) l.push(v)
    valeurs.set(b.item.value, l)
  }
  return finaliser(lignes, (b) => {
    const l = valeurs.get(b.item.value)
    return l && { ...map(b), r: l[0], ...(l.length > 1 ? { alt: l.slice(1) } : {}) }
  })
}

// Extraits musicaux : 3 titres phares des artistes les plus connus (Deezer, sans clé).
// Les liens d'écoute expirent : on ne stocke que l'identifiant du titre, l'app redemande le lien à l'écoute.
async function extraitsDeezer() {
  const { readFile } = await import('node:fs/promises')
  const artistes = JSON.parse(await readFile('public/packs/culture/artistes.json', 'utf8')).slice(0, 220)
  const out = []
  for (const a of artistes) {
    try {
      const r = await (await fetch(`https://api.deezer.com/search/artist?q=${encodeURIComponent(a.n.en)}&limit=1`)).json()
      const art = r.data?.[0]
      // Le nom trouvé doit correspondre, sinon Deezer propose un homonyme obscur
      if (!art || art.name.toLowerCase() !== a.n.en.toLowerCase() || art.nb_fan < 50000) continue
      const top = await (await fetch(`https://api.deezer.com/artist/${art.id}/top?limit=3`)).json()
      for (const t of top.data ?? []) {
        if (!t.preview) continue
        out.push({ id: String(t.id), n: { fr: t.title_short, en: t.title_short }, r: art.name, g: a.g, img: t.album?.cover_medium, f: [[{ fr: 'Titre', en: 'Title' }, t.title_short], [{ fr: 'Album', en: 'Album' }, t.album?.title]] })
      }
    } catch (e) {
      console.warn('  ', a.n.en, e.message)
    }
    await new Promise((ok) => setTimeout(ok, 250)) // limite Deezer : 50 requêtes / 5 s
  }
  return out
}

const THEMES = {
  films: () => sparql(req('?item wdt:P31 wd:Q11424; wdt:P57 ?x; wdt:P577 ?date.', { sl: 50, select: `?date ${libSelect('x')}`, extra: lib('x') }))
    .then((l) => finaliser(l, (b) => paire(b, 'x') && ({ ...base(b), r: paire(b, 'x'), f: [[{ fr: 'Sortie', en: 'Released' }, annee(b)]] }))),

  series: () => sparql(req('?item wdt:P31 wd:Q5398426; wdt:P580 ?date.', { sl: 40, select: '?date' }))
    .then((l) => finaliser(l, (b) => annee(b) && ({ ...base(b), r: annee(b) }))),

  acteurs: () => sparql(req('?item wdt:P106 wd:Q10800557; wdt:P18 ?img; wdt:P21 ?genre.', { sl: 70, select: '?genre' }))
    .then((l) => finaliser(l, (b) => ({ ...base(b), img: image(b), g: GENRES[b.genre.value.split('/').pop()] }))),

  // Maison de disques obligatoire : écarte les personnalités historiques qui « chantaient » aussi
  artistes: () => sparql(req('VALUES ?metier { wd:Q177220 wd:Q639669 wd:Q2252262 } ?item wdt:P106 ?metier; wdt:P18 ?img; wdt:P21 ?genre; wdt:P264 [].', { sl: 50, select: '?genre' }))
    .then((l) => finaliser(l, (b) => ({ ...base(b), img: image(b), g: GENRES[b.genre.value.split('/').pop()] }))),

  albums: () => sparql(req('?item wdt:P31 wd:Q482994; wdt:P175 ?x. OPTIONAL { ?item wdt:P577 ?date }', { sl: 30, select: `?date ${libSelect('x')}`, extra: lib('x') }))
    // Album éponyme (« Metallica » de Metallica) : la question donnerait la réponse
    .then((l) => finaliser(l, (b) => paire(b, 'x') && b.xFr.value !== b.nFr.value && ({ ...base(b), r: paire(b, 'x'), ...(annee(b) ? { f: [[{ fr: 'Sortie', en: 'Released' }, annee(b)]] } : {}) }))),

  // Animaux, insectes et plantes : iNaturalist (Wikidata dépasse son délai sur l'arbre du vivant).
  // Espèces les plus observées, nom commun FR/EN et photo sous licence libre.
  nature: async () => {
    const GROUPES = [
      ['animaux', 40151, { fr: 'Mammifère', en: 'Mammal' }, 300], ['animaux', 3, { fr: 'Oiseau', en: 'Bird' }, 200],
      ['animaux', 26036, { fr: 'Reptile', en: 'Reptile' }, 80], ['animaux', 20978, { fr: 'Amphibien', en: 'Amphibian' }, 50],
      ['animaux', 47178, { fr: 'Poisson', en: 'Fish' }, 80], ['insectes', 47158, { fr: 'Insecte', en: 'Insect' }, 400],
      ['plantes', 47126, { fr: 'Plante', en: 'Plant' }, 400],
    ]
    const page = async (taxon, locale, n) => {
      const out = []
      for (let p = 1; out.length < n; p++) {
        const res = await fetch(`https://api.inaturalist.org/v1/taxa?taxon_id=${taxon}&rank=species&order_by=observations_count&order=desc&per_page=200&page=${p}&locale=${locale}`, { headers: UA })
        if (!res.ok) throw new Error(`iNaturalist ${res.status}`)
        const r = (await res.json()).results
        if (!r.length) break
        out.push(...r)
        await new Promise((ok) => setTimeout(ok, 1100)) // limite de l'API : ~1 requête/s
      }
      return out.slice(0, n)
    }
    const packs = { animaux: [], insectes: [], plantes: [] }
    for (const [pack, taxon, groupe, n] of GROUPES) {
      const fr = await page(taxon, 'fr', n)
      const en = new Map((await page(taxon, 'en', n)).map((t) => [t.id, t]))
      for (const t of fr) {
        // Sans nom commun en français, la question serait en latin : on l'écarte
        if (!t.preferred_common_name || !t.default_photo?.medium_url) continue
        const nomEn = en.get(t.id)?.preferred_common_name ?? t.name
        packs[pack].push({
          id: `inat${t.id}`, n: { fr: maj(t.preferred_common_name), en: maj(nomEn) },
          img: t.default_photo.medium_url, g: groupe.fr, obs: t.observations_count,
          f: [[{ fr: 'Groupe', en: 'Group' }, groupe], [{ fr: 'Nom scientifique', en: 'Scientific name' }, t.name]],
          d: { fr: `${t.name}, ${groupe.fr.toLowerCase()}`, en: `${t.name}, ${groupe.en.toLowerCase()}` },
        })
      }
    }
    return packs
  },

  natureWikidata: async () => {
    const GROUPES = { Q7377: 50, Q5113: 50, Q10811: 40, Q10908: 30, Q152: 40, Q1390: 25, Q1757: 35, Q756: 50 }
    const lignes = []
    for (const [cl, sl] of Object.entries(GROUPES)) {
      const l = await sparql(`
SELECT ?item ?sl ?nFr ?nEn ?dFr ?dEn ?img ?cl ?clFr ?clEn WHERE {
  BIND(wd:${cl} AS ?cl)
  ?item wdt:P171+ wd:${cl}; wdt:P105 wd:Q7432; wikibase:sitelinks ?sl. FILTER(?sl > ${sl})
  ?item wdt:P18 ?img.
  ?item rdfs:label ?nFr FILTER(LANG(?nFr) = "fr")
  OPTIONAL { ?item rdfs:label ?nEn FILTER(LANG(?nEn) = "en") }
  OPTIONAL { ?item schema:description ?dFr FILTER(LANG(?dFr) = "fr") }
  OPTIONAL { ?item schema:description ?dEn FILTER(LANG(?dEn) = "en") }
  ${lib('cl')}
} LIMIT 2000`).catch((e) => (console.warn(`  groupe ${cl} : ${e.message}`), []))
      lignes.push(...l)
    }
    return lignes
  },

  // Liste choisie de parties du corps humain (les requêtes génériques ramènent cellules et os d'animaux).
  // Recherche par libellé + identifiant d'anatomie (UBERON) pour tomber sur le bon élément.
  corps: () => {
    const PARTIES = { organe: ['cœur', 'cerveau', 'foie', 'poumon', 'rein', 'estomac', 'intestin grêle', 'côlon', 'pancréas', 'rate', 'vessie', 'vésicule biliaire', 'œsophage', 'thyroïde', 'langue', 'peau', 'œil', 'oreille', 'larynx', 'trachée', 'appendice vermiculaire', 'utérus', 'prostate', 'moelle épinière'],
      os: ['fémur', 'tibia', 'fibula', 'humérus', 'radius', 'ulna', 'crâne', 'mandibule', 'clavicule', 'scapula', 'sternum', 'côte', 'bassin', 'patella', 'colonne vertébrale', 'calcanéus', 'coccyx', 'sacrum', 'étrier'],
      muscle: ['biceps brachial', 'triceps brachial', 'diaphragme', 'muscle grand fessier', 'muscle grand pectoral', 'quadriceps fémoral', 'muscle deltoïde', 'muscle trapèze', 'tendon calcanéen'] }
    const valeurs = Object.values(PARTIES).flat().map((n) => `"${n}"@fr`).join(' ')
    const typeDe = Object.fromEntries(Object.entries(PARTIES).flatMap(([t, l]) => l.map((n) => [n, t])))
    const TYPES = { organe: { fr: 'Organe', en: 'Organ' }, os: { fr: 'Os', en: 'Bone' }, muscle: { fr: 'Muscle', en: 'Muscle' } }
    return sparql(`
SELECT ?item ?sl ?nFr ?nEn ?dFr ?dEn ?img WHERE {
  VALUES ?nFr { ${valeurs} }
  ?item rdfs:label ?nFr; wdt:P1554 []; wdt:P18 ?img; wikibase:sitelinks ?sl.
  OPTIONAL { ?item rdfs:label ?nEn FILTER(LANG(?nEn) = "en") }
  OPTIONAL { ?item schema:description ?dFr FILTER(LANG(?dFr) = "fr") }
  OPTIONAL { ?item schema:description ?dEn FILTER(LANG(?dEn) = "en") }
} ORDER BY DESC(?sl)`).then((l) => {
      // Un même libellé peut viser plusieurs éléments : on garde le plus connu
      const vus = new Set()
      return finaliser(l.filter((b) => !vus.has(b.nFr.value) && vus.add(b.nFr.value)), (b) => {
        const t = typeDe[b.nFr.value]
        return { ...base(b), img: image(b), g: t, f: [[{ fr: 'Type', en: 'Type' }, TYPES[t]]] }
      })
    })
  },

  elements: () => sparql(req('?item wdt:P31 wd:Q11344; wdt:P246 ?sym; wdt:P1086 ?num.', { sl: 0, select: '?sym ?num' }))
    .then((l) => finaliser(l.filter((b) => +b.num.value <= 118), (b) => ({ ...base(b), r: b.sym.value, f: [[{ fr: 'Numéro atomique', en: 'Atomic number' }, b.num.value], [{ fr: 'Symbole', en: 'Symbol' }, b.sym.value]] }))),

  personnalites: () => sparql(req('VALUES ?metier { wd:Q82955 wd:Q901 wd:Q36180 wd:Q1028181 wd:Q2066131 wd:Q937857 wd:Q116 wd:Q1622272 wd:Q131524 wd:Q39631 } ?item wdt:P106 ?metier; wdt:P18 ?img; wdt:P21 ?genre. OPTIONAL { ?item wdt:P569 ?date }', { sl: 110, select: `?genre ?date ${libSelect('metier')}`, extra: lib('metier') }))
    .then((l) => finaliser(l, (b) => ({ ...base(b), img: image(b), g: GENRES[b.genre.value.split('/').pop()], f: [[{ fr: 'Activité', en: 'Occupation' }, paire(b, 'metier')], ...(annee(b) ? [[{ fr: 'Naissance', en: 'Born' }, annee(b)]] : [])] }))),

  histoire: () => sparql(req('VALUES ?t { wd:Q178561 wd:Q198 wd:Q10931 wd:Q103495 wd:Q131569 } ?item wdt:P31 ?t. { ?item wdt:P585 ?date } UNION { ?item wdt:P580 ?date }', { sl: 40, select: '?date' }))
    .then((l) => finaliser(l, (b) => annee(b) && ({ ...base(b), r: annee(b) }))),

  logos: () => sparql(req('VALUES ?t { wd:Q4830453 wd:Q891723 wd:Q6881511 wd:Q167037 wd:Q431289 } ?item wdt:P31 ?t; wdt:P154 ?logo.', { sl: 40, select: '?logo' }))
    .then((l) => finaliser(l, (b) => ({ ...base(b), img: image(b, 'logo') }))),

  monuments: () => sparql(req('VALUES ?t { wd:Q570116 wd:Q4989906 wd:Q2319498 wd:Q12518 wd:Q839954 wd:Q23413 wd:Q16560 wd:Q44539 wd:Q1081138 } ?item wdt:P31 ?t; wdt:P18 ?img; wdt:P17 ?x.', { sl: 60, select: libSelect('x'), extra: lib('x') }))
    .then((l) => finaliser(l, (b) => ({ ...base(b), img: image(b), f: [[{ fr: 'Pays', en: 'Country' }, paire(b, 'x')]] }))),

  tableaux: () => sparql(req('?item wdt:P31 wd:Q3305213; wdt:P18 ?img; wdt:P170 ?x. OPTIONAL { ?item wdt:P571 ?date }', { sl: 25, select: `?date ${libSelect('x')}`, extra: lib('x') }))
    .then((l) => finaliser(l, (b) => paire(b, 'x') && ({ ...base(b), img: image(b), r: paire(b, 'x'), ...(annee(b) ? { f: [[{ fr: 'Année', en: 'Year' }, annee(b)]] } : {}) }))),

  plats: () => sparql(req('?item wdt:P31/wdt:P279? wd:Q746549; wdt:P18 ?img; wdt:P495 ?x.', { sl: 25, select: libSelect('x'), extra: lib('x') }))
    .then(async (l) => {
      // Origine = un pays actuel (pas « Mésoamérique » ni « Grèce antique »), comparé à la liste des pays
      const { readFile } = await import('node:fs/promises')
      const pays = new Set(JSON.parse(await readFile('public/packs/pays.json', 'utf8')).pays.map((p) => p.nom.fr))
      pays.add('République populaire de Chine')
      return finaliser(l.filter((b) => b.xFr && pays.has(b.xFr.value)), (b) => ({ ...base(b), img: image(b), r: paire(b, 'x') }))
    }),

  // Monnaies et langues : un pays peut en avoir plusieurs, toutes sont acceptées (champ alt)
  monnaies: () => sparql(req('?item wdt:P31 wd:Q3624078; wdt:P38 ?x. FILTER NOT EXISTS { ?item wdt:P576 [] }', { sl: 0, select: libSelect('x'), extra: lib('x') }))
    .then((l) => avecAlternatives(l, (b) => base(b))),

  langues: () => sparql(req('?item wdt:P31 wd:Q3624078; wdt:P37 ?x. FILTER NOT EXISTS { ?item wdt:P576 [] }', { sl: 0, select: libSelect('x'), extra: lib('x') }))
    .then((l) => avecAlternatives(l, (b) => base(b))),

  extraits: () => extraitsDeezer(),

  marques: () => sparql(req('VALUES ?t { wd:Q4830453 wd:Q891723 wd:Q6881511 wd:Q167037 wd:Q431289 } ?item wdt:P31 ?t; wdt:P17 ?x.', { sl: 40, select: libSelect('x'), extra: lib('x') }))
    .then((l) => finaliser(l, (b) => paire(b, 'x') && ({ ...base(b), r: paire(b, 'x') }))),
}

// Répartition du thème « nature » en trois packs
const CLASSES_NATURE = { Q1390: 'insectes', Q1757: 'insectes', Q756: 'plantes' }

await mkdir('public/packs/culture', { recursive: true })
const voulus = process.argv.slice(2)
for (const [nom, fn] of Object.entries(THEMES)) {
  if (voulus.length && !voulus.includes(nom)) continue
  process.stdout.write(`${nom}… `)
  try {
    if (nom === 'natureWikidata') continue
    if (nom === 'nature') {
      const packs = await fn()
      for (const [p, l] of Object.entries(packs)) {
        // Les plus observés d'abord : ce sont aussi les plus connus
        // Animaux : on alterne mammifères, oiseaux, reptiles… pour que le niveau facile ne soit pas que des oiseaux
        const parGroupe = Object.values(l.reduce((acc, e) => ((acc[e.g] ??= []).push(e), acc), {})).map((g) => g.sort((a, b) => b.obs - a.obs))
        const melange = []
        for (let i = 0; parGroupe.some((g) => g[i]); i++) for (const g of parGroupe) if (g[i]) melange.push(g[i])
        const items = melange.map(({ obs, ...e }) => e)
        await writeFile(`public/packs/culture/${p}.json`, JSON.stringify(items))
        process.stdout.write(`${p}: ${items.length}  `)
      }
      console.log()
    } else {
      const items = await fn()
      await writeFile(`public/packs/culture/${nom}.json`, JSON.stringify(items))
      console.log(items.length)
    }
  } catch (e) {
    console.log('ÉCHEC', e.message)
  }
}
