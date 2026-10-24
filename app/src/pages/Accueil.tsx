import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { niveau, useAuth } from '../auth'
import { usePrefs } from '../i18n'
import { FAMILLES, type Famille, type SousTheme } from '../themes'
import { defiDuJour } from '../quiz/defi'
import { aReviser } from '../quiz/revision'
import { accesQuiz } from '../progression'
import { Coche, ICONS, Icon, Piece } from '../components/ui'
import { etatDuJour, quetesDuJour, recupererQuete } from '../quetes'
import { evenementDeLaSemaine, ligueDe, ligueSuivante } from '../meta'
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
  const evenement = evenementDeLaSemaine()
  const today = new Date().toLocaleDateString('sv')
  const defi = defiDuJour(today)
  const m = profile?.maitrise ?? {}
  const dues = aReviser(profile?.revision).length
  const [xpSemaine, setXpSemaine] = useState<number | null>(null)
  useEffect(() => { if (user) monXpSemaine(user.uid).then(setXpSemaine).catch(() => setXpSemaine(0)) }, [user, profile?.xp])
  const ligue = ligueDe(xpSemaine ?? 0)
  const suivante = ligueSuivante(xpSemaine ?? 0)

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

      {/* Les autres façons de jouer */}
      <section className="accueil-modes">
        <Link to="/duels" className="mode-tuile" style={{ ['--k' as string]: 'var(--pop)', ['--kt' as string]: 'var(--pop-t)', ['--ki' as string]: 'var(--pop-i)' }}>
          <span className="mode-emoji">👥</span><strong className="t">{fr ? 'Multijoueur' : 'Multiplayer'}</strong><span>{fr ? 'Salon entre amis, jusqu’à 20' : 'Rooms up to 20'}</span>
        </Link>
        <Link to="/partie?jeu=express&d=0&m=qcm" className="mode-tuile" style={{ ['--k' as string]: 'var(--cine)', ['--kt' as string]: 'var(--cine-t)', ['--ki' as string]: 'var(--cine-i)' }}>
          <span className="mode-emoji">⚡</span><strong className="t">Express</strong><span>{fr ? 'Le max en 1 minute' : 'Most in 1 minute'}{profile?.records?.express ? ` · ${fr ? 'record' : 'best'} ${profile.records.express}` : ''}</span>
        </Link>
        <Link to="/partie?jeu=survie&d=0&m=qcm" className="mode-tuile" style={{ ['--k' as string]: 'var(--nat)', ['--kt' as string]: 'var(--nat-t)', ['--ki' as string]: 'var(--nat-i)' }}>
          <span className="mode-emoji">❤️</span><strong className="t">{fr ? 'Survie' : 'Survival'}</strong><span>{fr ? '3 vies, de plus en plus dur' : '3 lives, ever harder'}{profile?.records?.survie ? ` · ${fr ? 'record' : 'best'} ${profile.records.survie}` : ''}</span>
        </Link>
        {profile?.defiJour === today
          ? <div className="mode-tuile" style={{ ['--k' as string]: 'var(--his)', ['--kt' as string]: 'var(--his-t)', ['--ki' as string]: 'var(--his-i)' }}><span className="mode-emoji">✅</span><strong className="t">{fr ? 'Défi réussi' : 'Challenge done'}</strong><span>{fr ? 'Reviens demain !' : 'Come back tomorrow!'}</span></div>
          : <Link to={defi.url} className="mode-tuile" style={{ ['--k' as string]: 'var(--his)', ['--kt' as string]: 'var(--his-t)', ['--ki' as string]: 'var(--his-i)' }}><span className="mode-emoji">🏆</span><strong className="t">{fr ? 'Défi du jour' : 'Daily challenge'}</strong><span>{defi.titre[lang]} · XP ×2</span></Link>}
      </section>

      {/* Ma semaine : ligue, quêtes, révision, événement */}
      <section className="accueil-semaine">
        <Link to="/classements" className="card bloc-ligue" style={{ ['--lc' as string]: ligue.couleur }}>
          <span className="ligue-blason" style={{ width: 52, height: 52 }}><Icon d={ICONS.sparkle} size={26} /></span>
          <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span className="eyebrow">{fr ? 'Ta ligue de la semaine' : 'Your weekly league'}</span>
            <strong className="t" style={{ fontSize: 20 }}>{fr ? 'Ligue' : 'League'} {ligue.nom[lang]}</strong>
            <span style={{ fontSize: 13, color: 'var(--muted)' }}>{xpSemaine === null ? '…' : suivante ? (fr ? `${xpSemaine} XP · encore ${suivante.min - xpSemaine} pour ${suivante.nom.fr}` : `${xpSemaine} XP · ${suivante.min - xpSemaine} to ${suivante.nom.en}`) : `${xpSemaine} XP · ${fr ? 'tout en haut !' : 'top league!'}`}</span>
            {suivante && xpSemaine !== null && <span className="bar" style={{ height: 6 }}><span style={{ width: `${((xpSemaine - ligue.min) / (suivante.min - ligue.min)) * 100}%`, background: suivante.couleur }} /></span>}
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

        <Link to={`/themes/${evenement.k}`} className="card bloc-evenement" style={{ background: `linear-gradient(135deg, var(--${evenement.k}-t), var(--surface))`, color: `var(--${evenement.k}-i)` }}>
          <span className="eyebrow" style={{ color: 'inherit' }}>{evenement.reel ? (fr ? 'Événement en cours' : 'Live event') : (fr ? 'Famille de la semaine' : 'Family of the week')}</span>
          <strong className="t" style={{ fontSize: 19 }}>{evenement.nom[lang]}</strong>
          <span style={{ fontWeight: 700, fontSize: 14 }}>XP {fr ? 'et pièces' : '& coins'} ×2{evenement.quiz ? (fr ? ` sur ${evenement.quiz.length} quiz` : ` on ${evenement.quiz.length} quizzes`) : ''}</span>
        </Link>

        {dues > 0 && (
          <Link to="/revision" className="card bloc-revision">
            <strong className="t" style={{ fontSize: 34 }}>{dues}</strong>
            <span style={{ fontWeight: 700 }}>{fr ? 'erreurs à revoir' : 'mistakes to review'}</span>
            <span style={{ fontSize: 13 }}>{fr ? 'Un petit tour en révision ?' : 'Quick review?'}</span>
          </Link>
        )}
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

      {/* Toutes les familles, d'un coup d'œil */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <h2 className="t" style={{ fontSize: 21, fontWeight: 900 }}>{fr ? 'Explorer' : 'Explore'}</h2>
        <div className="familles-puces">
          {FAMILLES.map((f) => (
            <Link key={f.k} to={`/themes/${f.k}`} className="famille-puce" style={{ ['--k' as string]: `var(--${f.k})`, ['--kt' as string]: `var(--${f.k}-t)`, ['--ki' as string]: `var(--${f.k}-i)` }}>
              <span className="famille-puce-icone"><Icon d={f.icon} size={18} /></span>{f.nom[lang]}
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}
