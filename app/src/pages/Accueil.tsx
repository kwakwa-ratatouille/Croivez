import { calendrierActif, prochainCalendrier } from '../calendriers'
import { trouverSousTheme } from '../themes'
import { themeTournoi } from '../tournoi'
import SerieHebdo from '../components/SerieHebdo'
import { ETAPES, REGIONS } from '../aventure'
import { etatSaison } from '../saison'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { jour, niveau, useAuth } from '../auth'
import { usePrefs } from '../i18n'
import { FAMILLES, type Famille, type SousTheme } from '../themes'
import { defiDuJour } from '../quiz/defi'
import { accesQuiz } from '../progression'
import { Coche, ICONS, Icon, Piece } from '../components/ui'
import { etatDuJour, quetesDuJour, recupererQuete } from '../quetes'
import { infoRang, ptsEffectifs } from '../ligues'
import BlasonRang from '../components/BlasonRang'
import BandeauEvenement from '../components/BandeauEvenement'
import { monXpSemaine } from '../social'
import CarteCouverture from '../components/CarteCouverture'
import Avatar from '../components/Avatar'
import Defileur from '../components/Defileur'
import { pleuvoirPieces } from '../components/PluiePieces'

// Derniers quiz joués sur cet appareil (d'après la mémoire des questions), du plus récent au plus ancien
function quizRecents(): string[] {
  try {
    return Object.keys(localStorage)
      .filter((k) => k.startsWith('memoire:') && k !== 'memoire:mix')
      .map((k) => {
        const m = JSON.parse(localStorage.getItem(k) ?? '{}') as Record<string, [number, number]>
        return { s: k.slice(8), t: Math.max(0, ...Object.values(m).map((v) => v[0])) }
      })
      .sort((a, b) => b.t - a.t)
      .map((x) => x.s)
  } catch { return [] }
}

// Les nouveautés mises en avant (nouveaux thèmes)
const NOUVEAUTES = ['youtubeurs', 'emojis-films', 'idees-recues', 'logos-vrai', 'repliques', 'fruits', 'desserts', 'superheros', 'dinosaures', 'jeux-societe', 'dessins-animes', 'persos-univers', 'lieux-jeux', 'expressions', 'slogans', 'legumes', 'mineraux', 'phobies', 'gentiles', 'cris', 'sigles', 'epices']

function Rangee({ titre, sous, lien, children }: { titre: string; sous?: string; lien?: { to: string; label: string }; children: React.ReactNode }) {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <h2 className="t" style={{ fontSize: 21, fontWeight: 900 }}>{titre}</h2>
          {sous && <p style={{ fontSize: 13.5, color: 'var(--muted)' }}>{sous}</p>}
        </div>
        {lien && <Link to={lien.to} className="lien-voir">{lien.label}<Icon d={ICONS.arrowR} size={15} /></Link>}
      </div>
      <Defileur>{children}</Defileur>
    </section>
  )
}

