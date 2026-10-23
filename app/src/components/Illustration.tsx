import type { Famille } from '../themes'

// Illustrations des familles, dans le style de la DA : formes rondes, couleurs douces, traits arrondis.
// Couleurs : --{k} (vif doux), --{k}-t (fond), --{k}-i (encre), plus le crème de la surface.
const S = { fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }

function Scene({ k }: { k: Famille }) {
  const c = `var(--${k})`, i = `var(--${k}-i)`, s = 'var(--surface)'
  switch (k) {
    case 'geo': return (<>
      <circle cx="120" cy="92" r="58" fill={c} opacity=".9" />
      <path d="M78 70c14 6 22-4 34 2s8 20 22 18 18-14 30-6M70 104c16-4 20 10 36 8s20-16 38-8 14 12 22 8" stroke={s} strokeWidth="6" {...S} />
      <path d="M176 40c-12 0-20 9-20 20 0 15 20 33 20 33s20-18 20-33c0-11-8-20-20-20Z" fill="var(--lx)" />
      <circle cx="176" cy="60" r="7" fill={s} />
      <path d="M52 150h136" stroke={i} strokeWidth="5" opacity=".25" {...S} />
    </>)
    case 'cine': return (<>
      <rect x="62" y="62" width="116" height="78" rx="14" fill={c} />
      <path d="M62 84h116" stroke={s} strokeWidth="5" />
      <path d="M58 46l112-14 4 22-112 14Z" fill={i} />
      <path d="M80 44l10 18M106 40l10 18M132 37l10 18" stroke={s} strokeWidth="5" {...S} />
      <circle cx="96" cy="112" r="10" fill={s} /><circle cx="144" cy="112" r="10" fill={s} />
      <path d="M190 128l10-30M200 98c6 2 10 8 8 14" stroke="var(--lx)" strokeWidth="5" {...S} />
    </>)
    case 'mus': return (<>
      <circle cx="104" cy="96" r="54" fill={i} />
      <circle cx="104" cy="96" r="36" fill="none" stroke={c} strokeWidth="3" opacity=".6" />
      <circle cx="104" cy="96" r="14" fill={c} /><circle cx="104" cy="96" r="4" fill={s} />
      <path d="M170 48v58M170 48l26-8v52" stroke={c} strokeWidth="6" {...S} />
      <ellipse cx="162" cy="108" rx="11" ry="8" fill={c} /><ellipse cx="188" cy="100" rx="11" ry="8" fill={c} />
    </>)
    case 'nat': return (<>
      <path d="M70 150C70 92 102 52 170 48c0 64-40 102-100 102Z" fill={c} />
      <path d="M70 150c22-34 48-58 76-72" stroke={s} strokeWidth="6" {...S} />
      <path d="M150 112c8-12 22-14 30-6-6 10-20 14-30 6ZM150 112c-2-14 6-26 18-26 2 12-6 24-18 26Z" fill="var(--lx)" />
      <path d="M168 100l-18 12" stroke={i} strokeWidth="3" {...S} />
      <circle cx="58" cy="60" r="12" fill="var(--his)" opacity=".8" />
    </>)
    case 'sci': return (<>
      <circle cx="120" cy="96" r="12" fill={i} />
      <ellipse cx="120" cy="96" rx="58" ry="22" stroke={c} strokeWidth="6" fill="none" />
      <ellipse cx="120" cy="96" rx="58" ry="22" stroke={c} strokeWidth="6" fill="none" transform="rotate(60 120 96)" />
      <ellipse cx="120" cy="96" rx="58" ry="22" stroke={c} strokeWidth="6" fill="none" transform="rotate(-60 120 96)" />
      <circle cx="186" cy="48" r="14" fill="var(--lx)" /><path d="M168 54c12-6 26-10 38-10" stroke={i} strokeWidth="3" {...S} />
      <circle cx="56" cy="140" r="6" fill={c} /><circle cx="196" cy="140" r="4" fill={c} />
    </>)
    case 'his': return (<>
      <path d="M60 64l60-30 60 30Z" fill={i} />
      <rect x="66" y="64" width="108" height="10" rx="3" fill={c} />
      {[78, 104, 130, 156].map((x) => <rect key={x} x={x} y="78" width="12" height="56" rx="5" fill={c} />)}
      <rect x="58" y="136" width="124" height="12" rx="4" fill={i} />
      <rect x="182" y="70" width="34" height="44" rx="6" fill={s} stroke="var(--lx)" strokeWidth="4" />
      <circle cx="199" cy="86" r="7" fill="var(--lx)" /><path d="M188 108c3-8 19-8 22 0" stroke="var(--lx)" strokeWidth="4" {...S} />
    </>)
    case 'brd': return (<>
      <path d="M70 100V58h46l52 52-46 46Z" fill={c} />
      <circle cx="94" cy="80" r="8" fill={s} />
      <circle cx="176" cy="56" r="20" fill="var(--lx)" /><path d="M168 56l6 6 12-12" stroke={s} strokeWidth="5" {...S} />
      <rect x="150" y="120" width="44" height="28" rx="8" fill={i} />
    </>)
    case 'spo': return (<>
      <circle cx="98" cy="100" r="46" fill={s} stroke={i} strokeWidth="5" />
      <path d="M98 72l18 13-7 21H87l-7-21Z" fill={i} />
      <path d="M98 54v18M116 85l24-8M109 106l14 20M87 106l-14 20M80 85l-24-8" stroke={i} strokeWidth="4" {...S} />
      <path d="M160 52h40v16a20 20 0 0 1-40 0Z" fill="var(--his)" />
      <path d="M180 88v20M168 116h24" stroke="var(--his)" strokeWidth="6" {...S} />
      <path d="M160 58h-8a10 10 0 0 0 10 12M200 58h8a10 10 0 0 1-10 12" stroke="var(--his)" strokeWidth="4" {...S} />
    </>)
    case 'lit': return (<>
      <path d="M56 62c22-8 42-6 64 8v76c-22-14-42-16-64-8Z" fill={c} />
      <path d="M184 62c-22-8-42-6-64 8v76c22-14 42-16 64-8Z" fill={i} />
      <path d="M68 84c14-4 28-2 40 4M68 102c14-4 28-2 40 4M132 88c12-6 26-8 40-4M132 106c12-6 26-8 40-4" stroke={s} strokeWidth="4" opacity=".8" {...S} />
      <path d="M176 30h34a10 10 0 0 1 10 10v18a10 10 0 0 1-10 10h-18l-12 10v-10h-4a10 10 0 0 1-10-10V40a10 10 0 0 1 10-10Z" fill="var(--lx)" />
    </>)
    case 'jv': return (<>
      <path d="M78 70h84a32 32 0 0 1 32 32v12a22 22 0 0 1-40 12l-8-8H94l-8 8a22 22 0 0 1-40-12v-12a32 32 0 0 1 32-32Z" fill={c} />
      <path d="M82 92v24M70 104h24" stroke={s} strokeWidth="7" {...S} />
      <circle cx="150" cy="96" r="7" fill="var(--lx)" /><circle cx="166" cy="110" r="7" fill="var(--lv)" />
      {[[48, 40], [64, 40], [56, 52], [190, 44], [202, 56]].map(([x, y]) => <rect key={`${x}${y}`} x={x} y={y} width="10" height="10" rx="2" fill={i} opacity=".7" />)}
    </>)
    case 'lan': return (<>
      <path d="M56 50h80a12 12 0 0 1 12 12v40a12 12 0 0 1-12 12H90l-20 18v-18H56a12 12 0 0 1-12-12V62a12 12 0 0 1 12-12Z" fill={c} />
      <path d="M184 76h-60a12 12 0 0 0-12 12v32a12 12 0 0 0 12 12h40l18 16v-16h2a12 12 0 0 0 12-12V88a12 12 0 0 0-12-12Z" fill={i} />
      <text x="96" y="92" textAnchor="middle" fontFamily="Nunito, sans-serif" fontWeight="900" fontSize="28" fill={s}>Aa</text>
      <text x="154" y="114" textAnchor="middle" fontFamily="Nunito, sans-serif" fontWeight="900" fontSize="24" fill={s}>文</text>
    </>)
  }
}

// Fond doux en forme de galet + scène de la famille
export default function Illustration({ k, taille = 200, fond = true }: { k: Famille; taille?: number; fond?: boolean }) {
  return (
    <svg viewBox="0 0 240 180" width={taille} height={(taille * 180) / 240} aria-hidden="true" style={{ display: 'block', flex: 'none' }}>
      {fond && <path d="M128 14c58-6 104 30 96 82s-62 80-118 72S10 130 18 80 74 20 128 14Z" fill={`var(--${k}-t)`} />}
      <Scene k={k} />
    </svg>
  )
}
