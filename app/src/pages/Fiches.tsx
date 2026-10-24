import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { deleteField, doc, setDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../auth'
import { usePrefs } from '../i18n'
import { trouverSousTheme } from '../themes'
import { genererPartie, type Question, type SousThemeId } from '../quiz/engine'
import { aReviser, cleRevision, planifier } from '../quiz/revision'
import { retourReponse } from '../retour'
import Img from '../components/Img'
import { Coche, ICONS, Icon } from '../components/ui'

// Fiches à retourner (façon Anki) : recto = question, verso = réponse et fiche ; « Je savais » espace la carte, « À revoir » la rapproche
export default function Fiches() {
  const { lang } = usePrefs()
  const fr = lang === 'fr'
  const { user, profile } = useAuth()
  const [cartes, setCartes] = useState<Question[] | null>(null)
  const [i, setI] = useState(0)
  const [verso, setVerso] = useState(false)
  const [sues, setSues] = useState(0)

  useEffect(() => {
    if (!profile || cartes) return
    const dues = [...aReviser(profile.revision)].sort(() => Math.random() - 0.5).slice(0, 30)
    const groupes = dues.reduce<Record<string, string[]>>((acc, c) => ((acc[c.s] ??= []).push(c.id), acc), {})
    Promise.all(Object.entries(groupes).map(([s, ids]) => genererPartie({ sousTheme: s as SousThemeId, difficulte: 4, max: 4, nombre: ids.length, mode: 'libre', lang, ids }).then((qs) => qs.map((q) => ({ ...q, s: s as SousThemeId }))).catch(() => [])))
      .then((t) => setCartes(t.flat().filter((q) => !q.carte).sort(() => Math.random() - 0.5)))
  }, [profile, cartes, lang])

  const noter = (juste: boolean) => {
    const q = cartes?.[i]
    if (!q || !user || !profile) return
    const s = q.s!
    const cle = cleRevision(s, q.id)
    const suite = planifier(profile.revision?.[cle], s, q.id, juste)
    setDoc(doc(db, 'users', user.uid), { revision: { [cle]: suite ?? deleteField() } }, { merge: true }).catch(console.error)
    retourReponse(juste)
    if (juste) setSues((n) => n + 1)
    setVerso(false)
    setI((n) => n + 1)
  }

  const q = cartes?.[i]
  const retour = <Link to="/revision" style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 8, minHeight: 44, fontWeight: 600, textDecoration: 'none', color: 'var(--muted)' }}><Icon d={ICONS.arrowL} />{fr ? 'Révision' : 'Review'}</Link>
  if (!cartes) return <>{retour}<p style={{ color: 'var(--muted)' }}>…</p></>
  if (!q) return (
    <>{retour}
      <section className="card" style={{ padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, textAlign: 'center' }}>
        <Coche size={56} />
        <h1 className="t" style={{ fontSize: 24, fontWeight: 900 }}>{cartes.length ? (fr ? `${sues} / ${cartes.length} sues` : `${sues} / ${cartes.length} known`) : (fr ? 'Aucune fiche à revoir' : 'No card due')}</h1>
        <Link className="btn btn-p" to="/revision">{fr ? 'Terminer' : 'Done'}</Link>
      </section>
    </>
  )
  const t = trouverSousTheme(q.s ?? '')
  return (
    <>
      {retour}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--muted)', fontWeight: 700 }}><span>{t?.sous.nom[lang]}</span><span>{i + 1} / {cartes.length}</span></div>
      <button type="button" className={`fiche-carte${verso ? ' retournee' : ''}`} onClick={() => setVerso((v) => !v)} aria-label={fr ? 'Retourner la fiche' : 'Flip card'}>
        <span className="fiche-recto">
          {q.image && <Img src={q.image} alt="" />}
          <strong className="t">{q.enonce}</strong>
          <small>{fr ? 'Touchez pour voir la réponse' : 'Tap to reveal'}</small>
        </span>
        <span className="fiche-verso">
          {q.fiche.image && <Img src={q.fiche.image} alt="" />}
          <strong className="t">{q.reponse}</strong>
          <small>{q.fiche.saviez}</small>
        </span>
      </button>
      {verso && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <button className="btn btn-lg" style={{ background: 'var(--ko-t)', color: 'var(--ko-i)' }} onClick={() => noter(false)}>{fr ? 'À revoir' : 'Again'}</button>
          <button className="btn btn-lg" style={{ background: 'var(--ok-t)', color: 'var(--ok-i)' }} onClick={() => noter(true)}>{fr ? 'Je savais' : 'Knew it'}</button>
        </div>
      )}
    </>
  )
}
