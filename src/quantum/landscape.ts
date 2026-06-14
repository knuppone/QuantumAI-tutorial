import { StateVector } from './statevector'
import { simulate, type Circuit, type GatePlacement, newGateId } from './circuit'
import type { GateType } from './gates'
import { obsZ0, type Observable } from './gradient'
import { makeRng } from './rng'

/**
 * Build a hardware-efficient ansatz: alternating rotation layers + CNOT entanglers.
 * Each parameterized gate gets param = seed-based initial angle.
 */
export function randomAnsatz(qubits: number, depth: number, seed = 42): Circuit {
  const rng = makeRng(seed)
  const gates: GatePlacement[] = []
  let col = 0

  for (let d = 0; d < depth; d++) {
    // Rotation layer: RY on each qubit
    for (let q = 0; q < qubits; q++) {
      gates.push({
        type: 'RY',
        qubits: [q],
        param: rng() * Math.PI * 2,
        column: col,
        id: newGateId(),
      })
    }
    col++
    // Entanglement layer: CNOT chain
    if (qubits > 1) {
      for (let q = 0; q < qubits - 1; q++) {
        gates.push({ type: 'CNOT', qubits: [q, q + 1], column: col + q, id: newGateId() })
      }
      col += qubits - 1
    }
    col++
  }
  return { nQubits: qubits, gates }
}

export interface SurfacePoint {
  theta1: number
  theta2: number
  loss: number
}

/**
 * Sample the loss landscape over two parameters (idx1 and idx2 in the circuit).
 * Returns a grid of size `steps × steps`.
 */
export function lossSurface(
  circuit: Circuit,
  idx1: number,
  idx2: number,
  steps = 24,
  obs: Observable = obsZ0,
  initialState?: StateVector,
): SurfacePoint[][] {
  const grid: SurfacePoint[][] = []
  for (let i = 0; i < steps; i++) {
    grid[i] = []
    const theta1 = (i / (steps - 1)) * 2 * Math.PI
    for (let j = 0; j < steps; j++) {
      const theta2 = (j / (steps - 1)) * 2 * Math.PI
      const modified: Circuit = {
        ...circuit,
        gates: circuit.gates.map((g, k) => {
          if (k === idx1) return { ...g, param: theta1 }
          if (k === idx2) return { ...g, param: theta2 }
          return g
        }),
      }
      const sv = simulate(modified, initialState)
      grid[i][j] = { theta1, theta2, loss: obs(sv) }
    }
  }
  return grid
}

/**
 * Estimate the gradient variance for random parameter vectors.
 * As qubits/depth increase, this → 0 (barren plateau).
 */
export function gradientVariance(
  qubits: number,
  depth: number,
  samples = 50,
  seed = 99,
): number {
  const rng = makeRng(seed)
  const grads: number[] = []

  for (let s = 0; s < samples; s++) {
    const circuit = randomAnsatz(qubits, depth, rng() * 1e8 | 0)
    // Pick the first parameterized gate
    const gIdx = circuit.gates.findIndex((g) => g.param !== undefined)
    if (gIdx < 0) continue

    const theta = circuit.gates[gIdx].param ?? 0
    const eps = 0.01
    const circPlus = {
      ...circuit,
      gates: circuit.gates.map((g, i) => (i === gIdx ? { ...g, param: theta + eps } : g)),
    }
    const circMinus = {
      ...circuit,
      gates: circuit.gates.map((g, i) => (i === gIdx ? { ...g, param: theta - eps } : g)),
    }
    const svP = simulate(circPlus)
    const svM = simulate(circMinus)
    const grad = (obsZ0(svP) - obsZ0(svM)) / (2 * eps)
    grads.push(grad)
  }

  if (grads.length < 2) return 0
  const mean = grads.reduce((a, b) => a + b, 0) / grads.length
  const variance = grads.reduce((a, g) => a + (g - mean) ** 2, 0) / (grads.length - 1)
  return variance
}
