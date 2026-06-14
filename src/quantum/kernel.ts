import { StateVector } from './statevector'

/**
 * Quantum kernel between two states: the fidelity |⟨a|b⟩|².
 * This is exactly the quantity a quantum computer estimates for a quantum kernel
 * machine — how "close" two data points are after the feature map U(x)|0⟩.
 * Returns a value in [0, 1] (1 = identical states, 0 = orthogonal).
 */
export function stateOverlap(a: StateVector, b: StateVector): number {
  const size = 1 << a.n
  let re = 0
  let im = 0
  for (let i = 0; i < size; i++) {
    // ⟨a|b⟩ = Σ conj(a_i) · b_i
    re += a.re[i] * b.re[i] + a.im[i] * b.im[i]
    im += a.re[i] * b.im[i] - a.im[i] * b.re[i]
  }
  return re * re + im * im
}

/**
 * Build the full kernel (Gram) matrix K[i][j] = |⟨ψ_i|ψ_j⟩|² for a list of
 * feature states. This is the object an SVM consumes — the only thing the quantum
 * computer ever needs to produce, regardless of how big the feature space is.
 */
export function kernelMatrix(states: StateVector[]): number[][] {
  const n = states.length
  const K: number[][] = Array.from({ length: n }, () => new Array(n).fill(0))
  for (let i = 0; i < n; i++) {
    K[i][i] = 1
    for (let j = i + 1; j < n; j++) {
      const k = stateOverlap(states[i], states[j])
      K[i][j] = k
      K[j][i] = k
    }
  }
  return K
}
