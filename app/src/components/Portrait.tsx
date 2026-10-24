// Portraits illustrés (SVG pur, aucune image à charger) : chaque personnage combine un visage, une coiffure,
// des yeux, une bouche, une tenue, un accessoire et un fond à motif. Animations légères (clignement, balancement).
export type Trait = {
  id: string; fr: string; en: string
  peau: string; cheveux: string; coiffure: 'court' | 'long' | 'chignon' | 'afro' | 'crete' | 'tresses' | 'chauve' | 'meches' | 'queue' | 'boucles'
  yeux: 'ronds' | 'rieurs' | 'determines' | 'etoiles' | 'lunettes' | 'cache'
  bouche: 'sourire' | 'grand' | 'moue' | 'dents' | 'moustache' | 'barbe'
  tenue: string; col: 'tshirt' | 'veste' | 'robe' | 'armure' | 'kimono' | 'combinaison' | 'cape'
  acc?: 'chapeau-pirate' | 'bandeau-ninja' | 'chapeau-sorciere' | 'casque-viking' | 'couronne' | 'casque-spatial' | 'casquette' | 'beret' | 'oreilles-chat' | 'aureole' | 'cornes' | 'fleur' | 'casque-audio' | 'toque' | 'stetson' | 'katana' | 'baguette' | 'antenne' | 'crocs' | 'masque'
  fond: [string, string]; motif: 'points' | 'rayures' | 'etoiles' | 'vagues' | 'damier' | 'rayons' | 'bulles' | 'triangles'
}
const T = (id: string, fr: string, en: string, o: Omit<Trait, 'id' | 'fr' | 'en'>): Trait => ({ id, fr, en, ...o })
export const PORTRAITS: Trait[] = [
  T('pirate', 'Capitaine pirate', 'Pirate captain', { peau: '#E8B48C', cheveux: '#2B1B12', coiffure: 'long', yeux: 'cache', bouche: 'barbe', tenue: '#8B1E2F', col: 'veste', acc: 'chapeau-pirate', fond: ['#1E3A5F', '#3A86C8'], motif: 'vagues' }),
  T('ninja', 'Ninja', 'Ninja', { peau: '#F1C9A5', cheveux: '#111', coiffure: 'court', yeux: 'determines', bouche: 'moue', tenue: '#1F2937', col: 'kimono', acc: 'bandeau-ninja', fond: ['#7F1D1D', '#DC2626'], motif: 'rayons' }),
  T('sorciere', 'Sorcière', 'Witch', { peau: '#C9E4C5', cheveux: '#5B21B6', coiffure: 'long', yeux: 'rieurs', bouche: 'grand', tenue: '#3B0764', col: 'cape', acc: 'chapeau-sorciere', fond: ['#1E1B4B', '#6D28D9'], motif: 'etoiles' }),
  T('viking', 'Viking', 'Viking', { peau: '#F3D0B0', cheveux: '#D97706', coiffure: 'tresses', yeux: 'determines', bouche: 'barbe', tenue: '#6B4423', col: 'armure', acc: 'casque-viking', fond: ['#0F766E', '#5EEAD4'], motif: 'triangles' }),
  T('reine', 'Reine', 'Queen', { peau: '#8D5A3B', cheveux: '#1E1E1E', coiffure: 'chignon', yeux: 'rieurs', bouche: 'sourire', tenue: '#9D174D', col: 'robe', acc: 'couronne', fond: ['#831843', '#F9A8D4'], motif: 'damier' }),
  T('roi', 'Roi', 'King', { peau: '#F1CCA8', cheveux: '#9CA3AF', coiffure: 'court', yeux: 'ronds', bouche: 'barbe', tenue: '#1E40AF', col: 'cape', acc: 'couronne', fond: ['#78350F', '#FCD34D'], motif: 'rayons' }),
  T('astronaute', 'Astronaute', 'Astronaut', { peau: '#F5D2B5', cheveux: '#3B2A20', coiffure: 'court', yeux: 'etoiles', bouche: 'grand', tenue: '#E5E7EB', col: 'combinaison', acc: 'casque-spatial', fond: ['#0B1026', '#312E81'], motif: 'etoiles' }),
  T('rappeur', 'Rappeur', 'Rapper', { peau: '#7B4B2A', cheveux: '#111', coiffure: 'tresses', yeux: 'lunettes', bouche: 'dents', tenue: '#F59E0B', col: 'tshirt', acc: 'casquette', fond: ['#111827', '#F43F5E'], motif: 'triangles' }),
  T('dj', 'DJ', 'DJ', { peau: '#D9A27A', cheveux: '#EC4899', coiffure: 'crete', yeux: 'rieurs', bouche: 'grand', tenue: '#111827', col: 'tshirt', acc: 'casque-audio', fond: ['#0EA5E9', '#A855F7'], motif: 'bulles' }),
  T('samourai', 'Samouraï', 'Samurai', { peau: '#F1C9A5', cheveux: '#111', coiffure: 'chignon', yeux: 'determines', bouche: 'moustache', tenue: '#B91C1C', col: 'kimono', acc: 'katana', fond: ['#FDE68A', '#F97316'], motif: 'rayons' }),
  T('chevalier', 'Chevalier', 'Knight', { peau: '#F3D0B0', cheveux: '#92400E', coiffure: 'court', yeux: 'determines', bouche: 'sourire', tenue: '#94A3B8', col: 'armure', fond: ['#1E3A8A', '#60A5FA'], motif: 'damier' }),
  T('vampire', 'Vampire', 'Vampire', { peau: '#E5E7EB', cheveux: '#111', coiffure: 'meches', yeux: 'determines', bouche: 'dents', tenue: '#111', col: 'cape', acc: 'crocs', fond: ['#450A0A', '#991B1B'], motif: 'bulles' }),
  T('zombie', 'Zombie', 'Zombie', { peau: '#A3C9A0', cheveux: '#3F3F46', coiffure: 'meches', yeux: 'ronds', bouche: 'dents', tenue: '#57534E', col: 'tshirt', fond: ['#14532D', '#84CC16'], motif: 'points' }),
  T('elfe', 'Elfe', 'Elf', { peau: '#FDE7D3', cheveux: '#FDE68A', coiffure: 'long', yeux: 'etoiles', bouche: 'sourire', tenue: '#15803D', col: 'cape', acc: 'fleur', fond: ['#064E3B', '#34D399'], motif: 'bulles' }),
  T('chef', 'Chef étoilé', 'Star chef', { peau: '#E0A981', cheveux: '#3A2618', coiffure: 'court', yeux: 'rieurs', bouche: 'moustache', tenue: '#FFFFFF', col: 'veste', acc: 'toque', fond: ['#B91C1C', '#FCA5A5'], motif: 'damier' }),
  T('cowboy', 'Cow-boy', 'Cowboy', { peau: '#D9A27A', cheveux: '#78350F', coiffure: 'court', yeux: 'determines', bouche: 'moustache', tenue: '#B45309', col: 'veste', acc: 'stetson', fond: ['#92400E', '#FBBF24'], motif: 'rayons' }),
  T('artiste', 'Artiste peintre', 'Painter', { peau: '#F0C29A', cheveux: '#A8432E', coiffure: 'boucles', yeux: 'rieurs', bouche: 'sourire', tenue: '#0EA5E9', col: 'tshirt', acc: 'beret', fond: ['#F472B6', '#FDE68A'], motif: 'points' }),
  T('chat', 'Fille-chat', 'Cat girl', { peau: '#FCE7D6', cheveux: '#F472B6', coiffure: 'queue', yeux: 'rieurs', bouche: 'grand', tenue: '#A855F7', col: 'tshirt', acc: 'oreilles-chat', fond: ['#FBCFE8', '#C084FC'], motif: 'bulles' }),
  T('ange', 'Ange', 'Angel', { peau: '#FDE7D3', cheveux: '#FDE68A', coiffure: 'boucles', yeux: 'etoiles', bouche: 'sourire', tenue: '#F8FAFC', col: 'robe', acc: 'aureole', fond: ['#BAE6FD', '#FDF4FF'], motif: 'etoiles' }),
  T('demon', 'Petit démon', 'Little devil', { peau: '#FCA5A5', cheveux: '#111', coiffure: 'meches', yeux: 'determines', bouche: 'dents', tenue: '#7F1D1D', col: 'cape', acc: 'cornes', fond: ['#111', '#DC2626'], motif: 'triangles' }),
  T('robot', 'Robot', 'Robot', { peau: '#B9C3CE', cheveux: '#64748B', coiffure: 'chauve', yeux: 'lunettes', bouche: 'grand', tenue: '#475569', col: 'combinaison', acc: 'antenne', fond: ['#0F172A', '#22D3EE'], motif: 'damier' }),
  T('detective', 'Détective', 'Detective', { peau: '#F2C9A5', cheveux: '#4A3526', coiffure: 'court', yeux: 'determines', bouche: 'moustache', tenue: '#8A6D4B', col: 'veste', acc: 'stetson', fond: ['#292524', '#A8A29E'], motif: 'rayures' }),
  T('super-heros', 'Super-héros', 'Superhero', { peau: '#E8B48C', cheveux: '#111', coiffure: 'meches', yeux: 'determines', bouche: 'sourire', tenue: '#2563EB', col: 'cape', acc: 'masque', fond: ['#DC2626', '#FACC15'], motif: 'rayons' }),
  T('punk', 'Punk', 'Punk', { peau: '#F1C9A5', cheveux: '#22C55E', coiffure: 'crete', yeux: 'determines', bouche: 'moue', tenue: '#111', col: 'veste', fond: ['#701A75', '#F0ABFC'], motif: 'triangles' }),
  T('scientifique', 'Scientifique', 'Scientist', { peau: '#C68B62', cheveux: '#E5E7EB', coiffure: 'afro', yeux: 'lunettes', bouche: 'grand', tenue: '#FFFFFF', col: 'veste', fond: ['#065F46', '#6EE7B7'], motif: 'bulles' }),
  T('gameuse', 'Gameuse', 'Gamer', { peau: '#8D5A3B', cheveux: '#7C3AED', coiffure: 'queue', yeux: 'rieurs', bouche: 'dents', tenue: '#10B981', col: 'tshirt', acc: 'casque-audio', fond: ['#1E1B4B', '#10B981'], motif: 'damier' }),
  T('surfeur', 'Surfeur', 'Surfer', { peau: '#C68B62', cheveux: '#FDE68A', coiffure: 'meches', yeux: 'rieurs', bouche: 'grand', tenue: '#06B6D4', col: 'tshirt', acc: 'fleur', fond: ['#0EA5E9', '#FDE68A'], motif: 'vagues' }),
  T('magicien', 'Magicien', 'Wizard', { peau: '#EDC3A0', cheveux: '#E5E7EB', coiffure: 'long', yeux: 'etoiles', bouche: 'barbe', tenue: '#4338CA', col: 'cape', acc: 'chapeau-sorciere', fond: ['#312E81', '#818CF8'], motif: 'etoiles' }),
  T('fee', 'Fée', 'Fairy', { peau: '#FDE7D3', cheveux: '#F9A8D4', coiffure: 'boucles', yeux: 'etoiles', bouche: 'sourire', tenue: '#C084FC', col: 'robe', acc: 'baguette', fond: ['#F5D0FE', '#A7F3D0'], motif: 'etoiles' }),
  T('sportive', 'Championne', 'Champion', { peau: '#B9774F', cheveux: '#2A1A12', coiffure: 'queue', yeux: 'determines', bouche: 'dents', tenue: '#E11D48', col: 'tshirt', fond: ['#FDE68A', '#FB7185'], motif: 'rayures' }),
  T('professeur', 'Professeur', 'Professor', { peau: '#F3D0B0', cheveux: '#9CA3AF', coiffure: 'chauve', yeux: 'lunettes', bouche: 'barbe', tenue: '#7C2D12', col: 'veste', fond: ['#FEF3C7', '#D97706'], motif: 'rayures' }),
  T('star', 'Pop star', 'Pop star', { peau: '#FCE7D6', cheveux: '#FACC15', coiffure: 'long', yeux: 'etoiles', bouche: 'grand', tenue: '#DB2777', col: 'robe', fond: ['#DB2777', '#7C3AED'], motif: 'etoiles' }),
]

