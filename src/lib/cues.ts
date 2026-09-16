/**
 * Signaux sonores et haptiques.
 *
 * Sur les exercices au sol, l'écran est au plafond et on ne le regarde pas :
 * le son et la vibration portent l'information, pas l'affichage. D'où des
 * timbres nettement différents entre « ça commence », « ça finit » et
 * « change de côté ».
 */

let ctx: AudioContext | null = null

/** À appeler sur un geste utilisateur : les navigateurs bloquent l'audio sinon. */
export function unlockAudio() {
  if (ctx) {
    if (ctx.state === 'suspended') void ctx.resume()
    return
  }
  const Ctor = window.AudioContext ?? (window as any).webkitAudioContext
  if (Ctor) ctx = new Ctor()
}

function tone(freq: number, duration: number, when = 0, gain = 0.18) {
  if (!ctx) return
  const t0 = ctx.currentTime + when
  const osc = ctx.createOscillator()
  const amp = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.value = freq
  amp.gain.setValueAtTime(0.0001, t0)
  amp.gain.exponentialRampToValueAtTime(gain, t0 + 0.02)
  amp.gain.exponentialRampToValueAtTime(0.0001, t0 + duration)
  osc.connect(amp).connect(ctx.destination)
  osc.start(t0)
  osc.stop(t0 + duration + 0.05)
}

function buzz(pattern: number | number[]) {
  if ('vibrate' in navigator) navigator.vibrate(pattern)
}

/** Décompte 3 - 2 - 1 avant la fin d'une phase. */
export function cueCountdown() {
  tone(660, 0.09)
}

/** L'exercice démarre. */
export function cueStart() {
  tone(880, 0.18)
  buzz(120)
}

/** L'exercice est fini, la transition commence. */
export function cueEnd() {
  tone(520, 0.22)
  tone(390, 0.3, 0.18)
  buzz([90, 70, 90])
}

/** Fin de la séance. */
export function cueFinish() {
  tone(523, 0.2)
  tone(659, 0.2, 0.18)
  tone(784, 0.45, 0.36)
  buzz([120, 80, 120, 80, 220])
}

let voiceEnabled = true

export function setVoiceEnabled(on: boolean) {
  voiceEnabled = on
  if (!on) window.speechSynthesis?.cancel()
}

/** Annonce vocale en français, gratuite et hors-ligne via le navigateur. */
export function speak(text: string) {
  if (!voiceEnabled || !('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = 'fr-FR'
  u.rate = 1
  window.speechSynthesis.speak(u)
}
