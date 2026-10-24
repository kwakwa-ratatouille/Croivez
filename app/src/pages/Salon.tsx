import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import QRCode from 'qrcode'
import { enregistrerPartie, noterExploit, useAuth } from '../auth'
import { usePrefs } from '../i18n'
import { FAMILLES, trouverSousTheme } from '../themes'
import { natureQuiz, type Question, type SousThemeId } from '../quiz/engine'
import { infoMiniJeu } from '../quiz/formats'
import { profilsDe, type ProfilPublic } from '../social'
import {
  MAX_JOUEURS, MINI_JEUX_SALON, REVELATION_MS, avancerSalon, ecouterDecalage, ecouterSalon, inviterAuSalon, lancerSalon, lienRejoindre, majRegles,
  pointsSalon, questionsSalon, quitterSalon, rejoindreSalon, rejouerSalon, repondreSalon, type JoueurSalon, type ReglesSalon, type Salon as SalonT,
} from '../salon'
import { retourFin, retourReponse, retourTic } from '../retour'
import { Coche, Croix, ICONS, Icon, Logo, Wordmark } from '../components/ui'
import Avatar from '../components/Avatar'
import Img from '../components/Img'
import Extrait from '../components/Extrait'
import Chrono, { BarreChrono } from '../components/Chrono'
import LogoTruque, { type EffetLogo } from '../components/LogoTruque'
import { pseudoInvite } from './Rejoindre'

const MEDAILLES = ['#E3A72F', '#9AA3AD', '#C98B5A']
const LETTRES = ['A', 'B', 'C', 'D', 'E', 'F']
type Moi = { uid: string; pseudo: string; avatar?: string; cadre?: string }

export default function Salon() {
  const { code = '' } = useParams()
  const nav = useNavigate()
  const { lang } = usePrefs()
  const fr = lang === 'fr'
  const { user, profile } = useAuth()
  const uid = user!.uid
  const invite = !!user?.isAnonymous
  const moi = useMemo<Moi>(() => ({ uid, pseudo: profile?.pseudo ?? (pseudoInvite() || 'Invité'), avatar: profile?.avatar, cadre: profile?.cadre }), [uid, profile?.pseudo, profile?.avatar, profile?.cadre])
  const [salon, setSalon] = useState<SalonT | null | undefined>(undefined)
  const [erreur, setErreur] = useState('')
  const [decalage, setDecalage] = useState(0)
  const [maintenant, setMaintenant] = useState(Date.now())

  useEffect(() => ecouterSalon(code, setSalon), [code])
  useEffect(() => ecouterDecalage(setDecalage), [])
  useEffect(() => { const t = setInterval(() => setMaintenant(Date.now()), 100); return () => clearInterval(t) }, [])

  // Ouvert par un lien ou une invitation : on rejoint automatiquement (sauf l'écran télé, qui ne joue pas)
  const rejoint = useRef(false)
  useEffect(() => {
    if (!salon || rejoint.current || (!profile && !invite)) return
    rejoint.current = true
    if (salon.tv && salon.hote === uid) return
    if (salon.joueurs?.[uid] && !salon.joueurs[uid].parti) return
    rejoindreSalon(code, moi).then((r) => {
      if (r !== 'ok') setErreur(r === 'commence' ? (fr ? 'La partie a déjà commencé.' : 'The game has already started.') : r === 'plein' ? (fr ? `Salon complet (${MAX_JOUEURS} joueurs).` : 'Room is full.') : (fr ? 'Salon introuvable.' : 'Room not found.'))
    })
  }, [salon, uid, code, moi, profile, invite, fr])

  const sortie = invite ? `/rejoindre/${code}` : '/duels'
  if (salon === undefined) return <Centre><Logo width={72} /></Centre>
  if (salon === null || erreur) return (
    <Centre>
      <Croix size={48} />
      <h1 className="t" style={{ fontSize: 26, fontWeight: 900 }}>{erreur || (fr ? 'Ce salon n’existe pas.' : 'This room doesn’t exist.')}</h1>
      <Link className="btn btn-p" to={sortie}>{fr ? 'Retour' : 'Back'}</Link>
    </Centre>
  )

  const actifs = Object.entries(salon.joueurs ?? {}).filter(([, j]) => !j.parti)
  // L'hôte (en mode télé : l'écran), ou s'il est parti, le joueur arrivé en premier
  const hote = salon.tv ? salon.hote : salon.joueurs?.[salon.hote] && !salon.joueurs[salon.hote].parti ? salon.hote : [...actifs].sort((a, b) => a[1].rejoint - b[1].rejoint)[0]?.[0]
  const suisHote = hote === uid
  const ecranTv = !!salon.tv && suisHote
  const quitter = async () => { if (!ecranTv) await quitterSalon(code, uid); nav(sortie) }

  if (salon.etat === 'attente') return ecranTv
    ? <LobbyTv code={code} salon={salon} onQuitter={quitter} />
    : <Lobby code={code} salon={salon} suisHote={suisHote} hote={hote} onQuitter={quitter} moi={moi} />
  return <Jeu code={code} salon={salon} suisHote={suisHote} ecranTv={ecranTv} maintenant={maintenant + decalage} onQuitter={quitter} />
}

