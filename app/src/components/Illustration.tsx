import type { Famille } from '../themes'

// Illustrations des familles, dans le style de la DA : formes rondes, couleurs douces, traits arrondis.
// Chaque scène est centrée sur (120, 90) et tient dans un carré de ~130 px du repère 240 × 180,
// pour que toutes les familles aient la même présence. Couleurs : --{k} (vif doux), --{k}-i (encre).
const S = { fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }

function Scene({ k }: { k: Famille }) {
  const c = `var(--${k})`, i = `var(--${k}-i)`, s = 'var(--surface)'
  switch (k) {
    case 'geo': return (<>
      <circle cx="112" cy="94" r="56" fill={c} />
      <ellipse cx="112" cy="94" rx="22" ry="56" stroke={s} strokeWidth="5" {...S} />
      <path d="M58 76h108M58 112h108M112 38v112" stroke={s} strokeWidth="5" {...S} />
      <path d="M168 34c-13 0-22 9-22 21 0 16 22 35 22 35s22-19 22-35c0-12-9-21-22-21Z" fill="var(--lx)" stroke={s} strokeWidth="4" />
      <circle cx="168" cy="55" r="7" fill={s} />
    </>)
    case 'cine': return (<>
      <rect x="62" y="74" width="116" height="76" rx="14" fill={c} />
      <path d="M62 52l112-16 4 26-112 16Z" fill={i} />
      <path d="M86 47l10 20M112 43l10 20M138 40l10 20" stroke={s} strokeWidth="6" {...S} />
      <path d="M62 96h116" stroke={s} strokeWidth="5" />
      <path d="M108 112v24l22-12Z" fill={s} />
    </>)
    case 'mus': return (<>
      <circle cx="102" cy="96" r="54" fill={i} />
      <circle cx="102" cy="96" r="38" stroke={c} strokeWidth="3" opacity=".5" fill="none" />
      <circle cx="102" cy="96" r="16" fill={c} />
      <circle cx="102" cy="96" r="4" fill={s} />
      <path d="M164 46v62M164 46l26-8v56" stroke={c} strokeWidth="7" {...S} />
      <ellipse cx="155" cy="110" rx="12" ry="9" fill={c} />
      <ellipse cx="181" cy="96" rx="12" ry="9" fill={c} />
    </>)
    case 'nat': return (<>
      <path d="M66 150C64 88 102 44 176 40c2 70-42 110-110 110Z" fill={c} />
      <path d="M68 148c26-38 54-64 88-82" stroke={s} strokeWidth="6" {...S} />
      <path d="M96 120c-8-8-20-8-26 0M118 98c-6-12-4-24 6-30M140 80c4-10 14-14 22-12" stroke={s} strokeWidth="4" {...S} />
    </>)
    case 'sci': return (<>
      <ellipse cx="120" cy="92" rx="62" ry="22" stroke={c} strokeWidth="6" fill="none" />
      <ellipse cx="120" cy="92" rx="62" ry="22" stroke={c} strokeWidth="6" fill="none" transform="rotate(60 120 92)" />
      <ellipse cx="120" cy="92" rx="62" ry="22" stroke={c} strokeWidth="6" fill="none" transform="rotate(-60 120 92)" />
      <circle cx="120" cy="92" r="13" fill={i} />
      <circle cx="182" cy="92" r="7" fill="var(--lx)" />
    </>)
    case 'his': return (<>
      <path d="M58 70l62-34 62 34Z" fill={i} />
      <rect x="64" y="70" width="112" height="11" rx="3" fill={c} />
      {[76, 102, 128, 154].map((x) => <rect key={x} x={x} y="86" width="12" height="52" rx="5" fill={c} />)}
      <rect x="56" y="140" width="128" height="12" rx="4" fill={i} />
    </>)
    case 'brd': return (<>
      <path d="M70 104V62h46l50 50-44 44Z" fill={c} />
      <circle cx="94" cy="84" r="9" fill={s} />
      <circle cx="166" cy="56" r="20" fill="var(--lx)" />
      <path d="M157 56l6 6 12-12" stroke={s} strokeWidth="5" {...S} />
    </>)
    case 'spo': return (<>
      {/* Ballon : pentagone central et coutures */}
      <clipPath id="ballon"><circle cx="104" cy="96" r="54" /></clipPath>
      <circle cx="104" cy="96" r="54" fill={s} />
      <g clipPath="url(#ballon)" fill={i}>
        <path d="M104 76l19 14-7 22H92l-7-22Z" />
        {[0, 72, 144, 216, 288].map((a) => <path key={a} d="M104 30l17 12-6 20H93l-6-20Z" transform={`rotate(${a} 104 96)`} />)}
      </g>
      <g clipPath="url(#ballon)" stroke={i} strokeWidth="3" {...S}>
        {[0, 72, 144, 216, 288].map((a) => <path key={a} d="M104 76V62" transform={`rotate(${a} 104 96)`} />)}
      </g>
      <circle cx="104" cy="96" r="54" stroke={i} strokeWidth="5" fill="none" />
      {/* Petite coupe */}
      <path d="M166 50h32v14a16 16 0 0 1-32 0Z" fill="var(--his)" />
      <path d="M182 80v14M172 100h20M166 56h-6a8 8 0 0 0 8 10M198 56h6a8 8 0 0 1-8 10" stroke="var(--his)" strokeWidth="5" {...S} />
    </>)
    case 'lit': return (<>
      <path d="M54 64c22-9 44-7 66 8v78c-22-15-44-17-66-8Z" fill={c} />
      <path d="M186 64c-22-9-44-7-66 8v78c22-15 44-17 66-8Z" fill={i} />
      <path d="M66 88c14-4 28-2 42 5M66 108c14-4 28-2 42 5M132 93c14-7 28-9 42-5M132 113c14-7 28-9 42-5" stroke={s} strokeWidth="4" opacity=".85" {...S} />
    </>)
    case 'jv': return (<>
      <path d="M78 64h84a34 34 0 0 1 34 34v14a24 24 0 0 1-43 14l-9-10H94l-9 10a24 24 0 0 1-43-14V98a34 34 0 0 1 36-34Z" fill={c} />
      <path d="M84 88v26M71 101h26" stroke={s} strokeWidth="7" {...S} />
      <circle cx="152" cy="94" r="8" fill="var(--lx)" />
      <circle cx="170" cy="108" r="8" fill="var(--lv)" />
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
