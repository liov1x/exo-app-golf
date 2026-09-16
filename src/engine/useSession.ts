import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getExercise, type Exercise } from '../data/exercises'
import type { Session } from '../data/sessions'
import { cueCountdown, cueEnd, cueFinish, cueStart, speak } from '../lib/cues'

export type Side = 'gauche' | 'droit'

export type Step = {
  kind: 'transition' | 'work'
  exercise: Exercise
  side?: Side
  duration: number
}

/**
 * Déplie une séance en une liste plate d'étapes.
 *
 * Chaque exercice est précédé d'une transition, et un exercice bilatéral
 * devient deux blocs transition + travail, un par côté.
 */
export function buildSteps(session: Session): Step[] {
  const steps: Step[] = []
  for (const item of session.items) {
    const exercise = getExercise(item.exerciseId)
    const duration = item.duration ?? exercise.duration
    const sides: (Side | undefined)[] = exercise.bilateral ? ['gauche', 'droit'] : [undefined]
    for (const side of sides) {
      steps.push({ kind: 'transition', exercise, side, duration: session.transition })
      steps.push({ kind: 'work', exercise, side, duration })
    }
  }
  return steps
}

export function stepTitle(step: Step): string {
  return step.side ? `${step.exercise.name} — côté ${step.side}` : step.exercise.name
}

export function useSession(session: Session) {
  const steps = useMemo(() => buildSteps(session), [session])
  const [index, setIndex] = useState(0)
  const [remaining, setRemaining] = useState(steps[0]?.duration ?? 0)
  const [running, setRunning] = useState(false)
  const [finished, setFinished] = useState(false)

  const deadline = useRef<number | null>(null)
  const lastWhole = useRef<number>(Math.ceil(steps[0]?.duration ?? 0))
  // Le temps restant change à chaque image : on le garde aussi en ref pour que
  // la boucle de décompte ne soit pas remontée 60 fois par seconde.
  const remainingRef = useRef(remaining)
  remainingRef.current = remaining

  const step = steps[index]

  /** Positionne une étape et annonce ce qu'il faut annoncer. */
  const goTo = useCallback(
    (next: number, announce: boolean) => {
      if (next >= steps.length) {
        setRunning(false)
        setFinished(true)
        deadline.current = null
        cueFinish()
        speak('Séance terminée')
        return
      }
      const target = steps[next]
      setIndex(next)
      setRemaining(target.duration)
      lastWhole.current = Math.ceil(target.duration)
      deadline.current = performance.now() + target.duration * 1000
      if (announce) {
        if (target.kind === 'transition') {
          cueEnd()
          speak(`Ensuite, ${stepTitle(target)}`)
        } else {
          cueStart()
        }
      }
    },
    [steps],
  )

  // Boucle de décompte, calée sur l'horloge murale pour ne pas dériver.
  useEffect(() => {
    if (!running || finished) return
    if (deadline.current === null) deadline.current = performance.now() + remainingRef.current * 1000

    let raf = 0
    const tick = () => {
      const left = ((deadline.current ?? 0) - performance.now()) / 1000
      if (left <= 0) {
        goTo(index + 1, true)
      } else {
        setRemaining(left)
        const whole = Math.ceil(left)
        if (whole < lastWhole.current) {
          lastWhole.current = whole
          if (whole <= 3) cueCountdown()
        }
        raf = requestAnimationFrame(tick)
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [running, finished, index, remaining, goTo])

  const start = useCallback(() => {
    setFinished(false)
    deadline.current = performance.now() + remainingRef.current * 1000
    setRunning(true)
    if (steps[index]?.kind === 'work') cueStart()
    else speak(stepTitle(steps[index]))
  }, [index, steps])

  const pause = useCallback(() => {
    setRunning(false)
    deadline.current = null
  }, [])

  const toggle = useCallback(() => (running ? pause() : start()), [running, pause, start])

  const next = useCallback(() => goTo(index + 1, false), [goTo, index])

  /** Retour : revient au début de l'étape en cours si on est déjà dedans. */
  const previous = useCallback(() => {
    const atStart = step && remaining > step.duration - 2
    goTo(Math.max(0, atStart ? index - 1 : index), false)
  }, [goTo, index, remaining, step])

  const addTime = useCallback((seconds: number) => {
    setRemaining((r) => r + seconds)
    if (deadline.current !== null) deadline.current += seconds * 1000
    lastWhole.current += seconds
  }, [])

  const restart = useCallback(() => {
    setRunning(false)
    setFinished(false)
    goTo(0, false)
    deadline.current = null
  }, [goTo])

  /** Temps restant sur toute la séance, pour la barre de progression globale. */
  const totalRemaining = useMemo(() => {
    const after = steps.slice(index + 1).reduce((sum, s) => sum + s.duration, 0)
    return after + remaining
  }, [steps, index, remaining])

  const total = useMemo(() => steps.reduce((sum, s) => sum + s.duration, 0), [steps])

  return {
    steps,
    step,
    index,
    remaining,
    running,
    finished,
    total,
    totalRemaining,
    toggle,
    next,
    previous,
    addTime,
    restart,
  }
}
