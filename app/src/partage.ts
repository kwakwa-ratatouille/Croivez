// Défi partageable (façon Wordle) : score en carrés + lien direct vers le quiz, via la feuille de partage du téléphone
export const URL_WEB = 'https://kwakwa-ratatouille.github.io/Croivez/'

export async function partagerDefi(o: { quiz?: string; nom: string; resultats: boolean[]; score: number; difficulte?: string; parrain?: string }) {
  const carres = o.resultats.map((j) => (j ? '🟩' : '🟥')).join('')
  const bonnes = o.resultats.filter(Boolean).length
  const lien = `${URL_WEB}#/${o.quiz ? `jouer/${o.quiz}` : ''}${o.parrain ? `?parrain=${o.parrain}` : ''}`
  const texte = `Croivez ✗✓ · ${o.nom}${o.difficulte ? ` (${o.difficulte})` : ''}\n${carres}\n${bonnes}/${o.resultats.length} · ${o.score} pts\nTu fais mieux ? 👉 ${lien}`
  try {
    if (navigator.share) { await navigator.share({ text: texte }); return 'partage' }
  } catch { /* partage annulé : on copie */ }
  try { await navigator.clipboard.writeText(texte); return 'copie' } catch { return 'echec' }
}
