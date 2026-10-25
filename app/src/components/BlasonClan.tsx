import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { lireClan, niveauClan, type Blason, type Clan } from '../clans'

// Blason de clan dessiné en SVG : forme, motif à deux couleurs, symbole ; il s'embellit avec le niveau
const FORMES: Record<Blason['forme'], string> = {
  ecu: 'M10 8h80v40c0 26-18 40-40 46C28 88 10 74 10 48Z',
  rond: 'M50 6a44 44 0 1 1 0 88a44 44 0 1 1 0-88Z',
  hexa: 'M50 5l39 22v46L50 95 11 73V27Z',
  pointe: 'M8 10h84l-6 44c-4 20-18 32-36 42C32 86 18 74 14 54Z',
  etoile: 'M50 4l11 25 27-4-17 21 17 21-27-4-11 25-11-25-27 4 17-21L12 25l27 4Z',
  couronne: 'M8 30l16 10 12-22 14 18 14-18 12 22 16-10-6 46c-4 14-20 20-36 20S18 90 14 76Z',
}
const SYMBOLES: Record<Blason['symbole'], string> = {
  etoile: 'M50 30l5.9 12 13.1 1.9-9.5 9.3 2.2 13.1L50 60.1l-11.7 6.2 2.2-13.1-9.5-9.3 13.1-1.9Z',
  couronne: 'M33 62l-3-24 11 9 9-14 9 14 11-9-3 24Z M33 65h34v5H33Z',
  eclair: 'M55 28 38 54h12l-5 20 18-28H51Z',
  flamme: 'M50 26c4 10 16 16 16 30a16 16 0 0 1-32 0c0-8 4-12 8-16 0 6 2 9 5 10-2-10 0-18 3-24Z',
  feuille: 'M66 32C40 32 32 46 34 66c20 2 34-6 32-34Z M34 66l20-20',
  coeur: 'M50 70 34 54a10 10 0 0 1 16-13 10 10 0 0 1 16 13Z',
  lune: 'M58 30a20 20 0 1 0 8 34 16 16 0 1 1-8-34Z',
  diamant: 'M38 36h24l8 10-20 26-20-26Z M30 46h40',
  epee: 'M50 26l4 6v26h-8V32Z M40 58h20v4H40Z M47 62h6v10h-6Z',
  livre: 'M30 36c8-3 14-2 20 2v32c-6-4-12-5-20-2Z M70 36c-8-3-14-2-20 2v32c6-4 12-5 20-2Z',
  oeil: 'M28 50c12-16 32-16 44 0-12 16-32 16-44 0Z M50 50m-7 0a7 7 0 1 0 14 0a7 7 0 1 0-14 0',
  aile: 'M34 64c0-20 12-34 34-36-4 6-6 10-6 14 4-2 8-2 10 0-6 2-9 5-10 9 3 0 6 1 8 3-8 4-18 8-36 10Z',
}

function Motif({ m, c2, id }: { m: Blason['motif']; c2: string; id: string }) {
  switch (m) {
    case 'bande': return <path d="M0 30L100 70V100L0 60Z" fill={c2} clipPath={`url(#${id})`} />
    case 'chevron': return <path d="M0 70 50 40 100 70V90L50 60 0 90Z" fill={c2} clipPath={`url(#${id})`} />
    case 'quartiers': return <g clipPath={`url(#${id})`} fill={c2}><rect x="50" y="0" width="50" height="50" /><rect x="0" y="50" width="50" height="50" /></g>
    case 'rayons': return <g clipPath={`url(#${id})`} fill={c2}>{Array.from({ length: 8 }, (_, i) => <path key={i} d="M50 50 L44 -10 L56 -10 Z" transform={`rotate(${i * 45} 50 50)`} />)}</g>
    case 'pal': return <rect x="36" y="0" width="28" height="100" fill={c2} clipPath={`url(#${id})`} />
    default: return null
  }
}

export default function BlasonClan({ b, niveau = 1, taille = 56 }: { b: Blason; niveau?: number; taille?: number }) {
  const id = `bl-${b.forme}-${b.motif}-${b.c1.slice(1)}-${b.c2.slice(1)}-${b.symbole}-${taille}`
  const clair = (b.c2 === '#F8FAFC' || b.c2 === '#FACC15') && b.motif === 'uni'
  return (
    <svg viewBox="0 0 100 100" width={taille} height={taille} className={`blason${niveau >= 5 ? ' blason-halo' : ''}${niveau >= 10 ? ' blason-anime' : ''}${niveau >= 15 ? ' blason-legende' : ''}`} aria-hidden="true">
      <defs>
        <clipPath id={id}><path d={FORMES[b.forme]} /></clipPath>
        <linearGradient id={`${id}-r`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff" stopOpacity=".45" /><stop offset=".5" stopColor="#fff" stopOpacity="0" /></linearGradient>
      </defs>
      <path d={FORMES[b.forme]} fill={b.c1} />
      <Motif m={b.motif} c2={b.c2} id={id} />
      <path d={SYMBOLES[b.symbole]} fill={clair ? '#111827' : '#fff'} stroke={clair ? 'none' : 'rgba(0,0,0,.35)'} strokeWidth="1.5" strokeLinejoin="round" className="blason-symbole" />
      <path d={FORMES[b.forme]} fill={`url(#${id}-r)`} />
      <path d={FORMES[b.forme]} fill="none" stroke={niveau >= 5 ? '#FACC15' : 'rgba(0,0,0,.25)'} strokeWidth={niveau >= 5 ? 4 : 3} />
    </svg>
  )
}

// Badge du clan d'un joueur (profil, fiche joueur) : blason, nom, niveau
export function BadgeClan({ code }: { code?: string }) {
  const [c, setC] = useState<Clan | null>(null)
  useEffect(() => { if (code) lireClan(code, false).then(setC).catch(() => setC(null)); else setC(null) }, [code])
  if (!c) return null
  return (
    <Link to="/clan" className="badge-clan" title={c.devise || c.nom}>
      <BlasonClan b={c.blason} niveau={niveauClan(c.xp)} taille={26} />
      <span>{c.nom}</span><small>niv. {niveauClan(c.xp)}</small>
    </Link>
  )
}
