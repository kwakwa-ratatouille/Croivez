import { createPortal } from 'react-dom'
import { ETAPES, seuilEtape, urlEtape, validerEtape } from '../aventure'
import { publierScoreJour } from '../jour'
import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { enregistrerPartie, jour, useAuth } from '../auth'
import { usePrefs } from '../i18n'
import { trouverSousTheme } from '../themes'
import { calculerXp, distanceKm, genererMix, genererPartie, natureQuiz, type Difficulte, type Mode, type Question, type SousThemeId } from '../quiz/engine'
import { partagerDefi } from '../partage'
import { estCorrect, normaliser } from '../quiz/match'
import { appliquerFormat, appliquerMiniJeu, infoMiniJeu, tirerMiniJeu, type Format, type InfoMiniJeu, type MiniJeu } from '../quiz/formats'
import { memoriser } from '../quiz/memoire'
import { retourFin, retourReponse, retourTic } from '../retour'
import Chrono, { BarreChrono } from '../components/Chrono'
import LogoTruque, { type EffetLogo } from '../components/LogoTruque'
import { lirePrefsJeu } from '../prefsJeu'
import { saviezFaible, useResume } from '../quiz/resume'
import { BONUS_PREMIERE, PRIX_INDICE, accesQuiz, facteurXp, partiesDuJour, payerIndice, payerPieces, piecesGagnees, plafonner, reussie } from '../progression'
import { FAMILLES } from '../themes'
import { bonusEvenement } from '../meta'
import { Coche, Croix, ICONS, Icon, Logo, Piece } from '../components/ui'
import Extrait from '../components/Extrait'
import Img from '../components/Img'
import CarteQuiz, { type Clic } from '../components/CarteQuiz'
import Illustration from '../components/Illustration'
import ImageWiki from '../components/ImageWiki'
import type { Famille } from '../themes'

type Reponse = { q: Question; donnee: string; juste: boolean; clic?: Clic; km?: number; points?: number }

// Combo : bonnes réponses d'affilée → multiplicateur de points
const multiplicateur = (combo: number) => (combo >= 8 ? 3 : combo >= 5 ? 2 : combo >= 3 ? 1.5 : 1)
const PRIX_BONUS = 15

// Quitter une partie ramène d'où l'on vient : mode histoire, révision, quiz du jour, ou la famille du quiz
function retourVers(p: URLSearchParams) {
  if (p.get('aventure') !== null) return '/aventure'
  if (p.get('rev') === '1') return '/revision'
  if (p.get('defi') === '1') return '/jour'
  if (p.get('jeu')) return '/'
  const t = trouverSousTheme(p.get('s') ?? '')
  return t ? `/themes/${t.famille.k}` : '/'
}

