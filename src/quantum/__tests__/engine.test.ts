import { describe, it, expect } from 'vitest'
import { StateVector } from '../statevector'
import { GH, RX, RY, RZ, GX } from '../gates'
import { reducedBloch } from '../density'
import { simulate, emptyCircuit, type Circuit } from '../circuit'
import { parameterShift, expectationZ } from '../gradient'
import { makeRng } from '../rng'
import { basisEmbed, qsampleEmbed, angleEmbed1Qubit } from '../embedding'
import { stateOverlap, kernelMatrix } from '../kernel'
import { interferenceClassify } from '../interference'
import { svd, lowRankApprox, frobeniusError } from '../tensor'
import { quboEnergy, bruteForceMin, maxCutQubo, allEnergies, qaoaExpectedCost, qaoaState } from '../optimization'
import { noisyExpectation, sampleExpectation, zeroNoiseExtrapolate } from '../noise'

const TOLS = 1e-9

function near(a: number, b: number, eps = 1e-6) {
  return Math.abs(a - b) < eps
}

describe('StateVector basics', () => {
  it('starts as |0⟩', () => {
    const sv = new StateVector(1)
    const p = sv.probabilities()
    expect(near(p[0], 1)).toBe(true)
    expect(near(p[1], 0)).toBe(true)
  })

  it('H|0⟩ = equal superposition', () => {
    const sv = new StateVector(1)
    sv.applySingleQubitGate(GH, 0)
    const p = sv.probabilities()
    expect(near(p[0], 0.5)).toBe(true)
    expect(near(p[1], 0.5)).toBe(true)
  })

  it('X|0⟩ = |1⟩', () => {
    const sv = new StateVector(1)
    sv.applySingleQubitGate(GX, 0)
    const p = sv.probabilities()
    expect(near(p[0], 0)).toBe(true)
    expect(near(p[1], 1)).toBe(true)
  })

  it('RX(π)|0⟩ ≈ |1⟩ (up to global phase)', () => {
    const sv = new StateVector(1)
    sv.applySingleQubitGate(RX(Math.PI), 0)
    const p = sv.probabilities()
    expect(near(p[0], 0)).toBe(true)
    expect(near(p[1], 1)).toBe(true)
  })

  it('RY(π)|0⟩ = |1⟩', () => {
    const sv = new StateVector(1)
    sv.applySingleQubitGate(RY(Math.PI), 0)
    const p = sv.probabilities()
    expect(near(p[0], 0)).toBe(true)
    expect(near(p[1], 1)).toBe(true)
  })

  it('RZ rotates phase but not probabilities', () => {
    const sv = new StateVector(1)
    sv.applySingleQubitGate(GH, 0) // create superposition
    sv.applySingleQubitGate(RZ(Math.PI / 2), 0)
    const p = sv.probabilities()
    expect(near(p[0], 0.5)).toBe(true)
    expect(near(p[1], 0.5)).toBe(true)
  })

  it('CNOT on |10⟩ gives |11⟩', () => {
    const sv = new StateVector(2)
    sv.applySingleQubitGate(GX, 0) // qubit 0 = 1 → state |10⟩
    sv.applyCNOT(0, 1)
    const p = sv.probabilities()
    // |11⟩ = index 3 in big-endian (qubit0=1, qubit1=1)
    expect(near(p[3], 1)).toBe(true)
  })

  it('Bell state from H+CNOT', () => {
    const sv = new StateVector(2)
    sv.applySingleQubitGate(GH, 0)
    sv.applyCNOT(0, 1)
    const p = sv.probabilities()
    // Bell state (|00⟩ + |11⟩)/√2
    expect(near(p[0], 0.5)).toBe(true)
    expect(near(p[1], 0)).toBe(true)
    expect(near(p[2], 0)).toBe(true)
    expect(near(p[3], 0.5)).toBe(true)
  })
})

