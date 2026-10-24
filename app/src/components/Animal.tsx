import { useId } from 'react'

// Avatars animaux en SVG pur : une tête ronde, des oreilles, un museau et quelques détails propres à chaque animal
export type AnimalDef = { id: string; fr: string; en: string; tete: string; oreille: 'pointue' | 'ronde' | 'longue' | 'aucune' | 'cornes'; interieur?: string; museau?: string; nez?: string; extra?: string; fond: string }

export const ANIMAUX: AnimalDef[] = [
  { id: 'chat', fr: 'Chat', en: 'Cat', tete: '#F4A261', oreille: 'pointue', interieur: '#F7C8A8', museau: '#FBE3CF', nez: '#E76F51', extra: 'moustaches', fond: '#FCEAD9' },
  { id: 'chien', fr: 'Chien', en: 'Dog', tete: '#C08552', oreille: 'longue', interieur: '#8C5A30', museau: '#F1DCC4', nez: '#3B2A20', extra: 'tache', fond: '#F4E6D6' },
  { id: 'renard', fr: 'Renard', en: 'Fox', tete: '#E8742E', oreille: 'pointue', interieur: '#3B2A20', museau: '#FFFFFF', nez: '#2B2B2B', extra: 'joues-blanches', fond: '#FDE7D6' },
  { id: 'panda', fr: 'Panda', en: 'Panda', tete: '#FFFFFF', oreille: 'ronde', interieur: '#2B2B2B', museau: '#FFFFFF', nez: '#2B2B2B', extra: 'yeux-panda', fond: '#E6F2E1' },
  { id: 'lapin', fr: 'Lapin', en: 'Rabbit', tete: '#EDE6F2', oreille: 'longue', interieur: '#F5B5C8', museau: '#FFFFFF', nez: '#F28BA8', extra: 'dents', fond: '#F6EEF9' },
  { id: 'ours', fr: 'Ours', en: 'Bear', tete: '#8B5E3C', oreille: 'ronde', interieur: '#C49A72', museau: '#D9B48F', nez: '#3B2A20', fond: '#F1E5D8' },
  { id: 'koala', fr: 'Koala', en: 'Koala', tete: '#9AA3AD', oreille: 'ronde', interieur: '#E8E3EA', museau: '#9AA3AD', nez: '#2F3437', extra: 'gros-nez', fond: '#E8EEF2' },
  { id: 'pingouin', fr: 'Manchot', en: 'Penguin', tete: '#2F3437', oreille: 'aucune', museau: '#FFFFFF', nez: '#F4A300', extra: 'bec', fond: '#E3F3F4' },
  { id: 'hibou', fr: 'Hibou', en: 'Owl', tete: '#8C6A4F', oreille: 'pointue', interieur: '#6B4E37', museau: '#E8D2B5', nez: '#F4A300', extra: 'grands-yeux', fond: '#F2EAD9' },
  { id: 'lion', fr: 'Lion', en: 'Lion', tete: '#E9B44C', oreille: 'ronde', interieur: '#C98B2E', museau: '#F8E2B0', nez: '#6B3F1D', extra: 'criniere', fond: '#FBF0D6' },
  { id: 'tigre', fr: 'Tigre', en: 'Tiger', tete: '#F08A24', oreille: 'ronde', interieur: '#FFFFFF', museau: '#FFFFFF', nez: '#E5484D', extra: 'rayures', fond: '#FDE8D3' },
  { id: 'grenouille', fr: 'Grenouille', en: 'Frog', tete: '#6CC24A', oreille: 'aucune', museau: '#9BDB7A', extra: 'yeux-hauts', fond: '#E5F5DC' },
  { id: 'licorne', fr: 'Licorne', en: 'Unicorn', tete: '#FFFFFF', oreille: 'pointue', interieur: '#F5B5C8', museau: '#FCE7F0', nez: '#F28BA8', extra: 'corne', fond: '#F3E8FB' },
  { id: 'dragon', fr: 'Dragon', en: 'Dragon', tete: '#3FB57A', oreille: 'cornes', museau: '#8FE0B4', nez: '#1F6B45', extra: 'ecailles', fond: '#DDF4E8' },
  { id: 'axolotl', fr: 'Axolotl', en: 'Axolotl', tete: '#F7A8C4', oreille: 'aucune', museau: '#FBD0DF', extra: 'branchies', fond: '#FDE9F1' },
  { id: 'raton', fr: 'Raton laveur', en: 'Raccoon', tete: '#9AA3AD', oreille: 'pointue', interieur: '#3B3F45', museau: '#FFFFFF', nez: '#2B2B2B', extra: 'masque', fond: '#E9ECEF' },
  { id: 'loup', fr: 'Loup', en: 'Wolf', tete: '#7C8794', oreille: 'pointue', interieur: '#4E5660', museau: '#DDE2E7', nez: '#2B2B2B', fond: '#E6EAEE' },
  { id: 'singe', fr: 'Singe', en: 'Monkey', tete: '#8B5E3C', oreille: 'ronde', interieur: '#F1CFA8', museau: '#F1CFA8', nez: '#5A3A22', extra: 'visage-singe', fond: '#F3E3D2' },
  { id: 'vache', fr: 'Vache', en: 'Cow', tete: '#FFFFFF', oreille: 'cornes', museau: '#F5B5C8', nez: '#C77A92', extra: 'taches-vache', fond: '#EEF5E6' },
  { id: 'cochon', fr: 'Cochon', en: 'Pig', tete: '#F7B6C2', oreille: 'pointue', interieur: '#F28BA8', museau: '#F28BA8', extra: 'groin', fond: '#FDE8EE' },
  { id: 'poussin', fr: 'Poussin', en: 'Chick', tete: '#FFD84D', oreille: 'aucune', nez: '#F08A24', extra: 'bec-houppe', fond: '#FFF6D1' },
  { id: 'requin', fr: 'Requin', en: 'Shark', tete: '#6E8CA8', oreille: 'aucune', museau: '#E8F0F7', extra: 'aileron-dents', fond: '#DDEBF5' },
  { id: 'paresseux', fr: 'Paresseux', en: 'Sloth', tete: '#A98B6D', oreille: 'aucune', museau: '#E8D7C3', nez: '#3B2A20', extra: 'masque-paresseux', fond: '#F1E9DE' },
  { id: 'alien', fr: 'Extraterrestre', en: 'Alien', tete: '#8FE07A', oreille: 'aucune', extra: 'antennes-alien', fond: '#E4F8DE' },
]

