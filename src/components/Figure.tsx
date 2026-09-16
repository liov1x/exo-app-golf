import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import {
  BODY,
  GROUND_Y,
  OUTLINE_PX,
  poseAtCycle,
  poseView,
  resolveHead,
  spineControl,
  type Point,
  type Pose,
} from '../lib/pose'

type Props = {
  frames: Pose[]
  /** Durée d'un aller-retour complet, en secondes. C'est le tempo de l'exercice. */
  cycle: number
  /** Le bonhomme s'arrête quand la séance est en pause. */
  running: boolean
  /** Inverse la figure pour le côté droit. */
  mirrored?: boolean
  /**
   * Passe le bras avant derrière le corps.
   *
   * Quand la main revient toucher le corps — genoux tenus à la poitrine, bras
   * le long du tronc — un bras dessiné devant fusionne avec lui en un pâté.
   * Derrière, le contour du tronc le recoupe et le geste redevient lisible.
   */
  armsBehind?: boolean
  /** Trait de sol. À couper sur les vues de trois quarts, où il n'a pas de sens. */
  ground?: boolean
  /**
   * Cache le membre du fond.
   *
   * De profil, un mouvement symétrique superpose exactement les deux bras ou
   * les deux jambes : le membre du fond n'apparaît alors qu'en liseré collé à
   * l'autre, et ça se lit comme un défaut de tracé. Les pictogrammes de profil
   * n'en dessinent qu'un.
   */
  singleArm?: boolean
  singleLeg?: boolean
}

type Segment = { d: string; w: number }

/** Un membre : des segments droits articulés, adoucis par les jointures rondes. */
const limb = (pts: Point[]) =>
  pts.map((pt, i) => `${i ? 'L' : 'M'} ${pt[0]} ${pt[1]}`).join(' ')

/** La colonne : une courbe, jamais un bâton. */
const spine = (pose: Pose) => {
  const [cx, cy] = spineControl(pose)
  return `M ${pose.neck[0]} ${pose.neck[1]} Q ${cx} ${cy} ${pose.hip[0]} ${pose.hip[1]}`
}

/**
 * Un groupe de membres, tracé deux fois : d'abord épais dans la couleur du
 * contour, puis exactement `outline` plus fin dans la couleur du fond. La
 * seconde passe efface les contours INTERNES du groupe, et il ne reste que la
 * silhouette — c'est ce qui donne un personnage cerné plutôt qu'un empilement
 * de traits. Le trait visible fait donc `outline` partout, y compris à la tête.
 */
function Part({ segments, outline }: { segments: Segment[]; outline: number }) {
  return (
    <g>
      <g className="stroke-outline">
        {segments.map((s, i) => (
          <path key={i} d={s.d} strokeWidth={s.w + outline * 2} />
        ))}
      </g>
      <g className="stroke-body">
        {segments.map((s, i) => (
          <path key={i} d={s.d} strokeWidth={s.w} />
        ))}
      </g>
    </g>
  )
}

/**
 * Le personnage animé. Il rejoue le mouvement en boucle au tempo de l'exercice :
 * c'est autant un schéma qu'un métronome visuel — on cale sa lenteur dessus.
 */
export function Figure({
  frames,
  cycle,
  running,
  mirrored,
  armsBehind,
  ground = true,
  singleArm,
  singleLeg,
}: Props) {
  const [pose, setPose] = useState<Pose>(frames[0])
  const elapsed = useRef(0)
  const last = useRef<number | null>(null)

  useEffect(() => {
    elapsed.current = 0
    setPose(frames[0])
  }, [frames])

  useEffect(() => {
    if (!running) {
      last.current = null
      return
    }
    let raf = 0
    const tick = (now: number) => {
      if (last.current !== null) {
        elapsed.current += (now - last.current) / 1000
      }
      last.current = now
      setPose(poseAtCycle(frames, (elapsed.current % cycle) / cycle))
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      last.current = null
    }
  }, [frames, cycle, running])

  const view = useMemo(() => poseView(frames, ground), [frames, ground])

  // Le zoom réel de cette figure, mesuré à l'écran : c'est lui qui convertit
  // l'épaisseur de contour voulue en pixels vers les unités du repère.
  const svg = useRef<SVGSVGElement>(null)
  const [pxPerUnit, setPxPerUnit] = useState(3)

  useLayoutEffect(() => {
    const el = svg.current
    if (!el) return
    const measure = () => {
      const box = el.getBoundingClientRect()
      if (!box.width || !box.height) return
      setPxPerUnit(Math.min(box.width / view.w, box.height / view.h))
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [view])

  const outline = OUTLINE_PX / pxPerUnit
  const head = resolveHead(pose)

  // Les membres du fond forment un groupe à part, dessiné en premier : le
  // contour du corps passe devant eux, donc on voit quel bras et quelle jambe
  // sont au premier plan.
  const nearArm: Segment = { d: limb([pose.neck, pose.elbowA, pose.handA]), w: BODY.arm }
  const behind: Segment[] = [
    ...(singleArm
      ? []
      : [{ d: limb([pose.neck, pose.elbowB, pose.handB]), w: BODY.arm * BODY.far }]),
    ...(singleLeg
      ? []
      : [{ d: limb([pose.hip, pose.kneeB, pose.footB]), w: BODY.leg * BODY.far }]),
    ...(armsBehind ? [nearArm] : []),
  ]
  const front: Segment[] = [
    { d: spine(pose), w: BODY.torso },
    { d: limb([pose.hip, pose.kneeA, pose.footA]), w: BODY.leg },
    ...(armsBehind ? [] : [nearArm]),
  ]

  return (
    <svg
      ref={svg}
      className="figure"
      viewBox={`${view.x} ${view.y} ${view.w} ${view.h}`}
      role="img"
      aria-label="Schéma du mouvement"
      style={mirrored ? { transform: 'scaleX(-1)' } : undefined}
    >
      {view.ground && (
        <line className="ground" x1={view.x + 2} y1={GROUND_Y} x2={view.x + view.w - 2} y2={GROUND_Y} />
      )}

      <Part segments={behind} outline={outline} />
      <Part segments={front} outline={outline} />

      <circle className="head" cx={head[0]} cy={head[1]} r={BODY.headRadius} strokeWidth={outline} />
    </svg>
  )
}
