import { Figure } from './Figure'
import { EXERCISES } from '../data/exercises'

/**
 * Planche de contrôle des schémas, ouverte avec ?poses.
 *
 * Chaque exercice est montré animé, puis pose clé par pose clé : c'est comme
 * ça qu'on règle un bonhomme sans lancer une séance entière.
 */
export function PoseSheet() {
  return (
    <div className="posesheet">
      <h1>Schémas</h1>
      {EXERCISES.map((e) => (
        <section key={e.id}>
          <h2>
            <span className="num">{e.id}</span> {e.name}
            <span className="cycle">{e.cycle}s / aller-retour</span>
          </h2>
          <div className="row">
            <div className="cell">
              <Figure
                frames={e.frames}
                cycle={e.cycle}
                running
                armsBehind={e.armsBehind}
                singleArm={e.singleArm}
                singleLeg={e.singleLeg}
                ground={!e.noGround}
              />
              <span>animé</span>
            </div>
            {e.frames.map((f, i) => (
              <div className="cell" key={i}>
                <Figure
                  frames={[f]}
                  cycle={e.cycle}
                  running={false}
                  armsBehind={e.armsBehind}
                  singleArm={e.singleArm}
                  singleLeg={e.singleLeg}
                  ground={!e.noGround}
                />
                <span>pose {i + 1}</span>
              </div>
            ))}
            <div className="cell photo-cell">
              <img src={e.photo} alt={e.name} />
              <span>photo d’origine</span>
            </div>
          </div>
        </section>
      ))}
    </div>
  )
}
