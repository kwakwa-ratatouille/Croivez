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
    default: return null
  }
}

export default function Bonhomme({ p, taille = 40, anime = false }: { p: Perso; taille?: number; anime?: boolean }) {
  const lunettes = p.acc.startsWith('lunettes')
  return (
    <svg viewBox="0 0 100 100" width={taille} height={taille} aria-hidden="true" className={anime ? 'bonhomme anime' : 'bonhomme'}>
      <path d="M14 100q4-30 36-30t36 30z" fill={p.habit} />
      {p.acc === 'lunettes-fiole' && <path d="M70 80h8l3 14h-14z" fill="#8FD3B6" />}
      {p.cheveux !== 'none' && <ellipse cx="50" cy="40" rx="27" ry="27" fill={p.cheveux} />}
      {p.acc === 'lunettes-chignon' && <circle cx="50" cy="13" r="9" fill={p.cheveux} />}
      <circle cx="50" cy="46" r="22" fill={p.peau} />
      {p.cheveux !== 'none' && <path d="M28 40q4-18 22-18t22 18q-10-8-22-8t-22 8z" fill={p.cheveux} />}
      <g className="yeux"><circle cx="42" cy="47" r="2.6" fill="#222" /><circle cx="58" cy="47" r="2.6" fill="#222" /></g>
      {lunettes && <g fill="none" stroke="#333" strokeWidth="2"><circle cx="42" cy="47" r="6" /><circle cx="58" cy="47" r="6" /><path d="M48 47h4" /></g>}
      <path d="M43 56q7 6 14 0" fill="none" stroke="#7A3B2E" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="36" cy="54" r="3" fill="#F08A7A" opacity=".35" /><circle cx="64" cy="54" r="3" fill="#F08A7A" opacity=".35" />
      <Accessoire a={p.acc} c={p.habit} />
    </svg>
  )
}
