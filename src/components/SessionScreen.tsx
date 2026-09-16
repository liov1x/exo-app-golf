import { useState } from 'react'
import type { Session } from '../data/sessions'
import { useSession, stepTitle } from '../engine/useSession'
import { useWakeLock } from '../lib/wakeLock'
import { unlockAudio } from '../lib/cues'
import { Figure } from './Figure'
import { TimeTimer } from './TimeTimer'

function clock(seconds: number) {
  const s = Math.max(0, Math.ceil(seconds))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

export function SessionScreen({ session, onExit }: { session: Session; onExit: () => void }) {
  const s = useSession(session)
  const [showPhoto, setShowPhoto] = useState(false)
  useWakeLock(s.running)

  const step = s.step
  // Ce qui intéresse, c'est le prochain exercice réel. Pendant une transition,
  // l'exercice qui suit immédiatement est celui qu'on est en train d'annoncer :
  // il faut donc regarder un cran plus loin.
  const workAhead = s.steps.slice(s.index + 1).filter((st) => st.kind === 'work')
  const upcoming = step.kind === 'transition' ? workAhead[1] : workAhead[0]

  if (s.finished) {
    return (
      <div className="screen finished">
        <h2>Séance terminée</h2>
        <p className="finished-meta">
          {session.name} · {clock(s.total)}
        </p>
        <div className="actions">
          <button className="btn primary" onClick={s.restart}>
            Recommencer
          </button>
          <button className="btn" onClick={onExit}>
            Retour
          </button>
        </div>
      </div>
    )
  }

  const isWork = step.kind === 'work'
  const progress = step.duration > 0 ? s.remaining / step.duration : 0
  const globalProgress = s.total > 0 ? 1 - s.totalRemaining / s.total : 0

  const toggle = () => {
    unlockAudio()
    s.toggle()
  }

  return (
    <div className={`screen session ${isWork ? 'is-work' : 'is-transition'}`}>
      <div className="topbar">
        <button className="ghost" onClick={onExit} aria-label="Quitter la séance">
          ✕
        </button>
        <div className="topbar-mid">
          <span className="session-label">{session.name}</span>
          <span className="remaining-total">reste {clock(s.totalRemaining)}</span>
        </div>
        <button
          className={`ghost ${showPhoto ? 'on' : ''}`}
          onClick={() => setShowPhoto((v) => !v)}
          aria-label="Afficher la photo d’origine"
        >
          ⧉
        </button>
      </div>

      <div className="stage">
        {isWork ? (
          <Figure
            frames={step.exercise.frames}
            cycle={step.exercise.cycle}
            running={s.running}
            mirrored={step.side === 'droit'}
            armsBehind={step.exercise.armsBehind}
          />
        ) : (
          <div className="next-up">
            <span className="next-label">Ensuite</span>
            <Figure
              frames={[step.exercise.frames[0]]}
              cycle={step.exercise.cycle}
              running={false}
              mirrored={step.side === 'droit'}
              armsBehind={step.exercise.armsBehind}
            />
          </div>
        )}

        {showPhoto && (
          <img className="photo" src={step.exercise.photo} alt={`Photo de ${step.exercise.name}`} />
        )}
      </div>

      <div className="info">
        <h2 className="exo-name">
          <span className="exo-num">{step.exercise.id}</span>
          {stepTitle(step)}
        </h2>
        <p className="exo-cue">{step.exercise.cue}</p>
      </div>

      <TimeTimer
        remaining={progress}
        seconds={s.remaining}
        tone={isWork ? 'work' : 'rest'}
        label={isWork ? 'secondes' : 'préparation'}
      />

      <div className="controls">
        <button className="btn round" onClick={s.previous} aria-label="Étape précédente">
          ⟲
        </button>
        <button className="btn round big primary" onClick={toggle}>
          {s.running ? '❙❙' : '▶'}
        </button>
        <button className="btn round" onClick={s.next} aria-label="Étape suivante">
          ⟳
        </button>
      </div>

      <div className="secondary-controls">
        <button className="btn slim" onClick={() => s.addTime(15)}>
          +15 s
        </button>
        <span className="upcoming">
          {upcoming ? `puis ${stepTitle(upcoming)}` : 'dernier exercice'}
        </span>
      </div>

      <div className="global-bar" aria-hidden="true">
        <div className="global-bar-fill" style={{ width: `${globalProgress * 100}%` }} />
      </div>
    </div>
  )
}