const ombre = (c: string) => `color-mix(in srgb, ${c} 75%, #000)`

function Motif({ id, m, c }: { id: string; m: Trait['motif']; c: string }) {
  const coul = 'rgba(255,255,255,.18)'
  switch (m) {
    case 'points': return <pattern id={id} width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="7" cy="7" r="2.4" fill={coul} /></pattern>
    case 'rayures': return <pattern id={id} width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><rect width="6" height="12" fill={coul} /></pattern>
    case 'etoiles': return <pattern id={id} width="26" height="26" patternUnits="userSpaceOnUse"><path d="M7 3l1.2 3 3 .3-2.3 2 .8 3-2.7-1.6L4.3 11l.8-3-2.3-2 3-.3Z" fill={coul} /><circle cx="20" cy="19" r="1.4" fill={coul} /></pattern>
    case 'vagues': return <pattern id={id} width="24" height="12" patternUnits="userSpaceOnUse"><path d="M0 8q6-6 12 0t12 0" fill="none" stroke={coul} strokeWidth="2.5" /></pattern>
    case 'damier': return <pattern id={id} width="16" height="16" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill={coul} /><rect x="8" y="8" width="8" height="8" fill={coul} /></pattern>
    case 'rayons': return <pattern id={id} width="100" height="100" patternUnits="userSpaceOnUse">{Array.from({ length: 12 }, (_, i) => <path key={i} d="M50 50 L46 -20 L54 -20 Z" fill={coul} transform={`rotate(${i * 30} 50 50)`} />)}</pattern>
    case 'bulles': return <pattern id={id} width="30" height="30" patternUnits="userSpaceOnUse"><circle cx="8" cy="9" r="4" fill="none" stroke={coul} strokeWidth="2" /><circle cx="22" cy="22" r="2.5" fill={coul} /></pattern>
    case 'triangles': return <pattern id={id} width="18" height="16" patternUnits="userSpaceOnUse"><path d="M9 2l7 12H2Z" fill={coul} /></pattern>
  }
  void c
}

