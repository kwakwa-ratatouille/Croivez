import { useEffect, useState } from 'react'
import { signOut } from 'firebase/auth'
import { auth, natif } from '../firebase'
import { App } from '@capacitor/app'
import { CapacitorUpdater } from '@capgo/capacitor-updater'
import { appliquerMaintenant, verifierMiseAJour } from '../components/MiseAJour'
import { useAuth } from '../auth'
import { usePrefs } from '../i18n'
import { FAMILLES } from '../themes'
import { imagesDe, type SousThemeId } from '../quiz/engine'
import { prefsRetour, reglerRetour, retourReponse } from '../retour'
import { tailleCache, telechargerImages, viderCache } from '../components/Img'
import { Icon, Toggle } from '../components/ui'
import { ecrirePrefsJeu, lirePrefsJeu, type PrefsJeu } from '../prefsJeu'
import { FORMATS, MINI_JEUX, miniJeuxAutorises, type MiniJeu } from '../quiz/formats'

export default function Parametres() {
  const { t, lang, setLang, dark, setDark } = usePrefs()
  const fr = lang === 'fr'
  const { user, profile } = useAuth()
  const [son, setSon] = useState(prefsRetour.son)
  const [vibration, setVibration] = useState(prefsRetour.vibration)
  const [taille, setTaille] = useState<number | null>(null)
  const [enCours, setEnCours] = useState<{ k: string; fait: number; total: number } | null>(null)
  const [faits, setFaits] = useState<Set<string>>(() => { try { return new Set(JSON.parse(localStorage.getItem('hors-ligne') ?? '[]')) } catch { return new Set() } })

  const [pj, setPj] = useState<PrefsJeu>(lirePrefsJeu)
  const majPj = (x: Partial<PrefsJeu>) => setPj(ecrirePrefsJeu(x))
  const [mjs, setMjs] = useState<MiniJeu[]>(miniJeuxAutorises)
  const basculerMj = (v: MiniJeu) => {
    const l = mjs.includes(v) ? mjs.filter((x) => x !== v) : [...mjs, v]
    if (!l.length) return // au moins un mini-jeu
    setMjs(l)
    try { localStorage.setItem('miniJeux', JSON.stringify(l)) } catch { /* stockage indisponible */ }
  }
  const majTaille = () => tailleCache().then(setTaille)
  useEffect(() => { majTaille() }, [])

  // Diagnostic : chaque étape de la mise à jour, avec l'erreur exacte en cas d'échec
  const [journal, setJournal] = useState<string[]>([])
  const [pret, setPret] = useState<string | null>(null)
  async function verifier() {
    const lignes: string[] = []
    const noter = (l: string) => { lignes.push(l); setJournal([...lignes]) }
    setPret(null)
    try {
      const r = await verifierMiseAJour(noter)
      if (r.type === 'pret') setPret(r.id)
      if (r.type === 'ipa') noter(`Nouvelle version native ${r.version} à installer via SideStore.`)
    } catch (e) {
      noter(`ERREUR : ${String((e as Error)?.message ?? e)}`)
    }
  }

  // Versions installées : utile pour comprendre une mise à jour qui n'arrive pas
  const [versions, setVersions] = useState('')
  useEffect(() => {
    const web = `contenu ${import.meta.env.VITE_WEB ?? 'dev'}`
    if (!natif) { setVersions(web); return }
    Promise.all([App.getInfo(), CapacitorUpdater.current()])
      .then(([info, cur]) => setVersions(`app ${info.version} (build ${info.build}) · ${cur.bundle.version === 'builtin' ? web + ' d’origine' : 'contenu ' + cur.bundle.version}`))
      .catch(() => setVersions(web))
  }, [])

  const ligne = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' as const }
  const titre = { fontSize: 19, fontWeight: 800 }

  // Télécharge toutes les images d'une famille de thèmes pour jouer sans réseau
  async function telecharger(k: string, deja: Set<string> = faits) {
    const f = FAMILLES.find((x) => x.k === k)!
    const srcs = [...new Set((await Promise.all(f.subs.filter((s) => s.jouable).map((s) => imagesDe(s.jouable as SousThemeId)))).flat())]
    setEnCours({ k, fait: 0, total: srcs.length })
    await telechargerImages(srcs, (fait) => setEnCours({ k, fait, total: srcs.length }))
    const n = new Set(deja).add(k)
    setFaits(n)
    try { localStorage.setItem('hors-ligne', JSON.stringify([...n])) } catch { /* stockage indisponible */ }
    setEnCours(null)
    majTaille()
    return n
  }

  // Toutes les familles à la suite (celles déjà téléchargées sont sautées)
  async function toutTelecharger() {
    let deja = faits
    for (const f of FAMILLES) if (!deja.has(f.k)) deja = await telecharger(f.k, deja)
  }

  return (
    <>
      <h1 className="t" style={{ fontSize: 36, fontWeight: 900 }}>{t('nav.settings')}</h1>
      <section className="card" style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 22, maxWidth: 760 }}>
        <div style={ligne}>
          <span className="t" style={titre}>{t('set.lang')}</span>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="pill" aria-pressed={lang === 'fr'} onClick={() => setLang('fr')}>Français</button>
            <button className="pill" aria-pressed={lang === 'en'} onClick={() => setLang('en')}>English</button>
          </div>
        </div>
        <div style={ligne}>
          <span className="t" style={titre}>{t('set.theme')}</span>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="pill" aria-pressed={!dark} onClick={() => setDark(false)}>{t('set.light')}</button>
            <button className="pill" aria-pressed={dark} onClick={() => setDark(true)}>{t('set.dark')}</button>
          </div>
        </div>
        <div style={ligne}>
          <span className="t" style={titre}>{fr ? 'Sons' : 'Sounds'}</span>
          <Toggle on={son} label={fr ? 'Sons' : 'Sounds'} onChange={(v) => { setSon(v); reglerRetour('son', v); if (v) retourReponse(true) }} />
        </div>
        <div style={ligne}>
          <span className="t" style={titre}>{fr ? 'Vibrations' : 'Haptics'}</span>
          <Toggle on={vibration} label={fr ? 'Vibrations' : 'Haptics'} onChange={(v) => { setVibration(v); reglerRetour('vibration', v); if (v) retourReponse(false) }} />
        </div>
        <div style={{ height: 1, background: 'var(--line)' }} />
        <div style={ligne}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span className="t" style={titre}>{t('set.account')}</span>
            <span style={{ color: 'var(--muted)' }}>{profile?.pseudo} · {user?.email}</span>
            <span style={{ color: 'var(--muted)', fontSize: 13 }}>Version : {versions}</span>
            {natif && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 6 }}>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button className="btn btn-s" style={{ minHeight: 40 }} onClick={verifier}>{fr ? 'Vérifier les mises à jour' : 'Check for updates'}</button>
                  {pret && <button className="btn btn-p" style={{ minHeight: 40 }} onClick={() => appliquerMaintenant(pret)}>{fr ? 'Redémarrer' : 'Restart'}</button>}
                </div>
                {journal.length > 0 && <pre style={{ margin: 0, padding: 10, borderRadius: 12, background: 'var(--surface2)', fontSize: 12, whiteSpace: 'pre-wrap', color: 'var(--text)' }}>{journal.join('\n')}</pre>}
              </div>
            )}
          </div>
          <button className="btn btn-g" onClick={() => signOut(auth)}>{t('set.logout')}</button>
        </div>
      </section>

      {/* Partie : réglages par défaut et confort */}
      <section className="card" style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 760 }}>
        <span className="t" style={{ fontSize: 22, fontWeight: 900 }}>{fr ? 'Partie' : 'Game'}</span>
        <div style={ligne}>
          <span className="t" style={titre}>{fr ? 'Questions par partie' : 'Questions per game'}</span>
          <div className="salon-choix">{[5, 10, 15, 20, 30].map((n) => <button key={n} className="pill" aria-pressed={pj.n === n} onClick={() => majPj({ n })}>{n}</button>)}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span className="t" style={titre}>{fr ? 'Format de réponse par défaut' : 'Default answer format'}</span>
          <div className="salon-choix">{FORMATS.map((f) => <button key={f.v} className="pill" aria-pressed={pj.m === f.v} onClick={() => majPj({ m: f.v })}>{f[lang]}</button>)}</div>
          <span style={{ fontSize: 13, color: 'var(--muted)' }}>{fr ? 'Auto : le format change à chaque question. Mini-jeu surprise : un mini-jeu tiré au hasard pour toute la série.' : 'Auto: format changes every question.'}</span>
        </div>
        <div style={ligne}>
          <span className="t" style={titre}>{fr ? 'Chrono par défaut' : 'Timer by default'}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            {pj.chrono && <div className="salon-choix">{[10, 15, 20, 30].map((n) => <button key={n} className="pill" aria-pressed={pj.duree === n} onClick={() => majPj({ duree: n })}>{n} s</button>)}</div>}
            <Toggle on={pj.chrono} label={fr ? 'Chrono' : 'Timer'} onChange={(v) => majPj({ chrono: v })} />
          </div>
        </div>
        <div style={ligne}>
          <div><span className="t" style={titre}>{fr ? 'Mode rapide par défaut' : 'Quick mode by default'}</span><p style={{ fontSize: 13, color: 'var(--muted)' }}>{fr ? 'Question suivante automatique, sans fiche.' : 'Auto next question, no fact card.'}</p></div>
          <Toggle on={pj.rapide} label={fr ? 'Mode rapide' : 'Quick mode'} onChange={(v) => majPj({ rapide: v })} />
        </div>
        <div style={ligne}>
          <span className="t" style={titre}>{fr ? 'Bonus en partie (+10 s, passer…)' : 'In-game power-ups'}</span>
          <Toggle on={pj.bonus} label="Bonus" onChange={(v) => majPj({ bonus: v })} />
        </div>
        <div style={ligne}>
          <span className="t" style={titre}>{fr ? 'Fiche « Le saviez-vous ? »' : '“Did you know?” cards'}</span>
          <Toggle on={pj.fiches} label={fr ? 'Fiches' : 'Cards'} onChange={(v) => majPj({ fiches: v })} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span className="t" style={titre}>{fr ? 'Mini-jeux des parties aléatoires' : 'Mini-games in random games'}</span>
          <div className="salon-choix">{MINI_JEUX.map((m) => <button key={m.v} className="pill" aria-pressed={mjs.includes(m.v)} onClick={() => basculerMj(m.v)}>{m.icone} {m.nom[lang]}</button>)}</div>
        </div>
        <div style={{ height: 1, background: 'var(--line)' }} />
        <div style={ligne}>
          <span className="t" style={titre}>{fr ? 'Taille du texte' : 'Text size'}</span>
          <div className="salon-choix">
            <button className="pill" aria-pressed={pj.texte === 'normal'} onClick={() => majPj({ texte: 'normal' })}>{fr ? 'Normale' : 'Normal'}</button>
            <button className="pill" aria-pressed={pj.texte === 'grand'} onClick={() => majPj({ texte: 'grand' })}>{fr ? 'Grande' : 'Large'}</button>
          </div>
        </div>
        <div style={ligne}>
          <span className="t" style={titre}>{fr ? 'Animations réduites' : 'Reduced motion'}</span>
          <Toggle on={pj.calme} label={fr ? 'Animations réduites' : 'Reduced motion'} onChange={(v) => majPj({ calme: v })} />
        </div>
      </section>

      <section className="card" style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 760 }}>
        <div style={ligne}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span className="t" style={titre}>{fr ? 'Jouer hors ligne' : 'Play offline'}</span>
            <span style={{ color: 'var(--muted)', fontSize: 14 }}>
              {fr ? 'Les images vues sont gardées automatiquement. Téléchargez un thème entier avant de partir sans réseau.' : 'Images you see are kept automatically. Download a whole topic before going offline.'}
              {taille !== null && ` ${fr ? 'Espace utilisé' : 'Space used'} : ${(taille / 1e6).toFixed(0)} Mo.`}
            </span>
          </div>
          <button className="btn btn-p" disabled={!!enCours || FAMILLES.every((f) => faits.has(f.k))} onClick={toutTelecharger}>{fr ? 'Tout télécharger' : 'Download all'}</button>
          <button className="btn btn-g" onClick={async () => { await viderCache(); setFaits(new Set()); try { localStorage.removeItem('hors-ligne') } catch { /* rien */ } majTaille() }}>{fr ? 'Vider' : 'Clear'}</button>
        </div>
        {FAMILLES.map((f) => {
          const actif = enCours?.k === f.k
          return (
            <div key={f.k} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 16, background: `var(--${f.k}-t)`, color: `var(--${f.k}-i)` }}>
              <Icon d={f.icon} />
              <span style={{ flex: 1, fontWeight: 700 }}>{f.nom[lang]}</span>
              {actif
                ? <span style={{ fontSize: 14, fontWeight: 600 }}>{enCours.fait} / {enCours.total}</span>
                : faits.has(f.k)
                  ? <span style={{ fontSize: 14, fontWeight: 600 }}>✓ {fr ? 'Téléchargé' : 'Downloaded'}</span>
                  : <button className="btn" disabled={!!enCours} onClick={() => telecharger(f.k)} style={{ minHeight: 40, padding: '0 14px', background: 'var(--surface)', color: 'inherit' }}>{fr ? 'Télécharger' : 'Download'}</button>}
            </div>
          )
        })}
      </section>

      {!natif && (
        <section className="card" style={{ padding: 28, display: 'flex', gap: 28, alignItems: 'center', flexWrap: 'wrap', maxWidth: 760 }}>
          <img src="./qr-android.svg" alt="QR code Android" width={180} height={180} style={{ borderRadius: 16, border: '1px solid var(--line)' }} />
          <div style={{ flex: '1 1 260px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span className="t" style={titre}>{fr ? 'Installer sur Android' : 'Install on Android'}</span>
            <p style={{ color: 'var(--muted)', lineHeight: 1.5 }}>
              {fr ? 'Scannez ce QR code avec le téléphone : l’APK se télécharge. Le contenu se met ensuite à jour tout seul.' : 'Scan this QR code with your phone to download the APK. Content then updates by itself.'}
            </p>
          </div>
        </section>
      )}
      {!natif && (
        <section className="card" style={{ padding: 28, display: 'flex', gap: 28, alignItems: 'center', flexWrap: 'wrap', maxWidth: 760 }}>
          <img src="./qr-sidestore.svg" alt="QR code SideStore" width={180} height={180} style={{ borderRadius: 16, border: '1px solid var(--line)' }} />
          <div style={{ flex: '1 1 260px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span className="t" style={titre}>{fr ? 'Installer sur iPhone' : 'Install on iPhone'}</span>
            <p style={{ color: 'var(--muted)', lineHeight: 1.5 }}>
              {fr ? 'Scannez ce QR code avec l’appareil photo de l’iPhone : la source Croivez s’ajoute à SideStore, et vous recevez les mises à jour.' : 'Scan this QR code with your iPhone camera to add the Croivez source to SideStore and get updates.'}
            </p>
          </div>
        </section>
      )}
    </>
  )
}
