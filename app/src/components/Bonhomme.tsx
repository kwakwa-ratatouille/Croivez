import { useId } from 'react'

// Personnages d'apprentissage en SVG pur (aucune image à charger) : tête, buste, et un accessoire de métier
export type Perso = { id: string; peau: string; habit: string; cheveux: string; acc: string }

export const PERSOS: Perso[] = [
  { id: 'eleve', peau: '#F2C9A5', habit: '#6BB8C4', cheveux: '#5A3B2A', acc: 'sac' },
  { id: 'savante', peau: '#C68B62', habit: '#FFFFFF', cheveux: '#2B2B2B', acc: 'lunettes-fiole' },
  { id: 'explorateur', peau: '#E8B48C', habit: '#B08A4E', cheveux: '#7A4A2A', acc: 'chapeau' },
  { id: 'astronaute', peau: '#F5D2B5', habit: '#E6E9EF', cheveux: '#3B2A20', acc: 'casque' },
  { id: 'musicienne', peau: '#8D5A3B', habit: '#B3A3DB', cheveux: '#1E1E1E', acc: 'casque-audio' },
  { id: 'peintre', peau: '#F0C29A', habit: '#E0997A', cheveux: '#A8432E', acc: 'beret' },
  { id: 'gameur', peau: '#D9A27A', habit: '#5BC08A', cheveux: '#2E2016', acc: 'casquette' },
  { id: 'sportive', peau: '#B9774F', habit: '#E3574B', cheveux: '#2A1A12', acc: 'bandeau' },
  { id: 'detective', peau: '#F2C9A5', habit: '#8A6D4B', cheveux: '#4A3526', acc: 'loupe' },
  { id: 'magicien', peau: '#EDC3A0', habit: '#5B4FA8', cheveux: '#DCDCDC', acc: 'chapeau-pointu' },
  { id: 'cheffe', peau: '#E0A981', habit: '#FFFFFF', cheveux: '#3A2618', acc: 'toque' },
  { id: 'historien', peau: '#F1CCA8', habit: '#7A5C3E', cheveux: '#9C9C9C', acc: 'couronne-laurier' },
  { id: 'botaniste', peau: '#A86D48', habit: '#7DB76A', cheveux: '#20160F', acc: 'feuille' },
  { id: 'pirate', peau: '#E5B089', habit: '#2F3A4A', cheveux: '#1C1C1C', acc: 'bandeau-oeil' },
  { id: 'robot', peau: '#B9C3CE', habit: '#7F8A96', cheveux: 'none', acc: 'antenne' },
  { id: 'professeure', peau: '#F3D0B0', habit: '#C2576B', cheveux: '#6B4630', acc: 'lunettes-chignon' },
  // Métiers et personnages de prestige
  { id: 'pilote', peau: '#F2C9A5', habit: '#E5484D', cheveux: '#3B2A20', acc: 'casque-f1' },
  { id: 'pompier', peau: '#D9A27A', habit: '#2F3A4A', cheveux: '#2E2016', acc: 'casque-pompier' },
  { id: 'docteure', peau: '#8D5A3B', habit: '#FFFFFF', cheveux: '#1E1E1E', acc: 'stetho' },
  { id: 'policier', peau: '#F0C29A', habit: '#2D4A8A', cheveux: '#4A3526', acc: 'kepi' },
  { id: 'footballeur', peau: '#B9774F', habit: '#3E7BFA', cheveux: '#1C1C1C', acc: 'ballon' },
  { id: 'dj', peau: '#E8B48C', habit: '#1E1B33', cheveux: '#9B51E0', acc: 'casque-audio' },
  { id: 'ninja', peau: '#E5B089', habit: '#1E1E1E', cheveux: '#1E1E1E', acc: 'ninja' },
  { id: 'chevalier', peau: '#F1CCA8', habit: '#9AA3AD', cheveux: 'none', acc: 'heaume' },
  { id: 'heroine', peau: '#C68B62', habit: '#E5484D', cheveux: '#2B2B2B', acc: 'masque-hero' },
  { id: 'plongeur', peau: '#F5D2B5', habit: '#1F6670', cheveux: '#3B2A20', acc: 'masque-plongee' },
  { id: 'agent', peau: '#EDC3A0', habit: '#1E1E1E', cheveux: '#2B2B2B', acc: 'lunettes-noires' },
  { id: 'cowboy', peau: '#E0A981', habit: '#B0623A', cheveux: '#5A3B2A', acc: 'stetson' },
  { id: 'rockstar', peau: '#F2C9A5', habit: '#2B2B2B', cheveux: '#E3A72F', acc: 'lunettes-etoile' },
  { id: 'reine', peau: '#F3D0B0', habit: '#7B3FA0', cheveux: '#A8432E', acc: 'couronne' },
  { id: 'viking', peau: '#F0C29A', habit: '#7A5C3E', cheveux: '#D9822B', acc: 'casque-viking' },
  { id: 'samourai', peau: '#E8B48C', habit: '#8A2E2E', cheveux: '#1C1C1C', acc: 'chignon-samourai' },
  { id: 'vampire', peau: '#E6E3EA', habit: '#2B1A2E', cheveux: '#1C1C1C', acc: 'crocs' },
  { id: 'sorciere', peau: '#9FD39A', habit: '#3B2A4A', cheveux: '#5B2A6E', acc: 'chapeau-sorciere' },
  { id: 'streameur', peau: '#D9A27A', habit: '#9146FF', cheveux: '#2E2016', acc: 'micro' },
]

