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
  /** Dessine le bras avant derrière le corps, quand la main revient le toucher. */
  armsBehind?: boolean
  /**
   * De profil, un mouvement symétrique superpose les deux bras — ou les deux
   * jambes — et celui du fond ne sort qu'en liseré. On n'en dessine alors qu'un.
   * À laisser faux dès que les deux membres font des choses différentes.
   */
  singleArm?: boolean
  singleLeg?: boolean
  /** Coupe le trait de sol, sur les vues où il n'a pas de sens. */
  noGround?: boolean
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
    armsBehind: true,
    singleArm: true,
    singleLeg: true,
    frames: [
      {
        head: [46, 116], neck: [58, 119], hip: [98, 119],
        elbowA: [74, 124], handA: [90, 124],
        elbowB: [72, 127], handB: [88, 128],
        kneeA: [118, 96], footA: [132, 124],
        kneeB: [110, 101], footB: [126, 125],
      },
      {
        head: [46, 116], neck: [58, 119], hip: [98, 92],
        elbowA: [74, 124], handA: [90, 124],
        elbowB: [72, 127], handB: [88, 128],
        kneeA: [120, 86], footA: [132, 124],
        kneeB: [112, 92], footB: [126, 125],
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
    armsBehind: true,
    singleArm: true,
    singleLeg: true,
    // La cuisse monte franchement vers la poitrine et le tibia redescend bien
    // à l'écart : sans cet angle, cuisse et tibia se superposent en un moignon
    // et le bras vient refermer le tout en pâté.
    frames: [
      {
        head: [44, 118], neck: [56, 118], hip: [106, 118],
        elbowA: [66, 106], handA: [78, 98],
        elbowB: [66, 108], handB: [78, 100],
        kneeA: [88, 94], footA: [106, 112],
        kneeB: [88, 94], footB: [106, 112],
      },
      {
        head: [44, 118], neck: [56, 118], hip: [102, 118],
        elbowA: [60, 100], handA: [70, 90],
        elbowB: [60, 102], handB: [70, 92],
        kneeA: [78, 82], footA: [96, 104],
        kneeB: [78, 82], footB: [96, 104],
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
    // Essayé en trois quarts : les quatre appuis se voyaient, mais le corps
    // devenait une masse illisible. Le profil dit la même chose plus clairement.
    singleArm: true,
    singleLeg: true,
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
    singleArm: true,
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
        head: [87, 32], neck: [93, 44], hip: [100, 76],
        elbowA: [112, 30], handA: [110, 8],
        elbowB: [76, 38], handB: [68, 20],
        kneeA: [112, 100], footA: [118, 124],
        kneeB: [88, 100], footB: [82, 124],
      },
      {
        head: [100, 28], neck: [100, 42], hip: [100, 76],
        elbowA: [116, 30], handA: [120, 9],
        elbowB: [84, 30], handB: [80, 9],
        kneeA: [112, 100], footA: [118, 124],
        kneeB: [88, 100], footB: [82, 124],
      },
      {
        head: [113, 32], neck: [107, 44], hip: [100, 76],
        elbowA: [124, 38], handA: [132, 20],
        elbowB: [88, 30], handB: [90, 8],
        kneeA: [112, 100], footA: [118, 124],
        kneeB: [88, 100], footB: [82, 124],
      },
    ],
  },
]

export function getExercise(id: number): Exercise {
  const found = EXERCISES.find((e) => e.id === id)
  if (!found) throw new Error(`Exercice ${id} introuvable`)
  return found
}