function Cheveux({ t, arriere }: { t: Trait; arriere: boolean }) {
  const c = t.cheveux
  if (t.coiffure === 'chauve') return null
  if (arriere) {
    if (t.coiffure === 'long' || t.coiffure === 'tresses') return <path d="M24 44q0-26 26-26t26 26v40H24Z" fill={ombre(c)} />
    if (t.coiffure === 'afro') return <circle cx="50" cy="42" r="31" fill={c} />
    if (t.coiffure === 'queue') return <path d="M70 36q18 10 12 36q-8-4-12-14Z" fill={ombre(c)} />
    if (t.coiffure === 'boucles') return <g fill={c}>{[28, 38, 50, 62, 72].map((x, i) => <circle key={i} cx={x} cy={i % 2 ? 30 : 34} r="10" />)}<circle cx="26" cy="50" r="9" /><circle cx="74" cy="50" r="9" /></g>
    return null
  }
  switch (t.coiffure) {
    case 'court': return <path d="M28 44q0-22 22-22t22 22q-6-10-22-10t-22 10Z" fill={c} />
    case 'long': return <path d="M27 48q0-26 23-26t23 26q-4-14-23-14t-23 14Z" fill={c} />
    case 'chignon': return <><circle cx="50" cy="16" r="9" fill={c} /><path d="M28 44q0-22 22-22t22 22q-6-10-22-10t-22 10Z" fill={c} /></>
    case 'afro': return <path d="M30 40q2-14 20-14t20 14q-8-6-20-6t-20 6Z" fill={ombre(c)} />
    case 'crete': return <><path d="M44 30 L50 6 L56 30Z" fill={c} /><path d="M30 42q2-16 20-16t20 16q-8-8-20-8t-20 8Z" fill={c} /></>
    case 'tresses': return <><path d="M28 44q0-22 22-22t22 22q-6-10-22-10t-22 10Z" fill={c} /><path d="M27 50v26M73 50v26" stroke={c} strokeWidth="6" strokeLinecap="round" strokeDasharray="5 3" /></>
    case 'meches': return <path d="M27 46q2-24 23-24t23 24l-7-8-5 6-6-9-6 9-5-6Z" fill={c} />
    case 'queue': return <path d="M28 44q0-22 22-22t22 22q-6-10-22-10t-22 10Z" fill={c} />
    case 'boucles': return <g fill={c}>{[32, 42, 52, 62].map((x, i) => <circle key={i} cx={x + 3} cy={28 + (i % 2) * 3} r="8" />)}</g>
  }
}

