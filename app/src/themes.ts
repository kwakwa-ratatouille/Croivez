import type { Lang } from './i18n'
import type { SousThemeId } from './quiz/engine'

export type Famille = 'geo' | 'cine' | 'mus' | 'nat' | 'sci' | 'his' | 'brd'

export type SousTheme = { id: string; nom: Record<Lang, string>; jouable?: SousThemeId }

// Icônes et motifs repris de la DA (Themes.dc.html)
export const FAMILLES: { k: Famille; nom: Record<Lang, string>; icon: string; motif: string; subs: SousTheme[] }[] = [
  {
    k: 'geo', nom: { fr: 'Géographie', en: 'Geography' },
    icon: 'M12 3.5a8.5 8.5 0 1 0 0 17a8.5 8.5 0 1 0 0-17ZM3.5 12h17M12 3.5c2.4 2.6 3.5 5.4 3.5 8.5s-1.1 5.9-3.5 8.5c-2.4-2.6-3.5-5.4-3.5-8.5s1.1-5.9 3.5-8.5Z',
    motif: 'M0 20 Q30 0 60 20 T120 20 M0 42 Q30 22 60 42 T120 42 M0 64 Q30 44 60 64 T120 64',
    subs: [
      { id: 'drapeaux', nom: { fr: 'Drapeaux', en: 'Flags' }, jouable: 'drapeaux' },
      { id: 'drapeaux-inverse', nom: { fr: 'Trouver le drapeau', en: 'Find the flag' }, jouable: 'drapeaux-inverse' },
      { id: 'capitales', nom: { fr: 'Capitales', en: 'Capitals' }, jouable: 'capitales' },
      { id: 'capitales-inverse', nom: { fr: 'Capitale → pays', en: 'Capital → country' }, jouable: 'capitales-inverse' },
      { id: 'villes-fr', nom: { fr: 'Villes de France', en: 'French cities' }, jouable: 'villes-fr' },
      { id: 'villes-monde', nom: { fr: 'Villes du monde', en: 'World cities' }, jouable: 'villes-monde' },
      { id: 'pays-carte', nom: { fr: 'Pays sur la carte', en: 'Countries on the map' }, jouable: 'pays-carte' },
    ],
  },
  {
    k: 'cine', nom: { fr: 'Cinéma & séries', en: 'Film & TV' },
    icon: 'M6 7h12a2.5 2.5 0 0 1 2.5 2.5v8A2.5 2.5 0 0 1 18 20H6a2.5 2.5 0 0 1-2.5-2.5v-8A2.5 2.5 0 0 1 6 7ZM3.5 11h17M8 7l2 4M13 7l2 4',
    motif: 'M10 10h100v60H10ZM10 20h100M10 60h100M20 10v10M40 10v10M60 10v10M80 10v10M100 10v10M20 60v10M40 60v10M60 60v10M80 60v10M100 60v10',
    subs: [{ id: 'films', nom: { fr: 'Films et réalisateurs', en: 'Films & directors' }, jouable: 'films' }, { id: 'series', nom: { fr: 'Séries', en: 'TV shows' }, jouable: 'series' }, { id: 'acteurs', nom: { fr: 'Acteurs', en: 'Actors' }, jouable: 'acteurs' }, { id: 'affiches', nom: { fr: 'Affiches de films', en: 'Film posters' } }],
  },
  {
    k: 'mus', nom: { fr: 'Musique', en: 'Music' },
    icon: 'M9 18V6l10-2v12M9 18a2.5 2.5 0 1 1-5 0a2.5 2.5 0 1 1 5 0ZM19 16a2.5 2.5 0 1 1-5 0a2.5 2.5 0 1 1 5 0Z',
    motif: 'M30 60V20l40-8v40M30 60a8 6 0 1 1-16 0a8 6 0 1 1 16 0M70 52a8 6 0 1 1-16 0a8 6 0 1 1 16 0M96 40V14l14 6',
    subs: [{ id: 'artistes', nom: { fr: 'Artistes', en: 'Artists' }, jouable: 'artistes' }, { id: 'extraits', nom: { fr: 'Extraits musicaux', en: 'Music clips' } }, { id: 'albums', nom: { fr: 'Albums', en: 'Albums' }, jouable: 'albums' }],
  },
  {
    k: 'nat', nom: { fr: 'Nature', en: 'Nature' },
    icon: 'M5 19.5C5 11 10 5 20 4.5c0 9.5-6 15-15 15ZM5 19.5c3-4.5 6.5-7.5 10-9',
    motif: 'M20 70C20 40 40 18 80 16c0 36-24 54-60 54M20 70c12-16 26-28 40-34M80 60c0-14 10-24 30-26 0 18-12 26-30 26',
    subs: [{ id: 'animaux', nom: { fr: 'Animaux', en: 'Animals' }, jouable: 'animaux' }, { id: 'insectes', nom: { fr: 'Insectes', en: 'Insects' }, jouable: 'insectes' }, { id: 'plantes', nom: { fr: 'Plantes', en: 'Plants' }, jouable: 'plantes' }],
  },
  {
    k: 'sci', nom: { fr: 'Corps humain & sciences', en: 'Human body & science' },
    icon: 'M9.5 3.5h5M10.5 3.5v5.5L5.2 18.3a1.5 1.5 0 0 0 1.3 2.2h11a1.5 1.5 0 0 0 1.3-2.2L13.5 9V3.5M7.5 15h9',
    motif: 'M40 40a10 10 0 1 1-20 0a10 10 0 1 1 20 0M80 20a8 8 0 1 1-16 0a8 8 0 1 1 16 0M100 56a10 10 0 1 1-20 0a10 10 0 1 1 20 0M40 36l26-12M76 26l12 22',
    subs: [{ id: 'corps', nom: { fr: 'Corps humain', en: 'Human body' }, jouable: 'corps' }, { id: 'elements', nom: { fr: 'Éléments chimiques', en: 'Chemical elements' }, jouable: 'elements' }],
  },
  {
    k: 'his', nom: { fr: 'Personnalités & histoire', en: 'People & history' },
    icon: 'M3.5 9 12 4.5 20.5 9M6 10v7.5M10 10v7.5M14 10v7.5M18 10v7.5M3.5 20h17',
    motif: 'M20 30 60 10l40 20M28 34v30M48 34v30M72 34v30M92 34v30M16 70h88',
    subs: [{ id: 'personnalites', nom: { fr: 'Personnalités', en: 'Famous people' }, jouable: 'personnalites' }, { id: 'histoire', nom: { fr: 'Dates de l’histoire', en: 'History dates' }, jouable: 'histoire' }],
  },
  {
    k: 'brd', nom: { fr: 'Marques & logos', en: 'Brands & logos' },
    icon: 'M3.5 12.6V4.5a1 1 0 0 1 1-1h8.1l8 8-9 9ZM10 8.5a1.5 1.5 0 1 1-3 0a1.5 1.5 0 1 1 3 0Z',
    motif: 'M20 44V14h30l34 34-30 30ZM40 30a5 5 0 1 1-10 0a5 5 0 1 1 10 0',
    subs: [{ id: 'logos', nom: { fr: 'Logos', en: 'Logos' }, jouable: 'logos' }, { id: 'marques', nom: { fr: 'Marques et pays', en: 'Brands & countries' }, jouable: 'marques' }],
  },
]

export const trouverSousTheme = (id: string) => {
  for (const f of FAMILLES) {
    const s = f.subs.find((x) => x.id === id)
    if (s) return { famille: f, sous: s }
  }
  return null
}
