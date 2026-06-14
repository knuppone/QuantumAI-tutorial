import type { makeRng } from './rng'

/**
 * Depolarizing-style decay of an expectation value with circuit depth: the
 * signal shrinks toward 0 as more noisy gates are applied. λ is the per-gate
 * (per-depth) error rate.
 */
export function noisyExpectation(ideal: number, lambda: number, depth: number): number {
  return ideal * Math.exp(-lambda * depth)
}

/**
 * Estimate an expectation value from a finite number of measurement shots.
 * `probs` is the outcome distribution, `parities` the ±1 (e.g. Z-parity) value
 * of each basis outcome. Returns the shot-averaged ±1 estimate (with sampling noise).
 */
export function sampleExpectation(
  probs: number[],
  parities: number[],
  shots: number,
  rng: ReturnType<typeof makeRng>,
): number {
  let acc = 0
  for (let s = 0; s < shots; s++) {
    const r = rng()
    let cumul = 0
    let chosen = probs.length - 1
    for (let i = 0; i < probs.length; i++) {
      cumul += probs[i]
      if (r < cumul) { chosen = i; break }
    }
    acc += parities[chosen]
  }
  return acc / shots
}

/**
 * Zero-noise extrapolation: given expectation values measured at several noise
 * scale factors, fit a line and return its value at zero noise (the y-intercept).
 */
export function zeroNoiseExtrapolate(points: { x: number; y: number }[]): number {
  const n = points.length
  if (n === 0) return 0
  if (n === 1) return points[0].y
  let sx = 0, sy = 0, sxx = 0, sxy = 0
  for (const { x, y } of points) {
    sx += x; sy += y; sxx += x * x; sxy += x * y
  }
  const denom = n * sxx - sx * sx
  if (Math.abs(denom) < 1e-15) return sy / n
  const slope = (n * sxy - sx * sy) / denom
  const intercept = (sy - slope * sx) / n
  return intercept
}
