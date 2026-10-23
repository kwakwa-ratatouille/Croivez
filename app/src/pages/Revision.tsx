import { Link } from 'react-router-dom'
import { useAuth } from '../auth'
import { usePrefs } from '../i18n'
import { trouverSousTheme } from '../themes'
import { aReviser, type CarteRevision } from '../quiz/revision'
import { Coche, ICONS, Icon } from '../components/ui'

export default function Revision() {
  const { lang } = usePrefs()
  const { profile } = useAuth()
  const toutes = Object.values(profile?.revision ?? {})
  const dues = aReviser(profile?.revision)
  const parTheme = Object.entries(dues.reduce<Record<string, CarteRevision[]>>((acc, c) => ((acc[c.s] ??= []).push(c), acc), {}))
  const prochaine = toutes.filter((c) => c.due > Date.now()).sort((a, b) => a.due - b.due)[0]

  return (
    <>
      <header style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <h1 className="t" style={{ fontSize: 36, fontWeight: 900 }}>{lang === 'fr' ? 'Révision' : 'Review'}</h1>
        <p style={{ fontSize: 17, color: 'var(--muted)', maxWidth: 680 }}>
          {lang === 'fr'
            ? 'Vos erreurs reviennent au bon moment : le lendemain, puis de plus en plus espacées à chaque bonne réponse, jusqu’à être acquises.'
            : 'Your mistakes come back at the right time: the next day, then further apart after each correct answer, until learned.'}
        </p>
      </header>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {[[dues.length, lang === 'fr' ? 'à revoir maintenant' : 'due now', 'his'], [toutes.length, lang === 'fr' ? 'en cours d’apprentissage' : 'being learned', 'geo']].map(([n, l, c]) => (
          <div key={l as string} className="card" style={{ padding: '20px 26px', display: 'flex', alignItems: 'baseline', gap: 10, background: `var(--${c}-t)`, borderColor: 'transparent', color: `var(--${c}-i)` }}>
            <span className="t" style={{ fontSize: 36, fontWeight: 900 }}>{n}</span><span style={{ fontWeight: 600 }}>{l}</span>
          </div>
        ))}
      </div>

      {parTheme.length === 0 ? (
        <section className="card" style={{ padding: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, textAlign: 'center' }}>
          <Coche size={56} />
          <h2 className="t" style={{ fontSize: 24, fontWeight: 800 }}>{lang === 'fr' ? 'Rien à revoir pour l’instant' : 'Nothing to review right now'}</h2>
          <p style={{ color: 'var(--muted)' }}>
            {prochaine
              ? (lang === 'fr' ? `Prochaine révision le ${new Date(prochaine.due).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}.` : `Next review on ${new Date(prochaine.due).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}.`)
              : (lang === 'fr' ? 'Jouez quelques parties : vos erreurs apparaîtront ici.' : 'Play a few games: your mistakes will show up here.')}
          </p>
          <Link className="btn btn-p" to="/themes">{lang === 'fr' ? 'Jouer' : 'Play'}<Icon d={ICONS.arrowR} /></Link>
        </section>
      ) : (
        <section className="grid-auto">
          {parTheme.map(([s, cartes]) => {
            const t = trouverSousTheme(s)
            const k = t?.famille.k ?? 'geo'
            const lot = cartes!.slice(0, 20)
            // Les villes se placent sur la carte ; le reste en QCM pour réviser vite
            const url = `/partie?s=${s}&m=${s.startsWith('villes') ? 'libre' : 'qcm'}&n=${lot.length}&d=4&rev=1&ids=${encodeURIComponent(lot.map((c) => c.id).join(','))}`
            return (
              <article key={s} className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 52, height: 52, borderRadius: 16, background: `var(--${k}-t)`, color: `var(--${k}-i)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon d={t?.famille.icon ?? ''} size={26} /></div>
                  <div><h2 className="t" style={{ fontSize: 20, fontWeight: 800 }}>{t?.sous.nom[lang] ?? s}</h2><span style={{ color: 'var(--muted)', fontSize: 14 }}>{cartes!.length} {lang === 'fr' ? 'à revoir' : 'to review'}</span></div>
                </div>
                <p style={{ fontSize: 14, color: 'var(--muted)' }}>{/^Q\d+$/.test(lot[0].id) ? '' : lot.slice(0, 5).map((c) => (c.id.length === 2 ? c.id.toUpperCase() : c.id.split('|')[0])).join(' · ') + (cartes!.length > 5 ? ' …' : '')}</p>
                <Link className="btn btn-p" to={url} style={{ alignSelf: 'flex-start' }}>{lang === 'fr' ? 'Réviser' : 'Review'}<Icon d={ICONS.arrowR} /></Link>
              </article>
            )
          })}
        </section>
      )}
    </>
  )
}
