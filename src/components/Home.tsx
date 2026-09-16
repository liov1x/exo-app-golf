import { SESSIONS, sessionDuration, type Session } from '../data/sessions'
import { EXERCISES, categoryLabel } from '../data/exercises'

function minutes(seconds: number) {
  const m = Math.round(seconds / 60)
  return `${m} min`
}

export function Home({ onStart }: { onStart: (s: Session) => void }) {
  return (
    <div className="home">
      <header className="home-head">
        <h1>Mobilité</h1>
        <p>{EXERCISES.length} exercices · d’après ta planche</p>
      </header>

      <ul className="session-list">
        {SESSIONS.map((s) => (
          <li key={s.id}>
            <button className="session-card" onClick={() => onStart(s)}>
              <span className="session-name">{s.name}</span>
              <span className="session-sub">{s.subtitle}</span>
              <span className="session-meta">
                {s.items.length} exercices · {minutes(sessionDuration(s))}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <section className="catalogue">
        <h2>Les exercices</h2>
        <ul>
          {EXERCISES.map((e) => (
            <li key={e.id}>
              <span className="num">{e.id}</span>
              <span className="cat-name">{e.name}</span>
              <span className="cat-tag">{categoryLabel(e.category)}</span>
            </li>
          ))}
        </ul>
        <p className="note">
          Prototype : 6 exercices sur les 29 de la planche, pour valider le style.
        </p>
      </section>
    </div>
  )
}
