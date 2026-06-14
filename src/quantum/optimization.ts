import { StateVector } from './statevector'
import { GH, RX } from './gates'

/** A QUBO cost matrix Q (n×n). Cost of a bit-vector x is xᵀ Q x. */
export type Qubo = number[][]

/** Decode basis index z into a big-endian bit-vector of length n (qubit 0 = MSB,
 *  matching StateVector's basis ordering). */
export function indexToBits(z: number, n: number): number[] {
  const bits = new Array(n)
  for (let q = 0; q < n; q++) bits[q] = (z >> (n - 1 - q)) & 1
  return bits
}

/** QUBO energy xᵀ Q x for binary x. */
export function quboEnergy(Q: Qubo, bits: number[]): number {
  let e = 0
  for (let i = 0; i < bits.length; i++) {
    if (!bits[i]) continue
    for (let j = 0; j < bits.length; j++) {
      if (bits[j]) e += Q[i][j]
    }
  }
  return e
}

/** Energies of every bit-string, indexed by basis state (length 2ⁿ). */
export function allEnergies(Q: Qubo): number[] {
  const n = Q.length
  const out = new Array(1 << n)
  for (let z = 0; z < out.length; z++) out[z] = quboEnergy(Q, indexToBits(z, n))
  return out
}

export interface MinResult {
  bits: number[]
  energy: number
  index: number
}

/** Exact optimum by enumeration (n small). */
export function bruteForceMin(Q: Qubo): MinResult {
  const n = Q.length
  let best: MinResult = { bits: indexToBits(0, n), energy: quboEnergy(Q, indexToBits(0, n)), index: 0 }
  for (let z = 1; z < 1 << n; z++) {
    const bits = indexToBits(z, n)
    const energy = quboEnergy(Q, bits)
    if (energy < best.energy) best = { bits, energy, index: z }
  }
  return best
}

/** Build the Max-Cut QUBO whose minimum is the maximum cut.
 *  Per edge (i,j): minimize −(xᵢ + xⱼ − 2xᵢxⱼ). */
export function maxCutQubo(edges: [number, number][], n: number): Qubo {
  const Q: Qubo = Array.from({ length: n }, () => new Array(n).fill(0))
  for (const [i, j] of edges) {
    Q[i][i] -= 1
    Q[j][j] -= 1
    Q[i][j] += 1
    Q[j][i] += 1
  }
  return Q
}

/** Build the QAOA state for given per-layer angles. Uniform superposition →
 *  for each layer: cost phase e^{-iγC} then transverse-field mixer Πq RX(2β). */
export function qaoaState(energies: number[], gammas: number[], betas: number[]): StateVector {
  const n = Math.round(Math.log2(energies.length))
  const sv = new StateVector(n)
  for (let q = 0; q < n; q++) sv.applySingleQubitGate(GH, q)
  for (let l = 0; l < gammas.length; l++) {
    sv.applyDiagonalPhase(energies, gammas[l])
    const mixer = RX(2 * betas[l])
    for (let q = 0; q < n; q++) sv.applySingleQubitGate(mixer, q)
  }
  return sv
}

/** Expected cost ⟨C⟩ = Σ_z p(z)·E(z) of the QAOA output distribution. */
export function qaoaExpectedCost(energies: number[], gammas: number[], betas: number[]): number {
  const probs = qaoaState(energies, gammas, betas).probabilities()
  let e = 0
  for (let z = 0; z < probs.length; z++) e += probs[z] * energies[z]
  return e
}