function Accessoire({ a }: { a: Trait['acc'] }) {
  switch (a) {
    case 'chapeau-pirate': return <><path d="M18 30q32-24 64 0q-32-8-64 0Z" fill="#111" /><path d="M22 30q28-10 56 0v4q-28-8-56 0Z" fill="#1F2937" /><circle cx="50" cy="22" r="4" fill="#fff" /></>
    case 'bandeau-ninja': return <><rect x="25" y="34" width="50" height="8" rx="3" fill="#DC2626" /><path d="M75 37l12-4-2 8Z" fill="#DC2626" /></>
    case 'chapeau-sorciere': return <><path d="M50 -6 L68 26 H32Z" fill="#1E1B4B" /><ellipse cx="50" cy="27" rx="28" ry="6" fill="#312E81" /><rect x="36" y="20" width="28" height="4" fill="#A855F7" /></>
    case 'casque-viking': return <><path d="M26 36q0-20 24-20t24 20Z" fill="#9CA3AF" /><path d="M26 30q-12-6-14-20q8 6 16 12Z M74 30q12-6 14-20q-8 6-16 12Z" fill="#FDE68A" /></>
    case 'couronne': return <path d="M32 26l4-14 7 9 7-12 7 12 7-9 4 14Z" fill="#FACC15" stroke="#CA8A04" strokeWidth="1.5" />
    case 'casque-spatial': return <><circle cx="50" cy="48" r="32" fill="none" stroke="#E5E7EB" strokeWidth="5" /><path d="M30 32a26 26 0 0 1 40 0" stroke="#fff" strokeOpacity=".6" strokeWidth="3" fill="none" /></>
    case 'casquette': return <><path d="M28 34q0-14 22-14t22 14Z" fill="#111827" /><path d="M50 32h30q-2 6-14 6H50Z" fill="#374151" /></>
    case 'beret': return <ellipse cx="46" cy="24" rx="22" ry="8" fill="#DC2626" />
    case 'oreilles-chat': return <path d="M30 32l4-16 10 10Z M70 32l-4-16-10 10Z" fill="#F472B6" stroke="#BE185D" strokeWidth="1.5" />
    case 'aureole': return <ellipse cx="50" cy="12" rx="16" ry="4" fill="none" stroke="#FACC15" strokeWidth="3.5" />
    case 'cornes': return <path d="M34 28q-6-12 0-18q2 8 6 14Z M66 28q6-12 0-18q-2 8-6 14Z" fill="#7F1D1D" />
    case 'fleur': return <g transform="translate(70 30)">{[0, 72, 144, 216, 288].map((r) => <ellipse key={r} rx="4" ry="7" fill="#F472B6" transform={`rotate(${r}) translate(0 -5)`} />)}<circle r="3.5" fill="#FDE68A" /></g>
    case 'casque-audio': return <><path d="M22 50a28 28 0 0 1 56 0" fill="none" stroke="#111" strokeWidth="5" /><rect x="16" y="46" width="11" height="17" rx="5" fill="#EC4899" /><rect x="73" y="46" width="11" height="17" rx="5" fill="#EC4899" /></>
    case 'toque': return <><rect x="34" y="14" width="32" height="14" fill="#fff" stroke="#E5E7EB" /><circle cx="40" cy="12" r="8" fill="#fff" /><circle cx="50" cy="8" r="9" fill="#fff" /><circle cx="60" cy="12" r="8" fill="#fff" /></>
    case 'stetson': return <><ellipse cx="50" cy="30" rx="34" ry="6" fill="#78350F" /><path d="M32 30q2-18 18-18t18 18Z" fill="#92400E" /></>
    case 'katana': return <path d="M80 100 L92 40" stroke="#E5E7EB" strokeWidth="3" />
    case 'baguette': return <><path d="M78 92 L90 62" stroke="#FDE68A" strokeWidth="3" /><path d="M90 56l2 4 4 1-3 3 1 4-4-2-4 2 1-4-3-3 4-1Z" fill="#FACC15" /></>
    case 'antenne': return <><path d="M50 22V8" stroke="#64748B" strokeWidth="3" /><circle cx="50" cy="7" r="4" fill="#22D3EE" /></>
    case 'crocs': return null
    case 'masque': return <path d="M30 42q20-8 40 0v8q-20-6-40 0Z" fill="#111" />
    default: return null
  }
}