describe('Density / Bloch vector', () => {
  it('|0⟩ has Bloch z=1, purity=1', () => {
    const sv = new StateVector(1)
    const b = reducedBloch(sv, 0)
    expect(near(b.z, 1)).toBe(true)
    expect(near(b.purity, 1)).toBe(true)
  })

  it('H|0⟩ has Bloch x≈1, z≈0, purity=1', () => {
    const sv = new StateVector(1)
    sv.applySingleQubitGate(GH, 0)
    const b = reducedBloch(sv, 0)
    expect(near(b.x, 1)).toBe(true)
    expect(near(b.z, 0)).toBe(true)
    expect(near(b.purity, 1)).toBe(true)
  })

  it('Bell state: reduced purity ≈ 0.5 (maximally entangled)', () => {
    const sv = new StateVector(2)
    sv.applySingleQubitGate(GH, 0)
    sv.applyCNOT(0, 1)
    const b0 = reducedBloch(sv, 0)
    const b1 = reducedBloch(sv, 1)
    expect(near(b0.purity, 0.5)).toBe(true)
    expect(near(b1.purity, 0.5)).toBe(true)
    // Bloch vector length ≈ 0
    const len0 = Math.sqrt(b0.x ** 2 + b0.y ** 2 + b0.z ** 2)
    expect(len0).toBeLessThan(0.01)
  })
})

describe('Parameter-shift gradient', () => {
  it('matches finite-difference for RY gate', () => {
    const eps = 1e-5
    const theta = 0.7
    const circuit: Circuit = {
      nQubits: 1,
      gates: [{ type: 'RY', qubits: [0], param: theta, column: 0, id: 'g1' }],
    }

    const { grad } = parameterShift(circuit, 0)

    // Finite difference reference
    const svP = simulate({ ...circuit, gates: [{ ...circuit.gates[0], param: theta + eps }] })
    const svM = simulate({ ...circuit, gates: [{ ...circuit.gates[0], param: theta - eps }] })
    const fdGrad = (expectationZ(svP, 0) - expectationZ(svM, 0)) / (2 * eps)

    expect(near(grad, fdGrad, 1e-4)).toBe(true)
  })
})

describe('Sampling', () => {
  it('shot counts converge to probabilities', () => {
    const sv = new StateVector(2)
    sv.applySingleQubitGate(GH, 0)
    sv.applyCNOT(0, 1)
    const rng = makeRng(1234)
    const counts = sv.sample(10000, rng)
    const total = counts.reduce((a, b) => a + b, 0)
    expect(total).toBe(10000)
    expect(Math.abs(counts[0] / total - 0.5)).toBeLessThan(0.03)
    expect(Math.abs(counts[3] / total - 0.5)).toBeLessThan(0.03)
    expect(counts[1]).toBe(0)
    expect(counts[2]).toBe(0)
  })

  it('collapse reduces state to one basis vector', () => {
    const sv = new StateVector(2)
    sv.applySingleQubitGate(GH, 0)
    sv.applyCNOT(0, 1)
    const rng = makeRng(999)
    const outcome = sv.collapse(rng)
    const p = sv.probabilities()
    // Only one state has probability 1
    expect(near(p[outcome], 1)).toBe(true)
    const others = p.filter((_, i) => i !== outcome)
    others.forEach((v) => expect(near(v, 0)).toBe(true))
  })
})

describe('Circuit simulation', () => {
  it('simulate reproduces H+CNOT Bell state', () => {
    const circuit: Circuit = {
      nQubits: 2,
      gates: [
        { type: 'H', qubits: [0], column: 0, id: 'g1' },
        { type: 'CNOT', qubits: [0, 1], column: 1, id: 'g2' },
      ],
    }
    const sv = simulate(circuit)
    const p = sv.probabilities()
    expect(near(p[0], 0.5)).toBe(true)
    expect(near(p[3], 0.5)).toBe(true)
  })
})

describe('Encoding helpers', () => {
  it('basisEmbed sets the matching basis state and is normalized', () => {
    const sv = basisEmbed([1, 0]) // |10⟩ = index 2
    const p = sv.probabilities()
    expect(near(p[2], 1)).toBe(true)
    expect(near(sv.norm2(), 1)).toBe(true)
  })

  it('qsampleEmbed reproduces the distribution and is normalized', () => {
    const dist = [0.1, 0.2, 0.3, 0.4]
    const sv = qsampleEmbed(dist)
    expect(near(sv.norm2(), 1)).toBe(true)
    const p = sv.probabilities()
    dist.forEach((d, i) => expect(near(p[i], d)).toBe(true))
  })
})

