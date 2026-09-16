/**
 * Modèle de bonhomme pictogramme.
 *
 * Les poses sont décrites par des articulations, mais le rendu est un
 * personnage cerné d'un contour, tête détachée — pas un squelette de traits.
 * Le squelette n'est que l'ossature : c'est `Figure` qui l'épaissit en corps.
 *
 * Toutes les coordonnées vivent dans un repère de 200 x 140 unités, avec le
 * sol à y = 125. Un adulte debout mesure ~100 unités.
 *
 * Le côté A est le membre le plus proche du spectateur, le côté B celui qui
 * est derrière : B est dessiné en premier, donc le contour de A passe devant
 * et les membres se détachent les uns des autres.
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

/**
 * Épaisseurs du personnage, en unités du repère.
 *
 * Le tronc est nettement plus large que les membres : c'est ce qui distingue
 * un pictogramme d'un bonhomme fil de fer.
 */
export const BODY = {
  torso: 15,
  arm: 7.5,
  leg: 10.5,
  /** Épaisseur du trait de contour, de chaque côté de la forme. */
  outline: 2.2,
  headRadius: 8.5,
  /** Espace entre le haut du tronc et la tête : elle doit rester détachée. */
  headGap: 2.5,
} as const

/**
 * Position réelle de la tête.
 *
 * Les poses donnent une tête approximative : on garde sa DIRECTION (c'est elle
 * qui porte l'intention — tête au sol, tête relevée, tête dans l'axe) mais on
 * impose la distance, pour que le détachement tête / épaules soit identique
 * partout sans avoir à régler 29 exercices à la main.
 */
export function resolveHead(pose: Pose): Point {
  const [hx, hy] = pose.head
  const [nx, ny] = pose.neck
  const dx = hx - nx
  const dy = hy - ny
  const len = Math.hypot(dx, dy) || 1
  const reach = BODY.torso / 2 + BODY.headRadius + BODY.headGap
  return [nx + (dx / len) * reach, ny + (dy / len) * reach]
}

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
export function poseView(frames: Pose[], pad = 6): View {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  // Chaque articulation est épaissie par la chair qu'elle porte, sinon le
  // cadre coupe le contour du personnage.
  const reach = (joint: string) => {
    if (joint === 'head') return BODY.headRadius + BODY.outline
    if (joint === 'neck' || joint === 'hip') return BODY.torso / 2 + BODY.outline
    if (joint.startsWith('knee') || joint.startsWith('foot')) return BODY.leg / 2 + BODY.outline
    return BODY.arm / 2 + BODY.outline
  }
  for (const f of frames) {
    for (const j of JOINTS) {
      const [x, y] = j === 'head' ? resolveHead(f) : f[j]
      const r = reach(j)
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
