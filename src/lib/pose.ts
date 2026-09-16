/**
 * Modèle de bonhomme schématique.
 *
 * Toutes les coordonnées vivent dans un repère fixe de 200 x 140 unités,
 * avec le sol à y = 125. Un adulte debout mesure ~100 unités, allongé il
 * occupe ~110 unités de long : les deux tiennent dans le même cadre, donc
 * le bonhomme ne « saute » pas d'échelle entre deux exercices.
 *
 * Le côté A est le membre le plus proche du spectateur (tracé plein),
 * le côté B celui qui est derrière (tracé plus pâle) : ça suffit à donner
 * la profondeur sans dessiner un vrai corps.
 */
export type Point = readonly [number, number]

export type Pose = {
  head: Point
  neck: Point
  hip: Point
  elbowA: Point
  handA: Point
  elbowB: Point
  handB: Point
  kneeA: Point
  footA: Point
  kneeB: Point
  footB: Point
}

export const GROUND_Y = 125

export const JOINTS = [
  'head', 'neck', 'hip',
  'elbowA', 'handA', 'elbowB', 'handB',
  'kneeA', 'footA', 'kneeB', 'footB',
] as const

/** Interpolation linéaire entre deux poses, t dans [0, 1]. */
export function lerpPose(a: Pose, b: Pose, t: number): Pose {
  const out = {} as Record<(typeof JOINTS)[number], Point>
  for (const j of JOINTS) {
    const [ax, ay] = a[j]
    const [bx, by] = b[j]
    out[j] = [ax + (bx - ax) * t, ay + (by - ay) * t]
  }
  return out as Pose
}

/** Accélération/décélération douce : un mouvement de mobilité n'est jamais linéaire. */
export function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
}

/**
 * Position dans un cycle d'animation.
 *
 * `frames` est la suite de poses clés. On va de la première à la dernière
 * puis on revient en arrière (aller-retour), ce qui correspond à la façon
 * dont ces mouvements se font réellement.
 */
export function poseAtCycle(frames: Pose[], progress: number): Pose {
  if (frames.length === 1) return frames[0]
  // progress dans [0,1) sur un aller-retour complet
  const pingPong = progress < 0.5 ? progress * 2 : (1 - progress) * 2
  const segments = frames.length - 1
  const scaled = Math.min(pingPong * segments, segments - 0.000001)
  const i = Math.floor(scaled)
  return lerpPose(frames[i], frames[i + 1], easeInOut(scaled - i))
}

export type View = { x: number; y: number; w: number; h: number; ground: boolean }

/**
 * Cadre de vue calé sur le mouvement.
 *
 * Un exercice allongé n'occupe que le bas du repère : sans recadrage, le
 * bonhomme serait minuscule sur un téléphone. On calcule donc la boîte
 * englobante de TOUTES les poses clés — sur toutes les poses, pour que la
 * figure ne saute pas d'échelle pendant l'animation — et on cadre dessus.
 */
export function poseView(frames: Pose[], headRadius = 9, pad = 10): View {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const f of frames) {
    for (const j of JOINTS) {
      const [x, y] = f[j]
      const r = j === 'head' ? headRadius : 0
      minX = Math.min(minX, x - r)
      minY = Math.min(minY, y - r)
      maxX = Math.max(maxX, x + r)
      maxY = Math.max(maxY, y + r)
    }
  }
  // Le sol ne fait partie du cadre que si le corps le touche vraiment.
  const ground = maxY >= GROUND_Y - 4
  if (ground) maxY = Math.max(maxY, GROUND_Y)
  return {
    x: minX - pad,
    y: minY - pad,
    w: maxX - minX + pad * 2,
    h: maxY - minY + pad * 2,
    ground,
  }
}
