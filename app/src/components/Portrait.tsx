// Portraits illustrés (SVG pur, aucune image à charger) : chaque personnage combine un visage, une coiffure,
// des yeux, une bouche, une tenue, un accessoire et un fond à motif. Animations légères (clignement, balancement).
export type Trait = {
  id: string; fr: string; en: string
  peau: string; cheveux: string; coiffure: 'court' | 'long' | 'chignon' | 'afro' | 'crete' | 'tresses' | 'chauve' | 'meches' | 'queue' | 'boucles' | 'bob' | 'herisse' | 'couettes'
  yeux: 'ronds' | 'rieurs' | 'determines' | 'etoiles' | 'lunettes' | 'cache' | 'anime' | 'endormis'
  bouche: 'sourire' | 'grand' | 'moue' | 'dents' | 'moustache' | 'barbe'
  tenue: string; col: 'tshirt' | 'veste' | 'robe' | 'armure' | 'kimono' | 'combinaison' | 'cape' | 'sweat' | 'salopette' | 'costume'
  acc?: 'bonnet' | 'chapeau-paille' | 'casque-chantier' | 'haut-de-forme' | 'bandana' | 'lunettes-soleil' | 'couronne-fleurs' | 'monocle' | 'nemes' | 'chapeau-pirate' | 'bandeau-ninja' | 'chapeau-sorciere' | 'casque-viking' | 'couronne' | 'casque-spatial' | 'casquette' | 'beret' | 'oreilles-chat' | 'aureole' | 'cornes' | 'fleur' | 'casque-audio' | 'toque' | 'stetson' | 'katana' | 'baguette' | 'antenne' | 'crocs' | 'masque'
  iris?: string; taches?: boolean // couleur des yeux, taches de rousseur
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
  T('pharaonne', 'Pharaonne', 'Pharaoh', { peau: '#B9774F', cheveux: '#111', coiffure: 'bob', yeux: 'determines', iris: '#3F2A14', bouche: 'sourire', tenue: '#F8FAFC', col: 'robe', acc: 'nemes', fond: ['#78350F', '#FBBF24'], motif: 'triangles' }),
  T('gentleman', 'Gentleman', 'Gentleman', { peau: '#F3D0B0', cheveux: '#3B2A20', coiffure: 'court', yeux: 'ronds', iris: '#2563EB', bouche: 'moustache', tenue: '#1F2937', col: 'costume', acc: 'haut-de-forme', fond: ['#3F3F46', '#A1A1AA'], motif: 'rayures' }),
  T('jardiniere', 'Jardinière', 'Gardener', { peau: '#E8B48C', cheveux: '#B45309', coiffure: 'couettes', yeux: 'rieurs', bouche: 'grand', tenue: '#65A30D', col: 'salopette', acc: 'chapeau-paille', taches: true, fond: ['#84CC16', '#FDE68A'], motif: 'points' }),
  T('ecolo', 'Gardienne de la planète', 'Planet guardian', { peau: '#8D5A3B', cheveux: '#1E1E1E', coiffure: 'boucles', yeux: 'etoiles', iris: '#15803D', bouche: 'sourire', tenue: '#16A34A', col: 'sweat', acc: 'couronne-fleurs', fond: ['#065F46', '#6EE7B7'], motif: 'bulles' }),
  T('ouvrier', 'Chef de chantier', 'Site manager', { peau: '#C68B62', cheveux: '#2B1B12', coiffure: 'court', yeux: 'determines', bouche: 'barbe', tenue: '#F97316', col: 'salopette', acc: 'casque-chantier', fond: ['#1E293B', '#FACC15'], motif: 'rayures' }),
  T('skateuse', 'Skateuse', 'Skater', { peau: '#F1C9A5', cheveux: '#14B8A6', coiffure: 'bob', yeux: 'rieurs', bouche: 'dents', tenue: '#7C3AED', col: 'sweat', acc: 'bonnet', taches: true, fond: ['#F472B6', '#22D3EE'], motif: 'triangles' }),
  T('heroine-anime', 'Héroïne d’anime', 'Anime heroine', { peau: '#FDE7D3', cheveux: '#EC4899', coiffure: 'couettes', yeux: 'anime', iris: '#7C3AED', bouche: 'grand', tenue: '#1D4ED8', col: 'tshirt', fond: ['#FBCFE8', '#A5B4FC'], motif: 'etoiles' }),
  T('heros-anime', 'Héros d’anime', 'Anime hero', { peau: '#F5D2B5', cheveux: '#F59E0B', coiffure: 'herisse', yeux: 'anime', iris: '#0EA5E9', bouche: 'dents', tenue: '#EA580C', col: 'kimono', fond: ['#1E3A8A', '#F97316'], motif: 'rayons' }),
  T('rockeuse', 'Rockeuse', 'Rocker', { peau: '#E5C1A0', cheveux: '#111', coiffure: 'long', yeux: 'determines', iris: '#4B5563', bouche: 'moue', tenue: '#111', col: 'veste', acc: 'bandana', fond: ['#7F1D1D', '#111827'], motif: 'triangles' }),
  T('touriste', 'Vacancier', 'Holidaymaker', { peau: '#F2B48E', cheveux: '#92400E', coiffure: 'meches', yeux: 'ronds', bouche: 'grand', tenue: '#F43F5E', col: 'tshirt', acc: 'lunettes-soleil', fond: ['#06B6D4', '#FDE047'], motif: 'vagues' }),
  T('etudiante', 'Étudiante', 'Student', { peau: '#D9A27A', cheveux: '#3A2618', coiffure: 'bob', yeux: 'lunettes', bouche: 'sourire', tenue: '#E11D48', col: 'sweat', fond: ['#FDE68A', '#60A5FA'], motif: 'damier' }),
  T('mamie', 'Mamie gâteau', 'Granny', { peau: '#F3D0B0', cheveux: '#E5E7EB', coiffure: 'chignon', yeux: 'lunettes', bouche: 'sourire', tenue: '#BE185D', col: 'robe', fond: ['#FCE7F3', '#F9A8D4'], motif: 'points' }),
  T('papi', 'Papi', 'Grandpa', { peau: '#EDC3A0', cheveux: '#D1D5DB', coiffure: 'chauve', yeux: 'endormis', bouche: 'barbe', tenue: '#92400E', col: 'veste', acc: 'beret', fond: ['#FEF3C7', '#A16207'], motif: 'rayures' }),
  T('dormeur', 'Grand dormeur', 'Sleepyhead', { peau: '#F5D2B5', cheveux: '#6B7280', coiffure: 'meches', yeux: 'endormis', bouche: 'moue', tenue: '#6366F1', col: 'tshirt', acc: 'bonnet', fond: ['#1E1B4B', '#4338CA'], motif: 'etoiles' }),
  T('aventurier', 'Aventurier', 'Adventurer', { peau: '#C68B62', cheveux: '#5C3B1E', coiffure: 'court', yeux: 'determines', iris: '#065F46', bouche: 'sourire', tenue: '#A16207', col: 'veste', acc: 'chapeau-paille', fond: ['#14532D', '#D9F99D'], motif: 'triangles' }),
  T('aristo', 'Aristocrate', 'Aristocrat', { peau: '#FDE7D3', cheveux: '#FDE68A', coiffure: 'boucles', yeux: 'ronds', iris: '#1D4ED8', bouche: 'moue', tenue: '#7C3AED', col: 'costume', acc: 'monocle', fond: ['#4C1D95', '#F0ABFC'], motif: 'damier' }),
  T('hipster', 'Barista', 'Barista', { peau: '#E0A981', cheveux: '#3A2618', coiffure: 'chignon', yeux: 'lunettes', bouche: 'barbe', tenue: '#57534E', col: 'salopette', fond: ['#78350F', '#FCD34D'], motif: 'bulles' }),
  T('kpop', 'Idole K-pop', 'K-pop idol', { peau: '#FCE7D6', cheveux: '#A78BFA', coiffure: 'meches', yeux: 'anime', iris: '#DB2777', bouche: 'sourire', tenue: '#F8FAFC', col: 'costume', fond: ['#F472B6', '#818CF8'], motif: 'etoiles' }),
]

