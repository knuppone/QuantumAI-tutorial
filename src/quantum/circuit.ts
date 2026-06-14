import { StateVector } from './statevector'
import type { GateType } from './gates'

export interface GatePlacement {
  type: GateType
  /** For single-qubit: [qubit]. For CNOT/CZ: [control, target]. */
  qubits: number[]
  /** Rotation parameter (θ) for RX/RY/RZ. */
  param?: number
  /** Column index in the circuit grid (0-based). */
  column: number
  /** Unique id for React keys / selection */
  id: string
}

export interface Circuit {
  nQubits: number
  gates: GatePlacement[]
}

let _idCounter = 0
export function newGateId(): string {
  return `g${++_idCounter}`
}

export function emptyCircuit(nQubits: number): Circuit {
  return { nQubits, gates: [] }
}

/**
 * Simulate the circuit, starting from `initialState` (defaults to |0...0⟩).
 * Returns a NEW StateVector — does not mutate the input.
 */
export function simulate(circuit: Circuit, initialState?: StateVector): StateVector {
  const sv = initialState ? initialState.clone() : new StateVector(circuit.nQubits)

  // Sort gates by column, then apply in order
  const sorted = [...circuit.gates].sort((a, b) => a.column - b.column)
  for (const gate of sorted) {
    sv.applyGate(gate.type, gate.qubits, gate.param ?? 0)
  }
  return sv
}

/** Return a human-readable ket label for basis index `i` with `n` qubits. */
export function ketLabel(i: number, n: number): string {
  return '|' + i.toString(2).padStart(n, '0') + '⟩'
}

/** All basis labels for `n` qubits. */
export function allKetLabels(n: number): string[] {
  return Array.from({ length: 1 << n }, (_, i) => ketLabel(i, n))
}
