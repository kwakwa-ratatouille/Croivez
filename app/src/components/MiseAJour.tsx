import { useEffect, useState } from 'react'
import { natif } from '../firebase'
import { usePrefs } from '../i18n'
import { ICONS, Icon } from './ui'

// Numéro de build injecté par GitHub Actions (VITE_BUILD) ; 0 en développement
const BUILD = Number(import.meta.env.VITE_BUILD ?? 0)
const SOURCE = 'https://raw.githubusercontent.com/kwakwa-ratatouille/Croivez/main/sidestore/source.json'

type Version = { version: string; buildVersion: string; downloadURL: string }

// Sur iPhone : compare la version installée à la source SideStore et propose la mise à jour en un geste
export default function MiseAJour() {
  const { lang } = usePrefs()
  const [dispo, setDispo] = useState<Version | null>(null)
  const [cache, setCache] = useState(false)

  useEffect(() => {
    if (!natif || !BUILD) return
    fetch(`${SOURCE}?t=${Date.now()}`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((s) => {
        const v: Version | undefined = s.apps?.[0]?.versions?.[0]
        if (v && Number(v.buildVersion) > BUILD) setDispo(v)
      })
      .catch(() => { /* hors ligne : on réessaiera au prochain lancement */ })
  }, [])

  if (!dispo || cache) return null
  const fr = lang === 'fr'
  // SideStore reconnaît l'app déjà installée et la met à jour en gardant les données
  const installer = () => { window.location.href = `sidestore://install?url=${encodeURIComponent(dispo.downloadURL)}` }

  return (
    <div role="status" className="rise card" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: 'var(--ok-t)', borderColor: 'transparent', color: 'var(--ok-i)', flexWrap: 'wrap' }}>
      <Icon d={ICONS.sparkle} />
      <div style={{ flex: '1 1 180px' }}>
        <strong>{fr ? 'Mise à jour disponible' : 'Update available'}</strong>
        <div style={{ fontSize: 14 }}>{fr ? `Croivez ${dispo.version} (build ${dispo.buildVersion})` : `Croivez ${dispo.version} (build ${dispo.buildVersion})`}</div>
      </div>
      <button className="btn btn-p" style={{ minHeight: 44 }} onClick={installer}>{fr ? 'Mettre à jour' : 'Update'}</button>
      <button className="btn btn-g" style={{ minHeight: 44, padding: '0 12px' }} aria-label={fr ? 'Plus tard' : 'Later'} onClick={() => setCache(true)}><Icon d={ICONS.close} size={18} /></button>
    </div>
  )
}
