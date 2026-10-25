import { useState } from 'react'
import { useAuth } from '../auth'
import { usePrefs } from '../i18n'
import { FAMILLES, type Famille, type SousTheme } from '../themes'
import { PRIX_CHOIX, acheterQuiz, prixCaisse, POIDS, RARETES, ouvrirCaisse, quizVerrouilles, rareteDe, type Rarete } from '../progression'
import Caisse from './Caisse'
import { prefsRetour, reglerRetour } from '../retour'
import Illustration from './Illustration'
import { ICONS, Icon, Piece, Toggle } from './ui'

// Caisse d'une famille : prix fixe, chances par rareté, puis ouverture façon CS:GO et révélation
export default function Achat({ k, onFermer }: { k: Famille; onFermer: () => void }) {
  const { lang } = usePrefs()
  const fr = lang === 'fr'
  const { user, profile } = useAuth()
  const [ouverte, setOuverte] = useState<{ gain: SousTheme; possibles: SousTheme[] } | null>(null)
  const [envoi, setEnvoi] = useState(false)
  const [choix, setChoix] = useState(false) // liste des quiz à acheter directement
  const [vise, setVise] = useState<SousTheme | null>(null) // quiz choisi, en attente de confirmation
  const [achete, setAchete] = useState('')
  const [confirmer, setConfirmer] = useState(false) // 2ᵉ étape avant de payer la caisse
  const [anim, setAnim] = useState(prefsRetour.animCaisse) // animation d'ouverture (réglage de l'appareil)
  const f = FAMILLES.find((x) => x.k === k)
  if (!f) return null
  if (ouverte) return <Caisse k={k} possibles={ouverte.possibles} gain={ouverte.gain} onFermer={onFermer} />
  const restants = quizVerrouilles(k, profile)
  const solde = profile?.pieces ?? 0
  const prix = prixCaisse(profile)
  const assez = solde >= prix
  // Combien de quiz restent par rareté, et la vraie chance de tomber sur chacune
  const parRarete = (Object.keys(RARETES) as Rarete[]).map((r) => ({ r, n: restants.filter((s) => rareteDe(s.id) === r).length }))
  const total = parRarete.reduce((a, x) => a + x.n * POIDS[x.r], 0)
  const ouvrir = async () => {
    if (!user) return
    setEnvoi(true)
    const gain = await ouvrirCaisse(user.uid, k, profile).catch(() => false as const)
    setEnvoi(false)
    if (gain) setOuverte({ gain, possibles: restants })
  }
  const acheterVise = async () => {
    if (!user || !vise) return
    setEnvoi(true)
    const ok = await acheterQuiz(user.uid, vise.id).catch(() => false)
    setEnvoi(false)
    setAchete(ok ? (fr ? `🎉 « ${vise.nom.fr} » est débloqué !` : 'Unlocked!') : (fr ? 'Pas assez de pièces.' : 'Not enough coins.'))
    setVise(null)
  }

  return (
    <div className="fiche-fond" onClick={onFermer} role="presentation">
      <div className="fiche" role="dialog" aria-modal="true" aria-label={f.nom[lang]} onClick={(e) => e.stopPropagation()}>
        <div className="fiche-poignee" />
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ width: 72, height: 72, borderRadius: 18, background: `var(--${k}-t)`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flex: 'none' }}><Illustration k={k} taille={80} fond={false} /></span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <span className="eyebrow" style={{ color: `var(--${k}-i)` }}>{fr ? 'Caisse' : 'Crate'}</span>
            <h2 className="t" style={{ fontSize: 22, fontWeight: 900, lineHeight: 1.2 }}>{f.nom[lang]}</h2>
            <span style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600 }}>{restants.length} {fr ? 'quiz à gagner' : 'quizzes to win'}</span>
          </div>
          <button className="btn btn-g" aria-label={fr ? 'Fermer' : 'Close'} onClick={onFermer} style={{ minHeight: 40, padding: '0 10px' }}><Icon d={ICONS.close} size={18} /></button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
          {parRarete.map(({ r, n }) => (
            <div key={r} style={{ padding: '8px 6px', borderRadius: 12, textAlign: 'center', background: 'var(--surface2)', boxShadow: `inset 0 -3px 0 ${RARETES[r].couleur}`, opacity: n ? 1 : 0.4 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: RARETES[r].couleur }}>{RARETES[r].nom[lang]}</div>
              <div className="t" style={{ fontWeight: 900, fontSize: 17 }}>{total ? Math.round((n * POIDS[r] * 100) / total) : 0} %</div>
              <div style={{ fontSize: 11, color: 'var(--muted)' }}>{n} quiz</div>
            </div>
          ))}
        </div>
        {confirmer && <p className="confirmer-achat">{fr ? `Dépenser ${prix} pièces pour ouvrir cette caisse ? Il te restera ${solde - prix} pièces.` : `Spend ${prix} coins?`}</p>}
        <div style={{ display: 'flex', gap: 8 }}>
          {confirmer && <button className="btn btn-g btn-lg" onClick={() => setConfirmer(false)}>{fr ? 'Annuler' : 'Cancel'}</button>}
          <button className="btn btn-p btn-lg" disabled={!assez || envoi || !restants.length} style={{ flex: 1 }} onClick={() => (confirmer ? ouvrir() : setConfirmer(true))}>
            {!restants.length ? (fr ? 'Tout est débloqué !' : 'All unlocked!') : confirmer ? (fr ? '✓ Oui, ouvrir' : '✓ Yes, open') : assez ? (fr ? 'Ouvrir la caisse' : 'Open crate') : (fr ? `Encore ${prix - solde} pièces` : `${prix - solde} more coins`)} · <Piece size={18} />{prix}
          </button>
        </div>
        <div className="caisse-reglage">
          <span>{fr ? 'Animation d’ouverture' : 'Opening animation'}</span>
          <Toggle on={anim} label={fr ? 'Animation d’ouverture' : 'Opening animation'} onChange={(v) => { setAnim(v); reglerRetour('animCaisse', v) }} />
        </div>
        {/* Ou payer plus cher pour choisir exactement son quiz (prix selon la rareté) */}
        {restants.length > 0 && (
          <div className="choix-quiz">
            <button type="button" className="btn btn-g" style={{ width: '100%' }} onClick={() => setChoix((c) => !c)}>🎯 {fr ? 'Choisir mon quiz (plus cher)' : 'Pick my quiz (pricier)'} {choix ? '▴' : '▾'}</button>
            {achete && <p className="confirmer-achat">{achete}</p>}
            {choix && (
              <>
                <p style={{ fontSize: 13, color: 'var(--muted)', textAlign: 'center' }}>{fr ? 'La caisse reste le pari pas cher ; ici tu prends exactement celui que tu veux.' : 'The crate is the cheap gamble; here you get exactly what you want.'}</p>
                <div className="choix-quiz-liste">
                  {[...restants].sort((a, b) => PRIX_CHOIX[rareteDe(a.id)] - PRIX_CHOIX[rareteDe(b.id)]).map((q) => {
                    const r = rareteDe(q.id)
                    return (
                      <button key={q.id} type="button" className="choix-quiz-ligne" style={{ ['--r' as string]: RARETES[r].couleur }} disabled={envoi} onClick={() => setVise(q)}>
                        <span className="choix-quiz-rarete">{RARETES[r].nom[lang]}</span>
                        <span className="choix-quiz-nom">{q.nom[lang]}</span>
                        <span className="choix-quiz-prix"><Piece size={15} />{PRIX_CHOIX[r]}</span>
                      </button>
                    )
                  })}
                </div>
              </>
            )}
            {vise && (
              <div className="confirmer-achat" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span>{fr ? `Dépenser ${PRIX_CHOIX[rareteDe(vise.id)]} pièces pour « ${vise.nom.fr} » ? Il te restera ${solde - PRIX_CHOIX[rareteDe(vise.id)]} pièces.` : 'Confirm?'}</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="button" className="btn btn-g" onClick={() => setVise(null)}>{fr ? 'Annuler' : 'Cancel'}</button>
                  <button type="button" className="btn btn-p" style={{ flex: 1 }} disabled={envoi || solde < PRIX_CHOIX[rareteDe(vise.id)]} onClick={acheterVise}>{solde < PRIX_CHOIX[rareteDe(vise.id)] ? (fr ? `Encore ${PRIX_CHOIX[rareteDe(vise.id)] - solde} pièces` : 'Not enough') : (fr ? '✓ Oui, acheter' : '✓ Yes, buy')}</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
