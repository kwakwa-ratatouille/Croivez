import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { get, ref } from 'firebase/database'
import { rtdb } from '../firebase'
import { useAuth } from '../auth'

// Partie de salon encore en cours (appli fermée ou téléphone en veille) : un bandeau pour y retourner
export default function ReprendrePartie() {
  const { user } = useAuth()
  const [code, setCode] = useState<string | null>(null)
  useEffect(() => {
    let c: string | null = null
    try { c = localStorage.getItem('salonEnCours') } catch { /* rien */ }
    if (!c || !user) return
    get(ref(rtdb, `duels/salon-${c}`)).then((s) => { const v = s.val(); if (v && v.etat !== 'fini' && v.joueurs?.[user.uid]) setCode(c); else { try { localStorage.removeItem('salonEnCours') } catch { /* rien */ } } }).catch(() => {})
  }, [user])
  if (!code) return null
  return <Link to={`/salon/${code}`} className="reprendre-partie"><span>🎮</span><strong>Une partie est en cours (salon {code})</strong><span>Reprendre →</span></Link>
}