export default function Accueil() {
  const { lang } = usePrefs()
  const fr = lang === 'fr'
  const { user, profile } = useAuth()
  const etatQuetes = etatDuJour(profile?.quetes)
  const today = new Date().toLocaleDateString('sv')
  const defi = defiDuJour(today)
  const m = profile?.maitrise ?? {}
  const [xpSemaine, setXpSemaine] = useState<number | null>(null)
  useEffect(() => { if (user) monXpSemaine(user.uid).then(setXpSemaine).catch(() => setXpSemaine(0)) }, [user, profile?.xp])
  const ptsRang = ptsEffectifs(profile?.ligue, jour())
  const rang = infoRang(ptsRang, lang)

  const tous = FAMILLES.flatMap((f) => f.subs.filter((s) => s.jouable).map((s) => ({ s, k: f.k })))
  const ouverts = tous.filter((x) => accesQuiz(x.s.id, profile))
  const recents = quizRecents().map((id) => ouverts.find((x) => x.s.id === id)).filter((x): x is { s: SousTheme; k: Famille } => !!x).slice(0, 10)
  const nouveautes = NOUVEAUTES.map((id) => tous.find((x) => x.s.id === id)).filter((x): x is { s: SousTheme; k: Famille } => !!x)
  // À découvrir : quiz ouverts jamais joués
  const decouvrir = ouverts.filter((x) => !(m[x.s.id] > 0) && !recents.some((r) => r.s.id === x.s.id) && !NOUVEAUTES.includes(x.s.id)).sort(() => Math.random() - 0.5).slice(0, 10)
  const queteFinies = quetesDuJour().filter((q) => etatQuetes.recues.includes(q.id)).length

  return (
    <>
      {/* En-tête : qui je suis, où j'en suis (série, pièces, niveau, ligue) */}
      <header className="accueil-tete rise">
        <Link to="/profil" style={{ display: 'flex' }}><Avatar pseudo={profile?.pseudo ?? '?'} avatar={profile?.avatar} cadre={profile?.cadre} taille={58} /></Link>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ color: 'var(--muted)', fontWeight: 600, fontSize: 14 }}>{fr ? 'Salut' : 'Hi'} 👋</p>
          <h1 className="t" style={{ fontSize: 28, fontWeight: 900, lineHeight: 1.1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile?.pseudo}</h1>
        </div>
        <div className="accueil-puces">
          <span className="puce" title={fr ? 'Série de jours' : 'Day streak'}><Icon d={ICONS.flame} size={17} style={{ color: '#E8742E' }} />{profile?.serie ?? 0}</span>
          <span className="puce">{fr ? 'Niv.' : 'Lv.'} {niveau(profile?.xp ?? 0)}</span>
        </div>
      </header>

      {/* Événement en cours (ou saison du mois) */}
      <div className="evt-compact"><BandeauEvenement /></div>

      {/* Le gros bouton : une partie aléatoire avec un mini-jeu surprise */}
      <Link to="/partie?jeu=mix&d=0&m=qcm" className="accueil-jouer rise">
        <span className="accueil-jouer-des" aria-hidden="true">🎲</span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span className="eyebrow" style={{ color: 'rgba(255,255,255,.85)' }}>{fr ? 'Partie rapide' : 'Quick game'}</span>
          <strong className="t" style={{ display: 'block', fontSize: 26, lineHeight: 1.1 }}>{fr ? 'Jouer au hasard' : 'Random game'}</strong>
          <span style={{ fontSize: 14, opacity: .92 }}>{fr ? 'Des thèmes mélangés et un mini-jeu surprise : vrai ou faux, photo floue, éclair…' : 'Mixed topics and a surprise mini-game.'}</span>
        </span>
        <span className="accueil-jouer-bouton"><Icon d={ICONS.arrowR} size={26} /></span>
      </Link>

      {/* Mode histoire : le grand voyage, mis en avant */}
      {(() => {
        const n = Math.min(profile?.aventure ?? 0, ETAPES.length - 1)
        const monde = REGIONS.find((r) => r.k === ETAPES[n]?.region)
        const fini = (profile?.aventure ?? 0) >= ETAPES.length
        return (
          <Link to="/aventure" className="bandeau-histoire rise">
            <span className="bandeau-histoire-deco" aria-hidden="true">🏡 🌲 🏔️ 🏛️ 🎬 🎤 🌊 🚀</span>
            <span className="bandeau-histoire-carte" aria-hidden="true">🗺️</span>
            <span className="bandeau-histoire-texte">
              <span className="eyebrow">{fr ? 'Mode histoire' : 'Story mode'}</span>
              <strong className="t">{fini ? (fr ? 'Tour du monde terminé !' : 'World tour complete!') : <>{monde?.emoji} {monde?.nom[lang]}</>}</strong>
              <small>{fini ? (fr ? 'Bravo, légende du voyage' : 'Well done') : (fr ? `Étape ${n + 1} sur ${ETAPES.length} · ${ETAPES[n]?.nom.fr}` : `Step ${n + 1} of ${ETAPES.length}`)}</small>
              <span className="bandeau-histoire-barre"><span style={{ width: `${((profile?.aventure ?? 0) / ETAPES.length) * 100}%` }} /></span>
            </span>
            <span className="bandeau-histoire-bouton">{fr ? 'Continuer' : 'Continue'}<Icon d={ICONS.arrowR} size={18} /></span>
          </Link>
        )
      })()}

      {/* Calendrier à cases (Avent, Pâques) : visible pendant la période et la semaine d'avant */}
      {(() => { const a = calendrierActif(); const pr = prochainCalendrier(); const j = Math.ceil((pr.date.getTime() - Date.now()) / 864e5); if (!a && j > 7) return null; const c = a ?? pr.c; return (
        <Link to="/calendrier" className="bandeau-tournoi rise" style={{ background: c.fond }}>
          <span className="bandeau-tournoi-coupe" aria-hidden="true">{c.emoji}</span>
          <span className="bandeau-tournoi-texte"><span className="eyebrow">{a ? (fr ? 'Case du jour à ouvrir' : 'Today’s box') : (fr ? `Dans ${j} jour${j > 1 ? 's' : ''}` : `In ${j} days`)}</span><strong className="t">{c.nom}</strong><small>{fr ? 'Un mini-quiz et un cadeau chaque jour' : 'A mini-quiz and a gift every day'}</small></span>
          <span className="bandeau-histoire-bouton">{fr ? 'Ouvrir' : 'Open'}<Icon d={ICONS.arrowR} size={18} /></span>
        </Link>) })()}

      {/* Tournoi de la semaine */}
      <Link to="/tournoi" className="bandeau-tournoi rise">
        <span className="bandeau-tournoi-coupe" aria-hidden="true">🏆</span>
        <span className="bandeau-tournoi-texte"><span className="eyebrow">{fr ? 'Tournoi de la semaine' : 'Weekly tournament'}</span><strong className="t">{trouverSousTheme(themeTournoi())?.sous.nom[lang] ?? ''}</strong><small>{fr ? 'Même quiz pour tous · 3 essais · jusqu’à 1 500 pièces' : 'Same quiz for all · 3 tries'}</small></span>
        <span className="bandeau-histoire-bouton">{fr ? 'Jouer' : 'Play'}<Icon d={ICONS.arrowR} size={18} /></span>
      </Link>

      {/* Aujourd'hui : quiz du jour et pass de saison */}
      <section className="accueil-objectifs">
        {profile?.defiJour === today
          ? <Link to="/jour" className="objectif" style={{ ['--k' as string]: 'var(--his)', ['--kt' as string]: 'var(--his-t)', ['--ki' as string]: 'var(--his-i)' }}><span className="objectif-emoji">🏅</span><span className="objectif-texte"><strong className="t">{fr ? 'Quiz du jour fait' : 'Daily quiz done'}</strong><small>{fr ? 'Vois ton rang et défie tes potes' : 'See your rank'}</small></span><span className="objectif-barre"><span style={{ width: '100%' }} /></span></Link>
          : <Link to={defi.url} className="objectif" style={{ ['--k' as string]: 'var(--his)', ['--kt' as string]: 'var(--his-t)', ['--ki' as string]: 'var(--his-i)' }}><span className="objectif-emoji">🏆</span><span className="objectif-texte"><strong className="t">{fr ? 'Quiz du jour' : 'Daily quiz'}</strong><small>{defi.titre[lang]} · XP ×2</small></span><span className="objectif-barre"><span style={{ width: '0%' }} /></span></Link>}
        <Link to="/saison" className="objectif" style={{ ['--k' as string]: 'var(--ani)', ['--kt' as string]: 'var(--ani-t)', ['--ki' as string]: 'var(--ani-i)' }}><span className="objectif-emoji">🎟️</span><span className="objectif-texte"><strong className="t">{fr ? 'Pass de saison' : 'Season pass'}</strong><small>{fr ? `Palier ${etatSaison(profile).palier} sur 20` : `Tier ${etatSaison(profile).palier} of 20`}</small></span><span className="objectif-barre"><span style={{ width: `${(etatSaison(profile).palier / 20) * 100}%` }} /></span></Link>
      </section>

      <SerieHebdo />

      {/* Modes rapides (Soirée et multijoueur sont dans Multi) */}
      <section className="accueil-modes compact">
        <Link to="/partie?jeu=express&d=0&m=qcm" className="mode-tuile" style={{ ['--k' as string]: 'var(--cine)', ['--kt' as string]: 'var(--cine-t)', ['--ki' as string]: 'var(--cine-i)' }}>
          <span className="mode-emoji">⚡</span><strong className="t">Express</strong><span>{fr ? 'Le max en 1 minute' : 'Most in 1 minute'}{profile?.records?.express ? ` · ${fr ? 'record' : 'best'} ${profile.records.express}` : ''}</span>
        </Link>
        <Link to="/partie?jeu=survie&d=0&m=qcm" className="mode-tuile" style={{ ['--k' as string]: 'var(--nat)', ['--kt' as string]: 'var(--nat-t)', ['--ki' as string]: 'var(--nat-i)' }}>
          <span className="mode-emoji">❤️</span><strong className="t">{fr ? 'Survie' : 'Survival'}</strong><span>{fr ? '3 vies, de plus en plus dur' : '3 lives, ever harder'}{profile?.records?.survie ? ` · ${fr ? 'record' : 'best'} ${profile.records.survie}` : ''}</span>
        </Link>
        <Link to="/cejour" className="mode-tuile" style={{ ['--k' as string]: 'var(--his)', ['--kt' as string]: 'var(--his-t)', ['--ki' as string]: 'var(--his-i)' }}>
          <span className="mode-emoji">📅</span><strong className="t">{fr ? 'Ce jour-là' : 'On this day'}</strong><span>{fr ? `L’histoire du ${new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}` : 'Today in history'}</span>
        </Link>
        <Link to="/frise" className="mode-tuile" style={{ ['--k' as string]: 'var(--brd)', ['--kt' as string]: 'var(--brd-t)', ['--ki' as string]: 'var(--brd-i)' }}>
          <span className="mode-emoji">🧭</span><strong className="t">{fr ? 'Frise' : 'Timeline'}</strong><span>{fr ? 'Remets l’histoire dans l’ordre' : 'Put history in order'}</span>
        </Link>
      </section>

      {/* Ma semaine : ligue, quêtes, révision, événement */}
      <section className="accueil-semaine">
        <Link to="/classements" className="card bloc-ligue" style={{ ['--lc' as string]: rang.rang.couleur }}>
          <BlasonRang pts={ptsRang} taille={50} />
          <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span className="eyebrow">{fr ? 'Ton rang' : 'Your rank'}{xpSemaine !== null ? ` · ${xpSemaine} XP ${fr ? 'cette semaine' : 'this week'}` : ''}</span>
            <strong className="t" style={{ fontSize: 20 }}>{rang.nom}</strong>
            <span style={{ fontSize: 13, color: 'var(--muted)' }}>{rang.suivant ? (fr ? `${ptsRang.toLocaleString('fr-FR')} pts · encore ${(rang.suivant - ptsRang).toLocaleString('fr-FR')} pour monter` : `${ptsRang} pts · ${rang.suivant - ptsRang} to go`) : (fr ? 'Rang ultime atteint !' : 'Top rank!')}</span>
            {rang.suivant && <span className="bar" style={{ height: 6 }}><span style={{ width: `${((ptsRang - rang.min) / (rang.suivant - rang.min)) * 100}%`, background: rang.rang.couleur }} /></span>}
          </span>
        </Link>

        <div className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="eyebrow">{fr ? 'Quêtes du jour' : 'Daily quests'}</span>
            <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--muted)' }}>{queteFinies}/{quetesDuJour().length}</span>
          </div>
          {quetesDuJour().map((qu) => {
            const v = etatQuetes.prog[qu.id] ?? 0
            const fini = v >= qu.objectif
            const recue = etatQuetes.recues.includes(qu.id)
            return (
              <div key={qu.id} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ flex: 1, fontWeight: 600, fontSize: 14, textDecoration: recue ? 'line-through' : 'none', color: recue ? 'var(--muted)' : 'var(--text)' }}>{qu.titre[lang]}</span>
                  {recue
                    ? <Coche size={18} anim={false} />
                    : fini
                      ? <button className="btn btn-p" style={{ minHeight: 34, padding: '0 10px', fontSize: 13, gap: 4 }} onClick={async () => { if (!user) return; await recupererQuete(user.uid, qu.id); pleuvoirPieces(qu.gain) }}><Piece size={14} />+{qu.gain}</button>
                      : <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 13, fontWeight: 700, color: 'var(--his-i)' }}><Piece size={14} />{qu.gain}</span>}
                </div>
                {!recue && <div className="bar" style={{ height: 6 }}><span style={{ width: `${(v / qu.objectif) * 100}%`, background: fini ? 'var(--ok)' : 'var(--his)' }} /></div>}
              </div>
            )
          })}
        </div>
      </section>

      {recents.length > 0 && (
        <Rangee titre={fr ? 'Reprendre' : 'Continue'}>
          {recents.map(({ s }) => <CarteCouverture key={s.id} id={s.id} pct={m[s.id] ?? 0} largeur={168} />)}
        </Rangee>
      )}
      <Rangee titre={fr ? 'Nouveaux thèmes ✨' : 'New topics ✨'} sous={fr ? 'Youtubeurs, films en émojis, faux logos, vrai ou faux…' : 'YouTubers, emoji films, fake logos…'}>
        {nouveautes.map(({ s }) => <CarteCouverture key={s.id} id={s.id} pct={m[s.id] ?? 0} largeur={168} verrou={!accesQuiz(s.id, profile)} />)}
      </Rangee>
      {decouvrir.length > 0 && (
        <Rangee titre={fr ? 'À découvrir' : 'Discover'} sous={fr ? 'Des quiz que tu n’as jamais lancés' : 'Quizzes you’ve never played'} lien={{ to: '/themes', label: fr ? 'Tous les thèmes' : 'All topics' }}>
          {decouvrir.map(({ s }) => <CarteCouverture key={s.id} id={s.id} pct={0} largeur={168} />)}
        </Rangee>
      )}

    </>
  )
}