function Accessoire({ a, c }: { a: string; c: string }) {
  switch (a) {
    case 'chapeau': return <><ellipse cx="50" cy="30" rx="34" ry="7" fill="#8B6A3A" /><path d="M30 30q2-20 20-20t20 20z" fill="#A47F48" /><rect x="30" y="24" width="40" height="5" fill="#5C4422" /></>
    case 'casque': return <><circle cx="50" cy="44" r="31" fill="none" stroke="#DDE3EA" strokeWidth="6" /><path d="M28 34a24 24 0 0 1 44 0" fill="#9FD6F0" opacity=".35" /></>
    case 'casque-audio': return <><path d="M22 46a28 28 0 0 1 56 0" fill="none" stroke="#333" strokeWidth="5" /><rect x="16" y="42" width="11" height="17" rx="5" fill="#E05A8A" /><rect x="73" y="42" width="11" height="17" rx="5" fill="#E05A8A" /></>
    case 'beret': return <><ellipse cx="46" cy="22" rx="24" ry="9" fill="#C0392B" /><circle cx="46" cy="13" r="3" fill="#C0392B" /></>
    case 'casquette': return <><path d="M26 30a24 18 0 0 1 48 0z" fill={c} /><path d="M50 30h34q-2 6-14 6H50z" fill={c} opacity=".8" /></>
    case 'bandeau': return <rect x="25" y="27" width="50" height="7" rx="3" fill="#fff" />
    case 'loupe': return <><circle cx="80" cy="76" r="8" fill="#CFEAF5" stroke="#5A4630" strokeWidth="3" /><path d="M74 82l-8 9" stroke="#5A4630" strokeWidth="4" strokeLinecap="round" /></>
    case 'chapeau-pointu': return <><path d="M50 -4L68 28H32z" fill="#5B4FA8" /><ellipse cx="50" cy="28" rx="26" ry="5" fill="#463C8A" /><circle cx="54" cy="12" r="2" fill="#F7D774" /></>
    case 'toque': return <><rect x="34" y="16" width="32" height="14" fill="#fff" stroke="#ddd" /><circle cx="40" cy="14" r="8" fill="#fff" /><circle cx="50" cy="10" r="9" fill="#fff" /><circle cx="60" cy="14" r="8" fill="#fff" /></>
    case 'couronne-laurier': return <><path d="M26 34q4-14 18-18" stroke="#6E9C4A" strokeWidth="4" fill="none" /><path d="M74 34q-4-14-18-18" stroke="#6E9C4A" strokeWidth="4" fill="none" /></>
    case 'feuille': return <path d="M58 20q14-14 22-6q-6 14-22 6z" fill="#5BAE4A" />
    case 'bandeau-oeil': return <><path d="M24 36L76 30" stroke="#111" strokeWidth="3" /><circle cx="60" cy="42" r="6" fill="#111" /></>
    case 'antenne': return <><path d="M50 18V6" stroke="#7F8A96" strokeWidth="3" /><circle cx="50" cy="5" r="4" fill="#E3574B" /></>
    case 'sac': return <path d="M22 76q-4 10 2 20h8V74z" fill="#E3A72F" />
    case 'casque-f1': return <><path d="M22 50a28 28 0 0 1 56 0v12H22z" fill="#E5484D" /><rect x="28" y="44" width="44" height="12" rx="6" fill="#1E1E1E" /><path d="M30 46h40" stroke="#7CCFDA" strokeWidth="2" opacity=".7" /><path d="M22 38h56" stroke="#fff" strokeWidth="3" /></>
    case 'casque-pompier': return <><path d="M24 34a26 22 0 0 1 52 0z" fill="#E5484D" /><rect x="18" y="32" width="64" height="5" rx="2" fill="#B8343A" /><path d="M50 14v12" stroke="#F7D774" strokeWidth="4" /></>
    case 'stetho': return <><path d="M38 70q-2 14 12 16q14-2 12-16" fill="none" stroke="#555" strokeWidth="2.5" /><circle cx="50" cy="87" r="4" fill="#9AA3AD" /></>
    case 'kepi': return <><path d="M28 30a22 14 0 0 1 44 0z" fill="#2D4A8A" /><rect x="26" y="28" width="48" height="5" fill="#1C2E5A" /><circle cx="50" cy="22" r="3" fill="#F7D774" /></>
    case 'ballon': return <><circle cx="80" cy="82" r="10" fill="#fff" stroke="#222" strokeWidth="1.5" /><path d="M80 76l4 3-1.5 4.5h-5L76 79z" fill="#222" /><text x="50" y="92" fontSize="12" fontWeight="900" textAnchor="middle" fill="#fff">10</text></>
    case 'ninja': return <><rect x="26" y="40" width="48" height="14" fill="#1E1E1E" /><path d="M28 56h44v12q-22 10-44 0z" fill="#1E1E1E" /><path d="M74 42l12-6M74 46l12 2" stroke="#E5484D" strokeWidth="3" /></>
    case 'heaume': return <><path d="M26 52a24 26 0 0 1 48 0v14H26z" fill="#B9C3CE" /><rect x="30" y="46" width="40" height="5" fill="#2F3437" /><path d="M50 54v10" stroke="#2F3437" strokeWidth="2" /><path d="M50 22q10-12 16 0" fill="#E5484D" /></>
    case 'masque-hero': return <><path d="M28 44q22-8 44 0q-2 10-10 9q-12-4-24 0q-8 1-10-9z" fill="#1E1E1E" /><path d="M14 100q2-16 10-24l-6 24z" fill="#F7D774" /></>
    case 'masque-plongee': return <><rect x="30" y="40" width="40" height="16" rx="8" fill="#7CCFDA" opacity=".6" stroke="#1F6670" strokeWidth="3" /><path d="M72 50v-22" stroke="#F4A300" strokeWidth="4" strokeLinecap="round" /></>
    case 'lunettes-noires': return <><rect x="33" y="43" width="14" height="9" rx="3" fill="#111" /><rect x="53" y="43" width="14" height="9" rx="3" fill="#111" /><path d="M47 47h6" stroke="#111" strokeWidth="2" /><path d="M46 78l4 6 4-6" fill="#E5484D" /></>
    case 'stetson': return <><ellipse cx="50" cy="30" rx="38" ry="7" fill="#7A4A2A" /><path d="M32 30q0-18 18-18t18 18z" fill="#8C5A30" /><rect x="32" y="24" width="36" height="4" fill="#3B2A20" /></>
    case 'lunettes-etoile': return <><path d="M42 41l2 4 4 .5-3 3 1 4-4-2-4 2 1-4-3-3 4-.5z" fill="#FFD84D" /><path d="M58 41l2 4 4 .5-3 3 1 4-4-2-4 2 1-4-3-3 4-.5z" fill="#FFD84D" /></>
    case 'couronne': return <><path d="M30 28l6-14 7 10 7-14 7 14 7-10 6 14z" fill="#F4C430" /><circle cx="50" cy="18" r="2.5" fill="#E5484D" /></>
    case 'casque-viking': return <><path d="M26 38a24 22 0 0 1 48 0z" fill="#9AA3AD" /><path d="M26 34q-14-6-12-22q8 10 16 14z" fill="#F5EBD7" /><path d="M74 34q14-6 12-22q-8 10-16 14z" fill="#F5EBD7" /><path d="M30 70q20 20 40 0" fill="#D9822B" /></>
    case 'chignon-samourai': return <><path d="M46 18q4-10 8 0z" fill="#1C1C1C" /><rect x="44" y="16" width="12" height="4" rx="2" fill="#1C1C1C" /><path d="M76 80l14-20" stroke="#C0C6CF" strokeWidth="3" /></>
    case 'crocs': return <><path d="M45 58l2 5 2-5M51 58l2 5 2-5" fill="#fff" /><path d="M18 78q32-10 64 0l-8-14q-24 8-48 0z" fill="#8A1F2E" /></>
    case 'chapeau-sorciere': return <><path d="M54 -6L70 26H30z" fill="#2B1A3A" /><ellipse cx="50" cy="27" rx="30" ry="5" fill="#1E1229" /><rect x="36" y="20" width="28" height="4" fill="#9B51E0" /></>
    case 'micro': return <><path d="M22 46a28 28 0 0 1 56 0" fill="none" stroke="#222" strokeWidth="5" /><rect x="16" y="42" width="11" height="17" rx="5" fill="#9146FF" /><rect x="73" y="42" width="11" height="17" rx="5" fill="#9146FF" /><path d="M24 58q4 12 18 12" fill="none" stroke="#222" strokeWidth="2.5" /><circle cx="43" cy="70" r="3" fill="#222" /></>
    default: return null
  }
}

