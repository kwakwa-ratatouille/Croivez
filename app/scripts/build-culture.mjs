// Construit public/packs/culture/<thème>.json à partir de Wikidata (gratuit, sans clé d'API).
// Chaque élément : { id, n: {fr,en}, d?: {fr,en} description, img?, r?: réponse, g?: groupe (distracteurs proches), f?: faits }
// Usage : npm run data:culture [thème...]   (sans argument : tous les thèmes)
import { writeFile, mkdir } from 'node:fs/promises'

const UA = { 'User-Agent': 'Croivez/0.1 (app perso de quiz)', Accept: 'application/sparql-results+json' }
const LIMITE = 2000
// Seuil de notoriété abaissé pour tous les thèmes : listes bien plus longues (les plus connus restent en tête)
const SEUIL = 0.65

async function sparql(requete, essais = 3) {
  for (let i = 1; i <= essais; i++) {
    // Une coupure réseau compte comme un essai raté, pas comme un échec définitif
    const res = await fetch('https://query.wikidata.org/sparql', {
      method: 'POST',
      headers: { ...UA, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'query=' + encodeURIComponent(requete),
    }).catch((e) => ({ ok: false, status: e.message }))
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
  ?item wikibase:sitelinks ?sl. FILTER(?sl > ${Math.round(sl * SEUIL)})
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

// Continent de chaque pays (nom français) : les leurres viennent du même continent
const CONTINENT = Object.fromEntries(JSON.parse(await (await import('node:fs/promises')).readFile('public/packs/pays.json', 'utf8')).pays.map((p) => [p.nom.fr, p.region.fr]))
CONTINENT['République populaire de Chine'] = 'Asie'

// Ajoute à chaque élément le libellé d'une propriété (pays, sport…) par lots de 150 : une seule grosse requête dépasserait le délai
async function enrichir(items, prop, champ, libelle) {
  for (let i = 0; i < items.length; i += 150) {
    const lot = items.slice(i, i + 150)
    const l = await sparql(`SELECT ?item ?vFr ?vEn WHERE {
  VALUES ?item { ${lot.map((e) => 'wd:' + e.id).join(' ')} }
  ?item wdt:${prop} ?v. ?v rdfs:label ?vFr FILTER(LANG(?vFr) = "fr")
  OPTIONAL { ?v rdfs:label ?vEn FILTER(LANG(?vEn) = "en") }
}`).catch(() => [])
    const vals = new Map()
    for (const b of l) { const id = b.item.value.split('/').pop(); if (!vals.has(id)) vals.set(id, { fr: b.vFr.value, en: b.vEn?.value ?? b.vFr.value }) }
    for (const e of lot) {
      const v = vals.get(e.id)
      if (!v) continue
      e.x = { ...(e.x ?? {}), [champ]: v }
      e.f = [...(e.f ?? []), [libelle, v]]
    }
  }
  return items
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
  films: () => sparql(req('?item wdt:P31 wd:Q11424; wdt:P57 ?x; wdt:P577 ?date.', { sl: 35, select: `?date ${libSelect('x')}`, extra: lib('x') }))
    .then((l) => finaliser(l, (b) => paire(b, 'x') && ({ ...base(b), r: paire(b, 'x'), x: { annee: annee(b) }, g: annee(b)?.slice(0, 3), f: [[{ fr: 'Sortie', en: 'Released' }, annee(b)]] }))),

  series: () => sparql(req('?item wdt:P31 wd:Q5398426; wdt:P580 ?date.', { sl: 30, select: '?date' }))
    .then((l) => finaliser(l, (b) => annee(b) && ({ ...base(b), r: annee(b) }))),

  acteurs: () => sparql(req('?item wdt:P106 wd:Q10800557; wdt:P18 ?img; wdt:P21 ?genre.', { sl: 50, select: '?genre' }))
    .then((l) => finaliser(l, (b) => ({ ...base(b), img: image(b), g: GENRES[b.genre.value.split('/').pop()] }))),

  // Maison de disques obligatoire : écarte les personnalités historiques qui « chantaient » aussi
  artistes: () => sparql(req('VALUES ?metier { wd:Q177220 wd:Q639669 wd:Q2252262 } ?item wdt:P106 ?metier; wdt:P18 ?img; wdt:P21 ?genre; wdt:P264 [].', { sl: 40, select: '?genre' }))
    .then((l) => finaliser(l, (b) => ({ ...base(b), img: image(b), g: GENRES[b.genre.value.split('/').pop()] })))
    .then((items) => enrichir(items, 'P136', 'genre', { fr: 'Genre', en: 'Genre' })),

  albums: () => sparql(req('?item wdt:P31 wd:Q482994; wdt:P175 ?x. OPTIONAL { ?item wdt:P577 ?date }', { sl: 25, select: `?date ${libSelect('x')}`, extra: lib('x') }))
    // Album éponyme (« Metallica » de Metallica) : la question donnerait la réponse
    .then((l) => finaliser(l, (b) => paire(b, 'x') && b.xFr.value !== b.nFr.value && ({ ...base(b), r: paire(b, 'x'), ...(annee(b) ? { f: [[{ fr: 'Sortie', en: 'Released' }, annee(b)]] } : {}) }))),

  // Animaux, insectes et plantes : iNaturalist (Wikidata dépasse son délai sur l'arbre du vivant).
  // Espèces les plus observées, nom commun FR/EN et photo sous licence libre.
  nature: async () => {
    // [pack, taxon iNaturalist, groupe, nombre d'espèces]
    const GROUPES = [
      ['mammiferes', 40151, { fr: 'Mammifère', en: 'Mammal' }, 800], ['oiseaux', 3, { fr: 'Oiseau', en: 'Bird' }, 1000],
      ['reptiles', 26036, { fr: 'Reptile', en: 'Reptile' }, 400], ['reptiles', 20978, { fr: 'Amphibien', en: 'Amphibian' }, 250],
      ['poissons', 47178, { fr: 'Poisson', en: 'Fish' }, 500], ['poissons', 47273, { fr: 'Requin ou raie', en: 'Shark or ray' }, 150],
      ['insectes', 47158, { fr: 'Insecte', en: 'Insect' }, 1600], ['papillons', 47157, { fr: 'Papillon', en: 'Butterfly or moth' }, 800],
      ['araignees', 47118, { fr: 'Araignée', en: 'Spider' }, 300], ['plantes', 47126, { fr: 'Plante', en: 'Plant' }, 2000],
      ['champignons', 47170, { fr: 'Champignon', en: 'Fungus' }, 700],
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
    const packs = Object.fromEntries([...new Set(GROUPES.map((g) => g[0]))].map((p) => [p, []]))
    for (const [pack, taxon, groupe, n] of GROUPES) {
      const fr = await page(taxon, 'fr', n)
      const en = new Map((await page(taxon, 'en', n)).map((t) => [t.id, t]))
      for (const t of fr) {
        // Sans nom commun en français, la question serait en latin : on l'écarte
        if (!t.preferred_common_name || !t.default_photo?.medium_url) continue
        const nomEn = en.get(t.id)?.preferred_common_name ?? t.name
        packs[pack].push({
          id: `inat${t.id}`, n: { fr: maj(t.preferred_common_name), en: maj(nomEn) },
          img: t.default_photo.medium_url, g: groupe.fr, obs: t.observations_count, x: { latin: t.name },
          f: [[{ fr: 'Groupe', en: 'Group' }, groupe], [{ fr: 'Nom scientifique', en: 'Scientific name' }, t.name]],
          d: { fr: `${t.name}, ${groupe.fr.toLowerCase()}`, en: `${t.name}, ${groupe.en.toLowerCase()}` },
        })
      }
    }
    // « Tous les animaux » : mammifères, oiseaux, poissons, reptiles réunis
    packs.animaux = ['mammiferes', 'oiseaux', 'poissons', 'reptiles'].flatMap((p) => packs[p])
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

  personnalites: () => sparql(req('VALUES ?metier { wd:Q82955 wd:Q901 wd:Q36180 wd:Q1028181 wd:Q2066131 wd:Q937857 wd:Q116 wd:Q1622272 wd:Q131524 wd:Q39631 } ?item wdt:P106 ?metier; wdt:P18 ?img; wdt:P21 ?genre. OPTIONAL { ?item wdt:P569 ?date }', { sl: 100, select: `?genre ?date ${libSelect('metier')}`, extra: lib('metier') }))
    .then((l) => finaliser(l, (b) => ({ ...base(b), img: image(b), g: GENRES[b.genre.value.split('/').pop()], x: { metier: paire(b, 'metier'), naissance: annee(b) }, f: [[{ fr: 'Activité', en: 'Occupation' }, paire(b, 'metier')], ...(annee(b) ? [[{ fr: 'Naissance', en: 'Born' }, annee(b)]] : [])] })))
    .then((items) => enrichir(items, 'P27', 'pays', { fr: 'Pays', en: 'Country' })),

  histoire: () => sparql(req('VALUES ?t { wd:Q178561 wd:Q198 wd:Q10931 wd:Q103495 wd:Q131569 } ?item wdt:P31 ?t. { ?item wdt:P585 ?date } UNION { ?item wdt:P580 ?date }', { sl: 30, select: '?date' }))
    .then((l) => finaliser(l, (b) => annee(b) && ({ ...base(b), r: annee(b) }))),

  logos: () => sparql(req('VALUES ?t { wd:Q4830453 wd:Q891723 wd:Q6881511 wd:Q167037 wd:Q431289 } ?item wdt:P31 ?t; wdt:P154 ?logo.', { sl: 30, select: '?logo' }))
    .then((l) => finaliser(l, (b) => ({ ...base(b), img: image(b, 'logo') }))),

  monuments: () => sparql(req('VALUES ?t { wd:Q570116 wd:Q4989906 wd:Q2319498 wd:Q12518 wd:Q839954 wd:Q23413 wd:Q16560 wd:Q44539 wd:Q1081138 } ?item wdt:P31 ?t; wdt:P18 ?img; wdt:P17 ?x.', { sl: 40, select: libSelect('x'), extra: lib('x') }))
    .then((l) => finaliser(l, (b) => ({ ...base(b), img: image(b), g: b.xFr?.value, f: [[{ fr: 'Pays', en: 'Country' }, paire(b, 'x')]] }))),

  tableaux: () => sparql(req('?item wdt:P31 wd:Q3305213; wdt:P18 ?img; wdt:P170 ?x. OPTIONAL { ?item wdt:P571 ?date }', { sl: 25, select: `?date ${libSelect('x')}`, extra: lib('x') }))
    .then((l) => finaliser(l, (b) => paire(b, 'x') && ({ ...base(b), img: image(b), r: paire(b, 'x'), g: annee(b)?.slice(0, 2), ...(annee(b) ? { f: [[{ fr: 'Année', en: 'Year' }, annee(b)]] } : {}) }))),

  plats: () => sparql(req('?item wdt:P31/wdt:P279? wd:Q746549; wdt:P18 ?img; wdt:P495 ?x.', { sl: 25, select: libSelect('x'), extra: lib('x') }))
    .then(async (l) => {
      // Origine = un pays actuel (pas « Mésoamérique » ni « Grèce antique »), comparé à la liste des pays
      const { readFile } = await import('node:fs/promises')
      const pays = new Set(JSON.parse(await readFile('public/packs/pays.json', 'utf8')).pays.map((p) => p.nom.fr))
      pays.add('République populaire de Chine')
      return finaliser(l.filter((b) => b.xFr && pays.has(b.xFr.value)), (b) => ({ ...base(b), img: image(b), r: paire(b, 'x'), g: CONTINENT[b.xFr.value] }))
    }),

  // Monnaies et langues : un pays peut en avoir plusieurs, toutes sont acceptées (champ alt)
  monnaies: () => sparql(req('?item wdt:P31 wd:Q3624078; wdt:P38 ?x. FILTER NOT EXISTS { ?item wdt:P576 [] }', { sl: 0, select: libSelect('x'), extra: lib('x') }))
    .then((l) => avecAlternatives(l, (b) => ({ ...base(b), g: CONTINENT[b.nFr.value] }))),

  langues: () => sparql(req('?item wdt:P31 wd:Q3624078; wdt:P37 ?x. FILTER NOT EXISTS { ?item wdt:P576 [] }', { sl: 0, select: libSelect('x'), extra: lib('x') }))
    .then((l) => avecAlternatives(l, (b) => ({ ...base(b), g: CONTINENT[b.nFr.value] }))),

  extraits: () => extraitsDeezer(),

  marques: () => sparql(req('VALUES ?t { wd:Q4830453 wd:Q891723 wd:Q6881511 wd:Q167037 wd:Q431289 } ?item wdt:P31 ?t; wdt:P17 ?x.', { sl: 30, select: libSelect('x'), extra: lib('x') }))
    .then((l) => finaliser(l, (b) => paire(b, 'x') && ({ ...base(b), r: paire(b, 'x'), g: CONTINENT[b.xFr.value] }))),

  // Complète le pack existant (activité, naissance, pays) sans relancer la grosse requête, qui dépasse souvent le délai
  'personnalites-maj': async () => {
    const { readFile } = await import('node:fs/promises')
    const items = JSON.parse(await readFile('public/packs/culture/personnalites.json', 'utf8'))
    for (const e of items) {
      const fait = (fr) => e.f?.find(([l]) => l.fr === fr)?.[1]
      e.x = { ...(e.x ?? {}), metier: fait('Activité'), naissance: fait('Naissance') }
      e.f = (e.f ?? []).filter(([l]) => l.fr !== 'Pays')
    }
    return enrichir(items, 'P27', 'pays', { fr: 'Pays', en: 'Country' })
  },

  chiens: () => sparql(req('?item wdt:P31 wd:Q39367; wdt:P18 ?img.', { sl: 8 })).then((l) => finaliser(l, (b) => ({ ...base(b), img: image(b) }))),
  chats: () => sparql(req('?item wdt:P31 wd:Q43577; wdt:P18 ?img.', { sl: 6 })).then((l) => finaliser(l, (b) => ({ ...base(b), img: image(b) }))),
  chevaux: () => sparql(req('?item wdt:P31 wd:Q1160573; wdt:P18 ?img.', { sl: 6 })).then((l) => finaliser(l, (b) => ({ ...base(b), img: image(b) }))),

  // ——— Sport ———
  clubs: () => sparql(req('?item wdt:P31 wd:Q476028; wdt:P154 ?logo. OPTIONAL { ?item wdt:P17 ?x }', { sl: 40, select: `?logo ${libSelect('x')}`, extra: `OPTIONAL { ${lib('x')} }` }))
    .then((l) => finaliser(l, (b) => ({ ...base(b), img: image(b, 'logo'), g: b.xFr?.value, f: [[{ fr: 'Pays', en: 'Country' }, paire(b, 'x')]] }))),
  sportifs: () => sparql(req('VALUES ?metier { wd:Q937857 wd:Q3665646 wd:Q10833314 wd:Q11513337 wd:Q10843402 wd:Q10871364 wd:Q13382576 wd:Q11338576 wd:Q19204627 wd:Q10843263 } ?item wdt:P106 ?metier; wdt:P18 ?img; wdt:P21 ?genre.', { sl: 70, select: '?genre' }))
    .then((l) => finaliser(l, (b) => ({ ...base(b), img: image(b), g: GENRES[b.genre.value.split('/').pop()] })))
    .then((items) => enrichir(items, 'P641', 'sport', { fr: 'Sport', en: 'Sport' })),
  jo: () => sparql(req('VALUES ?t { wd:Q159821 wd:Q82414 } ?item wdt:P31 ?t; wdt:P17 ?x.', { sl: 30, select: libSelect('x'), extra: lib('x') }))
    .then((l) => finaliser(l, (b) => paire(b, 'x') && ({ ...base(b), r: paire(b, 'x') }))),

  // ——— Littérature & BD ———
  livres: () => sparql(req('?item wdt:P31 wd:Q7725634; wdt:P50 ?x. OPTIONAL { ?item wdt:P577 ?date }', { sl: 40, select: `?date ${libSelect('x')}`, extra: lib('x') }))
    .then((l) => finaliser(l, (b) => paire(b, 'x') && ({ ...base(b), r: paire(b, 'x'), x: { annee: annee(b) }, g: annee(b)?.slice(0, 2), ...(annee(b) ? { f: [[{ fr: 'Publication', en: 'Published' }, annee(b)]] } : {}) }))),
  // Romanciers, poètes, dramaturges : « écrivain » seul ramène aussi des cinéastes
  auteurs: () => sparql(req('VALUES ?metier { wd:Q6625963 wd:Q49757 wd:Q214917 } ?item wdt:P106 ?metier; wdt:P18 ?img; wdt:P21 ?genre.', { sl: 60, select: '?genre' }))
    .then((l) => finaliser(l, (b) => ({ ...base(b), img: image(b), g: GENRES[b.genre.value.split('/').pop()] }))),
  bd: () => sparql(req('VALUES ?t { wd:Q1114461 wd:Q15773347 wd:Q80447738 } ?item wdt:P31 ?t; wdt:P18 ?img.', { sl: 25 }))
    .then((l) => finaliser(l, (b) => ({ ...base(b), img: image(b) }))),
  mangas: () => sparql(req('?item wdt:P31 wd:Q21198342; wdt:P50 ?x.', { sl: 25, select: libSelect('x'), extra: lib('x') }))
    .then((l) => finaliser(l, (b) => paire(b, 'x') && ({ ...base(b), r: paire(b, 'x') }))),

  // ——— Sciences & espace ———
  // Sans coordonnées : écarte les îles et terres « découvertes » par des navigateurs
  inventions: () => sparql(req('?item wdt:P61 ?x. ?x wdt:P31 wd:Q5. FILTER NOT EXISTS { ?item wdt:P625 [] }', { sl: 40, select: libSelect('x'), extra: lib('x') }))
    .then((l) => finaliser(l, (b) => paire(b, 'x') && ({ ...base(b), r: paire(b, 'x') }))),
  constellations: () => sparql(req('?item wdt:P31 wd:Q8928; wdt:P18 ?img.', { sl: 30 }))
    .then((l) => finaliser(l, (b) => ({ ...base(b), img: image(b) }))),
  scientifiques: () => sparql(req('VALUES ?metier { wd:Q901 wd:Q169470 wd:Q593644 wd:Q170790 wd:Q864503 wd:Q11063 } ?item wdt:P106 ?metier; wdt:P18 ?img; wdt:P21 ?genre.', { sl: 60, select: '?genre' }))
    .then((l) => finaliser(l, (b) => ({ ...base(b), img: image(b), g: GENRES[b.genre.value.split('/').pop()] }))),
  // Lunes des planètes (et planètes naines) du Système solaire
  lunes: () => sparql(req('VALUES ?t { wd:Q634 wd:Q17362350 } ?item wdt:P397 ?x. ?x wdt:P31/wdt:P279* wd:Q634.', { sl: 8, select: libSelect('x'), extra: lib('x') }))
    .then((l) => finaliser(l, (b) => paire(b, 'x') && ({ ...base(b), r: paire(b, 'x') }))),

  // ——— Jeux vidéo & pop culture ———
  jeux: () => sparql(req('?item wdt:P31 wd:Q7889; wdt:P178 ?x. OPTIONAL { ?item wdt:P577 ?date }', { sl: 20, select: `?date ${libSelect('x')}`, extra: lib('x') }))
    .then((l) => finaliser(l, (b) => paire(b, 'x') && ({ ...base(b), r: paire(b, 'x'), x: { annee: annee(b) }, g: annee(b)?.slice(0, 3), ...(annee(b) ? { f: [[{ fr: 'Sortie', en: 'Released' }, annee(b)]] } : {}) })))
    .then((items) => enrichir(items, 'P400', 'plateforme', { fr: 'Plateforme', en: 'Platform' })),
  // Seuil bas : on veut aussi les personnages secondaires
  'persos-jeux': () => sparql(req('?item wdt:P31/wdt:P279* wd:Q1569167; wdt:P18 ?img.', { sl: 5 }))
    .then((l) => finaliser(l, (b) => ({ ...base(b), img: image(b) })))
    .then((items) => enrichir(items, 'P1080', 'univers', { fr: 'Univers', en: 'Universe' })),
  // Lieux et cartes de jeux vidéo : de quel jeu ?
  'lieux-jeux': () => sparql(req('?item wdt:P31/wdt:P279* wd:Q3895768; wdt:P1441 ?x. ?x wdt:P31/wdt:P279* wd:Q7889.', { sl: 5, select: libSelect('x'), extra: lib('x') }))
    .then((l) => finaliser(l, (b) => paire(b, 'x') && ({ ...base(b), r: paire(b, 'x') }))),
  // Sagas de jeux vidéo et leur éditeur
  sagas: () => sparql(req('?item wdt:P31 wd:Q7058673; wdt:P123 ?x. OPTIONAL { ?item wdt:P18 ?img }', { sl: 15, select: libSelect('x'), extra: lib('x') }))
    .then((l) => finaliser(l, (b) => paire(b, 'x') && ({ ...base(b), img: image(b), r: paire(b, 'x') }))),
  // Licences : films des grands studios (Pixar, Disney, Marvel, DreamWorks, Ghibli, Illumination, Lucasfilm)
  studios: () => sparql(req('VALUES ?x { wd:Q127552 wd:Q1047410 wd:Q367466 wd:Q238557 wd:Q182950 wd:Q1136155 wd:Q242446 } ?item wdt:P31/wdt:P279* wd:Q11424; wdt:P272 ?x. OPTIONAL { ?item wdt:P577 ?date }', { sl: 20, select: `?date ${libSelect('x')}`, extra: lib('x') }))
    .then((l) => finaliser(l, (b) => paire(b, 'x') && ({ ...base(b), r: paire(b, 'x'), x: { annee: annee(b) }, ...(annee(b) ? { f: [[{ fr: 'Sortie', en: 'Released' }, annee(b)]] } : {}) }))),
  consoles: () => sparql(req('?item wdt:P31/wdt:P279? wd:Q8076; wdt:P176 ?x. OPTIONAL { ?item wdt:P18 ?img }', { sl: 20, select: libSelect('x'), extra: lib('x') }))
    .then((l) => finaliser(l, (b) => paire(b, 'x') && ({ ...base(b), img: image(b), r: paire(b, 'x') }))),

  // ——— France ———
  departements: () => sparql(req('?item wdt:P31 wd:Q6465; wdt:P2586 ?num. OPTIONAL { ?item wdt:P36 ?pref } OPTIONAL { ?item wdt:P131 ?reg. ?reg wdt:P31 wd:Q36784 }', { sl: 0, select: `?num ${libSelect('pref')} ${libSelect('reg')}`, extra: 'OPTIONAL { ?pref rdfs:label ?prefFr FILTER(LANG(?prefFr) = "fr") } OPTIONAL { ?pref rdfs:label ?prefEn FILTER(LANG(?prefEn) = "en") } OPTIONAL { ?reg rdfs:label ?regFr FILTER(LANG(?regFr) = "fr") } OPTIONAL { ?reg rdfs:label ?regEn FILTER(LANG(?regEn) = "en") }' }))
    .then((l) => finaliser(l, (b) => ({ ...base(b), g: b.regFr?.value, x: { numero: /^\d+$/.test(b.num.value) ? String(+b.num.value) : undefined, prefecture: paire(b, 'pref'), region: paire(b, 'reg') }, f: [[{ fr: 'Numéro', en: 'Number' }, b.num.value], [{ fr: 'Préfecture', en: 'Prefecture' }, paire(b, 'pref')], [{ fr: 'Région', en: 'Region' }, paire(b, 'reg')]] }))),
  presidents: () => sparql(req('?item wdt:P39 wd:Q191954; wdt:P18 ?img.', { sl: 0 }))
    .then((l) => finaliser(l, (b) => ({ ...base(b), img: image(b) }))),

  // ——— Monde avancé ———
  montagnes: () => sparql(req('?item wdt:P31 wd:Q8502; wdt:P17 ?x. OPTIONAL { ?item wdt:P18 ?img }', { sl: 50, select: libSelect('x'), extra: lib('x') }))
    .then((l) => avecAlternatives(l, (b) => ({ ...base(b), img: image(b), g: CONTINENT[b.xFr.value] }))),
  iles: () => sparql(req('?item wdt:P31 wd:Q23442; wdt:P17 ?x. OPTIONAL { ?item wdt:P18 ?img }', { sl: 60, select: libSelect('x'), extra: lib('x') }))
    .then((l) => avecAlternatives(l, (b) => ({ ...base(b), img: image(b), g: CONTINENT[b.xFr.value] }))),
  fleuves: () => sparql(req('?item wdt:P31 wd:Q4022; wdt:P17 ?x.', { sl: 60, select: libSelect('x'), extra: lib('x') }))
    .then((l) => avecAlternatives(l, (b) => ({ ...base(b), g: CONTINENT[b.xFr.value] }))),
  'etats-us': () => sparql(req('?item wdt:P31 wd:Q35657; wdt:P36 ?x.', { sl: 0, select: libSelect('x'), extra: lib('x') }))
    .then((l) => finaliser(l, (b) => paire(b, 'x') && ({ ...base(b), r: paire(b, 'x') }))),

  // ——— Art & architecture ———
  sculptures: () => sparql(req('?item wdt:P31 wd:Q860861; wdt:P18 ?img; wdt:P170 ?x.', { sl: 20, select: libSelect('x'), extra: lib('x') }))
    .then((l) => finaliser(l, (b) => paire(b, 'x') && ({ ...base(b), img: image(b), r: paire(b, 'x') }))),
  architecture: () => sparql(req('?item wdt:P84 ?x; wdt:P18 ?img. ?x wdt:P31 wd:Q5.', { sl: 50, select: libSelect('x'), extra: lib('x') }))
    .then((l) => finaliser(l, (b) => paire(b, 'x') && ({ ...base(b), img: image(b), r: paire(b, 'x') }))),
  compositeurs: () => sparql(req('?item wdt:P106 wd:Q36834; wdt:P18 ?img; wdt:P21 ?genre. ?item wdt:P569 ?date. FILTER(YEAR(?date) < 1900)', { sl: 50, select: '?genre' }))
    .then((l) => finaliser(l, (b) => ({ ...base(b), img: image(b), g: GENRES[b.genre.value.split('/').pop()] }))),
  mouvements: () => sparql(req('?item wdt:P31 wd:Q3305213; wdt:P18 ?img; wdt:P135 ?x.', { sl: 20, select: libSelect('x'), extra: lib('x') }))
    .then((l) => finaliser(l, (b) => paire(b, 'x') && ({ ...base(b), img: image(b), r: paire(b, 'x') }))),

  // ——— Langue & mots : vocabulaire courant dans 4 langues ———
  vocabulaire: () => sparql(req('VALUES ?t { wd:Q3314483 wd:Q11004 wd:Q1075 wd:Q34379 wd:Q39546 wd:Q14745 wd:Q40050 wd:Q42889 wd:Q11460 wd:Q28640 wd:Q7432 } ?item wdt:P31|wdt:P279 ?t. ?item rdfs:label ?es FILTER(LANG(?es) = "es") ?item rdfs:label ?de FILTER(LANG(?de) = "de") ?item rdfs:label ?it FILTER(LANG(?it) = "it")', { sl: 60, select: '?t ?es ?de ?it' }))
    .then((l) => finaliser(l.filter((b) => !/\s.*\s/.test(b.nFr.value)), (b) => ({ ...base(b), g: b.t.value.split('/').pop(), x: { en: b.nEn?.value, es: b.es.value, de: b.de.value, it: b.it.value } }))),
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
      await writeFile(`public/packs/culture/${nom.replace(/-maj$/, "")}.json`, JSON.stringify(items))
      console.log(items.length)
    }
  } catch (e) {
    console.log('ÉCHEC', e.message)
  }
}