function Centre({ children }: { children: React.ReactNode }) {
  return <div className="partie" style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24, textAlign: 'center' }}>{children}</div>
}

// ——— Règles de la partie (modifiables par l'hôte, résumé pour les autres) ———
function Regles({ code, salon, modifiable }: { code: string; salon: SalonT; modifiable: boolean }) {
  const { lang } = usePrefs()
  const fr = lang === 'fr'
  const r = salon.regles
  const maj = (x: Partial<ReglesSalon>) => majRegles(code, { ...r, ...x })
  const quizPossibles = FAMILLES.map((f) => ({ f, subs: f.subs.filter((s) => s.jouable && natureQuiz(s.id) !== 'carte') }))
  const nomQuiz = r.s === 'mix' ? (fr ? 'Aléatoire, tous thèmes' : 'Random, all topics') : trouverSousTheme(r.s)?.sous.nom[lang] ?? r.s
  const diffs = [fr ? 'Facile' : 'Easy', fr ? 'Moyen' : 'Medium', fr ? 'Difficile' : 'Hard', 'Expert']
  if (!modifiable) return (
    <div className="salon-recap">
      <div><span>{fr ? 'Thème' : 'Topic'}</span><strong>{nomQuiz}</strong></div>
      <div><span>{fr ? 'Mini-jeu' : 'Mini-game'}</span><strong>{infoMiniJeu(r.mj)?.icone} {infoMiniJeu(r.mj)?.nom[lang]}</strong></div>
      <div><span>{fr ? 'Difficulté' : 'Difficulty'}</span><strong>{diffs[r.d - 1]}</strong></div>
      <div><span>{fr ? 'Questions' : 'Questions'}</span><strong>{r.n} · {r.secondes} s</strong></div>
    </div>
  )
  return (
    <>
      <label className="salon-champ"><span>{fr ? 'Thème' : 'Topic'}</span>
        <select className="input" value={r.s} onChange={(e) => maj({ s: e.target.value })}>
          <option value="mix">{fr ? '🎲 Aléatoire, tous thèmes' : '🎲 Random, all topics'}</option>
          {quizPossibles.map(({ f, subs }) => <optgroup key={f.k} label={f.nom[lang]}>{subs.map((s) => <option key={s.id} value={s.id}>{s.nom[lang]}</option>)}</optgroup>)}
        </select>
      </label>
      <div className="salon-champ"><span>{fr ? 'Mini-jeu' : 'Mini-game'}</span>
        <div className="salon-choix">{MINI_JEUX_SALON.map((v) => { const m = infoMiniJeu(v)!; return <button key={v} type="button" className="pill" aria-pressed={r.mj === v} onClick={() => maj({ mj: v, secondes: m.chrono ?? (r.secondes < 10 ? 15 : r.secondes) })}>{m.icone} {m.nom[lang]}</button> })}</div>
      </div>
      <div className="salon-champ"><span>{fr ? 'Difficulté' : 'Difficulty'}</span>
        <div className="salon-choix">{diffs.map((d, i) => <button key={d} type="button" className="pill" aria-pressed={r.d === i + 1} onClick={() => maj({ d: (i + 1) as 1 | 2 | 3 | 4 })}>{d}</button>)}</div>
      </div>
      <div className="salon-champ"><span>{fr ? 'Questions' : 'Questions'}</span>
        <div className="salon-choix">{[5, 10, 15, 20].map((n) => <button key={n} type="button" className="pill" aria-pressed={r.n === n} onClick={() => maj({ n })}>{n}</button>)}</div>
      </div>
      {!infoMiniJeu(r.mj)?.chrono && (
        <div className="salon-champ"><span>{fr ? 'Temps par question' : 'Time per question'}</span>
          <div className="salon-choix">{[10, 15, 20, 30].map((n) => <button key={n} type="button" className="pill" aria-pressed={r.secondes === n} onClick={() => maj({ secondes: n })}>{n} s</button>)}</div>
        </div>
      )}
    </>
  )
}

