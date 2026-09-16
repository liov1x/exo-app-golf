import { useEffect, useMemo, useRef, useState } from 'react'
import { BODY, GROUND_Y, poseAtCycle, poseView, resolveHead, type Point, type Pose } from '../lib/pose'

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
}

type Segment = { pts: Point[]; w: number }

const path = (pts: Point[]) => pts.map((pt) => `${pt[0]},${pt[1]}`).join(' ')

/**
 * Un groupe de membres, tracé deux fois : d'abord épais dans la couleur du
 * contour, puis un peu plus fin dans la couleur du fond. La seconde passe
 * efface les contours INTERNES du groupe, et il ne reste que la silhouette —
 * c'est ce qui donne un personnage cerné plutôt qu'un empilement de traits.
 */
function Part({ segments }: { segments: Segment[] }) {
  return (
    <g>
      <g className="stroke-outline">
        {segments.map((s, i) => (
          <polyline key={i} points={path(s.pts)} strokeWidth={s.w + BODY.outline * 2} />
        ))}
      </g>
      <g className="stroke-body">
        {segments.map((s, i) => (
          <polyline key={i} points={path(s.pts)} strokeWidth={s.w} />
        ))}
      </g>
    </g>
  )
}

/**
 * Le personnage animé. Il rejoue le mouvement en boucle au tempo de l'exercice :
 * c'est autant un schéma qu'un métronome visuel — on cale sa lenteur dessus.
 */
export function Figure({ frames, cycle, running, mirrored, armsBehind }: Props) {
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

  const view = useMemo(() => poseView(frames), [frames])
  const head = resolveHead(pose)

  // Les membres arrière forment un groupe à part, dessiné en premier : le
  // contour du corps passe donc devant eux et les deux jambes se distinguent.
  const nearArm: Segment = { pts: [pose.neck, pose.elbowA, pose.handA], w: BODY.arm }
  const behind: Segment[] = [
    { pts: [pose.neck, pose.elbowB, pose.handB], w: BODY.arm },
    { pts: [pose.hip, pose.kneeB, pose.footB], w: BODY.leg },
    ...(armsBehind ? [nearArm] : []),
  ]
  const front: Segment[] = [
    { pts: [pose.neck, pose.hip], w: BODY.torso },
    { pts: [pose.hip, pose.kneeA, pose.footA], w: BODY.leg },
    ...(armsBehind ? [] : [nearArm]),
  ]

  return (
    <svg
      className="figure"
      viewBox={`${view.x} ${view.y} ${view.w} ${view.h}`}
      role="img"
      aria-label="Schéma du mouvement"
      style={mirrored ? { transform: 'scaleX(-1)' } : undefined}
    >
      {view.ground && (
        <line className="ground" x1={view.x + 2} y1={GROUND_Y} x2={view.x + view.w - 2} y2={GROUND_Y} />
      )}

      <Part segments={behind} />
      <Part segments={front} />

      <circle className="head" cx={head[0]} cy={head[1]} r={BODY.headRadius} strokeWidth={BODY.outline * 2} />
    </svg>
  )
}