function Oreilles({ a }: { a: AnimalDef }) {
  const c = a.tete, i = a.interieur ?? a.tete
  switch (a.oreille) {
    case 'pointue': return <><path d="M22 40L28 8L48 30Z" fill={c} /><path d="M78 40L72 8L52 30Z" fill={c} /><path d="M28 34L31 17L42 30Z" fill={i} /><path d="M72 34L69 17L58 30Z" fill={i} /></>
    case 'ronde': return <><circle cx="24" cy="24" r="13" fill={c} /><circle cx="76" cy="24" r="13" fill={c} /><circle cx="24" cy="24" r="7" fill={i} /><circle cx="76" cy="24" r="7" fill={i} /></>
    case 'longue': return a.id === 'chien'
      ? <><ellipse cx="17" cy="50" rx="10" ry="22" fill={i} transform="rotate(15 17 50)" /><ellipse cx="83" cy="50" rx="10" ry="22" fill={i} transform="rotate(-15 83 50)" /></>
      : <><ellipse cx="38" cy="14" rx="8" ry="22" fill={c} /><ellipse cx="62" cy="14" rx="8" ry="22" fill={c} /><ellipse cx="38" cy="15" rx="4" ry="16" fill={i} /><ellipse cx="62" cy="15" rx="4" ry="16" fill={i} /></>
    case 'cornes': return a.id === 'dragon'
      ? <><path d="M30 30L22 6L40 24Z" fill="#F4D58D" /><path d="M70 30L78 6L60 24Z" fill="#F4D58D" /></>
      : <><path d="M28 28Q18 18 22 8Q30 20 36 24Z" fill="#E8D7B5" /><path d="M72 28Q82 18 78 8Q70 20 64 24Z" fill="#E8D7B5" /><ellipse cx="18" cy="40" rx="9" ry="5" fill={c} stroke="#ddd" /><ellipse cx="82" cy="40" rx="9" ry="5" fill={c} stroke="#ddd" /></>
    default: return null
  }
}

