import { signOut } from 'firebase/auth'
import { auth } from '../firebase'
import { useAuth } from '../auth'
import { usePrefs } from '../i18n'

export default function Parametres() {
  const { t, lang, setLang, dark, setDark } = usePrefs()
  const { user, profile } = useAuth()

  const ligne = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' as const }

  return (
    <>
      <h1 className="t" style={{ fontSize: 36, fontWeight: 900 }}>{t('nav.settings')}</h1>
      <section className="card" style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 26, maxWidth: 760 }}>
        <div style={ligne}>
          <span className="t" style={{ fontSize: 19, fontWeight: 800 }}>{t('set.lang')}</span>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="pill" aria-pressed={lang === 'fr'} onClick={() => setLang('fr')}>Français</button>
            <button className="pill" aria-pressed={lang === 'en'} onClick={() => setLang('en')}>English</button>
          </div>
        </div>
        <div style={ligne}>
          <span className="t" style={{ fontSize: 19, fontWeight: 800 }}>{t('set.theme')}</span>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="pill" aria-pressed={!dark} onClick={() => setDark(false)}>{t('set.light')}</button>
            <button className="pill" aria-pressed={dark} onClick={() => setDark(true)}>{t('set.dark')}</button>
          </div>
        </div>
        <div style={{ height: 1, background: 'var(--line)' }} />
        <div style={ligne}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span className="t" style={{ fontSize: 19, fontWeight: 800 }}>{t('set.account')}</span>
            <span style={{ color: 'var(--muted)' }}>{profile?.pseudo} · {user?.email}</span>
          </div>
          <button className="btn btn-g" onClick={() => signOut(auth)}>{t('set.logout')}</button>
        </div>
      </section>
      <section className="card" style={{ padding: 32, display: 'flex', gap: 28, alignItems: 'center', flexWrap: 'wrap', maxWidth: 760 }}>
        <img src="./qr-sidestore.svg" alt="QR code SideStore" width={180} height={180} style={{ borderRadius: 16, border: '1px solid var(--line)' }} />
        <div style={{ flex: '1 1 260px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span className="t" style={{ fontSize: 19, fontWeight: 800 }}>{lang === 'fr' ? 'Installer sur iPhone' : 'Install on iPhone'}</span>
          <p style={{ color: 'var(--muted)', lineHeight: 1.5 }}>
            {lang === 'fr'
              ? 'Scannez ce QR code avec l’appareil photo de l’iPhone : la source Croivez s’ajoute à SideStore, et vous recevez les mises à jour.'
              : 'Scan this QR code with your iPhone camera to add the Croivez source to SideStore and get updates.'}
          </p>
        </div>
      </section>
    </>
  )
}
