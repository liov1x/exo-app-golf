import { useEffect, useMemo, useRef, useState } from 'react'
import { GROUND_Y, poseAtCycle, poseView, type Pose } from '../lib/pose'

type Props = {
  frames: Pose[]
  /** Durée d'un aller-retour complet, en secondes. C'est le tempo de l'exercice. */
  cycle: number
  /** Le bonhomme s'arrête quand la séance est en pause. */
  running: boolean
  /** Inverse la figure pour le côté droit. */
  mirrored?: boolean
}

/**
 * Le bonhomme animé. Il rejoue le mouvement en boucle au tempo de l'exercice :
 * c'est autant un schéma qu'un métronome visuel — on cale sa lenteur dessus.
 */
export function Figure({ frames, cycle, running, mirrored }: Props) {
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
  const p = (pt: readonly [number, number]) => `${pt[0]},${pt[1]}`

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

      {/* Membres arrière : plus pâles, ils posent la profondeur */}
      <g className="limb far">
        <polyline points={`${p(pose.neck)} ${p(pose.elbowB)} ${p(pose.handB)}`} />
        <polyline points={`${p(pose.hip)} ${p(pose.kneeB)} ${p(pose.footB)}`} />
      </g>

      {/* Tronc */}
      <line className="limb spine" x1={pose.neck[0]} y1={pose.neck[1]} x2={pose.hip[0]} y2={pose.hip[1]} />

      {/* Membres avant */}
      <g className="limb near">
        <polyline points={`${p(pose.neck)} ${p(pose.elbowA)} ${p(pose.handA)}`} />
        <polyline points={`${p(pose.hip)} ${p(pose.kneeA)} ${p(pose.footA)}`} />
      </g>

      <circle className="head" cx={pose.head[0]} cy={pose.head[1]} r="9" />
    </svg>
  )
}