function Yeux({ t }: { t: Trait }) {
  const e = t.yeux
  if (e === 'cache') return <><circle cx="58" cy="49" r="3" fill="#222" /><path d="M34 44h14v9H34Z" fill="#111" /><path d="M30 42l26 4" stroke="#111" strokeWidth="2" /></>
  if (e === 'rieurs') return <g className="portrait-yeux" stroke="#222" strokeWidth="2.6" fill="none" strokeLinecap="round"><path d="M38 50q4-5 8 0" /><path d="M54 50q4-5 8 0" /></g>
  if (e === 'determines') return <g className="portrait-yeux"><circle cx="42" cy="50" r="3" fill="#222" /><circle cx="58" cy="50" r="3" fill="#222" /><path d="M36 44l10 3M64 44l-10 3" stroke="#222" strokeWidth="2.4" strokeLinecap="round" /></g>
  if (e === 'etoiles') return <g className="portrait-yeux" fill="#222"><circle cx="42" cy="50" r="4" /><circle cx="58" cy="50" r="4" /><circle cx="43.4" cy="48.6" r="1.4" fill="#fff" /><circle cx="59.4" cy="48.6" r="1.4" fill="#fff" /></g>
  if (e === 'lunettes') return <g><g className="portrait-yeux"><circle cx="42" cy="50" r="2.6" fill="#222" /><circle cx="58" cy="50" r="2.6" fill="#222" /></g><g fill="rgba(186,230,253,.35)" stroke="#111" strokeWidth="2"><rect x="34" y="44" width="15" height="12" rx="4" /><rect x="51" y="44" width="15" height="12" rx="4" /></g><path d="M49 49h2" stroke="#111" strokeWidth="2" /></g>
  return <g className="portrait-yeux"><circle cx="42" cy="50" r="3.2" fill="#222" /><circle cx="58" cy="50" r="3.2" fill="#222" /></g>
}

