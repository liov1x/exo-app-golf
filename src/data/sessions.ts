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

/**
 * Temps de préparation entre deux exercices, en secondes.
 *
 * Réglé à l'usage : dix secondes, c'était long — on attend. Cinq suffisent à
 * entendre l'annonce du suivant et à se replacer.
 */
const TRANSITION = 5

const all = (ids: number[]): SessionItem[] => ids.map((exerciseId) => ({ exerciseId }))

export const SESSIONS: Session[] = [
  {
    id: 'complete',
    name: 'Mobilité complète',
    subtitle: 'Les 27 exercices, du sol jusqu’à debout',
    transition: TRANSITION,
    items: EXERCISES.map((e) => ({ exerciseId: e.id })),
  },
  {
    id: 'sol',
    name: 'Au sol',
    subtitle: 'Bas du dos, bassin et hanches, sans se relever',
    transition: TRANSITION,
    items: all([1, 2, 4, 6, 8, 10, 12]),
  },
  {
    id: 'dos',
    name: 'Bas du dos',
    subtitle: 'Enroulements et rotations, en douceur',
    transition: TRANSITION,
    items: all([2, 4, 5, 7, 12, 14]),
  },
  {
    id: 'avant-parcours',
    name: 'Avant-parcours',
    subtitle: 'Debout, court, sans tapis',
    transition: TRANSITION,
    items: [
      { exerciseId: 27, duration: 20 },
      { exerciseId: 24, duration: 25 },
      { exerciseId: 26, duration: 25 },
      { exerciseId: 25, duration: 25 },
      { exerciseId: 19, duration: 20 },
    ],
  },
  {
    id: 'reveil',
    name: 'Réveil',
    subtitle: 'Court, du sol à debout',
    transition: TRANSITION,
    items: [
      { exerciseId: 2, duration: 25 },
      { exerciseId: 12, duration: 25 },
      { exerciseId: 11, duration: 20 },
      { exerciseId: 23, duration: 20 },
      { exerciseId: 26, duration: 25 },
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
