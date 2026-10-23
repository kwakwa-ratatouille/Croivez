import { useEffect, useState } from 'react'

export function Logo({ width = 42 }: { width?: number }) {
  return (
    <svg viewBox="0 0 116 72" width={width} aria-hidden="true">
      <path className="lx" d="M16 16 Q33 36 50 58 M50 16 Q32 37 16 58" style={{ strokeWidth: 14 }} />
      <path className="lv" d="M44 40 Q52 49 60 58 Q77 32 102 12" style={{ strokeWidth: 14 }} />
    </svg>
  )
}

export function Icon({ d, size = 22, style }: { d: string; size?: number; style?: React.CSSProperties }) {
  return <svg className="ic" viewBox="0 0 24 24" aria-hidden="true" style={{ width: size, height: size, ...style }}><path d={d} /></svg>
}

export const ICONS = {
  home: 'M3.5 10.5 12 3.5l8.5 7M5.5 9.5V20h13V9.5',
  themes: 'M5.5 3.5h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-3a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2ZM15.5 3.5h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-3a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2ZM5.5 13.5h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-3a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2ZM15.5 13.5h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-3a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2Z',
  review: 'M20 12a8 8 0 1 1-2.3-5.7M20 4v5h-5',
  duels: 'M4 8h12.5l-3.5-3.5M20 16H7.5l3.5 3.5',
  ranking: 'M3.5 20.5h17M10.5 5h3a1.5 1.5 0 0 1 1.5 1.5v14h-6v-14A1.5 1.5 0 0 1 10.5 5ZM5 10.5h2.5A1.5 1.5 0 0 1 9 12v8.5H3.5V12A1.5 1.5 0 0 1 5 10.5ZM16.5 13.5H19a1.5 1.5 0 0 1 1.5 1.5v5.5H15V15a1.5 1.5 0 0 1 1.5-1.5Z',
  profile: 'M12 4a4 4 0 1 1 0 8a4 4 0 1 1 0-8ZM4.5 20.5c1.4-3.8 4.2-5.7 7.5-5.7s6.1 1.9 7.5 5.7',
  settings: 'M12 9a3 3 0 1 1 0 6a3 3 0 1 1 0-6ZM12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1',
  flame: 'M12 3.5c.8 3.2 5 5.2 5 9.8a5 5 0 0 1-10 0c0-2.4 1.3-3.9 2.4-4.9.1 1.9 1 2.9 2 2.9-.3-2.8-.7-5.2.6-7.8Z',
  arrowR: 'M5 12h14M13 6l6 6-6 6',
  arrowL: 'M19 12H5M11 6l-6 6 6 6',
  close: 'M6 6l12 12M18 6 6 18',
  cloudOff: 'M3 3l18 18M8.5 8.6A5 5 0 0 0 7 18h10.5M20.5 15.5A4 4 0 0 0 17 10h-.5A6 6 0 0 0 10 6.2',
  timer: 'M12 7.5a6.5 6.5 0 1 1 0 13a6.5 6.5 0 1 1 0-13ZM12 11v3l2 1.5M9.5 3.5h5',
  sparkle: 'M12 3.5l1.8 5.2 5.2 1.8-5.2 1.8L12 17.5l-1.8-5.2L5 10.5l5.2-1.8ZM18.5 16l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7Z',
  link: 'M14 4.5h5.5V10M19.5 4.5 11 13M17 13.5v5a1.5 1.5 0 0 1-1.5 1.5h-10A1.5 1.5 0 0 1 4 18.5v-10A1.5 1.5 0 0 1 5.5 7h5',
  lock: 'M7 10.5V8a5 5 0 0 1 10 0v2.5M6 10.5h12a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1ZM12 14.5v2.5',
  bulb: 'M9 17.5h6M10 20.5h4M12 3.5a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V17h5v-.6c0-.8.4-1.5 1-2A6 6 0 0 0 12 3.5Z',
}

// Coche ✓ et croix ✗ du logo, utilisées pour le feedback de réponse
export function Coche({ size = 28, color = 'var(--ok-i)', anim = true }: { size?: number; color?: string; anim?: boolean }) {
  return <svg viewBox="0 0 48 44" width={size} aria-hidden="true"><path className={`lv ${anim ? 'draw' : ''}`} d="M6 24 Q11 31 16 38 Q27 18 43 5" style={{ strokeWidth: 8, stroke: color }} /></svg>
}
export function Croix({ size = 26, color = 'var(--ko-i)', anim = true }: { size?: number; color?: string; anim?: boolean }) {
  return <svg viewBox="0 0 44 44" width={size} className={anim ? 'sway' : ''} aria-hidden="true"><path className="lx" d="M8 8 Q22 22 36 36 M36 8 Q22 22 8 36" style={{ strokeWidth: 8, stroke: color }} /></svg>
}

// Pièce d'or douce (moutarde de la DA) et compteur de pièces
export function Piece({ size = 20 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" style={{ flex: 'none' }}>
      <circle cx="12" cy="12" r="10" fill="var(--his)" />
      <circle cx="12" cy="12" r="6.5" fill="none" stroke="var(--his-i)" strokeWidth="1.6" opacity=".6" />
      <path d="M10 9.5l2.5 5 2.5-5" fill="none" stroke="var(--his-i)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function Pieces({ n }: { n: number }) {
  return (
    <span className="chip" aria-label={`${n} pièces`} style={{ alignSelf: 'flex-start', background: 'var(--his-t)', color: 'var(--his-i)', gap: 6, fontSize: 14 }}>
      <Piece size={18} />{n}
    </span>
  )
}

export function useOnline() {
  const [online, setOnline] = useState(navigator.onLine)
  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [])
  return online
}

export function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)}
      style={{ width: 52, height: 30, borderRadius: 999, border: 0, padding: 3, cursor: 'pointer', background: on ? 'var(--geo)' : 'var(--line)', transition: 'background-color .2s ease-out', flex: 'none' }}>
      <span style={{ display: 'block', width: 24, height: 24, borderRadius: '50%', background: 'var(--surface)', boxShadow: '0 1px 3px rgba(0,0,0,.15)', transform: on ? 'translateX(22px)' : 'none', transition: 'transform .2s ease-out' }} />
    </button>
  )
}
