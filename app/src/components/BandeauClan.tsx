import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BLASON_DEFAUT, clansPublics, lireClan, maxMembres, niveauClan, xpNiveau, type Clan, type EntreeIndex } from '../clans'
import BlasonClan from './BlasonClan'
import Avatar from './Avatar'

// Grand bandeau des clans dans Multi : mon clan (niveau, progression, membres) ou les clans à rejoindre
export default function BandeauClan({ code }: { code?: string }) {
  const [clan, setClan] = useState<Clan | null>(null)
  const [top, setTop] = useState<(EntreeIndex & { code: string })[]>([])
  useEffect(() => {
    if (code) lireClan(code).then(setClan).catch(() => setClan(null))
    else { setClan(null); clansPublics().then((l) => setTop(l.slice(0, 3))).catch(() => setTop([])) }
  }, [code])

  if (code && clan) {
    const niv = niveauClan(clan.xp)
    const debut = xpNiveau(niv), fin = xpNiveau(niv + 1)
    const membres = Object.values(clan.membres ?? {})
    return (
      <Link to="/clan" className="bandeau-clan" style={{ ['--c1' as string]: clan.blason.c1, ['--c2' as string]: clan.blason.c2 }}>
        <BlasonClan b={clan.blason} niveau={niv} taille={84} />
        <div className="bandeau-clan-texte">
          <span className="clan-niveau">Clan · niveau {niv}</span>
          <strong className="t">{clan.nom}</strong>
          <div className="clan-xp"><span style={{ width: `${((clan.xp ?? 0) - debut) / (fin - debut) * 100}%` }} /></div>
          <div className="bandeau-clan-membres">{membres.slice(0, 6).map((m, i) => <Avatar key={i} pseudo={m.pseudo} avatar={m.avatar} cadre={m.cadre} taille={26} />)}<small>{membres.length} / {maxMembres(niv)}</small></div>
        </div>
      </Link>
    )
  }
  return (
    <Link to="/clan" className="bandeau-clan vide">
      <BlasonClan b={BLASON_DEFAUT} niveau={5} taille={76} />
      <div className="bandeau-clan-texte">
        <span className="clan-niveau">Nouveau</span>
        <strong className="t">Rejoins un clan</strong>
        <small>Montez de niveau ensemble et débloquez un blason légendaire.</small>
        {top.length > 0 && <div className="bandeau-clan-top">{top.map((c) => <span key={c.code}><BlasonClan b={c.blason} niveau={niveauClan(c.xp)} taille={22} />{c.nom}</span>)}</div>}
      </div>
      <span className="bandeau-clan-cta">Voir les clans →</span>
    </Link>
  )
}