function Details({ a }: { a: AnimalDef }) {
  switch (a.extra) {
    case 'moustaches': return <g stroke="#7A4A2A" strokeWidth="1.6" strokeLinecap="round"><path d="M30 64h-14M30 68l-13 4M70 64h14M70 68l13 4" /></g>
    case 'tache': return <ellipse cx="66" cy="44" rx="9" ry="8" fill="#8C5A30" opacity=".7" />
    case 'joues-blanches': return <><path d="M20 58Q34 50 46 66Q30 78 20 58Z" fill="#fff" /><path d="M80 58Q66 50 54 66Q70 78 80 58Z" fill="#fff" /></>
    case 'yeux-panda': return <><ellipse cx="38" cy="50" rx="9" ry="11" fill="#2B2B2B" transform="rotate(-20 38 50)" /><ellipse cx="62" cy="50" rx="9" ry="11" fill="#2B2B2B" transform="rotate(20 62 50)" /></>
    case 'dents': return <rect x="46" y="72" width="8" height="7" rx="1.5" fill="#fff" stroke="#ddd" />
    case 'gros-nez': return <ellipse cx="50" cy="62" rx="9" ry="11" fill="#2F3437" />
    case 'bec': return <path d="M42 62L58 62L50 72Z" fill="#F4A300" />
    case 'grands-yeux': return <><circle cx="37" cy="50" r="12" fill="#fff" stroke="#E8D2B5" strokeWidth="3" /><circle cx="63" cy="50" r="12" fill="#fff" stroke="#E8D2B5" strokeWidth="3" /></>
    case 'criniere': return null
    case 'rayures': return <g fill="#2B2B2B"><path d="M50 22l-4 12h8z" /><path d="M22 46l12 3-12 4z" /><path d="M78 46l-12 3 12 4z" /><path d="M26 34l10 6-11 1z" /><path d="M74 34l-10 6 11 1z" /></g>
    case 'yeux-hauts': return <><circle cx="34" cy="32" r="11" fill={a.tete} /><circle cx="66" cy="32" r="11" fill={a.tete} /></>
    case 'corne': return <path d="M50 4L56 30H44Z" fill="url(#corne)" />
    case 'ecailles': return <g fill="#2E9A63" opacity=".6"><circle cx="40" cy="30" r="3" /><circle cx="50" cy="26" r="3" /><circle cx="60" cy="30" r="3" /></g>
    case 'branchies': return <g fill="#F06292"><path d="M18 40q-12-6-10-14q8 4 12 10z" /><path d="M16 52q-14 0-14-8q9 0 14 5z" /><path d="M82 40q12-6 10-14q-8 4-12 10z" /><path d="M84 52q14 0 14-8q-9 0-14 5z" /></g>
    case 'masque': return <path d="M18 48Q34 38 50 50Q66 38 82 48Q72 60 50 56Q28 60 18 48Z" fill="#3B3F45" />
    case 'visage-singe': return <path d="M30 48Q34 32 50 38Q66 32 70 48Q72 70 50 76Q28 70 30 48Z" fill="#F1CFA8" />
    case 'taches-vache': return <><ellipse cx="32" cy="38" rx="9" ry="7" fill="#2B2B2B" /><ellipse cx="70" cy="34" rx="6" ry="5" fill="#2B2B2B" /></>
    case 'groin': return <><ellipse cx="50" cy="64" rx="12" ry="8" fill="#F28BA8" /><circle cx="46" cy="64" r="2.2" fill="#B8566F" /><circle cx="54" cy="64" r="2.2" fill="#B8566F" /></>
    case 'bec-houppe': return <><path d="M50 14q-6 6 0 12q6-6 0-12z" fill="#FFC21A" /><path d="M42 60L58 60L50 70Z" fill="#F08A24" /></>
    case 'aileron-dents': return <><path d="M50 2L62 28H40Z" fill="#5A7894" /><path d="M36 70l4 5 4-5 4 5 4-5 4 5 4-5" fill="none" stroke="#fff" strokeWidth="2.5" /></>
    case 'masque-paresseux': return <><ellipse cx="38" cy="52" rx="10" ry="6" fill="#5A4636" transform="rotate(20 38 52)" /><ellipse cx="62" cy="52" rx="10" ry="6" fill="#5A4636" transform="rotate(-20 62 52)" /></>
    case 'antennes-alien': return <><path d="M38 24L30 6M62 24L70 6" stroke="#5BBF46" strokeWidth="3" /><circle cx="30" cy="6" r="4" fill="#FFD84D" /><circle cx="70" cy="6" r="4" fill="#FFD84D" /></>
    default: return null
  }
}