// ——— Salle d'attente (téléphones) : code à partager, joueurs, règles ———
function Lobby({ code, salon, suisHote, hote, onQuitter, moi }: { code: string; salon: SalonT; suisHote: boolean; hote?: string; onQuitter: () => void; moi: Moi }) {
  const { lang } = usePrefs()
  const fr = lang === 'fr'
  const { profile } = useAuth()
  const [amis, setAmis] = useState<ProfilPublic[]>([])
  const [invites, setInvites] = useState<string[]>([])
  const [copie, setCopie] = useState(false)
  useEffect(() => { profilsDe(profile?.amis ?? []).then(setAmis).catch(console.error) }, [profile?.amis])
  const joueurs = Object.entries(salon.joueurs ?? {}).filter(([, j]) => !j.parti).sort((a, b) => a[1].rejoint - b[1].rejoint)
  const partager = async () => {
    const texte = fr ? `Rejoins mon salon Croivez ! Code : ${code}` : `Join my Croivez room! Code: ${code}`
    try {
      if (navigator.share) await navigator.share({ title: 'Croivez', text: texte, url: lienRejoindre(code) })
      else { await navigator.clipboard.writeText(`${texte}\n${lienRejoindre(code)}`); setCopie(true); setTimeout(() => setCopie(false), 2000) }
    } catch { /* partage annulé */ }
  }

  return (
    <div className="partie salon" style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '28px 20px 48px', gap: 20 }}>
      <header style={{ width: '100%', maxWidth: 900, display: 'flex', alignItems: 'center', gap: 12 }}>
        <button className="btn btn-g" onClick={onQuitter} aria-label={fr ? 'Quitter le salon' : 'Leave room'} style={{ minHeight: 44, padding: '0 14px' }}><Icon d={ICONS.close} /></button>
        <h1 className="t" style={{ fontSize: 26, fontWeight: 900, flex: 1 }}>{salon.tv ? (fr ? 'Partie sur la télé' : 'TV game') : (fr ? 'Salon multijoueur' : 'Multiplayer room')}</h1>
      </header>

      {salon.tv ? (
        <section className="card salon-code rise">
          <span style={{ fontSize: 44 }} aria-hidden="true">📺</span>
          <strong className="t" style={{ fontSize: 22 }}>{fr ? `C’est bon, ${moi.pseudo} !` : `You’re in, ${moi.pseudo}!`}</strong>
          <p style={{ color: 'var(--muted)' }}>{fr ? 'Regarde la télé : la partie démarre bientôt. Tu répondras ici, sur ton téléphone.' : 'Watch the TV: you’ll answer here on your phone.'}</p>
        </section>
      ) : (
        <section className="card salon-code rise">
          <span className="eyebrow">{fr ? 'Code du salon' : 'Room code'}</span>
          <strong className="t salon-code-lettres">{code.split('').map((c, i) => <span key={i}>{c}</span>)}</strong>
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>{fr ? 'Tes amis tapent ce code dans Multi → Rejoindre un salon.' : 'Friends enter this code in Multi → Join a room.'}</p>
          <button className="btn btn-s" onClick={partager}><Icon d={ICONS.link} size={18} />{copie ? (fr ? 'Lien copié !' : 'Link copied!') : (fr ? 'Partager l’invitation' : 'Share invite')}</button>
        </section>
      )}

      <div className="salon-grille">
        <section className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <h2 className="t" style={{ fontSize: 19, fontWeight: 900 }}>{fr ? 'Joueurs' : 'Players'} · {joueurs.length}/{MAX_JOUEURS}</h2>
          <div className="salon-joueurs">
            {joueurs.map(([id, j]) => (
              <div key={id} className="salon-joueur rise">
                <Avatar pseudo={j.pseudo} avatar={j.avatar} cadre={j.cadre} taille={48} />
                <span>{j.pseudo}{id === moi.uid ? (fr ? ' (toi)' : ' (you)') : ''}</span>
                {id === hote && <span className="chip salon-hote">👑 {fr ? 'Hôte' : 'Host'}</span>}
              </div>
            ))}
          </div>
          {amis.length > 0 && !salon.tv && (
            <details className="repli" style={{ padding: 0 }}>
              <summary style={{ fontSize: 15 }}>{fr ? 'Inviter des amis' : 'Invite friends'}</summary>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {amis.filter((a) => !salon.joueurs?.[a.uid] || salon.joueurs[a.uid].parti).map((a) => (
                  <div key={a.uid} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Avatar pseudo={a.pseudo} avatar={a.avatar} cadre={a.cadre} taille={34} />
                    <span style={{ flex: 1, fontWeight: 700 }}>{a.pseudo}</span>
                    <button className="btn btn-s" style={{ minHeight: 38 }} disabled={invites.includes(a.uid)} onClick={async () => { await inviterAuSalon(code, moi, a.uid); setInvites((l) => [...l, a.uid]) }}>{invites.includes(a.uid) ? (fr ? 'Invité ✓' : 'Invited ✓') : (fr ? 'Inviter' : 'Invite')}</button>
                  </div>
                ))}
              </div>
            </details>
          )}
        </section>
        <section className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <h2 className="t" style={{ fontSize: 19, fontWeight: 900 }}>{fr ? 'Règles' : 'Rules'}{!suisHote && <span style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600 }}> · {fr ? 'choisies par l’hôte' : 'set by the host'}</span>}</h2>
          <Regles code={code} salon={salon} modifiable={suisHote} />
        </section>
      </div>

      {suisHote
        ? <button className="btn btn-p btn-lg salon-lancer" onClick={() => lancerSalon(code, salon)}>{joueurs.length < 2 ? (fr ? 'Lancer seul (en attendant)' : 'Start alone') : (fr ? `Lancer la partie · ${joueurs.length} joueurs` : `Start · ${joueurs.length} players`)}<Icon d={ICONS.arrowR} /></button>
        : <p className="attente" style={{ fontWeight: 800, color: 'var(--muted)' }}>{fr ? 'En attente du lancement…' : 'Waiting for the start…'}</p>}
    </div>
  )
}

