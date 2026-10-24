import { useAuth } from '../auth'
import { testPieces, testReinitialiser, testToutDebloquer } from '../progression'
import { ICONS, Icon } from './ui'

// Menu de test, ouvert par 3 appuis rapides sur le logo Croivez
export default function MenuTest({ onFermer }: { onFermer: () => void }) {
  const { user } = useAuth()
  if (!user) return null
  const action = (fn: () => Promise<unknown>) => async () => { await fn(); onFermer() }
  return (
    <div role="dialog" aria-modal="true" aria-label="Menu de test" className="caisse-fond" onClick={onFermer}>
      <div className="card rise" onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: 380, padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 className="t" style={{ fontSize: 22, fontWeight: 900 }}>Mode test</h2>
          <button className="btn btn-g" aria-label="Fermer" onClick={onFermer} style={{ minHeight: 40, padding: '0 10px' }}><Icon d={ICONS.close} size={18} /></button>
        </div>
        <button className="btn btn-p" onClick={action(() => testToutDebloquer(user.uid))}>Tout débloquer</button>
        <button className="btn btn-s" onClick={action(() => testReinitialiser(user.uid))}>Réinitialiser (choix des 6 quiz, 50 pièces)</button>
        <button className="btn btn-s" onClick={action(() => testPieces(user.uid, 500))}>+500 pièces</button>
        <button className="btn btn-g" onClick={action(async () => { Object.keys(localStorage).filter((k) => k.startsWith('memoire:')).forEach((k) => localStorage.removeItem(k)) })}>Effacer la mémoire des questions</button>
        <p style={{ fontSize: 13, color: 'var(--muted)' }}>L’XP, les badges et les statistiques ne sont pas touchés.</p>
      </div>
    </div>
  )
}
