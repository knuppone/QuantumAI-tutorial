import { StateVector } from './statevector'

export interface BlochVector {
  x: number
  y: number
  z: number
  /** Tr(ρ²) ∈ [0.5, 1] for a single qubit; 1 = pure, 0.5 = max-mixed */
  purity: number
}

/**
 * Compute the reduced Bloch vector for qubit `q` by tracing out all others.
 *
 * ρ_q = Tr_{rest}(|ψ⟩⟨ψ|)
 * Bloch vector: x = 2·Re(ρ_{01}), y = 2·Im(ρ_{01}), z = ρ_{00} - ρ_{11}
 */
export function reducedBloch(sv: StateVector, q: number): BlochVector {
  const n = sv.n
  const size = 1 << n
  const qBit = 1 << (n - 1 - q)

  // reduced density matrix elements
  let rho00 = 0 // ⟨0|ρ_q|0⟩
  let rho11 = 0 // ⟨1|ρ_q|1⟩
  let rho01re = 0 // Re(⟨0|ρ_q|1⟩)
  let rho01im = 0 // Im(⟨0|ρ_q|1⟩)

  for (let i = 0; i < size; i++) {
    const qi = (i & qBit) !== 0 ? 1 : 0 // qubit q value in basis state i
    const other = i ^ (qi === 0 ? 0 : qBit) // partner with qubit q flipped
    const j = other // state with qubit q = 1-qi

    if (qi === 0) {
      // Contribute to ρ_{00}: |α_i|²
      rho00 += sv.re[i] * sv.re[i] + sv.im[i] * sv.im[i]
      // Contribute to ρ_{01}: α_i · conj(α_{i|qBit})
      const jIdx = i | qBit
      rho01re += sv.re[i] * sv.re[jIdx] + sv.im[i] * sv.im[jIdx]
      rho01im += sv.im[i] * sv.re[jIdx] - sv.re[i] * sv.im[jIdx]
    } else {
      // qi === 1: contribute to ρ_{11}
      rho11 += sv.re[i] * sv.re[i] + sv.im[i] * sv.im[i]
    }
  }

  const x = 2 * rho01re
  const y = 2 * rho01im
  const z = rho00 - rho11

  // Purity = Tr(ρ²) = rho00² + rho11² + 2|rho01|²
  const purity = rho00 * rho00 + rho11 * rho11 + 2 * (rho01re * rho01re + rho01im * rho01im)

  return { x, y, z, purity }
}

/**
 * Returns an array of BlochVectors, one per qubit.
 */
export function allBlochVectors(sv: StateVector): BlochVector[] {
  return Array.from({ length: sv.n }, (_, q) => reducedBloch(sv, q))
}
