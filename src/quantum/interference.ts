import { StateVector } from './statevector'
import { GH } from './gates'

export interface Point2D {
  x: number
  y: number
}

export interface InterferenceResult {
  /** Conditional class probabilities given the ancilla measured 0 (sum to 1). */
  pClass0: number
  pClass1: number
  /** Predicted class label. */
  prediction: 0 | 1
  /** cos of the angle between the test state and each training state (similarity). */
  overlap0: number
  overlap1: number
}

/** Map a 2D pad point to a real single-qubit amplitude vector [c0, c1] (a unit
 *  vector pointing in the data's direction — this is amplitude encoding of the
 *  feature vector). Degenerate (0,0) falls back to |0⟩. */
function toQubit(p: Point2D): [number, number] {
  const r = Math.hypot(p.x, p.y)
  if (r < 1e-9) return [1, 0]
  return [p.x / r, p.y / r]
}

/**
 * Schuld's Hadamard-interference distance classifier (a faithful 3-qubit version).
 *
 * Registers (big-endian): q0 = ancilla, q1 = data, q2 = index/class label.
 * We prepare, for each class m ∈ {0,1}:
 *   |0⟩_a |ψ_test⟩_d |m⟩   and   |1⟩_a |ψ_train_m⟩_d |m⟩,
 * each weighted 1/2 (so the whole state is normalised, since each ψ is a unit
 * vector). A Hadamard on the ancilla then *interferes* the test branch with each
 * training branch. Conditioned on measuring the ancilla in |0⟩, the probability of
 * class c works out to ∝ (1 + cos θ_c) — i.e. the closer the test point is to a
 * class's training point, the more likely that class. No autograd, no distances
 * computed explicitly: the interference does the geometry.
 */
export function interferenceClassify(
  train0: Point2D,
  train1: Point2D,
  test: Point2D,
): InterferenceResult {
  const t = toQubit(test)
  const m0 = toQubit(train0)
  const m1 = toQubit(train1)
  const trains: [number, number][] = [m0, m1]

  const sv = new StateVector(3)
  sv.re.fill(0)
  sv.im.fill(0)
  // index bits: a*4 + d*2 + m   (q0=a most significant, q2=m least significant)
  for (let m = 0; m < 2; m++) {
    for (let d = 0; d < 2; d++) {
      // ancilla = 0 → test point
      sv.re[(0 << 2) | (d << 1) | m] = 0.5 * t[d]
      // ancilla = 1 → training point for this class
      sv.re[(1 << 2) | (d << 1) | m] = 0.5 * trains[m][d]
    }
  }

  // Interfere test vs training branches.
  sv.applySingleQubitGate(GH, 0)

  // Read P(ancilla=0, class=m) by summing over the data qubit.
  const probs = sv.probabilities()
  let p0 = 0
  let p1 = 0
  for (let d = 0; d < 2; d++) {
    p0 += probs[(0 << 2) | (d << 1) | 0]
    p1 += probs[(0 << 2) | (d << 1) | 1]
  }
  const denom = p0 + p1 || 1
  const pClass0 = p0 / denom
  const pClass1 = p1 / denom

  return {
    pClass0,
    pClass1,
    prediction: pClass1 >= pClass0 ? 1 : 0,
    overlap0: t[0] * m0[0] + t[1] * m0[1],
    overlap1: t[0] * m1[0] + t[1] * m1[1],
  }
}