export default function Partie() {
  const [params] = useSearchParams()
  const nav = useNavigate()
  const { t, lang } = usePrefs()
  const { user, profile } = useAuth()

  // Modes de jeu : quiz classique, ou Mix / Express (1 min) / Survie (3 vies) sur des thèmes variés
  const jeu = params.get('jeu') as 'mix' | 'express' | 'survie' | null
  const sousTheme = (params.get('s') ?? (jeu ? 'mix' : 'drapeaux')) as SousThemeId
  const format = (params.get('m') ?? 'qcm') as Format
  const mode: Mode = format === 'libre' ? 'libre' : 'qcm' // le moteur fait un QCM, transformé ensuite
  // Mini-jeu : imposé par le lien, ou tiré au hasard (partie aléatoire, format « surprise ») — le même pour toute la série
  const [mj, setMj] = useState<MiniJeu | null>(() => (params.get('mj') as MiniJeu | null) ?? (jeu === 'mix' ? tirerMiniJeu() : format === 'surprise' ? tirerMiniJeu(params.get('s') ?? undefined) : null))
  const infoMj = infoMiniJeu(mj)
  const [intro, setIntro] = useState(!!mj)
  const prefs = lirePrefsJeu()
  const nombre = Number(params.get('n') ?? prefs.n)
  const diffChoisie = Number(params.get('d') ?? 0) as Difficulte
  const legende = Number(params.get('d') ?? 0) === 5
  // Légende : chrono de 12 s imposé
  // Éclair et Pile ou face imposent leur propre chrono
  const chrono = legende ? 12 : infoMj?.chrono ?? Number(params.get('t') ?? 0)
  const defi = params.get('defi') === '1'
  const revision = params.get('rev') === '1'
  // Mode rapide : pas de fiche, question suivante automatique (toujours en Express et Survie)
  const rapide = params.get('r') === '1' || jeu === 'express' || jeu === 'survie' || !prefs.fiches
  const seed = defi ? Number(jour().replace(/-/g, '')) : undefined
  const difficulte = diffChoisie // 0 = tout mélangé
  const max = plafonner(4, profile, sousTheme) // difficulté la plus haute débloquée
  const k = trouverSousTheme(sousTheme)?.famille.k ?? (params.get('f') as Famille | null) ?? (jeu ? 'jv' : 'geo')
  const EXPRESS_MS = 60_000
  const [finExpress, setFinExpress] = useState(0)
  const [vies, setVies] = useState(3)

  const [questions, setQuestions] = useState<Question[] | null>(null)
  const [i, setI] = useState(0)
  const [reponses, setReponses] = useState<Reponse[]>([])
  const [saisie, setSaisie] = useState('')
  const [outils, setOutils] = useState(false)
  const [ficheOuverte, setFicheOuverte] = useState(false)
  const [restant, setRestant] = useState(chrono)
  const [combo, setCombo] = useState(0)
  const [comboMax, setComboMax] = useState(0)
  const debutQuestion = useRef(Date.now())
  const [double, setDouble] = useState(false) // bonus : prochaine bonne réponse ×2
  const [secondeChance, setSecondeChance] = useState<number | null>(null) // bonus : une erreur pardonnée sur cette question
  const [bonusMsg, setBonusMsg] = useState('')
  const [fini, setFini] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const debutTouche = useRef<{ x: number; y: number } | null>(null)
  const [indice, setIndice] = useState<{ i: number; masques?: string[]; lettre?: string } | null>(null)
  const [msgIndice, setMsgIndice] = useState('')

  const demarrer = useCallback((ids?: string[]) => {
    setQuestions(null)
    setI(0)
    setReponses([])
    setSaisie('')
    setRestant(chrono)
    setFini(false)
    setVies(3)
    if (jeu) {
      // Tous les quiz débloqués ; Survie monte en difficulté par blocs de 6 questions
      // f= : partie aléatoire limitée à une famille
      const tous = FAMILLES.filter((f) => !params.get('f') || f.k === params.get('f')).flatMap((f) => f.subs.filter((x) => x.jouable && accesQuiz(x.id, profile)).map((x) => x.jouable as SousThemeId))
      // Mini-jeu réservé à un type de quiz (photo floue, avant / après) : seulement les quiz compatibles
      const nature = infoMj?.nature
      const compatibles = nature ? tous.filter((s) => natureQuiz(s) === nature) : tous
      const quiz = compatibles.length >= 2 ? compatibles : tous
      const regle: MiniJeu | null = compatibles.length >= 2 ? mj : mj && 'qcm'
      if (regle !== mj) setMj(regle)
      const difficultes: Difficulte[] = jeu === 'survie'
        ? Array.from({ length: 36 }, (_, n) => Math.min(max, 1 + Math.floor(n / 6)) as Difficulte)
        : Array.from({ length: jeu === 'express' ? 40 : nombre }, () => difficulte)
      genererMix({ quiz, difficultes, lang, max }).then((qs) => { setQuestions(regle ? qs.map((x) => appliquerMiniJeu(x, regle, lang)) : qs); if (jeu === 'express') setFinExpress(Date.now() + EXPRESS_MS) })
      return
    }
    setCombo(0); setComboMax(0); setDouble(false); setSecondeChance(null)
    if (revision && sousTheme === ('tout' as SousThemeId) && ids) {
      const groupes = ids.reduce<Record<string, string[]>>((acc, c) => { const [s, ...r] = c.split('~'); (acc[s] ??= []).push(r.join('~')); return acc }, {})
      Promise.all(Object.entries(groupes).map(([s, l]) => genererPartie({ sousTheme: s as SousThemeId, difficulte: 4, max: 4, nombre: l.length, mode: s.startsWith('villes') ? 'libre' : 'qcm', lang, ids: l }).then((qs) => qs.map((q) => ({ ...q, s: s as SousThemeId }))).catch(() => [])))
        .then((t) => { setQuestions(t.flat().sort(() => Math.random() - 0.5).map((x) => appliquerFormat(x, format, 3, lang))); debutQuestion.current = Date.now() })
      return
    }
    // Question boss : une dernière question très dure (difficulté max débloquée) en partie classique
    const avecBoss = !ids && !defi && !revision && !legende
    genererPartie({ sousTheme, difficulte, max, nombre: avecBoss ? Math.max(1, nombre - 1) : nombre, mode, lang, ids, seed: ids ? undefined : seed }).then(async (qs) => {
      if (avecBoss) {
        const candidats = await genererPartie({ sousTheme, difficulte: max, max, nombre: 3, mode, lang }).catch(() => [])
        const boss = candidats.find((c) => !qs.some((x) => x.id === c.id))
        if (boss) qs = [...qs, { ...boss, boss: true }]
      }
      setQuestions(qs.map((x) => (mj ? appliquerMiniJeu(x, mj, lang) : appliquerFormat(x, format, difficulte, lang))))
      debutQuestion.current = Date.now()
    })
  }, [sousTheme, difficulte, max, nombre, mode, lang, chrono, seed, jeu, profile, mj, infoMj, format, defi, legende, revision])

  // Une partie est générée une seule fois, à l'ouverture
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => demarrer(params.get('ids')?.split(',')), [])

  const q = questions?.[i]
  useEffect(() => { setOutils(false); setFicheOuverte(false) }, [i])
  const courante = reponses[i] as Reponse | undefined

  const enregistrer = useCallback((r: Omit<Reponse, 'q'>) => {
    if (!q || reponses[i]) return
    // Seconde chance : la première erreur sur cette question est pardonnée (la mauvaise réponse est retirée)
    if (!r.juste && secondeChance === i && q.options.length) {
      setSecondeChance(null)
      setIndice((x) => ({ i, masques: [...(x?.i === i ? x.masques ?? [] : []), r.donnee] }))
      setBonusMsg(lang === 'fr' ? 'Seconde chance utilisée, réessayez !' : 'Second chance used, try again!')
      return
    }
    // Points : 100 + rapidité (jusqu'à +50 en moins de 3 s), × combo, × bonus « points ×2 »
    const nouveauCombo = r.juste ? combo + 1 : 0
    const secondes = (Date.now() - debutQuestion.current) / 1000
    const rapidite = Math.round(50 * Math.max(0, Math.min(1, (10 - secondes) / 7)))
    const points = r.juste ? Math.round((100 + rapidite) * multiplicateur(nouveauCombo) * (double ? 2 : 1)) : 0
    if (r.juste && double) setDouble(false)
    setCombo(nouveauCombo)
    setComboMax((m) => Math.max(m, nouveauCombo))
    setReponses((prev) => [...prev, { q, ...r, points }])
    retourReponse(r.juste)
    memoriser(q.s ?? sousTheme, q.id, r.juste) // ratée : reviendra ; réussie plusieurs fois : mise de côté un temps
    if (jeu === 'survie' && !r.juste) setVies((v) => v - 1)
  }, [q, i, reponses, sousTheme, jeu, combo, double, secondeChance, lang])

  const repondre = useCallback((donnee: string) => {
    if (!q) return
    const juste = !!donnee && (q.options.length ? donnee === q.reponse : estCorrect(donnee, q.acceptees))
    enregistrer({ donnee, juste })
  }, [q, enregistrer])

  const repondreCarte = useCallback((clic: Clic) => {
    if (!q?.carte) return
    if (q.carte.trouverPays) {
      enregistrer({ donnee: '', juste: clic.paysId === q.carte.trouverPays, clic })
    } else if (q.carte.cible) {
      const km = Math.round(distanceKm(clic.latlng, q.carte.cible))
      enregistrer({ donnee: `${km} km`, juste: km <= q.carte.seuilKm, clic, km })
    }
  }, [q, enregistrer])

  const suivant = useCallback(() => {
    if (!questions) return
    if (i + 1 >= questions.length || (jeu === 'survie' && vies <= 0)) { setFini(true); retourFin(reponses.filter((x) => x.juste).length >= questions.length / 2); return }
    setI(i + 1)
    debutQuestion.current = Date.now()
    setBonusMsg('')
    setSaisie('')
    setRestant(chrono)
  }, [i, questions, chrono, reponses, jeu, vies])

  // Chrono : à zéro, la question compte comme ratée
  const dernierTic = useRef(0)
  useEffect(() => {
    if (!chrono || courante || fini || !q || intro) return
    if (restant <= 0) { enregistrer({ donnee: '', juste: false }); return }
    // Tic sonore à chaque seconde des 5 dernières
    const s = Math.ceil(restant)
    if (s <= 5 && s !== dernierTic.current) { dernierTic.current = s; retourTic(s) }
    const id = setTimeout(() => setRestant((r) => r - 0.1), 100)
    return () => clearTimeout(id)
  }, [chrono, restant, courante, fini, q, enregistrer, intro])

  useEffect(() => { if (q && !q.options.length && !q.carte && !courante) inputRef.current?.focus() }, [q, courante])

  // Express : la partie s'arrête au bout d'une minute, où qu'on en soit
  useEffect(() => {
    if (jeu !== 'express' || !finExpress || fini) return
    const t = setTimeout(() => { setFini(true); retourFin(true) }, Math.max(0, finExpress - Date.now()))
    return () => clearTimeout(t)
  }, [jeu, finExpress, fini])
  const [, rafraichir] = useState(0)
  useEffect(() => { if (jeu !== 'express' || fini) return; const t = setInterval(() => rafraichir((x) => x + 1), 250); return () => clearInterval(t) }, [jeu, fini])

  // Mode rapide : on laisse juste le temps de voir ✓ ou ✗ (un peu plus en cas d'erreur, pour lire la bonne réponse)
  useEffect(() => {
    if (!rapide || !courante) return
    const t = setTimeout(suivant, courante.juste ? 650 : q?.carte ? 1800 : 1400)
    return () => clearTimeout(t)
  }, [rapide, courante, suivant, q])

  // Raccourcis : 1-4 pour répondre, Entrée pour passer à la suite
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!q || fini) return
      if (courante && e.key === 'Enter') { e.preventDefault(); suivant(); return }
      const n = Number(e.key)
      if (!courante && q.options.length && n >= 1 && n <= q.options.length) repondre(q.options[n - 1].label)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [q, courante, fini, repondre, suivant])

  const bonnes = reponses.filter((r) => r.juste).length
  const score = reponses.reduce((a, r) => a + (r.points ?? 0), 0)
  const bossReussi = reponses.some((r) => r.q.boss && r.juste)
  // Les questions sur carte valent autant que la saisie libre
  // Défi du jour : XP doublés
  // Question boss réussie : +30 pièces ; gros score : un peu d'XP en plus
  const pieces = (piecesGagnees(bonnes, questions?.length ?? 0, defi) * (legende ? 3 : 1) + (bossReussi ? 30 : 0)) * (jeu ? 1 : bonusEvenement(k, sousTheme))
  const xpBrut = (calculerXp(bonnes, q?.carte && !q.options.length ? 'libre' : mode, difficulte || 2) * (legende ? 3 : defi ? 2 : 1) + Math.round(score / 250)) * (jeu ? 1 : bonusEvenement(k, sousTheme))
  // XP dégressive : facteur figé au début de la partie (le profil change pendant l'enregistrement)
  const cleFarm = jeu ?? `${sousTheme}:${difficulte}`
  const dejaValide = !jeu && difficulte >= 1 && difficulte <= 4 && reussie(difficulte, profile, sousTheme)
  const facteurRef = useRef<{ f: number; n: number } | null>(null)
  if (!fini || !facteurRef.current) facteurRef.current = { f: facteurXp(profile, cleFarm, dejaValide), n: partiesDuJour(profile, cleFarm) }
  const premiere = !jeu && !revision && !dejaValide && difficulte >= 1 && difficulte <= 4 && !!questions && bonnes === questions.length
  const xp = Math.round(xpBrut * facteurRef.current.f) + (premiere ? BONUS_PREMIERE[difficulte] : 0)
  const enregistre = useRef(false)
  useEffect(() => {
    if (!fini || enregistre.current || !user || !profile || !questions) return
    enregistre.current = true
    // Mode aventure : l'étape est validée avec assez de bonnes réponses (7/10, boss 8/10)
    const etapeAventure = params.get('aventure')
    if (etapeAventure !== null && ETAPES[Number(etapeAventure)] && bonnes >= seuilEtape(ETAPES[Number(etapeAventure)])) validerEtape(user.uid, Number(etapeAventure), profile.aventure ?? 0).catch(console.error)
    if (defi) publierScoreJour(jour(), { uid: user.uid, pseudo: profile.pseudo, score, bonnes, total: reponses.length, grille: reponses.map((r) => (r.juste ? '🟩' : '🟥')).join(''), ...(profile.avatar ? { avatar: profile.avatar } : {}), ...(profile.cadre ? { cadre: profile.cadre } : {}) }).catch(console.error)
    enregistrerPartie(user.uid, profile, { sousTheme, xp, pieces, stats: { bonnes, comboMax, jeu: jeu ?? undefined, famille: k, difficulte },  defi, revision: revision || !!jeu, sansRevision: !!jeu, record: jeu && jeu !== 'mix' ? { jeu, score: bonnes } : undefined, difficulte: jeu ? undefined : difficulte, resultats: reponses.map((r) => ({ id: r.q.id, juste: r.juste, s: r.q.s ?? sousTheme })), bossReussi, difficulteJouee: difficulte, miniJeu: mj ?? undefined, cleFarm: revision ? undefined : cleFarm }).catch(console.error)
  }, [fini, user, profile, sousTheme, xp, pieces, defi, revision, reponses, questions])

  if (!questions) return <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}><Logo width={72} /></div>
  // Écran d'annonce du mini-jeu : on sait à quoi on joue avant que le chrono parte
  if (intro && infoMj && q) return <IntroMiniJeu info={infoMj} total={questions.length} onGo={() => { setIntro(false); setRestant(chrono); debutQuestion.current = Date.now() }} />
  if (!q) return <div style={{ padding: 48, textAlign: 'center' }}><p>{lang === 'fr' ? 'Aucune question disponible.' : 'No questions available.'}</p><Link className="btn btn-p" to="/">{t('res.home')}</Link></div>

  if (fini) return <Resultat reponses={reponses} xp={xp} pieces={pieces} score={score} comboMax={comboMax} k={k} reduit={revision ? null : { f: facteurRef.current!.f, n: facteurRef.current!.n, premiere, dejaValide }} onReplay={(ids) => {
    facteurRef.current = null
    enregistre.current = false
    const p = new URLSearchParams(params)
    if (ids) p.set('ids', ids.join(',')); else p.delete('ids')
    nav(`/partie?${p}`, { replace: true })
    demarrer(ids)
  }} />

  // Balayer vers la gauche (après avoir répondu) passe à la question suivante
  const toucher = (e: React.TouchEvent) => { debutTouche.current = { x: e.touches[0].clientX, y: e.touches[0].clientY } }
  const relacher = (e: React.TouchEvent) => {
    const d = debutTouche.current
    if (!d || !courante || q?.carte) return
    const dx = e.changedTouches[0].clientX - d.x
    const dy = e.changedTouches[0].clientY - d.y
    if (dx < -70 && Math.abs(dy) < 50) suivant()
  }

  async function acheterBonus(appliquer: () => void) {
    if (!user) return
    setBonusMsg('')
    if (!(await payerPieces(user.uid, PRIX_BONUS).catch(() => false))) { setBonusMsg(lang === 'fr' ? 'Pas assez de pièces.' : 'Not enough coins.'); return }
    appliquer()
  }

  // Indice : payé en pièces (transaction : refusé si le solde ne suffit pas)
  async function demanderIndice() {
    if (!user || !q) return
    setMsgIndice('')
    if (!(await payerIndice(user.uid).catch(() => false))) { setMsgIndice(lang === 'fr' ? 'Pas assez de pièces.' : 'Not enough coins.'); return }
    if (q.options.length) {
      const faux = q.options.map((o) => o.label).filter((l) => l !== q.reponse).sort(() => Math.random() - 0.5).slice(0, 2)
      setIndice({ i, masques: faux })
    } else {
      const r = q.reponse
      setIndice({ i, lettre: lang === 'fr' ? `Commence par « ${r[0]} », ${r.replace(/s/g, '').length} lettres` : `Starts with “${r[0]}”, ${r.replace(/s/g, '').length} letters` })
    }
  }

  const submit = (e: FormEvent) => { e.preventDefault(); if (saisie.trim()) repondre(saisie) }

  return (
    <div className="partie" onTouchStart={toucher} onTouchEnd={relacher} style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '28px 40px 48px', gap: 24 }}>
      <header style={{ width: '100%', maxWidth: 1040, display: 'flex', alignItems: 'center', gap: 20 }}>
        <Link to={retourVers(params)} className="btn btn-g" aria-label={t('q.quit')} style={{ minHeight: 44, padding: '0 14px' }}><Icon d={ICONS.close} /></Link>
        <div className="bar" style={{ flex: 1 }}><span style={{ width: `${((i + (courante ? 1 : 0)) / questions.length) * 100}%`, background: `var(--${k})` }} /></div>
        {jeu === 'express'
          ? <span className="t" style={{ fontWeight: 900, fontSize: 20, whiteSpace: 'nowrap', color: finExpress - Date.now() < 10_000 ? 'var(--ko-i)' : 'var(--text)' }}>{Math.max(0, Math.ceil((finExpress - Date.now()) / 1000))} s · {bonnes} ✓</span>
          : jeu === 'survie'
            ? <span style={{ fontWeight: 800, whiteSpace: 'nowrap', letterSpacing: 2, color: 'var(--ko-i)' }} aria-label={`${vies} vies`}>{'♥'.repeat(Math.max(0, vies))}<span style={{ opacity: .25 }}>{'♥'.repeat(Math.max(0, 3 - vies))}</span> · {bonnes}</span>
            : <span style={{ fontWeight: 600, color: 'var(--muted)', whiteSpace: 'nowrap' }}>{i + 1} {t('q.of')} {questions.length}</span>}
        <span className="puce puce-pieces" title={lang === 'fr' ? 'Tes pièces' : 'Your coins'}><Piece size={16} />{profile?.pieces ?? 0}</span>
        {chrono > 0 && <Chrono restant={restant} total={chrono} actif={!courante} />}
      </header>
      {chrono > 0 && <BarreChrono restant={restant} total={chrono} actif={!courante} />}
      {infoMj && <span className="chip mini-jeu-chip">{infoMj.icone} {infoMj.nom[lang]}</span>}

      <section key={i} className="rise" style={{ width: '100%', maxWidth: 1040, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
        {q.boss && <span className="chip boss rise">{lang === 'fr' ? 'Question boss · +30 pièces' : 'Boss question · +30 coins'}</span>}
        <h1 className="t" style={{ fontSize: 30, fontWeight: 900, textAlign: 'center', maxWidth: 760 }}>{q.enonce}</h1>
        {/* Émojis, réplique, slogan, expression… : en gros, c'est le cœur de la question */}
        {q.grand && <p className={`t enonce-grand${/^[^\p{L}\d]+$/u.test(q.grand) ? ' emojis' : ''}`}>{q.grand}</p>}
        <div className="jauge-combo" aria-label={`Score ${score}, combo ${combo}`}>
          <span className="t" style={{ fontWeight: 900 }}>{score.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-GB')} pts</span>
          {combo >= 2 && <span key={combo} className={`chip combo combo-${multiplicateur(combo) >= 3 ? 3 : multiplicateur(combo) >= 2 ? 2 : multiplicateur(combo) > 1 ? 1 : 0}`}>{combo} {lang === 'fr' ? 'd’affilée' : 'in a row'}{multiplicateur(combo) > 1 ? ` · ×${multiplicateur(combo)}` : ''}</span>}
          {double && <span className="chip" style={{ background: 'var(--mus-t)', color: 'var(--mus-i)' }}>{lang === 'fr' ? '×2 actif' : '×2 on'}</span>}
        </div>
        {q.image && (
          <Img src={q.image} alt="" className={`question-image${q.flou && !courante ? ' image-floue' : ''}`} style={{ height: 220, maxWidth: '100%', borderRadius: 18, boxShadow: 'var(--shadow)', border: '1px solid var(--line)', objectFit: 'contain', background: q.fondGris ? 'var(--fond-logo)' : 'var(--surface)', padding: q.fondGris ? 14 : 0 }} />
        )}
        {q.carte && <CarteQuiz carte={q.carte} clic={courante?.clic} repondu={!!courante} onClic={repondreCarte} />}
        {q.audio && <Extrait id={q.audio} />}

        {q.format === 'vf' && <p className="t" style={{ fontSize: 24, fontWeight: 900, textAlign: 'center' }}>{q.propose} ?{courante && !courante.juste && <span style={{ display: 'block', fontSize: 16, color: 'var(--ok-i)' }}>→ {q.vraie}</span>}</p>}
        {q.vraie && q.format !== 'vf' && courante && <p className="t" style={{ fontSize: 20, fontWeight: 900, color: courante.juste ? 'var(--ok-i)' : 'var(--ko-i)' }}>{lang === 'fr' ? 'C’était' : 'It was'} {q.vraie}</p>}
        {q.format === 'lettres' && !courante && <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>{q.lettres?.map((l, n) => <span key={n} className="kbd" style={{ fontSize: 18, minWidth: 34 }}>{l}</span>)}</div>}
        {q.options.length > 0 ? (
          <div className={`grille-reponses${q.imagesOnly ? ' images' : ''}${q.options.length > 4 ? ' six' : ''}`} style={{ width: '100%', display: 'grid', gridTemplateColumns: q.imagesOnly ? 'repeat(auto-fit, minmax(200px, 1fr))' : 'repeat(2, minmax(0, 1fr))', gap: 14 }}>
            {q.options.map((o, n) => {
              const estBonne = o.label === q.reponse
              const choisie = courante?.donnee === o.label
              const masque = indice?.i === i && indice.masques?.includes(o.label)
              const etat = !courante ? (masque ? 'dim' : 'idle') : estBonne ? 'ok' : choisie ? 'ko' : 'dim'
              return (
                <button key={o.label} type="button" onClick={() => repondre(o.label)} disabled={!!courante || masque}
                  aria-label={q.imagesOnly ? `Option ${n + 1}` : undefined}
                  style={{
                    display: 'flex', flexDirection: q.imagesOnly ? 'column' : 'row', alignItems: 'center', gap: 14, padding: q.imagesOnly ? 16 : '0 20px', minHeight: 72,
                    borderRadius: 20, cursor: courante ? 'default' : 'pointer', textAlign: 'left', font: "600 18px 'DM Sans', sans-serif", color: 'var(--text)',
                    background: etat === 'ok' ? 'var(--ok-t)' : etat === 'ko' ? 'var(--ko-t)' : 'var(--surface)',
                    border: `2px solid ${etat === 'ok' ? 'var(--ok)' : etat === 'ko' ? 'var(--ko)' : 'var(--line)'}`,
                    opacity: etat === 'dim' ? .55 : 1, transition: 'all .2s ease-out',
                  }}>
                  <span className="kbd" style={{ flex: 'none' }}>{n + 1}</span>
                  {o.image && (o.effet?.truc
                    ? <LogoTruque src={o.image} effet={o.effet as EffetLogo} style={{ width: '100%', aspectRatio: '3 / 2', borderRadius: 10, padding: 10, background: 'var(--fond-logo)' }} />
                    : <Img src={o.image} alt="" style={{ width: '100%', aspectRatio: '3 / 2', objectFit: 'contain', borderRadius: 10, padding: q.fondGris ? 10 : 0, background: q.fondGris ? 'var(--fond-logo)' : undefined }} />)}
                  {(!q.imagesOnly || courante) && <span style={{ flex: 1 }}>{o.label}</span>}
                  {etat === 'ok' && <Coche />}
                  {etat === 'ko' && <Croix />}
                </button>
              )
            })}
          </div>
        ) : !q.carte && (
          <form onSubmit={submit} style={{ width: '100%', maxWidth: 620, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <label htmlFor="rep" className="sr">{t('q.placeholder')}</label>
            <input id="rep" ref={inputRef} className="input" value={saisie} onChange={(e) => setSaisie(e.target.value)} disabled={!!courante} placeholder={t('q.placeholder')} autoComplete="off" spellCheck={false}
              style={{ flex: '1 1 260px', width: 'auto', fontSize: 20, minHeight: 64, borderColor: courante ? (courante.juste ? 'var(--ok)' : 'var(--ko)') : undefined }} />
            {q.format === 'assistee' && !courante && normaliser(saisie).length >= 2 && (
              <div style={{ flexBasis: '100%', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {[q.reponse, ...(q.leurres ?? [])].filter((l) => normaliser(l).includes(normaliser(saisie))).sort().slice(0, 5).map((l) => <button key={l} type="button" className="pill" onClick={() => repondre(l)}>{l}</button>)}
              </div>
            )}
            {!courante && <button className="btn btn-p" style={{ minHeight: 64 }}>{t('q.validate')}</button>}
            {!courante && <button type="button" className="btn btn-g" style={{ minHeight: 64 }} onClick={() => repondre('')}>{t('q.skip')}</button>}
          </form>
        )}

        {/* Bonus et indice : cachés dans un petit menu, pour laisser toute la place à la question */}
        {!courante && !legende && createPortal(
          <div className={`outils${outils ? ' ouvert' : ''}`}>
            {outils && (
              <div className="outils-menu rise" role="menu">
                {!q.carte && (indice?.i === i
                  ? indice.lettre && <span className="outils-info"><Icon d={ICONS.bulb} size={16} />{indice.lettre}</span>
                  : <button type="button" role="menuitem" onClick={() => { demanderIndice(); setOutils(false) }}><Icon d={ICONS.bulb} size={16} />{q.options.length ? (lang === 'fr' ? 'Indice 50/50' : '50/50 hint') : (lang === 'fr' ? 'Première lettre' : 'First letter')}<span><Piece size={14} />{PRIX_INDICE}</span></button>)}
                {prefs.bonus && <>
                  {chrono > 0 && <button type="button" role="menuitem" onClick={() => { acheterBonus(() => setRestant((r) => r + 10)); setOutils(false) }}>{lang === 'fr' ? '+10 secondes' : '+10 seconds'}<span><Piece size={14} />{PRIX_BONUS}</span></button>}
                  <button type="button" role="menuitem" onClick={() => { acheterBonus(() => enregistrer({ donnee: lang === 'fr' ? '(passée)' : '(skipped)', juste: true })); setOutils(false) }}>{lang === 'fr' ? 'Passer (comptée juste)' : 'Skip (counts as right)'}<span><Piece size={14} />{PRIX_BONUS}</span></button>
                  {q.options.length > 0 && secondeChance !== i && <button type="button" role="menuitem" onClick={() => { acheterBonus(() => setSecondeChance(i)); setOutils(false) }}>{lang === 'fr' ? 'Seconde chance' : 'Second chance'}<span><Piece size={14} />{PRIX_BONUS}</span></button>}
                  {!double && <button type="button" role="menuitem" onClick={() => { acheterBonus(() => setDouble(true)); setOutils(false) }}>{lang === 'fr' ? 'Points ×2' : 'Points ×2'}<span><Piece size={14} />{PRIX_BONUS}</span></button>}
                </>}
              </div>
            )}
            <button type="button" className="outils-bouton" aria-label={lang === 'fr' ? 'Indices et bonus' : 'Hints and boosts'} aria-expanded={outils} onClick={() => setOutils((o) => !o)}><Icon d={outils ? ICONS.close : ICONS.bulb} size={20} /></button>
          </div>, document.body
        )}
        {bonusMsg && <p role="status" style={{ fontSize: 14, fontWeight: 600, color: 'var(--mus-i)' }}>{bonusMsg}</p>}
        {indice?.i === i && indice.lettre && !courante && <p className="rise" style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, color: 'var(--his-i)' }}><Icon d={ICONS.bulb} size={20} />{indice.lettre}</p>}
        {msgIndice && !courante && <p role="status" style={{ fontSize: 14, color: 'var(--ko-i)' }}>{msgIndice}</p>}

        {courante && rapide && (
          <p className="rise" role="status" style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 800, fontSize: 20, color: courante.juste ? 'var(--ok-i)' : 'var(--ko-i)' }}>
            {courante.juste ? <Coche size={32} /> : <Croix size={28} />}
            {courante.juste ? t('q.right') : `${t('q.answerWas')} ${courante.q.reponse}`}
          </p>
        )}
        {courante && !rapide && ficheOuverte && createPortal(<div className="fiche-voile" onClick={() => setFicheOuverte(false)}><div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: 760 }}><Fiche r={courante} onNext={() => { setFicheOuverte(false); suivant() }} dernier={i + 1 >= questions.length} k={k} onFermer={() => setFicheOuverte(false)} /></div></div>, document.body)}
        {/* Après la réponse : le verdict, « ? » pour en savoir plus, et Suivant toujours sous le pouce */}
        {courante && !rapide && createPortal(
          <div className={`barre-verdict ${courante.juste ? 'juste' : 'faux'}`}>
            <span className="barre-verdict-texte">
              {courante.juste ? <Coche size={26} anim={false} /> : <Croix size={22} />}
              <span><strong>{courante.juste ? t('q.right') : t('q.wrong')}</strong>{!courante.juste && courante.km === undefined && <small>{t('q.answerWas')} {courante.q.reponse}</small>}{courante.km !== undefined && <small>{lang === 'fr' ? `à ${courante.km} km` : `${courante.km} km away`}</small>}</span>
            </span>
            <button type="button" className="btn barre-verdict-info" aria-label={lang === 'fr' ? 'En savoir plus' : 'Learn more'} onClick={() => setFicheOuverte(true)}>?</button>
            <button className="btn btn-p btn-lg barre-verdict-suivant" onClick={suivant} autoFocus>{i + 1 >= questions.length ? t('res.title') : t('q.next')}<Icon d={ICONS.arrowR} /></button>
          </div>, document.body
        )}
      </section>
    </div>
  )
}