describe('Quantum kernel', () => {
  it('overlap of identical states is 1', () => {
    const a = angleEmbed1Qubit(0.4, -0.2)
    expect(near(stateOverlap(a, a.clone()), 1)).toBe(true)
  })

  it('overlap of orthogonal states |0⟩, |1⟩ is 0', () => {
    const zero = new StateVector(1)
    const one = new StateVector(1)
    one.applySingleQubitGate(GX, 0)
    expect(near(stateOverlap(zero, one), 0)).toBe(true)
  })

  it('kernel matrix has a unit diagonal and is symmetric', () => {
    const states = [
      angleEmbed1Qubit(0.2, 0.1),
      angleEmbed1Qubit(-0.5, 0.3),
      angleEmbed1Qubit(0.8, -0.4),
    ]
    const K = kernelMatrix(states)
    for (let i = 0; i < 3; i++) {
      expect(near(K[i][i], 1)).toBe(true)
      for (let j = 0; j < 3; j++) expect(near(K[i][j], K[j][i])).toBe(true)
    }
  })
})

describe('Interference distance classifier', () => {
  const train0 = { x: -1, y: 0 } // class 0 anchor
  const train1 = { x: 1, y: 0 }  // class 1 anchor

  it('classifies a test point nearer class 1 as class 1', () => {
    const r = interferenceClassify(train0, train1, { x: 0.9, y: 0.1 })
    expect(r.prediction).toBe(1)
    expect(r.pClass1).toBeGreaterThan(r.pClass0)
  })

  it('classifies a test point nearer class 0 as class 0', () => {
    const r = interferenceClassify(train0, train1, { x: -0.9, y: 0.1 })
    expect(r.prediction).toBe(0)
    expect(r.pClass0).toBeGreaterThan(r.pClass1)
  })

  it('conditional class probabilities sum to 1', () => {
    const r = interferenceClassify(train0, train1, { x: 0.3, y: 0.5 })
    expect(near(r.pClass0 + r.pClass1, 1)).toBe(true)
  })
})

describe('Tensor / low-rank (SVD)', () => {
  const A = [
    [4, 0, 1, 2],
    [0, 3, 1, 0],
    [1, 1, 5, 1],
    [2, 0, 1, 4],
  ]

  it('full-rank reconstruction is exact', () => {
    expect(frobeniusError(A, lowRankApprox(A, 4))).toBeLessThan(1e-6)
  })

  it('U·diag(s)·Vᵀ reconstructs A, s sorted descending', () => {
    const { U, s, V } = svd(A)
    for (let k = 0; k < s.length - 1; k++) expect(s[k]).toBeGreaterThanOrEqual(s[k + 1] - 1e-9)
    s.forEach((v) => expect(v).toBeGreaterThanOrEqual(-1e-9))
    // reconstruct
    const recon = A.map((row, i) => row.map((_, j) => {
      let acc = 0
      for (let k = 0; k < s.length; k++) acc += s[k] * U[i][k] * V[j][k]
      return acc
    }))
    expect(frobeniusError(A, recon)).toBeLessThan(1e-6)
  })

  it('U has orthonormal columns', () => {
    const { U } = svd(A)
    const n = U[0].length
    for (let a = 0; a < n; a++)
      for (let b = 0; b < n; b++) {
        let dot = 0
        for (let k = 0; k < U.length; k++) dot += U[k][a] * U[k][b]
        expect(near(dot, a === b ? 1 : 0, 1e-6)).toBe(true)
      }
  })

  it('reconstruction error is non-increasing in rank', () => {
    const e1 = frobeniusError(A, lowRankApprox(A, 1))
    const e2 = frobeniusError(A, lowRankApprox(A, 2))
    const e3 = frobeniusError(A, lowRankApprox(A, 3))
    expect(e2).toBeLessThanOrEqual(e1 + 1e-9)
    expect(e3).toBeLessThanOrEqual(e2 + 1e-9)
  })

  it('rank-1 matrix is exact at rank 1', () => {
    const R1 = [[1, 2], [2, 4]] // outer product [1,2]ᵀ[1,2]
    expect(frobeniusError(R1, lowRankApprox(R1, 1))).toBeLessThan(1e-6)
  })
})

