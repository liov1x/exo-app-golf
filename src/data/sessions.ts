import { EXERCISES, getExercise } from './exercises'

export type SessionItem = {
  exerciseId: number
  /** Surcharge la durée par défaut de l'exercice, en secondes. */
  duration?: number
}

export type Session = {
  id: string
  name: string
  subtitle: string
  /** Temps de transition entre deux exercices, en secondes. */
  transition: number
  items: SessionItem[]
}

export const SESSIONS: Session[] = [
  {
    id: 'complete',
    name: 'Mobilité complète',
    subtitle: 'Tout l’enchaînement, du sol jusqu’à debout',
    transition: 10,
    items: EXERCISES.map((e) => ({ exerciseId: e.id })),
  },
  {
    id: 'sol',
    name: 'Au sol',
    subtitle: 'Bas du dos et bassin, sans se relever',
    transition: 10,
    items: [{ exerciseId: 1 }, { exerciseId: 4 }, { exerciseId: 12 }],
  },
  {
    id: 'avant-parcours',
    name: 'Avant-parcours',
    subtitle: 'Debout, court, sans tapis',
    transition: 8,
    items: [
      { exerciseId: 19, duration: 25 },
      { exerciseId: 24, duration: 30 },
    ],
  },
]

/** Durée totale d'une séance, transitions comprises, en secondes. */
export function sessionDuration(session: Session): number {
  return session.items.reduce((total, item) => {
    const ex = getExercise(item.exerciseId)
    const work = (item.duration ?? ex.duration) * (ex.bilateral ? 2 : 1)
    const transitions = session.transition * (ex.bilateral ? 2 : 1)
    return total + work + transitions
  }, 0)
}