const ombre = (c: string) => `color-mix(in srgb, ${c} 75%, #000)`
const clair = (c: string) => `color-mix(in srgb, ${c} 70%, #fff)`

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
    if (t.coiffure === 'bob') return <path d="M25 46q0-26 25-26t25 26v18q-6 4-10 0V44H35v20q-4 4-10 0Z" fill={ombre(c)} />
    if (t.coiffure === 'couettes') return <g fill={c}><path d="M24 40q-14 6-12 30q8-2 14-16Z" /><path d="M76 40q14 6 12 30q-8-2-14-16Z" /></g>
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
    case 'bob': return <path d="M27 46q0-24 23-24t23 24q-10-4-14-12q-4 8-32 12Z" fill={c} />
    case 'herisse': return <path d="M26 46 18 30l12 2-4-16 12 8 2-16 9 13 7-13 3 16 11-8-3 15 12-1-8 16q-10-12-23-12t-24 12Z" fill={c} />
    case 'couettes': return <><path d="M28 44q0-22 22-22t22 22q-8-8-22-8t-22 8Z" fill={c} /><circle cx="24" cy="38" r="3.5" fill="#F472B6" /><circle cx="76" cy="38" r="3.5" fill="#F472B6" /></>
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
    case 'bonnet': return <><path d="M27 38q0-22 23-22t23 22Z" fill="#E11D48" /><rect x="25" y="34" width="50" height="8" rx="4" fill="#BE123C" /><circle cx="50" cy="15" r="5" fill="#FDE68A" /></>
    case 'chapeau-paille': return <><ellipse cx="50" cy="30" rx="36" ry="7" fill="#EAB308" /><path d="M33 30q1-16 17-16t17 16Z" fill="#FACC15" /><rect x="33" y="25" width="34" height="4" fill="#DC2626" /></>
    case 'casque-chantier': return <><path d="M27 36q0-20 23-20t23 20Z" fill="#FACC15" /><rect x="22" y="33" width="56" height="5" rx="2.5" fill="#EAB308" /><rect x="47" y="16" width="6" height="18" rx="2" fill="#FDE047" /></>
    case 'haut-de-forme': return <><ellipse cx="50" cy="28" rx="26" ry="5" fill="#111" /><rect x="36" y="2" width="28" height="26" rx="2" fill="#1F2937" /><rect x="36" y="20" width="28" height="4" fill="#DC2626" /></>
    case 'bandana': return <><path d="M27 38q0-16 23-16t23 16q-23-6-46 0Z" fill="#DC2626" /><path d="M73 36l10 6-9 2Z" fill="#DC2626" /><g fill="#fff">{[34, 44, 56, 66].map((x) => <circle key={x} cx={x} cy="32" r="1.3" />)}</g></>
    case 'lunettes-soleil': return <><path d="M32 45h16v6q-8 6-16 0Z M52 45h16v6q-8 6-16 0Z" fill="#111" /><path d="M48 46h4" stroke="#111" strokeWidth="2" /><path d="M35 47l4 0" stroke="#fff" strokeOpacity=".6" strokeWidth="1.5" /></>
    case 'couronne-fleurs': return <g>{[28, 37, 46, 55, 64, 72].map((x, i) => <g key={x} transform={`translate(${x} ${30 - (i === 0 || i === 5 ? 0 : 3)})`}>{[0, 90, 180, 270].map((r) => <ellipse key={r} rx="2.6" ry="4.4" fill={['#F472B6', '#FDE047', '#A78BFA'][i % 3]} transform={`rotate(${r}) translate(0 -3)`} />)}<circle r="2" fill="#FFF" /></g>)}<path d="M26 32q24-10 48 0" fill="none" stroke="#16A34A" strokeWidth="2" /></g>
    case 'monocle': return <><circle cx="58" cy="50" r="7" fill="rgba(186,230,253,.3)" stroke="#CA8A04" strokeWidth="2" /><path d="M64 54q6 10 4 22" fill="none" stroke="#CA8A04" strokeWidth="1.2" /></>
    case 'nemes': return <><path d="M26 44q0-26 24-26t24 26l6 30H20Z" fill="#1D4ED8" /><path d="M26 44q0-26 24-26t24 26" fill="none" stroke="#FACC15" strokeWidth="3" /><path d="M22 54h56M21 62h58M20 70h60" stroke="#FACC15" strokeWidth="2.5" /><path d="M46 20q4-6 8 0v6h-8Z" fill="#FACC15" /></>
    default: return null
  }
}

