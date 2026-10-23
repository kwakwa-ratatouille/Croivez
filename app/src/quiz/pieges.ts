// Pièges : des mauvaises réponses qui ressemblent vraiment à la bonne, pour qu'il faille savoir et pas deviner.

// Drapeaux qui se ressemblent (codes ISO) : couleurs et dispositions quasi identiques
export const SOSIES: string[][] = [
  ['td', 'ro', 'ad', 'md'], ['id', 'mc', 'pl', 'sg'], ['ie', 'ci', 'it', 'mx'], ['nl', 'lu', 'fr', 'ru', 'hr', 'py'],
  ['au', 'nz', 'fj', 'tv'], ['no', 'is', 'dk', 'fi', 'se', 'fo'], ['sn', 'ml', 'gn', 'cm', 'gh', 'bj'],
  ['co', 'ec', 've'], ['si', 'sk', 'ru', 'rs', 'hr'], ['eg', 'sy', 'iq', 'ye'], ['hn', 'ni', 'sv', 'ar', 'gt'],
  ['jo', 'ps', 'sd', 'kw', 'ae', 'eh'], ['qa', 'bh'], ['gh', 'bo', 'et', 'lt', 'gn'], ['hu', 'bg', 'tj', 'ir', 'it'],
  ['at', 'lv', 'lb', 'pe', 'ca'], ['be', 'de', 'ug'], ['ht', 'li'], ['cu', 'pr', 'uy', 'gr'], ['us', 'lr', 'my', 'pr'],
  ['ng', 'nf', 'ie'], ['dz', 'pk', 'mr', 'tm'], ['tr', 'tn', 'az'], ['vn', 'cn', 'mk', 'kg'], ['jp', 'bd', 'pw', 'kr'],
  ['ee', 'bw', 'sl'], ['ua', 'kz', 'pw'], ['ke', 'mw', 'ss', 'zw'], ['cd', 'cg', 'tz', 'ga'], ['th', 'cr', 'kp'],
  ['in', 'ne', 'ie', 'ci'], ['ch', 'to', 'dk'], ['ge', 'en', 'mt'], ['me', 'al', 'mk'], ['lk', 'bt', 'ms'],
  ['pt', 'mz', 'ao'], ['br', 'gw', 'ml'], ['za', 'ss', 'jm'], ['ph', 'cz', 'bs'], ['ma', 'vn'], ['sa', 'pk', 'af'],
]

export function sosiesDe(id: string) {
  const out = new Set<string>()
  for (const g of SOSIES) if (g.includes(id)) g.forEach((x) => x !== id && out.add(x))
  return [...out]
}

// Capitale ou plus grande ville ? Le piège classique (fr, en)
export const PIEGES_CAPITALES: Record<string, [string, string][]> = {
  au: [['Sydney', 'Sydney'], ['Melbourne', 'Melbourne']], ca: [['Toronto', 'Toronto'], ['Montréal', 'Montreal']],
  tr: [['Istanbul', 'Istanbul'], ['Izmir', 'Izmir']], br: [['Rio de Janeiro', 'Rio de Janeiro'], ['São Paulo', 'São Paulo']],
  us: [['New York', 'New York'], ['Los Angeles', 'Los Angeles']], ch: [['Zurich', 'Zurich'], ['Genève', 'Geneva']],
  ma: [['Casablanca', 'Casablanca'], ['Marrakech', 'Marrakesh']], ng: [['Lagos', 'Lagos']], pk: [['Karachi', 'Karachi'], ['Lahore', 'Lahore']],
  in: [['Mumbai', 'Mumbai'], ['Calcutta', 'Kolkata']], vn: [['Hô-Chi-Minh-Ville', 'Ho Chi Minh City']], nz: [['Auckland', 'Auckland']],
  za: [['Johannesburg', 'Johannesburg'], ['Le Cap', 'Cape Town']], cn: [['Shanghai', 'Shanghai'], ['Hong Kong', 'Hong Kong']],
  bo: [['La Paz', 'La Paz'], ['Santa Cruz de la Sierra', 'Santa Cruz de la Sierra']], ec: [['Guayaquil', 'Guayaquil']],
  ci: [['Abidjan', 'Abidjan']], tz: [['Dar es Salam', 'Dar es Salaam']], kz: [['Almaty', 'Almaty']], mm: [['Rangoun', 'Yangon']],
  il: [['Tel Aviv', 'Tel Aviv']], ae: [['Dubaï', 'Dubai']], sa: [['Djeddah', 'Jeddah']], it: [['Milan', 'Milan']], es: [['Barcelone', 'Barcelona']],
  de: [['Munich', 'Munich'], ['Bonn', 'Bonn']], nl: [['La Haye', 'The Hague'], ['Rotterdam', 'Rotterdam']], be: [['Anvers', 'Antwerp']],
  ru: [['Saint-Pétersbourg', 'Saint Petersburg']], jp: [['Kyoto', 'Kyoto'], ['Osaka', 'Osaka']], kr: [['Busan', 'Busan']],
  ph: [['Cebu', 'Cebu']], my: [['Putrajaya', 'Putrajaya']], lk: [['Colombo', 'Colombo']], bj: [['Cotonou', 'Cotonou']],
  cm: [['Douala', 'Douala']], sn: [['Saint-Louis', 'Saint-Louis']], mt: [['Mdina', 'Mdina']], pl: [['Cracovie', 'Kraków']],
  gr: [['Thessalonique', 'Thessaloniki']], eg: [['Alexandrie', 'Alexandria']], ar: [['Córdoba', 'Córdoba']], co: [['Medellín', 'Medellín']],
}

// Symboles chimiques : variantes plausibles fabriquées avec les lettres du nom (FR et EN) et vrais symboles proches.
// Magnésium → Mg, mais aussi Ma, Mn (manganèse !), Ms… Sodium → Na, mais aussi So, Sd, S.
export function piegesSymbole(nomFr: string, nomEn: string, symbole: string, tousSymboles: string[]) {
  const cands = new Set<string>()
  for (const nom of [nomFr, nomEn]) {
    const l = nom.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z]/g, '')
    if (!l) continue
    const p = l[0].toUpperCase()
    cands.add(p)
    for (let i = 1; i < Math.min(l.length, 6); i++) cands.add(p + l[i])
  }
  // Vrais symboles qui commencent par la même lettre que le nom ou que le symbole : les plus vicieux
  for (const s of tousSymboles) if (s[0] === symbole[0] || s[0] === nomFr[0]?.toUpperCase()) cands.add(s)
  cands.delete(symbole)
  return [...cands]
}
