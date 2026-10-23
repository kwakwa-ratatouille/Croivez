import { useEffect, useState } from 'react'
import { App } from '@capacitor/app'
import { CapacitorUpdater } from '@capgo/capacitor-updater'
import { natif } from '../firebase'
import { usePrefs } from '../i18n'
import { ICONS, Icon } from './ui'

// Numéro du contenu web embarqué (injecté par GitHub Actions) ; 0 en développement
const WEB = Number(import.meta.env.VITE_WEB ?? 0)
const BASE = 'https://raw.githubusercontent.com/kwakwa-ratatouille/Croivez/main/sidestore'

type Manifeste = { web: number; url: string; natifMin: number }
type Etat =
  | { type: 'pret'; id: string; web: number } // nouveau contenu téléchargé, appliqué au prochain lancement
  | { type: 'ipa'; version: string; url: string } // la partie native a changé : il faut réinstaller via SideStore

// Mise à jour en deux niveaux :
//  1. contenu web (interface, quiz, données) : téléchargé en silence, quelques Mo, sans réinstaller l'app ;
//  2. partie native (rare) : on propose la nouvelle IPA dans SideStore.
export default function MiseAJour() {
  const { lang } = usePrefs()
  const fr = lang === 'fr'
  const [etat, setEtat] = useState<Etat | null>(null)
  const [cache, setCache] = useState(false)

  useEffect(() => {
    if (!natif) return
    let vivant = true
    ;(async () => {
      const sansCache = { cache: 'no-store' as RequestCache }
      const [m, info] = await Promise.all([
        fetch(`${BASE}/web.json?t=${Date.now()}`, sansCache).then((r) => r.json() as Promise<Manifeste>),
        App.getInfo(),
      ])
      const natifInstalle = Number(info.build) || 0
      if (natifInstalle < m.natifMin) {
        // Le nouveau contenu demande une version native plus récente : proposer l'IPA
        const s = await fetch(`${BASE}/source.json?t=${Date.now()}`, sansCache).then((r) => r.json())
        const v = s.apps?.[0]?.versions?.[0]
        if (v && Number(v.buildVersion) > natifInstalle && vivant) setEtat({ type: 'ipa', version: v.version, url: v.downloadURL })
        return
      }
      const actuel = await CapacitorUpdater.current()
      const webInstalle = actuel.bundle.version === 'builtin' ? WEB : Number(actuel.bundle.version) || WEB
      if (m.web <= webInstalle) return
      // Déjà téléchargé lors d'un lancement précédent ?
      const { bundles } = await CapacitorUpdater.list()
      const existant = bundles.find((b) => b.version === String(m.web) && b.status === 'success')
      const paquet = existant ?? await CapacitorUpdater.download({ url: m.url, version: String(m.web) })
      await CapacitorUpdater.next({ id: paquet.id })
      if (vivant) setEtat({ type: 'pret', id: paquet.id, web: m.web })
    })().catch(() => { /* hors ligne : on réessaiera au prochain lancement */ })
    return () => { vivant = false }
  }, [])

  if (!etat || cache) return null

  const action = etat.type === 'pret'
    ? () => CapacitorUpdater.set({ id: etat.id }) // recharge tout de suite sur le nouveau contenu
    : () => { window.location.href = `sidestore://install?url=${encodeURIComponent(etat.url)}` }

  return (
    <div role="status" className="rise card" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: 'var(--ok-t)', borderColor: 'transparent', color: 'var(--ok-i)', flexWrap: 'wrap' }}>
      <Icon d={ICONS.sparkle} />
      <div style={{ flex: '1 1 180px' }}>
        <strong>{etat.type === 'pret' ? (fr ? 'Mise à jour prête' : 'Update ready') : (fr ? 'Nouvelle version de l’app' : 'New app version')}</strong>
        <div style={{ fontSize: 14 }}>
          {etat.type === 'pret'
            ? (fr ? 'Redémarrez maintenant, ou elle s’appliquera au prochain lancement.' : 'Restart now, or it will apply next launch.')
            : (fr ? `Croivez ${etat.version} : à installer via SideStore.` : `Croivez ${etat.version}: install via SideStore.`)}
        </div>
      </div>
      <button className="btn btn-p" style={{ minHeight: 44 }} onClick={action}>{etat.type === 'pret' ? (fr ? 'Redémarrer' : 'Restart') : (fr ? 'Mettre à jour' : 'Update')}</button>
      <button className="btn btn-g" style={{ minHeight: 44, padding: '0 12px' }} aria-label={fr ? 'Plus tard' : 'Later'} onClick={() => setCache(true)}><Icon d={ICONS.close} size={18} /></button>
    </div>
  )
}
