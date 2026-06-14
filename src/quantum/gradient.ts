import { StateVector } from './statevector'
import { simulate, type Circuit, type GatePlacement } from './circuit'

/** ⟨Z⟩ on qubit `q` for the given state. */
export function expectationZ(sv: StateVector, q: number): number {
  return sv.expectationZ(q)
}

/** Observable: expectation value of a simple operator */
export type Observable = (sv: StateVector) => number

export const obsZ0: Observable = (sv) => sv.expectationZ(0)

export interface GradientResult {
  /** Output at θ + π/2 */
  ePlus: number
  /** State at θ + π/2 */
  svPlus: StateVector
  /** Output at θ - π/2 */
  eMinus: number
  /** State at θ - π/2 */
  svMinus: StateVector
  /** Gradient = 0.5 * (ePlus - eMinus) */
  grad: number
}

/**
 * Parameter-shift rule gradient for gate `gateIndex` in the circuit.
 * Only valid for parameterized gates (RX, RY, RZ).
 * Uses the observable `obs` (default: ⟨Z₀⟩).
 */
export function parameterShift(
  circuit: Circuit,
  gateIndex: number,
  obs: Observable = obsZ0,
  initialState?: StateVector,
): GradientResult {
  const gate = circuit.gates[gateIndex]
  const theta = gate.param ?? 0

  const circuitPlus: Circuit = {
    ...circuit,
    gates: circuit.gates.map((g, i) =>
      i === gateIndex ? { ...g, param: theta + Math.PI / 2 } : g,
    ),
  }
  const circuitMinus: Circuit = {
    ...circuit,
    gates: circuit.gates.map((g, i) =>
      i === gateIndex ? { ...g, param: theta - Math.PI / 2 } : g,
    ),
  }

  const svPlus = simulate(circuitPlus, initialState)
  const svMinus = simulate(circuitMinus, initialState)
  const ePlus = obs(svPlus)
  const eMinus = obs(svMinus)

  return { ePlus, svPlus, eMinus, svMinus, grad: 0.5 * (ePlus - eMinus) }
}

/**
 * Take a single gradient descent step on all parameterized gates in the circuit.
 * Returns a NEW circuit with updated params.
 */
export function gradientStep(
  circuit: Circuit,
  learningRate: number,
  obs: Observable = obsZ0,
  initialState?: StateVector,
): Circuit {
  const newGates = [...circuit.gates]
  for (let i = 0; i < newGates.length; i++) {
    const g = newGates[i]
    if (g.param === undefined) continue
    const result = parameterShift(circuit, i, obs, initialState)
    newGates[i] = { ...g, param: g.param - learningRate * result.grad }
  }
  return { ...circuit, gates: newGates }
}
