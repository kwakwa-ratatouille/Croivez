import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { App } from '@capacitor/app'
import { natif } from '../firebase'

// Lien « croivez://rejoindre/ABCDE » (bouton « Ouvrir dans l'appli » de la page web) : on va à la bonne page
export default function LiensAppli() {
  const nav = useNavigate()
  useEffect(() => {
    if (!natif) return
    const l = App.addListener('appUrlOpen', ({ url }) => {
      const chemin = url.replace(/^croivez:\/\/+/i, '/').replace(/^https?:\/\/[^#]+#/, '')
      if (chemin.startsWith('/')) nav(chemin)
    })
    return () => { l.then((x) => x.remove()) }
  }, [nav])
  return null
}