function Sourcils({ t }: { t: Trait }) {
  const c = ombre(t.cheveux === '#111' || t.coiffure === 'chauve' ? '#3B2A20' : t.cheveux)
  const d = t.yeux === 'determines' ? 'M35 42l11 3M65 42l-11 3' : t.yeux === 'endormis' ? 'M36 44q5-1 10 0M54 44q5-1 10 0' : t.yeux === 'rieurs' || t.yeux === 'anime' ? 'M36 42q5-4 10-1M54 41q5-3 10 1' : 'M36 43q5-3 10-1M54 42q5-2 10 1'
  return <path d={d} fill="none" stroke={c} strokeWidth="2.4" strokeLinecap="round" />
}

function Oeil({ x, iris, grand = false }: { x: number; iris: string; grand?: boolean }) {
  const r = grand ? 6 : 4.4
  return <g>
    <ellipse cx={x} cy="50" rx={r} ry={grand ? 6.8 : 4.8} fill="#fff" stroke="#222" strokeWidth=".8" />
    <circle cx={x} cy={grand ? 51 : 50.4} r={grand ? 4.6 : 3} fill={iris} />
    <circle cx={x} cy={grand ? 51 : 50.4} r={grand ? 2.4 : 1.6} fill="#111" />
    <circle cx={x + (grand ? 1.8 : 1.1)} cy={grand ? 48.6 : 49.2} r={grand ? 1.6 : 1} fill="#fff" />
    {grand && <circle cx={x - 1.6} cy="53" r=".9" fill="#fff" />}
    <path d={`M${x - r} ${grand ? 47 : 48}q${r} ${grand ? -5 : -3.4} ${r * 2} 0`} fill="none" stroke="#222" strokeWidth={grand ? 2 : 1.6} strokeLinecap="round" />
  </g>
}