function Bouche({ t }: { t: Trait }) {
  switch (t.bouche) {
    case 'grand': return <path d="M42 60q8 10 16 0Z" fill="#7A1F2B" />
    case 'moue': return <path d="M45 63q5-3 10 0" fill="none" stroke="#7A3B2E" strokeWidth="2.4" strokeLinecap="round" />
    case 'dents': return <><path d="M41 59q9 9 18 0Z" fill="#7A1F2B" /><path d="M42 59h16v2.5H42Z" fill="#fff" />{t.acc === 'crocs' && <path d="M45 61l1.5 4 1.5-4M52 61l1.5 4 1.5-4" fill="#fff" />}</>
    case 'moustache': return <><path d="M38 58q6-5 12 0q6-5 12 0q-6 3-12 0q-6 3-12 0Z" fill={ombre(t.cheveux)} /><path d="M45 64q5 3 10 0" fill="none" stroke="#7A3B2E" strokeWidth="2" strokeLinecap="round" /></>
    case 'barbe': return <><path d="M30 52q2 26 20 26t20-26q-4 12-20 12t-20-12Z" fill={t.cheveux} /><path d="M44 61q6 4 12 0" fill="none" stroke="#7A3B2E" strokeWidth="2" strokeLinecap="round" /></>
    default: return <path d="M43 60q7 6 14 0" fill="none" stroke="#7A3B2E" strokeWidth="2.6" strokeLinecap="round" />
  }
}

