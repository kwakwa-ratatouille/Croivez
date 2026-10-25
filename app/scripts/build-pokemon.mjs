// Pokémon : une liste (nom français, nom anglais = titre du wiki, type principal, génération), images du wiki Fandom.
// Produit deux packs : « pokemon » (le type, avec l'image) et « pokemon-photo » (qui est ce Pokémon ? / silhouette).
// Rangés du plus connu au plus pointu. Usage : node scripts/build-pokemon.mjs
import { writeFile } from 'node:fs/promises'

const UA = { 'User-Agent': 'Croivez/0.1 (app perso de quiz)' }
const L = `Pikachu|Pikachu|Électrik|1 ; Salamèche|Charmander|Feu|1 ; Bulbizarre|Bulbasaur|Plante|1 ; Carapuce|Squirtle|Eau|1 ; Dracaufeu|Charizard|Feu|1 ; Mewtwo|Mewtwo|Psy|1 ; Évoli|Eevee|Normal|1 ;
Ronflex|Snorlax|Normal|1 ; Rondoudou|Jigglypuff|Fée|1 ; Ectoplasma|Gengar|Spectre|1 ; Miaouss|Meowth|Normal|1 ; Psykokwak|Psyduck|Eau|1 ; Magicarpe|Magikarp|Eau|1 ; Léviator|Gyarados|Eau|1 ;
Mew|Mew|Psy|1 ; Tortank|Blastoise|Eau|1 ; Florizarre|Venusaur|Plante|1 ; Raichu|Raichu|Électrik|1 ; Dracolosse|Dragonite|Dragon|1 ; Lokhlass|Lapras|Eau|1 ; Métamorph|Ditto|Normal|1 ;
Onix|Onix|Roche|1 ; Racaillou|Geodude|Roche|1 ; Mackogneur|Machamp|Combat|1 ; Alakazam|Alakazam|Psy|1 ; Arcanin|Arcanine|Feu|1 ; Goupix|Vulpix|Feu|1 ; Nidoking|Nidoking|Poison|1 ;
Abo|Ekans|Poison|1 ; Arbok|Arbok|Poison|1 ; Roucool|Pidgey|Normal|1 ; Rattata|Rattata|Normal|1 ; Chenipan|Caterpie|Insecte|1 ; Papilusion|Butterfree|Insecte|1 ; Nosferapti|Zubat|Poison|1 ;
Ptéra|Aerodactyl|Roche|1 ; Artikodin|Articuno|Glace|1 ; Électhor|Zapdos|Électrik|1 ; Sulfura|Moltres|Feu|1 ; Kangourex|Kangaskhan|Normal|1 ; Tauros|Tauros|Normal|1 ; Porygon|Porygon|Normal|1 ;
Hypotrempe|Horsea|Eau|1 ; Staross|Starmie|Eau|1 ; Lippoutou|Jynx|Glace|1 ; M. Mime|Mr. Mime|Psy|1 ; Kicklee|Hitmonlee|Combat|1 ; Tygnon|Hitmonchan|Combat|1 ; Ramoloss|Slowpoke|Eau|1 ;
Togepi|Togepi|Fée|2 ; Marill|Marill|Eau|2 ; Héricendre|Cyndaquil|Feu|2 ; Germignon|Chikorita|Plante|2 ; Kaiminus|Totodile|Eau|2 ; Lugia|Lugia|Psy|2 ; Ho-Oh|Ho-Oh|Feu|2 ; Celebi|Celebi|Psy|2 ;
Tyranocif|Tyranitar|Roche|2 ; Mentali|Espeon|Psy|2 ; Noctali|Umbreon|Ténèbres|2 ; Pichu|Pichu|Électrik|2 ; Feurisson|Quilava|Feu|2 ; Scarhino|Heracross|Insecte|2 ; Steelix|Steelix|Acier|2 ;
Cizayox|Scizor|Insecte|2 ; Suicune|Suicune|Eau|2 ; Raikou|Raikou|Électrik|2 ; Entei|Entei|Feu|2 ; Zarbi|Unown|Psy|2 ; Qulbutoké|Wobbuffet|Psy|2 ; Granivol|Hoppip|Plante|2 ;
Poussifeu|Torchic|Feu|3 ; Arcko|Treecko|Plante|3 ; Gobou|Mudkip|Eau|3 ; Rayquaza|Rayquaza|Dragon|3 ; Groudon|Groudon|Sol|3 ; Kyogre|Kyogre|Eau|3 ; Gardevoir|Gardevoir|Psy|3 ; Brasegali|Blaziken|Feu|3 ;
Métalosse|Metagross|Acier|3 ; Absol|Absol|Ténèbres|3 ; Latios|Latios|Dragon|3 ; Latias|Latias|Dragon|3 ; Jirachi|Jirachi|Acier|3 ; Deoxys|Deoxys|Psy|3 ; Milobellus|Milotic|Eau|3 ; Drattak|Salamence|Dragon|3 ;
Ouisticram|Chimchar|Feu|4 ; Tiplouf|Piplup|Eau|4 ; Tortipouss|Turtwig|Plante|4 ; Lucario|Lucario|Combat|4 ; Carchacrok|Garchomp|Dragon|4 ; Dialga|Dialga|Acier|4 ; Palkia|Palkia|Eau|4 ; Giratina|Giratina|Spectre|4 ;
Arceus|Arceus|Normal|4 ; Darkrai|Darkrai|Ténèbres|4 ; Givrali|Glaceon|Glace|4 ; Phyllali|Leafeon|Plante|4 ; Lixy|Shinx|Électrik|4 ; Étourmi|Starly|Normal|4 ; Riolu|Riolu|Combat|4 ; Shaymin|Shaymin|Plante|4 ;
Gruikui|Tepig|Feu|5 ; Vipélierre|Snivy|Plante|5 ; Moustillon|Oshawott|Eau|5 ; Zoroark|Zoroark|Ténèbres|5 ; Victini|Victini|Psy|5 ; Reshiram|Reshiram|Dragon|5 ; Zekrom|Zekrom|Dragon|5 ; Kyurem|Kyurem|Dragon|5 ;
Grenousse|Froakie|Eau|6 ; Amphinobi|Greninja|Eau|6 ; Feunnec|Fennekin|Feu|6 ; Marisson|Chespin|Plante|6 ; Nymphali|Sylveon|Fée|6 ; Xerneas|Xerneas|Fée|6 ; Yveltal|Yveltal|Ténèbres|6 ; Brutalibré|Hawlucha|Combat|6 ;
Brindibou|Rowlet|Plante|7 ; Flamiaou|Litten|Feu|7 ; Otaquin|Popplio|Eau|7 ; Mimiqui|Mimikyu|Spectre|7 ; Solgaleo|Solgaleo|Psy|7 ; Lunala|Lunala|Psy|7 ; Tokorico|Tapu Koko|Électrik|7 ; Marshadow|Marshadow|Combat|7 ;
Ouistempo|Grookey|Plante|8 ; Flambino|Scorbunny|Feu|8 ; Larméléon|Sobble|Eau|8 ; Zacian|Zacian|Fée|8 ; Zamazenta|Zamazenta|Combat|8 ; Éthernatos|Eternatus|Poison|8 ; Pyrobut|Cinderace|Feu|8 ; Corvaillus|Corviknight|Vol|8 ;
Poussacha|Sprigatito|Plante|9 ; Chochodile|Fuecoco|Feu|9 ; Coiffeton|Quaxly|Eau|9 ; Koraidon|Koraidon|Combat|9 ; Miraidon|Miraidon|Électrik|9 ; Pâtachiot|Lechonk|Normal|9 ; Pohm|Pawmi|Électrik|9 ; Tinkaton|Tinkaton|Fée|9`
const POKE = L.split(';').map((s) => s.trim()).filter(Boolean).map((s) => { const [fr, en, type, gen] = s.split('|').map((x) => x.trim()); return { fr, en, type, gen: Number(gen) } })

