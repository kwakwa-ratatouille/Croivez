import { useEffect, useState } from 'react'
import { App } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'
import { CapacitorUpdater } from '@capgo/capacitor-updater'
import { natif } from '../firebase'
import { usePrefs } from '../i18n'
import { ICONS, Icon } from './ui'

// Numéro du contenu web embarqué (injecté par GitHub Actions) ; 0 en développement
const WEB = Number(import.meta.env.VITE_WEB ?? 0)
const BASE = 'https://raw.githubusercontent.com/kwakwa-ratatouille/Croivez/main/sidestore'

type Manifeste = { web: number; url: string; natifMin: number; natifMinAndroid?: number }
const android = Capacitor.getPlatform() === 'android'
export type Resultat =
  | { type: 'pret'; id: string; web: number } // nouveau contenu téléchargé, appliqué au prochain lancement
  | { type: 'ipa'; version: string; url: string } // la partie native a changé : il faut réinstaller
  | { type: 'ajour' }

// Vérifie et télécharge la mise à jour, en racontant chaque étape (journal) : le diagnostic
// des Paramètres affiche ce journal, la bannière ne garde que le résultat.
export async function verifierMiseAJour(journal: (ligne: string) => void = () => {}): Promise<Resultat> {
  const sansCache = { cache: 'no-store' as RequestCache }
  journal(`Plateforme : ${Capacitor.getPlatform()}`)
  const info = await App.getInfo()
  const natifInstalle = Number(info.build) || 0
  journal(`App installée : ${info.version} (build ${natifInstalle})`)
  const reponse = await fetch(`${BASE}/web.json?t=${Date.now()}`, sansCache)
  if (!reponse.ok) throw new Error(`Manifeste inaccessible (HTTP ${reponse.status})`)
  const m = (await reponse.json()) as Manifeste
  journal(`Dernier contenu publié : n°${m.web} (app minimum : build ${android ? m.natifMinAndroid ?? 1 : m.natifMin})`)

  if (natifInstalle < (android ? m.natifMinAndroid ?? 1 : m.natifMin)) {
    journal('Cette app est trop ancienne pour le nouveau contenu : réinstallation nécessaire.')
    if (android) {
      const a = await fetch(`${BASE}/android.json?t=${Date.now()}`, sansCache).then((r) => r.json())
      return a.build > natifInstalle ? { type: 'ipa', version: a.version, url: a.url } : { type: 'ajour' }
    }
    const s = await fetch(`${BASE}/source.json?t=${Date.now()}`, sansCache).then((r) => r.json())
    const v = s.apps?.[0]?.versions?.[0]
    return v && Number(v.buildVersion) > natifInstalle ? { type: 'ipa', version: v.version, url: v.downloadURL } : { type: 'ajour' }
  }

  const actuel = await CapacitorUpdater.current()
  const webInstalle = actuel.bundle.version === 'builtin' ? WEB : Number(actuel.bundle.version) || WEB
  journal(`Contenu en cours : ${actuel.bundle.version === 'builtin' ? `d’origine (n°${WEB})` : `n°${actuel.bundle.version}`}`)
  if (m.web <= webInstalle) { journal('Déjà à jour.'); return { type: 'ajour' } }

  const { bundles } = await CapacitorUpdater.list()
  journal(`Contenus déjà téléchargés : ${bundles.map((b) => `${b.version} (${b.status})`).join(', ') || 'aucun'}`)
  let paquet = bundles.find((b) => b.version === String(m.web) && b.status === 'success')
  if (!paquet) {
    journal(`Téléchargement du contenu n°${m.web}…`)
    paquet = await CapacitorUpdater.download({ url: m.url, version: String(m.web) })
    journal(`Téléchargé (statut : ${paquet.status}).`)
  }
  await CapacitorUpdater.next({ id: paquet.id })
  journal('Prêt : il s’appliquera au redémarrage.')
  return { type: 'pret', id: paquet.id, web: m.web }
}

export const appliquerMaintenant = (id: string) => CapacitorUpdater.set({ id })

// Bannière : vérifie au lancement et propose de redémarrer (ou de réinstaller si le natif a changé)
export default function MiseAJour() {
  const { lang } = usePrefs()
  const fr = lang === 'fr'
  const [etat, setEtat] = useState<Resultat | null>(null)
  const [erreur, setErreur] = useState('')
  const [cache, setCache] = useState(false)

  useEffect(() => {
    if (!natif) return
    let vivant = true
    verifierMiseAJour()
      .then((r) => vivant && setEtat(r))
      .catch((e) => vivant && navigator.onLine && setErreur(String(e?.message ?? e)))
    return () => { vivant = false }
  }, [])

  if (cache) return null
  if (erreur) {
    return (
      <div role="status" className="card" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'var(--ko-t)', borderColor: 'transparent', color: 'var(--ko-i)', fontSize: 13 }}>
        <span style={{ flex: 1 }}>{fr ? 'Mise à jour impossible : ' : 'Update failed: '}{erreur}</span>
        <button className="btn btn-g" style={{ minHeight: 36, padding: '0 10px' }} aria-label={fr ? 'Fermer' : 'Close'} onClick={() => setCache(true)}><Icon d={ICONS.close} size={16} /></button>
      </div>
    )
  }
  if (!etat || etat.type === 'ajour') return null

  const action = etat.type === 'pret'
    ? () => appliquerMaintenant(etat.id) // recharge tout de suite sur le nouveau contenu
    // Android : le navigateur télécharge l'APK, qui s'installe par-dessus (même clé de signature)
    : () => { window.location.href = android ? etat.url : `sidestore://install?url=${encodeURIComponent(etat.url)}` }

  return (
    <div role="status" className="rise card" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: 'var(--ok-t)', borderColor: 'transparent', color: 'var(--ok-i)', flexWrap: 'wrap' }}>
      <Icon d={ICONS.sparkle} />
      <div style={{ flex: '1 1 180px' }}>
        <strong>{etat.type === 'pret' ? (fr ? 'Mise à jour prête' : 'Update ready') : (fr ? 'Nouvelle version de l’app' : 'New app version')}</strong>
        <div style={{ fontSize: 14 }}>
          {etat.type === 'pret'
            ? (fr ? 'Redémarrez maintenant, ou elle s’appliquera au prochain lancement.' : 'Restart now, or it will apply next launch.')
            : android
              ? (fr ? `Croivez ${etat.version} : téléchargez et installez la nouvelle version.` : `Croivez ${etat.version}: download and install the new version.`)
              : (fr ? `Croivez ${etat.version} : à installer via SideStore.` : `Croivez ${etat.version}: install via SideStore.`)}
        </div>
      </div>
      <button className="btn btn-p" style={{ minHeight: 44 }} onClick={action}>{etat.type === 'pret' ? (fr ? 'Redémarrer' : 'Restart') : (fr ? 'Mettre à jour' : 'Update')}</button>
      <button className="btn btn-g" style={{ minHeight: 44, padding: '0 12px' }} aria-label={fr ? 'Plus tard' : 'Later'} onClick={() => setCache(true)}><Icon d={ICONS.close} size={18} /></button>
    </div>
  )
}
