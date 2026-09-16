import { useState } from 'react'
import { Home } from './components/Home'
import { SessionScreen } from './components/SessionScreen'
import type { Session } from './data/sessions'
import { unlockAudio } from './lib/cues'
import { PoseSheet } from './components/PoseSheet'

export default function App() {
  const [active, setActive] = useState<Session | null>(null)

  // Planche de contrôle des schémas, pour régler les poses sans jouer une séance.
  if (typeof location !== 'undefined' && location.search.includes('poses')) {
    return <PoseSheet />
  }

  const start = (s: Session) => {
    // Le clic qui lance la séance est aussi celui qui débloque l'audio.
    unlockAudio()
    setActive(s)
  }

  return active ? (
    <SessionScreen session={active} onExit={() => setActive(null)} />
  ) : (
    <Home onStart={start} />
  )
}
