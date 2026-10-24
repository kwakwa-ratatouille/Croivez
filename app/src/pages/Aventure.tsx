import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth'
import { usePrefs } from '../i18n'
import { ETAPES, REGIONS, seuilEtape, urlEtape } from '../aventure'
import Avatar from '../components/Avatar'

// Décor de chaque région : dégradé de fond et éléments disséminés sur la carte
const DECOR: Record<string, { fond: string; deco: string[] }> = {
  depart: { fond: 'linear-gradient(180deg, #CFEFC1, #9ED89A)', deco: ['🏡', '🌳', '🐄', '🌻', '⛲'] },
  foret: { fond: 'linear-gradient(180deg, #7DBE7A, #3E7D4F)', deco: ['🌲', '🍄', '🦊', '🌲', '🦉'] },
  cite: { fond: 'linear-gradient(180deg, #F3DDB5, #E2B98A)', deco: ['🏛️', '🎨', '🗿', '🏰', '🎭'] },
  ocean: { fond: 'linear-gradient(180deg, #8ED3F0, #3A86C8)', deco: ['🐠', '🏝️', '🐙', '⛵', '🐋'] },
  espace: { fond: 'linear-gradient(180deg, #2B2560, #0E0B2A)', deco: ['🪐', '⭐', '🛰️', '🌙', '☄️'] },
  montagne: { fond: 'linear-gradient(180deg, #DDEBF7, #9DB6CC)', deco: ['🏔️', '🌋', '🦅', '🧀', '⛷️'] },
  studio: { fond: 'linear-gradient(180deg, #3B1F2B, #7A2E4A)', deco: ['🎬', '🍿', '🎥', '⭐', '🎞️'] },
  scene: { fond: 'linear-gradient(180deg, #1E1B4B, #6D28D9)', deco: ['🎤', '🎸', '🥁', '🎧', '🎶'] },
  arcade: { fond: 'linear-gradient(180deg, #0F172A, #312E81)', deco: ['🕹️', '👾', '🎮', '🏆', '💾'] },
  labo: { fond: 'linear-gradient(180deg, #CCFBF1, #5EEAD4)', deco: ['🧪', '🔬', '🧬', '⚗️', '🦖'] },
  arene: { fond: 'linear-gradient(180deg, #14532D, #22C55E)', deco: ['🏟️', '⚽', '🏅', '🏀', '🎾'] },
  temps: { fond: 'linear-gradient(180deg, #FDE68A, #B45309)', deco: ['⏳', '🏰', '📜', '⚔️', '👑'] },
  legendes: { fond: 'linear-gradient(180deg, #450A0A, #7C2D12)', deco: ['🐉', '📚', '🔥', '🏛️', '⚡'] },
}
// Région sans décor prévu : un décor neutre plutôt qu'un plantage
const DECOR_DEFAUT = { fond: 'linear-gradient(180deg, #E2E8F0, #94A3B8)', deco: ['⭐', '🗺️', '✨', '🧭', '⭐'] }
// Positions en zigzag (en % de la largeur) pour 8 étapes par région
const X = [22, 62, 80, 48, 18, 40, 75, 50]

export default function Aventure() {
  const { lang } = usePrefs()
  const fr = lang === 'fr'
  const { profile } = useAuth()
  const fait = profile?.aventure ?? 0

  // On arrive directement sur l'étape en cours
  useEffect(() => { document.querySelector('.carte-etape.actuelle')?.scrollIntoView({ block: 'center' }) }, [])

  let n = 0
  return (
    <div className="histoire">
      <header className="histoire-tete">
        <h1 className="t">🗺️ {fr ? 'Mode histoire' : 'Story mode'}</h1>
        <p>{fr ? `Un tour du monde en ${ETAPES.length} étapes. 7/10 pour avancer, 8/10 contre les boss 👑, 9/10 contre le boss ultime. Les 5 derniers mondes passent en Difficile puis Expert.` : `A world tour in ${ETAPES.length} steps.`}</p>
        <div className="bar" style={{ height: 8 }}><span style={{ width: `${(fait / ETAPES.length) * 100}%`, background: 'var(--esp)' }} /></div>
        <small>{Math.min(fait, ETAPES.length)} / {ETAPES.length} {fr ? 'étapes' : 'steps'}</small>
      </header>

      {REGIONS.map((r) => {
        const debut = n
        const d = DECOR[r.k] ?? DECOR_DEFAUT
        const verrouillee = fait < debut
        return (
          <section key={r.k} className={`carte-region${verrouillee ? ' fermee' : ''}`} style={{ background: d.fond, color: ['espace', 'foret', 'ocean', 'studio', 'scene', 'arcade', 'arene', 'legendes'].includes(r.k) ? '#fff' : '#2a2a2a' }}>
            <h2 className="t carte-region-titre">{r.emoji} {r.nom[lang]}</h2>
            {d.deco.map((e, i) => <span key={i} className="carte-deco" style={{ left: `${[6, 84, 40, 90, 8][i]}%`, top: `${[12, 22, 46, 70, 82][i]}%` }}>{e}</span>)}
            {/* Le chemin pointillé qui relie les étapes */}
            <svg className="carte-chemin" viewBox="0 0 100 870" preserveAspectRatio="none" aria-hidden="true">
              <path d={r.etapes.map((_, i) => `${i ? "L" : "M"} ${X[i]} ${110 + i * 92}`).join(' ')} />
            </svg>
            {r.etapes.map((x, i) => {
              const k = n++
              const etat = k < fait ? 'faite' : k === fait ? 'actuelle' : 'fermee'
              const style = { left: `${X[i]}%`, top: `${110 + i * 92}px` }
              const contenu = (
                <>
                  <span className={`carte-pastille${x.boss ? ' boss' : ''}`}>{etat === 'faite' ? '✓' : x.boss ? '👑' : k + 1}</span>
                  {etat === 'actuelle' && <span className="carte-moi"><Avatar pseudo={profile?.pseudo} avatar={profile?.avatar} cadre={profile?.cadre} taille={40} /></span>}
                  <span className="carte-libelle">{x.nom[lang]}{etat === 'actuelle' && <small>{fr ? `Jouer · ${seuilEtape(x)}/10` : `Play · ${seuilEtape(x)}/10`}</small>}</span>
                </>
              )
              return etat === 'fermee'
                ? <div key={k} className={`carte-etape ${etat}`} style={style}>{contenu}</div>
                : <Link key={k} to={urlEtape(k)} className={`carte-etape ${etat}`} style={style}>{contenu}</Link>
            })}
            {verrouillee && <div className="carte-voile">🔒 {fr ? 'Bats le boss précédent pour entrer' : 'Beat the previous boss to enter'}</div>}
          </section>
        )
      })}
      {fait >= ETAPES.length && <p className="t" style={{ textAlign: 'center', fontSize: 22, fontWeight: 900 }}>🏆 {fr ? 'Tour du monde terminé, bravo !' : 'World tour complete!'}</p>}
    </div>
  )
}