function Yeux({ t }: { t: Trait }) {
  const e = t.yeux
  const iris = t.iris ?? '#6B4423'
  if (e === 'cache') return <><g className="portrait-yeux"><Oeil x={58} iris={iris} /></g><path d="M34 44h14v9H34Z" fill="#111" /><path d="M30 42l26 4" stroke="#111" strokeWidth="2" /></>
  if (e === 'rieurs') return <g className="portrait-yeux" stroke="#222" strokeWidth="2.6" fill="none" strokeLinecap="round"><path d="M37 51q5-6 10 0" /><path d="M53 51q5-6 10 0" /></g>
  if (e === 'endormis') return <g className="portrait-yeux" stroke="#222" strokeWidth="2.2" fill="none" strokeLinecap="round"><path d="M37 50q5 4 10 0" /><path d="M53 50q5 4 10 0" /></g>
  if (e === 'anime') return <g className="portrait-yeux"><Oeil x={41} iris={iris} grand /><Oeil x={59} iris={iris} grand /></g>
  if (e === 'etoiles') return <g className="portrait-yeux"><Oeil x={42} iris={iris} /><Oeil x={58} iris={iris} /><path d="M42 45.5l.8 1.6 1.7.2-1.3 1.1.4 1.7-1.6-.9-1.5.9.4-1.7-1.3-1.1 1.7-.2Z M58 45.5l.8 1.6 1.7.2-1.3 1.1.4 1.7-1.6-.9-1.5.9.4-1.7-1.3-1.1 1.7-.2Z" fill="#FDE047" /></g>
  if (e === 'lunettes') return <g><g className="portrait-yeux"><Oeil x={42} iris={iris} /><Oeil x={58} iris={iris} /></g><g fill="rgba(186,230,253,.25)" stroke="#111" strokeWidth="2"><rect x="34" y="44" width="15" height="12" rx="4" /><rect x="51" y="44" width="15" height="12" rx="4" /></g><path d="M49 49h2" stroke="#111" strokeWidth="2" /><path d="M36 46l3 0" stroke="#fff" strokeOpacity=".8" strokeWidth="1.4" /></g>
  return <g className="portrait-yeux"><Oeil x={42} iris={iris} /><Oeil x={58} iris={iris} /></g>
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
    case 'sweat': return <><path d="M14 100q4-30 36-30t36 30Z" fill={c} /><path d="M34 72q16 12 32 0" fill="none" stroke={ombre(c)} strokeWidth="5" /><path d="M45 78v10M55 78v10" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" /><rect x="40" y="90" width="20" height="8" rx="3" fill={ombre(c)} /></>
    case 'salopette': return <><path d="M14 100q4-30 36-30t36 30Z" fill="#F8FAFC" /><path d="M30 100V82h40v18Z" fill={c} /><path d="M33 82 30 72M67 82l3-10" stroke={c} strokeWidth="4" /><circle cx="34" cy="83" r="1.8" fill="#FACC15" /><circle cx="66" cy="83" r="1.8" fill="#FACC15" /><rect x="44" y="86" width="12" height="8" rx="2" fill={ombre(c)} /></>
    case 'costume': return <><path d="M14 100q4-30 36-30t36 30Z" fill={c} /><path d="M42 72h16L50 100Z" fill="#fff" /><path d="M48 76h4l1 4-3 16-3-16Z" fill="#DC2626" /><path d="M42 72 34 86l8-2 8 16M58 72l8 14-8-2-8 16" fill="none" stroke={ombre(c)} strokeWidth="2" /></>
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
        <radialGradient id={`p-${t.id}`} cx=".38" cy=".32" r=".8"><stop offset="0" stopColor={clair(t.peau)} /><stop offset=".55" stopColor={t.peau} /><stop offset="1" stopColor={ombre(t.peau)} /></radialGradient>
        <radialGradient id={`h-${t.id}`} cx=".5" cy=".55" r=".55"><stop offset="0" stopColor="#fff" stopOpacity=".35" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></radialGradient>
        <linearGradient id={`o-${t.id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity=".28" /></linearGradient>
      </defs>
      <rect width="100" height="100" fill={`url(#f-${t.id})`} />
      <rect width="100" height="100" fill={`url(#${pid})`} className="portrait-motif" />
      <circle cx="50" cy="52" r="40" fill={`url(#h-${t.id})`} />
      <g className="portrait-corps">
        <Cheveux t={t} arriere />
        <Tenue t={t} />
        <path d="M14 100q4-30 36-30t36 30Z" fill={`url(#o-${t.id})`} />
        <path d="M44 62h12v10q-6 4-12 0Z" fill={ombre(t.peau)} />
        <ellipse cx="29" cy="52" rx="3.5" ry="5" fill={ombre(t.peau)} /><ellipse cx="71" cy="52" rx="3.5" ry="5" fill={ombre(t.peau)} />
        <ellipse cx="50" cy="50" rx="21" ry="23" fill={`url(#p-${t.id})`} />
        <ellipse cx="37" cy="58" rx="4" ry="2.6" fill="#F87171" opacity=".35" /><ellipse cx="63" cy="58" rx="4" ry="2.6" fill="#F87171" opacity=".35" />
        {t.taches && <g fill={ombre(t.peau)} opacity=".7">{[[35, 55], [38, 57], [41, 55], [59, 55], [62, 57], [65, 55]].map(([x, y]) => <circle key={x} cx={x} cy={y} r=".9" />)}</g>}
        <path d="M49 52q-2 5 1 6q2 .5 3-1" fill="none" stroke={ombre(t.peau)} strokeWidth="1.6" strokeLinecap="round" />
        <Sourcils t={t} />
        <Yeux t={t} />
        <Bouche t={t} />
        <Cheveux t={t} arriere={false} />
        {t.coiffure !== 'chauve' && <path d="M36 30q8-5 18-4" fill="none" stroke="#fff" strokeOpacity=".35" strokeWidth="2.5" strokeLinecap="round" />}
        <Accessoire a={t.acc} />
      </g>
      <ellipse cx="30" cy="16" rx="22" ry="10" fill="#fff" opacity=".12" />
    </svg>
  )
}
