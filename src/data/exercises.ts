import type { Pose } from '../lib/pose'

export type Category = 'sol' | 'quadrupedie' | 'debout'

export type Exercise = {
  /** Numéro de la planche MOBILITE d'origine : on garde la correspondance. */
  id: number
  name: string
  /** Une ligne, pas plus : c'est lu en une seconde, entre deux respirations. */
  cue: string
  category: Category
  /** Durée par défaut d'un côté, en secondes. */
  duration: number
  /** Si vrai, l'exercice est joué deux fois : côté gauche puis côté droit. */
  bilateral: boolean
  /** Durée d'un aller-retour du mouvement, en secondes : le tempo à suivre. */
  cycle: number
  /** Poses clés du schéma animé. */
  frames: Pose[]
  /** Photo d'origine découpée de la planche PDF. */
  photo: string
}

const CATEGORY_LABEL: Record<Category, string> = {
  sol: 'Au sol',
  quadrupedie: 'Quatre pattes',
  debout: 'Debout',
}

export function categoryLabel(c: Category) {
  return CATEGORY_LABEL[c]
}

export const EXERCISES: Exercise[] = [
  {
    id: 1,
    name: 'Pont fessier',
    cue: 'Dos au sol, pieds ancrés : monte le bassin, redescends lentement.',
    category: 'sol',
    duration: 45,
    bilateral: false,
    cycle: 6,
    photo: 'photos/exo-01.jpg',
    frames: [
      {
        head: [46, 116], neck: [58, 119], hip: [98, 119],
        elbowA: [74, 124], handA: [90, 124],
        elbowB: [72, 127], handB: [88, 128],
        kneeA: [118, 96], footA: [132, 124],
        kneeB: [116, 100], footB: [130, 125],
      },
      {
        head: [46, 116], neck: [58, 119], hip: [98, 92],
        elbowA: [74, 124], handA: [90, 124],
        elbowB: [72, 127], handB: [88, 128],
        kneeA: [120, 86], footA: [132, 124],
        kneeB: [118, 90], footB: [130, 125],
      },
    ],
  },
  {
    id: 4,
    name: 'Genoux à la poitrine',
    cue: 'Ramène les deux genoux, entoure-les des bras, berce doucement.',
    category: 'sol',
    duration: 40,
    bilateral: false,
    cycle: 5,
    photo: 'photos/exo-04.jpg',
    frames: [
      {
        head: [46, 116], neck: [58, 118], hip: [104, 119],
        elbowA: [76, 112], handA: [94, 100],
        elbowB: [76, 116], handB: [92, 104],
        kneeA: [94, 98], footA: [112, 106],
        kneeB: [92, 102], footB: [110, 110],
      },
      {
        head: [48, 114], neck: [60, 116], hip: [100, 118],
        elbowA: [70, 106], handA: [84, 92],
        elbowB: [70, 110], handB: [82, 96],
        kneeA: [84, 88], footA: [98, 102],
        kneeB: [82, 92], footB: [96, 106],
      },
    ],
  },
  {
    id: 12,
    name: 'Bascule à quatre pattes',
    cue: 'Recule les fesses vers les talons, puis reviens à l’aplomb des mains.',
    category: 'quadrupedie',
    duration: 40,
    bilateral: false,
    cycle: 5,
    photo: 'photos/exo-12.jpg',
    frames: [
      {
        head: [58, 80], neck: [70, 84], hip: [118, 84],
        elbowA: [70, 104], handA: [72, 124],
        elbowB: [67, 105], handB: [69, 126],
        kneeA: [118, 122], footA: [136, 125],
        kneeB: [115, 123], footB: [133, 126],
      },
      {
        head: [50, 90], neck: [64, 90], hip: [106, 94],
        elbowA: [70, 106], handA: [72, 124],
        elbowB: [67, 107], handB: [69, 126],
        kneeA: [118, 122], footA: [136, 125],
        kneeB: [115, 123], footB: [133, 126],
      },
    ],
  },
  {
    id: 18,
    name: 'Planche, genou vers la poitrine',
    cue: 'Gainage bras tendus : ramène un genou, sans creuser le dos.',
    category: 'quadrupedie',
    duration: 35,
    bilateral: false,
    cycle: 4,
    photo: 'photos/exo-18.jpg',
    frames: [
      {
        head: [54, 78], neck: [66, 82], hip: [108, 102],
        elbowA: [68, 104], handA: [70, 124],
        elbowB: [65, 105], handB: [67, 126],
        kneeA: [130, 112], footA: [150, 123],
        kneeB: [128, 114], footB: [148, 125],
      },
      {
        head: [54, 78], neck: [66, 82], hip: [108, 102],
        elbowA: [68, 104], handA: [70, 124],
        elbowB: [65, 105], handB: [67, 126],
        kneeA: [98, 106], footA: [114, 118],
        kneeB: [128, 114], footB: [148, 125],
      },
    ],
  },
  {
    id: 19,
    name: 'Fente, bras au ciel',
    cue: 'Grande fente : le bras arrière monte et s’étire vers le haut.',
    category: 'debout',
    duration: 30,
    bilateral: true,
    cycle: 6,
    photo: 'photos/exo-19.jpg',
    frames: [
      {
        head: [94, 26], neck: [96, 40], hip: [98, 74],
        elbowA: [104, 58], handA: [108, 74],
        elbowB: [90, 58], handB: [86, 74],
        kneeA: [120, 98], footA: [124, 124],
        kneeB: [80, 100], footB: [64, 124],
      },
      {
        head: [92, 24], neck: [94, 38], hip: [98, 72],
        elbowA: [98, 16], handA: [100, 3],
        elbowB: [90, 56], handB: [86, 72],
        kneeA: [120, 98], footA: [124, 124],
        kneeB: [78, 102], footB: [62, 124],
      },
    ],
  },
  {
    id: 24,
    name: 'Inclinaison debout, bras au-dessus',
    cue: 'Pieds écartés, bras tendus : incline le buste d’un côté puis de l’autre.',
    category: 'debout',
    duration: 40,
    bilateral: false,
    cycle: 6,
    photo: 'photos/exo-24.jpg',
    frames: [
      {
        head: [90, 30], neck: [93, 42], hip: [100, 74],
        elbowA: [105, 24], handA: [98, 6],
        elbowB: [76, 34], handB: [74, 14],
        kneeA: [112, 98], footA: [118, 124],
        kneeB: [88, 98], footB: [82, 124],
      },
      {
        head: [100, 26], neck: [100, 40], hip: [100, 74],
        elbowA: [114, 26], handA: [110, 6],
        elbowB: [86, 26], handB: [90, 6],
        kneeA: [112, 98], footA: [118, 124],
        kneeB: [88, 98], footB: [82, 124],
      },
      {
        head: [110, 30], neck: [107, 42], hip: [100, 74],
        elbowA: [124, 34], handA: [126, 14],
        elbowB: [95, 24], handB: [102, 6],
        kneeA: [112, 98], footA: [118, 124],
        kneeB: [88, 98], footB: [82, 124],
      },
    ],
  },
]

export function getExercise(id: number): Exercise {
  const found = EXERCISES.find((e) => e.id === id)
  if (!found) throw new Error(`Exercice ${id} introuvable`)
  return found
}
