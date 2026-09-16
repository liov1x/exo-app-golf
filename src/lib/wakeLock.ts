import { useEffect } from 'react'

/**
 * Empêche l'écran de s'éteindre pendant une séance.
 *
 * Sans ça, l'écran se verrouille au milieu d'un exercice allongé et il faut
 * se relever pour le rallumer — c'est le détail qui fait abandonner l'app.
 */
export function useWakeLock(active: boolean) {
  useEffect(() => {
    if (!active) return
    const anyNav = navigator as any
    if (!anyNav.wakeLock) return

    let sentinel: any = null
    let cancelled = false

    const acquire = async () => {
      try {
        const lock = await anyNav.wakeLock.request('screen')
        if (cancelled) {
          void lock.release()
          return
        }
        sentinel = lock
      } catch {
        // Refusé (onglet en arrière-plan, batterie faible) : on continue sans.
      }
    }

    // Le verrou saute quand l'onglet repasse en arrière-plan : on le reprend.
    const onVisible = () => {
      if (document.visibilityState === 'visible') void acquire()
    }

    void acquire()
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', onVisible)
      if (sentinel) void sentinel.release()
    }
  }, [active])
}
