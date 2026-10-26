import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth'
import { usePrefs } from '../i18n'
import { ETAPES, FIN_MONDE, REGIONS, bossBattus, miniBattus, questionsEtape, seuilEtape, urlEtape } from '../aventure'
import { BOUTIQUE, possede } from '../meta'
import Avatar from '../components/Avatar'

// Décor de chaque région : dégradé de fond et éléments disséminés sur la carte (ils flottent doucement)
const DECOR: Record<string, { fond: string; deco: string[] }> = {
  depart: { fond: 'linear-gradient(180deg, #CFEFC1, #9ED89A)', deco: ['🏡', '🌳', '🐄', '🌻', '⛲', '🐔'] },
  foret: { fond: 'linear-gradient(180deg, #7DBE7A, #3E7D4F)', deco: ['🌲', '🍄', '🦊', '🌲', '🦉', '🦌'] },
  cite: { fond: 'linear-gradient(180deg, #F3DDB5, #E2B98A)', deco: ['🏛️', '🎨', '🗿', '🏰', '🎭', '🖼️'] },
  ocean: { fond: 'linear-gradient(180deg, #8ED3F0, #3A86C8)', deco: ['🐠', '🏝️', '🐙', '⛵', '🐋', '🦀'] },
  espace: { fond: 'linear-gradient(180deg, #2B2560, #0E0B2A)', deco: ['🪐', '⭐', '🛰️', '🌙', '☄️', '👽'] },
  montagne: { fond: 'linear-gradient(180deg, #DDEBF7, #9DB6CC)', deco: ['🏔️', '🌋', '🦅', '🧀', '⛷️', '❄️'] },
  studio: { fond: 'linear-gradient(180deg, #3B1F2B, #7A2E4A)', deco: ['🎬', '🍿', '🎥', '⭐', '🎞️', '🎭'] },
  scene: { fond: 'linear-gradient(180deg, #1E1B4B, #6D28D9)', deco: ['🎤', '🎸', '🥁', '🎧', '🎶', '🎹'] },
  arcade: { fond: 'linear-gradient(180deg, #0F172A, #312E81)', deco: ['🕹️', '👾', '🎮', '🏆', '💾', '🍄'] },
  labo: { fond: 'linear-gradient(180deg, #CCFBF1, #5EEAD4)', deco: ['🧪', '🔬', '🧬', '⚗️', '🦖', '💡'] },
  arene: { fond: 'linear-gradient(180deg, #14532D, #22C55E)', deco: ['🏟️', '⚽', '🏅', '🏀', '🎾', '🥇'] },
  temps: { fond: 'linear-gradient(180deg, #FDE68A, #B45309)', deco: ['⏳', '🏰', '📜', '⚔️', '👑', '🗝️'] },
  legendes: { fond: 'linear-gradient(180deg, #450A0A, #7C2D12)', deco: ['🐉', '📚', '🔥', '🏛️', '⚡', '🧙'] },
  toons: { fond: 'linear-gradient(180deg, #FBCFE8, #A78BFA)', deco: ['🎨', '🐭', '🦁', '🧞', '🏰', '🎈'] },
  festival: { fond: 'linear-gradient(180deg, #0B1026, #7E22CE 60%, #DB2777)', deco: ['🎧', '🎤', '🎆', '🎶', '🕺', '💃'] },
  curiosites: { fond: 'linear-gradient(180deg, #FEF3C7, #F59E0B)', deco: ['🌮', '🦒', '🗼', '🤪', '🧩', '🔍'] },
  multivers: { fond: 'radial-gradient(circle at 50% 85%, #7C3AED, #1E1B4B 45%, #05030F)', deco: ['🌌', '🪐', '✨', '☄️', '🌀', '🌠'] },
}
const SOMBRES = ['espace', 'foret', 'ocean', 'studio', 'scene', 'arcade', 'arene', 'legendes', 'festival', 'multivers']
// Région sans décor prévu : un décor neutre plutôt qu'un plantage
const DECOR_DEFAUT = { fond: 'linear-gradient(180deg, #E2E8F0, #94A3B8)', deco: ['⭐', '🗺️', '✨', '🧭', '⭐', '🗝️'] }
// Positions en zigzag (en % de la largeur) pour 8 étapes par région, et des éléments de décor
const X = [22, 62, 80, 48, 18, 40, 75, 50]
const DECO_POS: [number, number][] = [[7, 13], [88, 21], [36, 45], [92, 66], [7, 80], [62, 90]]
const ICONE = { mini: '⚔️', boss: '👑', ultime: '🌌' } as const

