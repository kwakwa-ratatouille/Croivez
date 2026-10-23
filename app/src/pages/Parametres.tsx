import { useEffect, useState } from 'react'
import { signOut } from 'firebase/auth'
import { auth, natif } from '../firebase'
import { useAuth } from '../auth'
import { usePrefs } from '../i18n'
import { FAMILLES } from '../themes'
import { imagesDe, type SousThemeId } from '../quiz/engine'
import { prefsRetour, reglerRetour, retourReponse } from '../retour'
import { tailleCache, telechargerImages, viderCache } from '../components/Img'
import { Icon, Toggle } from '../components/ui'

export default function Parametres() {
  const { t, lang, setLang, dark, setDark } = usePrefs()
  const fr = lang === 'fr'
  const { user, profile } = useAuth()
  const [son, setSon] = useState(prefsRetour.son)
  const [vibration, setVibration] = useState(prefsRetour.vibration)
  const [taille, setTaille] = useState<number | null>(null)
  const [enCours, setEnCours] = useState<{ k: string; fait: number; total: number } | null>(null)
  const [faits, setFaits] = useState<Set<string>>(() => { try { return new Set(JSON.parse(localStorage.getItem('hors-ligne') ?? '[]')) } catch { return new Set() } })

  const majTaille = () => tailleCache().then(setTaille)
  useEffect(() => { majTaille() }, [])

  const ligne = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' as const }
  const titre = { fontSize: 19, fontWeight: 800 }

  // Télécharge toutes les images d'une famille de thèmes pour jouer sans réseau
  async function telecharger(k: string) {
    const f = FAMILLES.find((x) => x.k === k)!
    const srcs = [...new Set((await Promise.all(f.subs.filter((s) => s.jouable).map((s) => imagesDe(s.jouable as SousThemeId)))).flat())]
    setEnCours({ k, fait: 0, total: srcs.length })
    await telechargerImages(srcs, (fait) => setEnCours({ k, fait, total: srcs.length }))
    const n = new Set(faits).add(k)
    setFaits(n)
    try { localStorage.setItem('hors-ligne', JSON.stringify([...n])) } catch { /* stockage indisponible */ }
    setEnCours(null)
    majTaille()
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
          </div>
          <button className="btn btn-g" onClick={() => signOut(auth)}>{t('set.logout')}</button>
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