function Tenue({ t }: { t: Trait }) {
  const c = t.tenue
  switch (t.col) {
    case 'veste': return <><path d="M14 100q4-30 36-30t36 30Z" fill={c} /><path d="M50 72 40 100h20Z" fill="#fff" /><path d="M50 72 44 86 50 100 56 86Z" fill={ombre(c)} /></>
    case 'robe': return <><path d="M14 100q4-30 36-30t36 30Z" fill={c} /><path d="M36 76q14 10 28 0" fill="none" stroke="#fff" strokeOpacity=".5" strokeWidth="3" /></>
    case 'armure': return <><path d="M14 100q4-30 36-30t36 30Z" fill={c} /><path d="M26 82h48M30 92h40" stroke={ombre(c)} strokeWidth="3" /><circle cx="50" cy="86" r="5" fill="#FACC15" /></>
    case 'kimono': return <><path d="M14 100q4-30 36-30t36 30Z" fill={c} /><path d="M38 72l12 18 12-18" fill="none" stroke="#fff" strokeWidth="4" /></>
    case 'combinaison': return <><path d="M14 100q4-30 36-30t36 30Z" fill={c} /><rect x="42" y="80" width="16" height="10" rx="2" fill="#38BDF8" /></>
    case 'cape': return <><path d="M8 100q6-34 42-32t42 32Z" fill={ombre(c)} /><path d="M20 100q4-28 30-28t30 28Z" fill={c} /></>
    default: return <path d="M14 100q4-30 36-30t36 30Z" fill={c} />
  }
}

// Un portrait : fond à motif, tenue, visage, coiffure, accessoire ; « anime » = clignement et balancement
export default function Portrait({ t, taille = 64, anime = false }: { t: Trait; taille?: number; anime?: boolean }) {
  const pid = `m-${t.id}`
  return (
    <svg viewBox="10 8 80 80" width={taille} height={taille} aria-hidden="true" className={`portrait${anime ? ' anime' : ''}`}>
      <defs>
        <linearGradient id={`f-${t.id}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={t.fond[0]} /><stop offset="1" stopColor={t.fond[1]} /></linearGradient>
        <Motif id={pid} m={t.motif} c={t.fond[0]} />
      </defs>
      <rect width="100" height="100" fill={`url(#f-${t.id})`} />
      <rect width="100" height="100" fill={`url(#${pid})`} className="portrait-motif" />
      <g className="portrait-corps">
        <Cheveux t={t} arriere />
        <Tenue t={t} />
        <rect x="44" y="62" width="12" height="10" fill={ombre(t.peau)} />
        <ellipse cx="50" cy="50" rx="21" ry="23" fill={t.peau} />
        <ellipse cx="29" cy="52" rx="3.5" ry="5" fill={t.peau} /><ellipse cx="71" cy="52" rx="3.5" ry="5" fill={t.peau} />
        <circle cx="36" cy="58" r="3.5" fill="#F87171" opacity=".3" /><circle cx="64" cy="58" r="3.5" fill="#F87171" opacity=".3" />
        <Yeux t={t} />
        <Bouche t={t} />
        <Cheveux t={t} arriere={false} />
        <Accessoire a={t.acc} />
      </g>
      <ellipse cx="30" cy="16" rx="22" ry="10" fill="#fff" opacity=".12" />
    </svg>
  )
}
