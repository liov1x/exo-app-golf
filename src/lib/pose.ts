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
  /**
   * Courbure du dos, en unités : de combien la colonne s'écarte de la droite
   * épaules–bassin, à mi-hauteur. Sans elle le tronc est un bâton et un dos
   * rond ne peut pas exister.
   *
   * Le sens est donné par la perpendiculaire à l'axe épaules → bassin, tournée
   * d'un quart de tour dans le sens horaire à l'écran. Concrètement : de profil
   * tête à gauche, une valeur négative bombe le dos vers le haut (dos rond) ;
   * de face, une valeur positive bombe la colonne vers la gauche, donc le buste
   * s'incline à droite.
   *
   * Elle s'interpole comme le reste : le dos s'arrondit au fil du mouvement.
   */
  bend?: number
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
  headRadius: 8.5,
  /** Espace entre le haut du tronc et la tête : elle doit rester détachée. */
  headGap: 2.5,
  /**
   * Les membres du fond sont légèrement plus fins que ceux du premier plan.
   * C'est le seul indice de profondeur qu'on s'autorise en plus du recouvrement,
   * et il suffit à savoir quel bras est devant.
   */
  far: 0.86,
  /** Valeur nominale du contour, pour le calcul du cadre uniquement. */
  outline: 2.2,
} as const

/**
 * Épaisseur du trait de contour, en PIXELS à l'écran.
 *
 * En unités du repère, elle varierait d'un exercice à l'autre : chaque schéma
 * est cadré sur son propre mouvement, donc zoomé différemment, et un même
 * chiffre donnerait un trait gras ici et fin là. Une planche de pictogrammes
 * n'a qu'une seule graisse de trait — on la fixe donc en pixels et on la
 * reconvertit en unités selon le zoom réel de chaque figure.
 */
export const OUTLINE_PX = 3

/**
 * Cadre minimal, en unités.
 *
 * Sans plancher, un exercice compact serait zoomé bien plus qu'un exercice
 * étendu et son personnage paraîtrait deux fois plus épais que les autres.
 */
export const MIN_VIEW = { w: 125, h: 100 } as const

/**
 * Point de contrôle de la colonne.
 *
 * La colonne est tracée en Bézier quadratique entre les épaules et le bassin.
 * Le point de contrôle est placé à deux fois l'écart voulu, parce qu'une
 * quadratique ne passe qu'à mi-chemin de son point de contrôle : `bend` est
 * ainsi l'écart réellement visible au milieu du dos.
 */
export function spineControl(pose: Pose): Point {
  const [nx, ny] = pose.neck
  const [hx, hy] = pose.hip
  const mid: Point = [(nx + hx) / 2, (ny + hy) / 2]
  const bend = pose.bend ?? 0
  if (!bend) return mid
  const dx = hx - nx
  const dy = hy - ny
  const len = Math.hypot(dx, dy) || 1
  // Perpendiculaire à l'axe du tronc, quart de tour horaire à l'écran.
  const px = -dy / len
  const py = dx / len
  return [mid[0] + px * bend * 2, mid[1] + py * bend * 2]
}

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
  const from = a.bend ?? 0
  const to = b.bend ?? 0
  return { ...(out as Pose), bend: from + (to - from) * t }
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

/** D'où l'on regarde le mouvement. Décide aussi de ce qui marque le sol. */
export type Viewpoint = 'profil' | 'face' | 'dessus' | 'troisquarts'

export type View = { x: number; y: number; w: number; h: number; ground: boolean }

/**
 * Cadre de vue calé sur le mouvement.
 *
 * Un exercice allongé n'occupe que le bas du repère : sans recadrage, le
 * bonhomme serait minuscule sur un téléphone. On calcule donc la boîte
 * englobante de TOUTES les poses clés — sur toutes les poses, pour que la
 * figure ne saute pas d'échelle pendant l'animation — et on cadre dessus.
 */
export function poseView(frames: Pose[], viewpoint: Viewpoint = 'profil', pad = 6): View {
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
  const swallow = (x: number, y: number, r: number) => {
    minX = Math.min(minX, x - r)
    minY = Math.min(minY, y - r)
    maxX = Math.max(maxX, x + r)
    maxY = Math.max(maxY, y + r)
  }
  for (const f of frames) {
    for (const j of JOINTS) {
      const [x, y] = j === 'head' ? resolveHead(f) : f[j]
      swallow(x, y, reach(j))
    }
    // Une colonne courbée déborde de ses articulations : la Bézier reste dans
    // l'enveloppe de ses trois points, donc englober le point de contrôle suffit.
    const [cx, cy] = spineControl(f)
    swallow(cx, cy, BODY.torso / 2 + BODY.outline)
  }
  // Le trait de sol n'a de sens que vu de profil ou de face, et seulement si
  // le corps le touche vraiment.
  const onFloor = viewpoint === 'profil' || viewpoint === 'face'
  const ground = onFloor && maxY >= GROUND_Y - 4
  if (ground) maxY = Math.max(maxY, GROUND_Y)

  let x = minX - pad
  let y = minY - pad
  let w = maxX - minX + pad * 2
  let h = maxY - minY + pad * 2

  // Élargir autour du centre jusqu'au cadre minimal, pour que tous les
  // personnages soient dessinés à des échelles comparables.
  if (w < MIN_VIEW.w) {
    x -= (MIN_VIEW.w - w) / 2
    w = MIN_VIEW.w
  }
  if (h < MIN_VIEW.h) {
    y -= (MIN_VIEW.h - h) / 2
    h = MIN_VIEW.h
  }

  return { x, y, w, h, ground }
}