describe('QUBO / QAOA optimization', () => {
  it('quboEnergy + bruteForceMin on a single edge', () => {
    const Q = maxCutQubo([[0, 1]], 2)
    expect(quboEnergy(Q, [0, 0])).toBe(0)
    expect(quboEnergy(Q, [1, 0])).toBe(-1)
    expect(quboEnergy(Q, [1, 1])).toBe(0)
    expect(bruteForceMin(Q).energy).toBe(-1) // max cut = 1 edge
  })

  it('triangle max-cut optimum is 2 cut edges (energy −2)', () => {
    const Q = maxCutQubo([[0, 1], [1, 2], [0, 2]], 3)
    expect(bruteForceMin(Q).energy).toBe(-2)
  })

  it('applyDiagonalPhase preserves probabilities', () => {
    const sv = new StateVector(1)
    sv.applySingleQubitGate(GH, 0)
    sv.applyDiagonalPhase([0, 1], 0.7)
    const p = sv.probabilities()
    expect(near(p[0], 0.5)).toBe(true)
    expect(near(p[1], 0.5)).toBe(true)
  })

  it('tuned QAOA beats the uniform-superposition baseline', () => {
    const Q = maxCutQubo([[0, 1], [1, 2], [0, 2]], 3)
    const energies = allEnergies(Q)
    const mean = energies.reduce((a, b) => a + b, 0) / energies.length
    // β=γ=0 leaves the uniform superposition → expected cost = mean energy
    expect(near(qaoaExpectedCost(energies, [0], [0]), mean, 1e-6)).toBe(true)
    // grid-search p=1 angles for the best expected cost
    let best = Infinity
    for (let gi = 0; gi <= 12; gi++) {
      for (let bi = 0; bi <= 12; bi++) {
        const g = (gi / 12) * Math.PI
        const b = (bi / 12) * (Math.PI / 2)
        best = Math.min(best, qaoaExpectedCost(energies, [g], [b]))
      }
    }
    expect(best).toBeLessThan(mean - 0.05)
    expect(best).toBeGreaterThanOrEqual(bruteForceMin(Q).energy - 1e-9)
  })

  it('qaoaState is normalized', () => {
    const energies = allEnergies(maxCutQubo([[0, 1], [1, 2]], 3))
    expect(near(qaoaState(energies, [0.4, 0.8], [0.3, 0.6]).norm2(), 1)).toBe(true)
  })
})

describe('Noise & error mitigation', () => {
  it('noisyExpectation: ideal at depth 0, decays with depth and λ', () => {
    expect(near(noisyExpectation(0.8, 0.1, 0), 0.8)).toBe(true)
    expect(noisyExpectation(0.8, 0.1, 5)).toBeLessThan(noisyExpectation(0.8, 0.1, 1))
    expect(noisyExpectation(0.8, 0.3, 3)).toBeLessThan(noisyExpectation(0.8, 0.1, 3))
    expect(noisyExpectation(0.8, 0.1, 1000)).toBeLessThan(1e-6)
  })

  it('zeroNoiseExtrapolate recovers the intercept of a line', () => {
    // y = x + 1 → intercept 1
    const v = zeroNoiseExtrapolate([{ x: 1, y: 2 }, { x: 2, y: 3 }, { x: 3, y: 4 }])
    expect(near(v, 1, 1e-9)).toBe(true)
  })

  it('sampleExpectation converges to the analytic value', () => {
    const rng = makeRng(2024)
    const est = sampleExpectation([0.5, 0.5], [1, -1], 10000, rng)
    expect(Math.abs(est)).toBeLessThan(0.05) // true ⟨Z⟩ = 0
  })
})