function IntroMiniJeu({ info, total, onGo }: { info: InfoMiniJeu; total: number; onGo: () => void }) {
  const { lang } = usePrefs()
  const fr = lang === 'fr'
  return (
    <div className="partie" style={{ minHeight: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <section className="card intro-mj rise">
        <span className="eyebrow">{fr ? 'Mini-jeu de la série' : 'This round’s mini-game'}</span>
        <span className="intro-mj-icone" aria-hidden="true">{info.icone}</span>
        <h1 className="t" style={{ fontSize: 34, fontWeight: 900 }}>{info.nom[lang]}</h1>
        <p style={{ fontSize: 17, color: 'var(--muted)', maxWidth: 420 }}>{info.desc[lang]}</p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
          <span className="chip" style={{ background: 'var(--surface2)' }}>{total} questions</span>
          {info.chrono && <span className="chip" style={{ background: 'var(--ko-t)', color: 'var(--ko-i)' }}>⏱ {info.chrono} s</span>}
        </div>
        <button className="btn btn-p btn-lg" onClick={onGo} autoFocus style={{ minWidth: 220 }}>{fr ? 'C’est parti !' : 'Let’s go!'}<Icon d={ICONS.arrowR} /></button>
      </section>
    </div>
  )
}

function Fiche({ r, onNext, dernier, k, onFermer }: { r: Reponse; onNext: () => void; dernier: boolean; k: string; onFermer?: () => void }) {
  const { t, lang } = usePrefs()
  const f = r.q.fiche
  const seuil = r.q.carte?.seuilKm
  // Anecdote trop pauvre (juste le nom) : résumé de l'article Wikipédia à la place
  const faible = saviezFaible(f.saviez, r.q.reponse)
  const resume = useResume(f.wiki, faible)
  const saviez = faible && resume ? resume : f.saviez
  return (
    <div className="card rise fiche-savoir" role="dialog" style={{ position: 'relative', width: '100%', padding: 28, display: 'flex', gap: 28, flexWrap: 'wrap', alignItems: 'center', borderColor: r.juste ? 'var(--ok)' : 'var(--ko)', borderWidth: 2 }}>
      {onFermer && <button type="button" className="btn btn-g fiche-fermer" aria-label="Fermer" onClick={onFermer}><Icon d={ICONS.close} size={18} /></button>}
      {f.image ? <Img src={f.image} alt="" style={{ width: 160, borderRadius: 12, border: '1px solid var(--line)', flex: 'none' }} /> : <ImageWiki wiki={f.wiki} />}
      <div style={{ flex: '1 1 340px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {r.juste ? <Coche size={30} /> : <Croix size={26} />}
          <span className="t" style={{ fontSize: 22, fontWeight: 900, color: r.juste ? 'var(--ok-i)' : 'var(--ko-i)' }}>{r.juste ? t('q.right') : t('q.wrong')}</span>
          {r.km !== undefined
            ? <span style={{ color: 'var(--muted)' }}>· {lang === 'fr' ? `à ${r.km} km` : `${r.km} km away`} ({lang === 'fr' ? 'objectif' : 'target'} : {seuil} km)</span>
            : !r.juste && <span style={{ color: 'var(--muted)' }}>· {t('q.answerWas')} <strong style={{ color: 'var(--text)' }}>{r.q.reponse}</strong></span>}
        </div>
        <div style={{ display: 'flex', gap: 22, flexWrap: 'wrap' }}>
          {f.faits.map((x) => <div key={x.l} style={{ display: 'flex', flexDirection: 'column' }}><span className="eyebrow" style={{ fontSize: 11 }}>{x.l}</span><span style={{ fontWeight: 700 }}>{x.v}</span></div>)}
        </div>
        <p style={{ fontSize: 15, color: `var(--${k}-i)`, background: `var(--${k}-t)`, padding: '10px 14px', borderRadius: 12 }}><strong>{t('q.didyouknow')}</strong> {saviez}</p>
        <a href={f.wiki} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 600, fontSize: 14, color: 'var(--muted)', alignSelf: 'flex-start', minHeight: 32 }}>
          <Icon d={ICONS.link} size={16} />{f.wiki.includes('wikipedia') ? t('q.more') : (lang === 'fr' ? 'En savoir plus' : 'Learn more')}
        </a>
      </div>
      <button className="btn btn-p btn-lg btn-suivant-fiche" onClick={onNext} autoFocus>{dernier ? t('res.title') : t('q.next')}<span className="kbd">Entrée</span></button>
    </div>
  )
}

function Resultat({ reponses, xp, pieces, score, comboMax, k, reduit, onReplay }: { reponses: Reponse[]; xp: number; pieces: number; score: number; comboMax: number; k: string; reduit: { f: number; n: number; premiere: boolean; dejaValide: boolean } | null; onReplay: (ids?: string[]) => void }) {
  const { t, lang } = usePrefs()
  const bonnes = reponses.filter((r) => r.juste).length
  const erreurs = reponses.filter((r) => !r.juste)
  const taux = bonnes / reponses.length
  const { user } = useAuth()
  const [partage, setPartage] = useState('')

  return (
    <div className="partie" style={{ minHeight: '100%', display: 'flex', justifyContent: 'center', padding: '48px 40px' }}>
      <div style={{ width: '100%', maxWidth: 880, display: 'flex', flexDirection: 'column', gap: 24 }}>
        <section className="card rise" style={{ padding: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <svg viewBox="0 0 400 300" width="420" aria-hidden="true" style={{ position: 'absolute', right: -120, top: -100, opacity: .5 }}><path d="M210 30c80-10 170 40 160 120s-90 130-180 120S20 200 40 120 130 40 210 30Z" style={{ fill: `var(--${k}-t)` }} /></svg>
          <div style={{ position: 'relative' }}><Illustration k={k as Famille} taille={190} /><span style={{ position: 'absolute', right: -6, bottom: -4 }}>{taux >= .5 ? <Coche size={52} /> : <Croix size={40} />}</span></div>
          <h1 className="t" style={{ fontSize: 34, fontWeight: 900, position: 'relative' }}>{t('res.title')}</h1>
          <p className="t" style={{ fontSize: 22, fontWeight: 900, position: 'relative' }}>
            {score.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-GB')} pts
            {comboMax >= 3 && <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--muted)' }}> · {lang === 'fr' ? `meilleur combo ${comboMax}` : `best combo ${comboMax}`}</span>}
          </p>
          <div className="res-stats" style={{ display: 'flex', gap: 28, position: 'relative', flexWrap: 'wrap', justifyContent: 'center' }}>
            <div><div className="t" style={{ fontSize: 44, fontWeight: 900 }}>{bonnes}/{reponses.length}</div><div style={{ color: 'var(--muted)' }}>{t('res.score')}</div></div>
            <div><div className="t" style={{ fontSize: 44, fontWeight: 900, color: 'var(--ok-i)' }}>+{xp}</div><div style={{ color: 'var(--muted)' }}>{t('res.xp')}</div></div>
            <div><div className="t" style={{ fontSize: 44, fontWeight: 900, color: 'var(--his-i)', display: 'flex', alignItems: 'center', gap: 8 }}><Piece size={36} />+{pieces}</div><div style={{ color: 'var(--muted)' }}>{lang === 'fr' ? 'pièces' : 'coins'}</div></div>
          </div>
          {/* Pourquoi l'XP est plus faible (ou le bonus de première réussite) */}
          {reduit?.premiere && <p className="chip" style={{ position: 'relative', background: 'var(--ok-t)', color: 'var(--ok-i)', fontWeight: 800 }}>🎉 {lang === 'fr' ? 'Niveau réussi pour la première fois : bonus d’XP !' : 'First time clearing this level: XP bonus!'}</p>}
          {reduit && reduit.f < 1 && !reduit.premiere && <p style={{ position: 'relative', fontSize: 13.5, color: 'var(--muted)', maxWidth: 460 }}>{lang === 'fr' ? `XP réduite (×${reduit.f.toFixed(2).replace('.', ',')}) : ${reduit.dejaValide ? 'niveau déjà réussi' : ''}${reduit.dejaValide && reduit.n ? ', ' : ''}${reduit.n ? `déjà joué ${reduit.n} fois aujourd’hui` : ''}. Pour gagner plus, essaie d’autres quiz ou un niveau plus dur.` : 'Reduced XP: try other quizzes or a harder level.'}</p>}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', position: 'relative' }}>
            {/* Rejouer : tout le niveau, mêmes réglages, nouvelles questions (les erreurs vont en révision) */}
            {/* Mode histoire : étape réussie → on enchaîne directement sur la suivante */}
            {(() => {
              const n = Number(new URLSearchParams(location.hash.split('?')[1] ?? '').get('aventure') ?? NaN)
              if (Number.isNaN(n) || !ETAPES[n]) return null
              const reussi = bonnes >= seuilEtape(ETAPES[n])
              return reussi && ETAPES[n + 1]
                ? <Link className="btn btn-p btn-lg" to={urlEtape(n + 1)} autoFocus>{lang === 'fr' ? 'Étape suivante' : 'Next step'}<Icon d={ICONS.arrowR} /></Link>
                : <Link className="btn btn-s btn-lg" to="/aventure">🗺️ {lang === 'fr' ? (reussi ? 'Voir la carte' : `Il faut ${seuilEtape(ETAPES[n])}/10 : retour à la carte`) : 'Back to map'}</Link>
            })()}
            <button className="btn btn-p btn-lg" onClick={() => onReplay()} autoFocus>{t('res.replay')}<Icon d={ICONS.review} /></button>
            <button className="btn btn-s btn-lg" onClick={async () => { const r = await partagerDefi({ quiz: trouverSousTheme(reponses[0]?.q.s ?? new URLSearchParams(location.hash.split('?')[1]).get('s') ?? '')?.sous.id, nom: trouverSousTheme(reponses[0]?.q.s ?? new URLSearchParams(location.hash.split('?')[1]).get('s') ?? '')?.sous.nom[lang] ?? 'Mix', resultats: reponses.map((x) => x.juste), score, parrain: user?.uid }); setPartage(r) }}>{partage === 'copie' ? (lang === 'fr' ? 'Copié !' : 'Copied!') : (lang === 'fr' ? 'Défier un ami' : 'Challenge a friend')}</button>
            <Link className="btn btn-g" to={retourVers(new URLSearchParams(location.hash.split('?')[1] ?? ''))}>{lang === 'fr' ? 'Retour' : 'Back'}</Link>
          </div>
        </section>
        {erreurs.length > 0 && (
          <section className="card" style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <h2 className="t" style={{ fontSize: 22, fontWeight: 800 }}>{t('res.review')}</h2>
            {erreurs.map((r) => (
              <div key={r.q.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 12, borderRadius: 16, background: 'var(--surface2)' }}>
                {r.q.fiche.image && <Img src={r.q.fiche.image} alt="" style={{ width: 54, borderRadius: 6 }} />}
                <div style={{ flex: 1 }}><div style={{ fontWeight: 700 }}>{r.q.reponse}</div><div style={{ fontSize: 14, color: 'var(--muted)' }}>{r.q.enonce}</div></div>
                {r.donnee && <span style={{ fontSize: 14, color: 'var(--ko-i)', textDecoration: r.km === undefined ? 'line-through' : 'none' }}>{r.donnee}</span>}
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  )
}