// Mode histoire : un vrai mode à part, 17 mondes, des mini-boss, des boss et l'Ultime, avec leurs récompenses uniques
export default function Aventure() {
  const { lang } = usePrefs()
  const fr = lang === 'fr'
  const { profile } = useAuth()
  const fait = Math.min(profile?.aventure ?? 0, ETAPES.length)

  // On arrive directement sur l'étape en cours
  useEffect(() => { document.querySelector('.carte-etape.actuelle')?.scrollIntoView({ block: 'center' }) }, [])

  const mondesFinis = REGIONS.filter((r) => fait >= FIN_MONDE[r.k]).length
  const nbMini = ETAPES.filter((x) => x.type === 'mini').length
  const nbBoss = ETAPES.filter((x) => x.boss).length
  const prochainBoss = ETAPES.findIndex((x, i) => i >= fait && x.boss)
  // Prochaine récompense unique : celle du monde en cours
  const regionEnCours = REGIONS.find((r) => fait < FIN_MONDE[r.k])
  const prochaine = regionEnCours ? BOUTIQUE.find((o) => o.monde === regionEnCours.k && !possede(profile, o)) : undefined

  let n = 0
  return (
    <div className="histoire">
      <header className="histoire-tete histoire-hero">
        <h1 className="t">🗺️ {fr ? 'Mode histoire' : 'Story mode'}</h1>
        <p>{fr ? `${REGIONS.length} mondes, ${ETAPES.length} étapes. 7/10 pour avancer, un mini-boss ⚔️ au milieu de chaque monde, un boss 👑 à la fin (8/10), et tout au bout l’Ultime 🌌 : 15 questions de tous les thèmes, 13/15 pour gagner.` : `${REGIONS.length} worlds, ${ETAPES.length} steps.`}</p>
        <div className="histoire-stats">
          <span>🌍 <strong>{mondesFinis}</strong>/{REGIONS.length}<small>{fr ? 'mondes' : 'worlds'}</small></span>
          <span>⚔️ <strong>{miniBattus(fait)}</strong>/{nbMini}<small>{fr ? 'mini-boss' : 'mini-bosses'}</small></span>
          <span>👑 <strong>{bossBattus(fait)}</strong>/{nbBoss}<small>{fr ? 'boss' : 'bosses'}</small></span>
        </div>
        <div className="bar" style={{ height: 10 }}><span style={{ width: `${(fait / ETAPES.length) * 100}%`, background: 'linear-gradient(90deg, #8E4FC4, #EC4899, #F59E0B)' }} /></div>
        <small>{fait} / {ETAPES.length} {fr ? 'étapes' : 'steps'}{prochainBoss >= 0 ? ` · ${fr ? 'prochain boss' : 'next boss'} : ${ETAPES[prochainBoss].nom[lang]} (${fr ? 'étape' : 'step'} ${prochainBoss + 1})` : ''}</small>
        {prochaine && <span className="histoire-prochaine">🎁 {fr ? 'À gagner dans ce monde' : 'Reward in this world'} : <strong>{prochaine.nom[lang]}</strong></span>}
      </header>

      {REGIONS.map((r, ir) => {
        const debut = n
        const d = DECOR[r.k] ?? DECOR_DEFAUT
        const verrouillee = fait < debut
        const faitsIci = Math.max(0, Math.min(r.etapes.length, fait - debut))
        const recompenses = BOUTIQUE.filter((o) => o.monde === r.k)
        return (
          <section key={r.k} className={`carte-region${verrouillee ? ' fermee' : ''}${r.k === 'multivers' ? ' finale' : ''}`} style={{ background: d.fond, color: SOMBRES.includes(r.k) ? '#fff' : '#2a2a2a' }}>
            <div className="carte-region-titre">
              <span className="t">{r.emoji} {r.nom[lang]}</span>
              <small>{fr ? `Monde ${ir + 1}` : `World ${ir + 1}`} · {faitsIci}/{r.etapes.length}</small>
            </div>
            {d.deco.map((e, i) => <span key={i} className="carte-deco" style={{ left: `${DECO_POS[i][0]}%`, top: `${DECO_POS[i][1]}%`, animationDelay: `${-i * 1.3}s` }}>{e}</span>)}
            {/* Le chemin pointillé qui relie les étapes */}
            <svg className="carte-chemin" viewBox="0 0 100 980" preserveAspectRatio="none" aria-hidden="true">
              <path d={r.etapes.map((_, i) => `${i ? 'L' : 'M'} ${X[i]} ${150 + i * 92}`).join(' ')} />
            </svg>
            {r.etapes.map((x, i) => {
              const k = n++
              const etat = k < fait ? 'faite' : k === fait ? 'actuelle' : 'fermee'
              const style = { left: `${X[i]}%`, top: `${150 + i * 92}px` }
              const t = x.type
              const contenu = (
                <>
                  {t && etat !== 'faite' && <span className={`carte-aura ${t}`} aria-hidden="true" />}
                  <span className={`carte-pastille${t ? ` ${t}` : ''}`}>{etat === 'faite' ? '✓' : t ? ICONE[t] : k + 1}</span>
                  {t && <span className={`carte-badge ${t}`}>{t === 'mini' ? 'MINI-BOSS' : t === 'ultime' ? (fr ? 'BOSS ULTIME' : 'ULTIMATE') : 'BOSS'}</span>}
                  {etat === 'actuelle' && <span className="carte-moi"><Avatar pseudo={profile?.pseudo} avatar={profile?.avatar} cadre={profile?.cadre} taille={40} /></span>}
                  <span className="carte-libelle">{x.nom[lang]}{etat === 'actuelle' && <small>{fr ? `Jouer · ${seuilEtape(x)}/${questionsEtape(x)}` : `Play · ${seuilEtape(x)}/${questionsEtape(x)}`}</small>}</span>
                </>
              )
              return etat === 'fermee'
                ? <div key={k} className={`carte-etape ${etat}${t ? ` etape-${t}` : ''}`} style={style}>{contenu}</div>
                : <Link key={k} to={urlEtape(k)} className={`carte-etape ${etat}${t ? ` etape-${t}` : ''}`} style={style}>{contenu}</Link>
            })}
            {/* Récompenses uniques du boss de ce monde */}
            {recompenses.length > 0 && (
              <div className="carte-recompenses">
                <span>🎁</span>
                {recompenses.map((o) => <span key={o.id} className={possede(profile, o) ? 'eue' : ''}>{possede(profile, o) ? '✓ ' : ''}{o.nom[lang]}</span>)}
              </div>
            )}
            {verrouillee && <div className="carte-voile">🔒 {fr ? 'Bats le boss précédent pour entrer' : 'Beat the previous boss to enter'}</div>}
          </section>
        )
      })}
      {fait >= ETAPES.length && <p className="t histoire-fin">🌌 {fr ? 'L’Ultime est tombé. Tu es maître·sse du multivers !' : 'The Ultimate has fallen!'}</p>}
    </div>
  )
}