export default function Bonhomme({ p, taille = 40, anime = false }: { p: Perso; taille?: number; anime?: boolean }) {
  const lunettes = p.acc.startsWith('lunettes')
  const id = useId().replace(/:/g, '')
  return (
    <svg viewBox="0 0 100 100" width={taille} height={taille} aria-hidden="true" className={`bonhomme acc-${p.acc}${anime ? ' anime' : ''}`}>
      <defs>
        <radialGradient id={`f${id}`} cx=".5" cy=".35" r=".75"><stop offset="0" stopColor="#fff" stopOpacity=".9" /><stop offset="1" stopColor={p.habit} stopOpacity=".35" /></radialGradient>
        <radialGradient id={`v${id}`} cx=".35" cy=".3" r=".8"><stop offset="0" stopColor="#fff" stopOpacity=".45" /><stop offset=".5" stopColor="#fff" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity=".12" /></radialGradient>
        <linearGradient id={`h${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" stopOpacity=".25" /><stop offset="1" stopColor="#000" stopOpacity=".15" /></linearGradient>
      </defs>
      {/* Fond doux aux couleurs du personnage, et deux petites étoiles qui scintillent */}
      <rect width="100" height="100" fill={`url(#f${id})`} />
      <g className="etoiles-perso" fill="#fff"><path d="M14 18l1.6 3.4 3.4 1.6-3.4 1.6L14 28l-1.6-3.4L9 23l3.4-1.6z" /><path d="M86 30l1.2 2.6 2.6 1.2-2.6 1.2L86 38l-1.2-2.6-2.6-1.2 2.6-1.2z" /></g>
      <g className="corps">
      <path d="M14 100q4-30 36-30t36 30z" fill={p.habit} />
      <path d="M14 100q4-30 36-30t36 30z" fill={`url(#h${id})`} />
      <g className="tete">
      {p.acc === 'lunettes-fiole' && <path d="M70 80h8l3 14h-14z" fill="#8FD3B6" />}
      {p.cheveux !== 'none' && <ellipse cx="50" cy="40" rx="27" ry="27" fill={p.cheveux} />}
      {p.acc === 'lunettes-chignon' && <circle cx="50" cy="13" r="9" fill={p.cheveux} />}
      <circle cx="50" cy="46" r="22" fill={p.peau} />
      <circle cx="50" cy="46" r="22" fill={`url(#v${id})`} />
      {p.cheveux !== 'none' && <path d="M28 40q4-18 22-18t22 18q-10-8-22-8t-22 8z" fill={p.cheveux} />}
      {p.cheveux !== 'none' && <path d="M36 28q8-5 16-4" fill="none" stroke="#fff" strokeOpacity=".35" strokeWidth="2.4" strokeLinecap="round" />}
      <g className="yeux"><circle cx="42" cy="47" r="3" fill="#222" /><circle cx="58" cy="47" r="3" fill="#222" /><circle cx="43.1" cy="45.9" r="1" fill="#fff" /><circle cx="59.1" cy="45.9" r="1" fill="#fff" /></g>
      {lunettes && <g fill="none" stroke="#333" strokeWidth="2"><circle cx="42" cy="47" r="6" /><circle cx="58" cy="47" r="6" /><path d="M48 47h4" /></g>}
      <path className="bouche" d="M43 56q7 6 14 0" fill="none" stroke="#7A3B2E" strokeWidth="2.4" strokeLinecap="round" />
      <circle className="joue" cx="36" cy="54" r="3.4" fill="#F08A7A" opacity=".4" /><circle className="joue" cx="64" cy="54" r="3.4" fill="#F08A7A" opacity=".4" />
      <g className="accessoire"><Accessoire a={p.acc} c={p.habit} /></g>
      </g>
      </g>
    </svg>
  )
}