export default function Animal({ a, taille = 40, anime = false }: { a: AnimalDef; taille?: number; anime?: boolean }) {
  const id = useId().replace(/:/g, '')
  const yeuxHauts = a.extra === 'yeux-hauts'
  const grandsYeux = a.extra === 'grands-yeux'
  const alien = a.id === 'alien'
  return (
    <svg viewBox="0 0 100 100" width={taille} height={taille} aria-hidden="true" className={`animal animal-${a.id}${anime ? ' anime' : ''}`} style={{ background: a.fond }}>
      <defs>
        <radialGradient id={`f${id}`} cx=".5" cy=".3" r=".8"><stop offset="0" stopColor="#fff" stopOpacity=".85" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></radialGradient>
        <radialGradient id={`v${id}`} cx=".35" cy=".28" r=".8"><stop offset="0" stopColor="#fff" stopOpacity=".5" /><stop offset=".45" stopColor="#fff" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity=".14" /></radialGradient>
      </defs>
      <rect width="100" height="100" fill={`url(#f${id})`} />
      <g className="etoiles-perso" fill="#fff"><path d="M12 16l1.4 3 3 1.4-3 1.4-1.4 3-1.4-3-3-1.4 3-1.4z" /><path d="M88 22l1 2.2 2.2 1-2.2 1-1 2.2-1-2.2-2.2-1 2.2-1z" /></g>
      <g className="tete-animal">
      <defs><linearGradient id="corne" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFD84D" /><stop offset=".5" stopColor="#F28BA8" /><stop offset="1" stopColor="#8FD3F5" /></linearGradient></defs>
      {a.extra === 'criniere' && <circle cx="50" cy="54" r="40" fill="#C2701E" />}
      {(a.extra === 'branchies' || a.extra === 'aileron-dents' || a.extra === 'yeux-hauts' || a.extra === 'antennes-alien') && <Details a={a} />}
      <g className="oreilles"><Oreilles a={a} /></g>
      {alien ? <ellipse cx="50" cy="56" rx="30" ry="34" fill={a.tete} /> : <circle cx="50" cy="56" r="32" fill={a.tete} />}
      {alien ? <ellipse cx="50" cy="56" rx="30" ry="34" fill={`url(#v${id})`} /> : <circle cx="50" cy="56" r="32" fill={`url(#v${id})`} />}
      {a.extra !== 'branchies' && a.extra !== 'aileron-dents' && a.extra !== 'yeux-hauts' && a.extra !== 'antennes-alien' && a.extra !== 'groin' && a.extra !== 'bec-houppe' && <Details a={a} />}
      {a.museau && <ellipse cx="50" cy="68" rx="15" ry="11" fill={a.museau} />}
      {/* Yeux (avec reflet) */}
      {alien
        ? <><ellipse cx="38" cy="50" rx="9" ry="12" fill="#1E1E1E" transform="rotate(-25 38 50)" /><ellipse cx="62" cy="50" rx="9" ry="12" fill="#1E1E1E" transform="rotate(25 62 50)" /></>
        : <g className="yeux">
            <circle cx="38" cy={yeuxHauts ? 32 : 50} r={grandsYeux ? 7 : 4.5} fill="#1E1E1E" /><circle cx="62" cy={yeuxHauts ? 32 : 50} r={grandsYeux ? 7 : 4.5} fill="#1E1E1E" />
            <circle cx="39.5" cy={(yeuxHauts ? 32 : 50) - 1.5} r="1.5" fill="#fff" /><circle cx="63.5" cy={(yeuxHauts ? 32 : 50) - 1.5} r="1.5" fill="#fff" />
          </g>}
      {(a.extra === 'groin' || a.extra === 'bec-houppe') && <Details a={a} />}
      {a.nez && !['bec', 'bec-houppe', 'gros-nez'].includes(a.extra ?? '') && <ellipse cx="50" cy="63" rx="4.5" ry="3.2" fill={a.nez} />}
      {!['bec', 'bec-houppe', 'groin', 'aileron-dents'].includes(a.extra ?? '') && <path d="M44 72q6 5 12 0" fill="none" stroke="#5A3A2A" strokeWidth="2" strokeLinecap="round" />}
      <circle className="joue" cx="28" cy="66" r="4.5" fill="#F28BA8" opacity=".4" /><circle className="joue" cx="72" cy="66" r="4.5" fill="#F28BA8" opacity=".4" />
      </g>
    </svg>
  )
}