// ——— Écran télé : grand QR code, joueurs qui arrivent, règles ———
function LobbyTv({ code, salon, onQuitter }: { code: string; salon: SalonT; onQuitter: () => void }) {
  const { lang } = usePrefs()
  const fr = lang === 'fr'
  const [qr, setQr] = useState('')
  useEffect(() => { QRCode.toDataURL(lienRejoindre(code), { width: 640, margin: 1, color: { dark: '#1d1b33', light: '#ffffff' } }).then(setQr).catch(console.error) }, [code])
  const joueurs = Object.entries(salon.joueurs ?? {}).filter(([, j]) => !j.parti).sort((a, b) => a[1].rejoint - b[1].rejoint)
  return (
    <div className="tv">
      <button className="btn tv-quitter" onClick={onQuitter} aria-label={fr ? 'Fermer' : 'Close'}><Icon d={ICONS.close} /></button>
      <div className="tv-lobby">
        <section className="tv-qr rise">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Logo width={54} /><Wordmark size={34} /></div>
          <h1 className="t">{fr ? 'Soirée quiz !' : 'Quiz night!'}</h1>
          <p>{fr ? 'Scanne avec ton téléphone pour jouer' : 'Scan with your phone to play'}</p>
          {qr ? <img src={qr} alt={fr ? 'QR code pour rejoindre' : 'QR code to join'} className="tv-qr-image" /> : <div className="tv-qr-image" />}
          <p className="tv-code">{fr ? 'ou code' : 'or code'} <strong className="t">{code}</strong></p>
        </section>
        <section className="tv-cote">
          <div className="tv-joueurs">
            <h2 className="t">{joueurs.length ? `${joueurs.length} ${fr ? (joueurs.length > 1 ? 'joueurs' : 'joueur') : 'players'}` : (fr ? 'En attente des joueurs…' : 'Waiting for players…')}</h2>
            <div className="tv-joueurs-liste">
              {joueurs.map(([id, j]) => (
                <div key={id} className="tv-joueur">
                  <Avatar pseudo={j.pseudo} avatar={j.avatar} cadre={j.cadre} taille={64} />
                  <span>{j.pseudo}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card tv-regles"><Regles code={code} salon={salon} modifiable /></div>
          <button className="btn btn-lg tv-lancer" disabled={!joueurs.length} onClick={() => lancerSalon(code, salon)}>{fr ? 'C’est parti !' : 'Let’s go!'}<Icon d={ICONS.arrowR} /></button>
        </section>
      </div>
    </div>
  )
}

// ——— Déroulement commun (télé et téléphones) : questions, chrono, révélation, passage à la suite ———
function useDeroulement(code: string, salon: SalonT, maintenant: number, suisHote: boolean) {
  const { lang } = usePrefs()
  const [questions, setQuestions] = useState<Question[] | null>(null)
  const r = salon.regles
  useEffect(() => { setQuestions(null); questionsSalon(r, salon.seed, lang).then(setQuestions) }, [salon.seed, r.s, r.n, r.d, r.mj, lang]) // eslint-disable-line react-hooks/exhaustive-deps
  const i = salon.etape?.q ?? 0
  const debut = salon.etape?.debut ?? maintenant
  const q = questions?.[i]
  const n = Math.min(r.n, questions?.length ?? r.n)
  const actifs = Object.entries(salon.joueurs ?? {}).filter(([, j]) => !j.parti)
  const restant = Math.max(0, r.secondes - (maintenant - debut) / 1000)
  const tousOntRepondu = actifs.length > 0 && actifs.every(([, j]) => j.r?.[i])
  const revele = !!q && (tousOntRepondu || restant <= 0)
  const classement = actifs.map(([id, j]) => ({ id, ...j })).sort((a, b) => b.score - a.score)

  // L'hôte passe à la suite après la révélation ; si l'hôte a disparu, n'importe qui le fait avec du retard
  useEffect(() => {
    if (!revele || salon.etat !== 'jeu') return
    const finQuestion = tousOntRepondu ? maintenant : debut + r.secondes * 1000
    const delai = suisHote ? REVELATION_MS : REVELATION_MS + 6000
    const t = setTimeout(() => avancerSalon(code, i, n, Date.now()).catch(console.error), Math.max(0, finQuestion + delai - maintenant))
    return () => clearTimeout(t)
  }, [revele, tousOntRepondu, suisHote, i, n, code, salon.etat]) // eslint-disable-line react-hooks/exhaustive-deps

  return { questions, i, debut, q, n, actifs, restant, tousOntRepondu, revele, classement, r }
}
type Classe = (JoueurSalon & { id: string })[]

function Podium({ classement }: { classement: Classe }) {
  const podium = classement.slice(0, 3)
  return (
    <div className="podium">
      {[1, 0, 2].map((p) => podium[p] && (
        <div key={podium[p].id} className={`podium-place place-${p + 1}`}>
          <Avatar pseudo={podium[p].pseudo} avatar={podium[p].avatar} cadre={podium[p].cadre} taille={p === 0 ? 72 : 56} />
          <strong>{podium[p].pseudo}</strong>
          <span className="t">{podium[p].score} pts</span>
          <div className="podium-marche" style={{ background: MEDAILLES[p] }}>{p + 1}</div>
        </div>
      ))}
    </div>
  )
}

function Jeu({ code, salon, suisHote, ecranTv, maintenant, onQuitter }: { code: string; salon: SalonT; suisHote: boolean; ecranTv: boolean; maintenant: number; onQuitter: () => void }) {
  const { lang } = usePrefs()
  const fr = lang === 'fr'
  const { user, profile } = useAuth()
  const uid = user!.uid
  const d = useDeroulement(code, salon, maintenant, suisHote)
  const { questions, i, debut, q, n, actifs, restant, revele, classement, r } = d
  const moiJ = salon.joueurs?.[uid]
  const maRep = moiJ?.r?.[i]
  const [choisie, setChoisie] = useState<string | null>(null)
  useEffect(() => setChoisie(null), [i])

  const repondre = (label: string | null) => {
    if (!q || maRep || !moiJ || revele) return
    const juste = label === q.reponse
    const ms = Math.max(0, maintenant - debut)
    setChoisie(label)
    retourReponse(juste)
    repondreSalon(code, uid, i, juste, ms, pointsSalon(juste, ms, r.secondes), moiJ.score ?? 0)
  }
  // Temps écoulé sans réponse : 0 point
  useEffect(() => { if (q && !maRep && moiJ && restant <= 0 && salon.etat === 'jeu') repondreSalon(code, uid, i, false, r.secondes * 1000, 0, moiJ.score ?? 0) }, [q, maRep, moiJ, restant, salon.etat, code, uid, i, r.secondes])
  const tic = useRef(0)
  useEffect(() => { const s = Math.ceil(restant); if ((ecranTv || !maRep) && !revele && s <= 5 && s > 0 && s !== tic.current) { tic.current = s; retourTic(s) } }, [restant, maRep, ecranTv, revele])

  const enregistre = useRef(false)
  useEffect(() => {
    if (salon.etat !== 'fini' || enregistre.current || !questions) return
    enregistre.current = true
    const rang = classement.findIndex((c) => c.id === uid)
    retourFin(ecranTv || rang === 0)
    if (ecranTv && profile) noterExploit(uid, 'tvHote').catch(console.error) // soirée télé animée
    if (!profile || !moiJ) return // invité ou écran télé : rien à enregistrer
    const resultats = questions.slice(0, n).map((qq, k) => ({ id: qq.id, juste: !!moiJ.r?.[k]?.j, s: qq.s ?? r.s }))
    const bonnes = resultats.filter((x) => x.juste).length
    enregistrerPartie(uid, profile, { sousTheme: (r.s === 'mix' ? 'mix' : r.s) as SousThemeId, xp: 20 + bonnes * 6 + (classement.length > 1 ? [50, 30, 15][rang] ?? 0 : 0), pieces: classement.length > 1 && rang === 0 ? 30 : 10, resultats, revision: true, sansRevision: true, multi: { mode: salon.tv ? 'tv' : 'salon', gagne: classement.length > 1 && rang === 0 }, miniJeu: r.mj }).catch(console.error)
  }, [salon.etat, profile, questions, moiJ, classement, uid, n, r.s, r.mj, ecranTv, salon.tv])

  // ——— Fin de partie ———
  if (salon.etat === 'fini') {
    const rang = classement.findIndex((c) => c.id === uid) + 1
    return (
      <div className={ecranTv ? 'tv tv-fin' : 'partie'} style={ecranTv ? undefined : { minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '36px 20px', gap: 22 }}>
        <h1 className="t" style={{ fontSize: ecranTv ? 56 : 34, fontWeight: 900, textAlign: 'center' }}>
          {ecranTv ? `🏆 ${classement[0]?.pseudo ?? ''} ${fr ? 'gagne !' : 'wins!'}` : rang === 1 ? (fr ? 'Tu gagnes ! 🏆' : 'You win! 🏆') : (fr ? `Tu finis ${rang}${rang === 1 ? 'er' : 'e'}` : `You finished #${rang}`)}
        </h1>
        <Podium classement={classement} />
        {classement.length > 3 && (
          <section className="card" style={{ width: '100%', maxWidth: 560, padding: 8 }}>
            {classement.slice(3).map((c, k) => <div key={c.id} className="ligne-classement"><span className="t rang" style={{ background: 'var(--surface2)', color: 'var(--muted)' }}>{k + 4}</span><Avatar pseudo={c.pseudo} avatar={c.avatar} cadre={c.cadre} taille={34} /><span style={{ flex: 1, fontWeight: 700 }}>{c.pseudo}</span><span className="t" style={{ fontWeight: 900 }}>{c.score} pts</span></div>)}
          </section>
        )}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          {suisHote && <button className={`btn btn-lg ${ecranTv ? 'tv-lancer' : 'btn-p'}`} onClick={() => rejouerSalon(code)}>{fr ? 'On rejoue !' : 'Play again!'}<Icon d={ICONS.review} /></button>}
          {!suisHote && <p style={{ color: 'var(--muted)', alignSelf: 'center' }}>{fr ? 'L’hôte peut relancer une partie.' : 'The host can start another game.'}</p>}
          <button className={`btn ${ecranTv ? 'tv-secondaire' : 'btn-g'}`} onClick={onQuitter}>{fr ? 'Quitter' : 'Leave'}</button>
        </div>
      </div>
    )
  }

  if (!questions || !q) return <Centre><Logo width={72} /><p style={{ color: 'var(--muted)' }}>{fr ? 'Préparation des questions…' : 'Preparing questions…'}</p></Centre>

  // ——— Écran télé : la question en grand, qui a répondu, puis la bonne réponse et le classement ———
  if (ecranTv) return (
    <div className="tv tv-jeu">
      <header className="tv-entete">
        <span className="t">{fr ? 'Question' : 'Question'} {i + 1} / {n}</span>
        <span className="tv-repondu">{actifs.filter(([, j]) => j.r?.[i]).length} / {actifs.length} {fr ? 'ont répondu' : 'answered'}</span>
        <Chrono restant={restant} total={r.secondes} actif={!revele} />
      </header>
      <BarreChrono restant={restant} total={r.secondes} actif={!revele} />
      <section key={i} className="tv-question rise">
        <h1 className="t">{q.enonce}</h1>
        {q.grand && <p className={`t enonce-grand${/^[^\p{L}\d]+$/u.test(q.grand) ? ' emojis' : ''}`}>{q.grand}</p>}
        {q.image && <Img src={q.image} alt="" className="tv-image" style={{ background: q.fondGris ? 'var(--fond-logo)' : undefined }} />}
        {q.audio && <Extrait id={q.audio} />}
        {q.format === 'vf' && <p className="t" style={{ fontSize: 36, fontWeight: 900 }}>{q.propose} ?</p>}
      </section>
      <div className="tv-options">
        {q.options.map((o, k) => (
          <div key={o.label} className={`tv-option tv-couleur-${k}${revele ? (o.label === q.reponse ? ' ok' : ' dim') : ''}`}>
            <span className="tv-lettre">{LETTRES[k]}</span>
            {o.image && (o.effet?.truc ? <LogoTruque src={o.image} effet={o.effet as EffetLogo} style={{ height: 110, aspectRatio: '3 / 2', borderRadius: 12, padding: 8, background: 'var(--fond-logo)' }} /> : <Img src={o.image} alt="" style={{ height: 90, objectFit: 'contain' }} />)}
            {(!q.imagesOnly || revele) && <span>{o.label}</span>}
            {revele && o.label === q.reponse && <Coche size={34} color="#fff" />}
          </div>
        ))}
      </div>
      <div className="tv-avatars">
        {actifs.map(([id, j]) => (
          <span key={id} className={`tv-avatar${j.r?.[i] ? ' a-repondu' : ''}${revele && j.r?.[i]?.j ? ' juste' : ''}`}>
            <Avatar pseudo={j.pseudo} avatar={j.avatar} cadre={j.cadre} taille={44} />
            <small>{j.pseudo}</small>
          </span>
        ))}
      </div>
      {revele && (
        <section className="tv-classement rise">
          {classement.slice(0, 5).map((c, k) => (
            <div key={c.id} className="tv-ligne">
              <span className="t" style={{ color: k < 3 ? MEDAILLES[k] : '#fff', width: 34 }}>{k + 1}</span>
              <Avatar pseudo={c.pseudo} avatar={c.avatar} cadre={c.cadre} taille={36} />
              <span style={{ flex: 1 }}>{c.pseudo}</span>
              {c.r?.[i]?.pts ? <span className="tv-plus">+{c.r[i].pts}</span> : null}
              <span className="t">{c.score}</span>
            </div>
          ))}
        </section>
      )}
    </div>
  )

  // ——— Téléphone d'un joueur ———
  const rang = classement.findIndex((c) => c.id === uid) + 1
  return (
    <div className="partie" style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 20px 48px', gap: 20 }}>
      <header style={{ width: '100%', maxWidth: 1040, display: 'flex', alignItems: 'center', gap: 14 }}>
        <button className="btn btn-g" onClick={onQuitter} aria-label={fr ? 'Quitter' : 'Leave'} style={{ minHeight: 44, padding: '0 14px' }}><Icon d={ICONS.close} /></button>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontWeight: 800 }}>{fr ? 'Question' : 'Question'} {i + 1} / {n}</span>
          <span style={{ fontSize: 13, color: 'var(--muted)' }}>{moiJ?.score ?? 0} pts · {rang > 0 ? `${rang}${rang === 1 ? (fr ? 'er' : 'st') : (fr ? 'e' : 'th')}` : ''} / {classement.length} · {actifs.filter(([, j]) => j.r?.[i]).length}/{actifs.length} {fr ? 'ont répondu' : 'answered'}</span>
        </div>
        <Chrono restant={restant} total={r.secondes} actif={!maRep && !revele} />
      </header>
      <BarreChrono restant={restant} total={r.secondes} actif={!maRep && !revele} />

      <section key={i} className="rise" style={{ width: '100%', maxWidth: 1040, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
        <h1 className="t" style={{ fontSize: 26, fontWeight: 900, textAlign: 'center', maxWidth: 760 }}>{q.enonce}</h1>
        {/* En mode télé, l'image et le texte en grand sont sur l'écran : le téléphone sert de manette */}
        {!salon.tv && q.grand && <p className={`t enonce-grand${/^[^\p{L}\d]+$/u.test(q.grand) ? ' emojis' : ''}`}>{q.grand}</p>}
        {!salon.tv && q.image && <Img src={q.image} alt="" style={{ height: 200, maxWidth: '100%', borderRadius: 18, border: '1px solid var(--line)', objectFit: 'contain', background: q.fondGris ? 'var(--fond-logo)' : 'var(--surface)' }} />}
        {!salon.tv && q.audio && <Extrait id={q.audio} />}
        {q.format === 'vf' && <p className="t" style={{ fontSize: 24, fontWeight: 900, textAlign: 'center' }}>{q.propose} ?</p>}
        <div style={{ width: '100%', display: 'grid', gridTemplateColumns: q.imagesOnly ? 'repeat(auto-fit, minmax(150px, 1fr))' : 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
          {q.options.map((o, k) => {
            const etat = revele ? (o.label === q.reponse ? 'ok' : choisie === o.label ? 'ko' : 'dim') : choisie === o.label ? 'choisie' : maRep ? 'dim' : 'idle'
            return (
              <button key={o.label} type="button" disabled={!!maRep || revele} onClick={() => repondre(o.label)} className={`option-salon ${etat}${salon.tv ? ` manette tv-couleur-${k}` : ''}`}>
                <span className="kbd">{LETTRES[k]}</span>
                {o.image && (o.effet?.truc ? <LogoTruque src={o.image} effet={o.effet as EffetLogo} style={{ width: '100%', aspectRatio: '3 / 2', borderRadius: 8, padding: 8, background: 'var(--fond-logo)' }} /> : <Img src={o.image} alt="" style={{ width: '100%', aspectRatio: '3 / 2', objectFit: 'contain', borderRadius: 8, padding: q.fondGris ? 8 : 0, background: q.fondGris ? 'var(--fond-logo)' : undefined }} />)}
                {(!q.imagesOnly || revele) && <span style={{ flex: 1 }}>{o.label}</span>}
                {etat === 'ok' && <Coche />}{etat === 'ko' && <Croix />}
              </button>
            )
          })}
        </div>
        {maRep && !revele && <p style={{ fontWeight: 700, color: 'var(--muted)' }}>{fr ? 'Réponse enregistrée, on attend les autres…' : 'Answer locked, waiting for others…'}</p>}
        {revele && (
          <section className="card rise salon-revele">
            <p style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 800, color: maRep?.j ? 'var(--ok-i)' : 'var(--ko-i)' }}>
              {maRep?.j ? <Coche size={24} /> : <Croix size={20} />}
              {maRep?.j ? (fr ? `Bien joué ! +${maRep.pts} pts` : `Nice! +${maRep.pts} pts`) : `${fr ? 'C’était' : 'It was'} ${q.vraie ?? q.reponse}`}
            </p>
            {classement.slice(0, 5).map((c, k) => (
              <div key={c.id} className="ligne-mini">
                <span className="t" style={{ width: 22, fontWeight: 900, color: k < 3 ? MEDAILLES[k] : 'var(--muted)' }}>{k + 1}</span>
                <Avatar pseudo={c.pseudo} avatar={c.avatar} cadre={c.cadre} taille={28} />
                <span style={{ flex: 1, fontWeight: c.id === uid ? 900 : 600 }}>{c.pseudo}</span>
                {c.r?.[i]?.pts ? <span style={{ color: 'var(--ok-i)', fontWeight: 800, fontSize: 13 }}>+{c.r[i].pts}</span> : null}
                <span className="t" style={{ fontWeight: 900, minWidth: 64, textAlign: 'right' }}>{c.score}</span>
              </div>
            ))}
          </section>
        )}
      </section>
    </div>
  )
}
