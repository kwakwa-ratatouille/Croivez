import type { Lang } from '../i18n'
import type { Mode, SousThemeId } from './engine'

// Défi du jour : même sous-thème et mêmes questions pour tous les joueurs, tirés de la date
const DEFIS: { s: SousThemeId; m: Mode; titre: Record<Lang, string>; texte: Record<Lang, string> }[] = [
  { s: 'capitales', m: 'libre', titre: { fr: '10 capitales, saisie libre', en: '10 capitals, free typing' }, texte: { fr: 'Sans propositions : tapez la réponse, les fautes de frappe sont pardonnées.', en: 'No options: type the answer, typos are forgiven.' } },
  { s: 'villes-fr', m: 'libre', titre: { fr: '10 villes de France sur la carte', en: '10 French cities on the map' }, texte: { fr: 'Placez chaque ville au plus près.', en: 'Place each city as close as you can.' } },
  { s: 'drapeaux', m: 'libre', titre: { fr: '10 drapeaux à nommer', en: '10 flags to name' }, texte: { fr: 'Un drapeau, un nom de pays : à vous de l’écrire.', en: 'One flag, one country: type its name.' } },
  { s: 'pays-carte', m: 'libre', titre: { fr: '10 pays à trouver sur la carte', en: '10 countries to find on the map' }, texte: { fr: 'Cliquez sur le bon pays. Zoomez pour les plus petits.', en: 'Click the right country. Zoom in for the small ones.' } },
  { s: 'villes-monde', m: 'libre', titre: { fr: '10 villes du monde', en: '10 world cities' }, texte: { fr: 'La carte se cadre sur le pays, à vous de placer la ville.', en: 'The map zooms on the country, you place the city.' } },
  { s: 'drapeaux-inverse', m: 'qcm', titre: { fr: '10 drapeaux qui se ressemblent', en: '10 look-alike flags' }, texte: { fr: 'Quatre drapeaux du même continent : lequel est le bon ?', en: 'Four flags from the same continent: which one is it?' } },
  { s: 'capitales-inverse', m: 'libre', titre: { fr: '10 capitales, retrouvez le pays', en: '10 capitals, find the country' }, texte: { fr: 'On vous donne la capitale, tapez le pays.', en: 'Given the capital, type the country.' } },
]

export function defiDuJour(date: string) {
  // Graine = date AAAAMMJJ ; on avance d'un défi chaque jour
  const seed = Number(date.replace(/-/g, ''))
  const jourIndex = Math.floor(Date.parse(date) / 864e5)
  return { ...DEFIS[jourIndex % DEFIS.length], seed, url: `/partie?s=${DEFIS[jourIndex % DEFIS.length].s}&m=${DEFIS[jourIndex % DEFIS.length].m}&n=10&d=2&defi=1` }
}
