type Props = {
  /** Fraction de temps restant, de 1 (plein) à 0 (écoulé). */
  remaining: number
  /** Secondes restantes, affichées au centre. */
  seconds: number
  /** Couleur du disque : l'orange du travail, le bleu de la transition. */
  tone: 'work' | 'rest'
  label?: string
}

const R = 46
const C = 2 * Math.PI * R

/**
 * Le disque façon Time Timer : la surface colorée se réduit à mesure que le
 * temps passe. L'important est de pouvoir lire le temps restant d'un coup
 * d'œil, sans lire le chiffre — d'où la surface pleine plutôt qu'un arc fin.
 */
export function TimeTimer({ remaining, seconds, tone, label }: Props) {
  const clamped = Math.max(0, Math.min(1, remaining))
  const angle = clamped * 2 * Math.PI
  const large = angle > Math.PI ? 1 : 0
  const x = 50 + R * Math.sin(angle)
  const y = 50 - R * Math.cos(angle)
  // Un secteur plein, dessiné depuis midi dans le sens horaire.
  const wedge =
    clamped >= 0.9999
      ? `M 50 4 A ${R} ${R} 0 1 1 49.99 4 Z`
      : `M 50 50 L 50 ${50 - R} A ${R} ${R} 0 ${large} 1 ${x} ${y} Z`

  return (
    <div className={`timetimer ${tone}`}>
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <circle className="tt-track" cx="50" cy="50" r={R} strokeDasharray={C} />
        {clamped > 0 && <path className="tt-wedge" d={wedge} />}
        <circle className="tt-rim" cx="50" cy="50" r={R} />
      </svg>
      <div className="tt-readout">
        <span className="tt-seconds">{Math.ceil(seconds)}</span>
        {label && <span className="tt-label">{label}</span>}
      </div>
    </div>
  )
}
