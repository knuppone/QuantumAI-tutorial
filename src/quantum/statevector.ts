import { add, mul, abs2, scale, type C, ZERO } from './complex'
import { getMatrix, type GateType, type M2 } from './gates'
import type { makeRng } from './rng'

export class StateVector {
  /** Number of qubits */
  readonly n: number
  /** 2^n complex amplitudes, re part */
  re: Float64Array
  /** 2^n complex amplitudes, im part */
  im: Float64Array

  constructor(n: number) {
    this.n = n
    const size = 1 << n
    this.re = new Float64Array(size)
    this.im = new Float64Array(size)
    this.re[0] = 1 // |00...0⟩
  }

  static fromAmplitudes(n: number, amps: C[]): StateVector {
    const sv = new StateVector(n)
    for (let i = 0; i < amps.length; i++) {
      sv.re[i] = amps[i][0]
      sv.im[i] = amps[i][1]
    }
    return sv
  }

  clone(): StateVector {
    const sv = new StateVector(this.n)
    sv.re = new Float64Array(this.re)
    sv.im = new Float64Array(this.im)
    return sv
  }

  reset(): void {
    this.re.fill(0)
    this.im.fill(0)
    this.re[0] = 1
  }

  /** Probability of each basis state */
  probabilities(): number[] {
    const size = 1 << this.n
    const probs: number[] = new Array(size)
    for (let i = 0; i < size; i++) {
      probs[i] = this.re[i] * this.re[i] + this.im[i] * this.im[i]
    }
    return probs
  }

  /** Total norm squared — should be ~1 */
  norm2(): number {
    let s = 0
    const size = 1 << this.n
    for (let i = 0; i < size; i++) s += this.re[i] * this.re[i] + this.im[i] * this.im[i]
    return s
  }

  /** Normalize in-place */
  normalize(): void {
    const norm = Math.sqrt(this.norm2())
    if (norm < 1e-14) return
    const size = 1 << this.n
    for (let i = 0; i < size; i++) {
      this.re[i] /= norm
      this.im[i] /= norm
    }
  }

  /**
   * Apply a 2×2 gate to qubit `target` (big-endian: qubit 0 = most significant bit).
   */
  applySingleQubitGate(M: M2, target: number): void {
    const size = 1 << this.n
    // stride between |...0...⟩ and |...1...⟩ for `target`
    const bit = 1 << (this.n - 1 - target)
    for (let i = 0; i < size; i++) {
      if (i & bit) continue // process pairs once
      const j = i | bit
      const re0 = this.re[i], im0 = this.im[i]
      const re1 = this.re[j], im1 = this.im[j]
      // new[i] = M[0]*old[i] + M[1]*old[j]
      this.re[i] = M[0][0] * re0 - M[0][1] * im0 + M[1][0] * re1 - M[1][1] * im1
      this.im[i] = M[0][0] * im0 + M[0][1] * re0 + M[1][0] * im1 + M[1][1] * re1
      // new[j] = M[2]*old[i] + M[3]*old[j]
      this.re[j] = M[2][0] * re0 - M[2][1] * im0 + M[3][0] * re1 - M[3][1] * im1
      this.im[j] = M[2][0] * im0 + M[2][1] * re0 + M[3][0] * im1 + M[3][1] * re1
    }
  }

  /**
   * Apply CNOT: control qubit flips target qubit when control=1.
   */
  applyCNOT(control: number, target: number): void {
    const size = 1 << this.n
    const cBit = 1 << (this.n - 1 - control)
    const tBit = 1 << (this.n - 1 - target)
    for (let i = 0; i < size; i++) {
      if (!(i & cBit)) continue      // control is 0 — skip
      if (i & tBit) continue         // only process target=0 states to avoid double-swap
      const j = i | tBit             // target=1 partner
      // Swap amplitudes
      let tmp = this.re[i]; this.re[i] = this.re[j]; this.re[j] = tmp
      tmp = this.im[i]; this.im[i] = this.im[j]; this.im[j] = tmp
    }
  }

  /**
   * Apply CZ: control and target each get phase -1 when both are 1.
   */
  applyCZ(control: number, target: number): void {
    const size = 1 << this.n
    const cBit = 1 << (this.n - 1 - control)
    const tBit = 1 << (this.n - 1 - target)
    for (let i = 0; i < size; i++) {
      if ((i & cBit) && (i & tBit)) {
        this.re[i] = -this.re[i]
        this.im[i] = -this.im[i]
      }
    }
  }

  /**
   * Apply a diagonal phase e^{-iγ·E_i} to each amplitude i, where E is a list of
   * per-basis-state energies. This is the QAOA cost-layer unitary e^{-iγ C}.
   */
  applyDiagonalPhase(energies: number[], gamma: number): void {
    const size = 1 << this.n
    for (let i = 0; i < size; i++) {
      const theta = gamma * energies[i]
      const cos = Math.cos(theta)
      const sin = Math.sin(theta)
      const re = this.re[i], im = this.im[i]
      // (re + i·im) · (cosθ − i·sinθ)
      this.re[i] = re * cos + im * sin
      this.im[i] = im * cos - re * sin
    }
  }

  /**
   * Apply a named gate. Two-qubit gates need qubits.length === 2.
   */
  applyGate(type: GateType, qubits: number[], param = 0): void {
    if (type === 'CNOT') {
      this.applyCNOT(qubits[0], qubits[1])
    } else if (type === 'CZ') {
      this.applyCZ(qubits[0], qubits[1])
    } else {
      this.applySingleQubitGate(getMatrix(type, param), qubits[0])
    }
  }

  /**
   * Sample the state `shots` times. Returns counts[basisIndex].
   */
  sample(shots: number, rng: ReturnType<typeof makeRng>): number[] {
    const probs = this.probabilities()
    const size = 1 << this.n
    const counts = new Array(size).fill(0) as number[]
    for (let s = 0; s < shots; s++) {
      let r = rng()
      let cumul = 0
      let chosen = size - 1
      for (let i = 0; i < size; i++) {
        cumul += probs[i]
        if (r < cumul) { chosen = i; break }
      }
      counts[chosen]++
    }
    return counts
  }

  /**
   * Collapse to a single outcome in-place. Returns the measured basis index.
   */
  collapse(rng: ReturnType<typeof makeRng>): number {
    const probs = this.probabilities()
    const size = 1 << this.n
    let r = rng()
    let cumul = 0
    let chosen = size - 1
    for (let i = 0; i < size; i++) {
      cumul += probs[i]
      if (r < cumul) { chosen = i; break }
    }
    // Project onto the chosen state
    this.re.fill(0)
    this.im.fill(0)
    this.re[chosen] = 1
    return chosen
  }

  /** ⟨Z⟩ expectation value on qubit `q`. */
  expectationZ(q: number): number {
    const size = 1 << this.n
    const bit = 1 << (this.n - 1 - q)
    let ev = 0
    for (let i = 0; i < size; i++) {
      const sign = i & bit ? -1 : 1
      ev += sign * (this.re[i] * this.re[i] + this.im[i] * this.im[i])
    }
    return ev
  }

  /** Get amplitude at index i as [re, im] */
  amp(i: number): C {
    return [this.re[i], this.im[i]]
  }

  /** Phase (argument) of amplitude i, in [-π, π] */
  phase(i: number): number {
    return Math.atan2(this.im[i], this.re[i])
  }
}