async function images(titres) {
  const p = new URLSearchParams({ action: 'query', format: 'json', redirects: '1', prop: 'pageimages', piprop: 'thumbnail', pithumbsize: '500', titles: titres.join('|') })
  const j = await (await fetch(`https://pokemon.fandom.com/api.php?${p}`, { headers: UA })).json().catch(() => ({}))
  const vers = new Map()
  for (const n of [...(j.query?.normalized ?? []), ...(j.query?.redirects ?? [])]) vers.set(n.from, n.to)
  const par = new Map(Object.values(j.query?.pages ?? {}).filter((pg) => pg.thumbnail).map((pg) => [pg.title, pg.thumbnail.source]))
  const out = new Map()
  for (const t of titres) { let f = t; for (let k = 0; k < 3 && vers.has(f); k++) f = vers.get(f); if (par.has(f)) out.set(t, par.get(f).replace(/\/scale-to-width-down\/\d+/, '/scale-to-width-down/500')) }
  return out
}
const img = new Map()
for (let i = 0; i < POKE.length; i += 45) {
  for (const [k, v] of await images(POKE.slice(i, i + 45).map((p) => `${p.en} (Pokémon)`))) img.set(k, v)
  await new Promise((ok) => setTimeout(ok, 500))
}
const manquants = POKE.filter((p) => !img.has(`${p.en} (Pokémon)`))
for (let i = 0; i < manquants.length; i += 45) for (const [k, v] of await images(manquants.slice(i, i + 45).map((p) => p.en))) img.set(`${k} (Pokémon)`, v)
const avec = POKE.map((p) => ({ ...p, img: img.get(`${p.en} (Pokémon)`) })).filter((p) => p.img)
// Type : la question montre le Pokémon (image) ; Photo : qui est-ce ? (aussi en silhouette)
await writeFile('public/packs/culture/pokemon.json', JSON.stringify(avec.map((p, i) => ({ id: `pokemon${i}`, n: { fr: p.fr, en: p.en }, r: { fr: p.type, en: p.type }, img: p.img, g: 'pkm', f: [[{ fr: 'Génération', en: 'Generation' }, String(p.gen)]] }))))
await writeFile('public/packs/culture/pokemon-photo.json', JSON.stringify(avec.map((p, i) => ({ id: `pkm-${i}`, n: { fr: p.fr, en: p.en }, img: p.img, g: `gen${p.gen}`, f: [[{ fr: 'Type', en: 'Type' }, p.type], [{ fr: 'Génération', en: 'Generation' }, String(p.gen)]] }))))
console.log(`pokemon : ${avec.length} / ${POKE.length} · sans image : ${POKE.filter((p) => !avec.includes(p) && !img.get(`${p.en} (Pokémon)`)).map((p) => p.fr).join(', ') || 'aucun'}`)
