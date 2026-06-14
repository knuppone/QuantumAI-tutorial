import { c, expI, type M2 } from './complex'

const s = 1 / Math.sqrt(2)

/** Pauli I */
export const GI: M2 = [c(1, 0), c(0, 0), c(0, 0), c(1, 0)]
/** Pauli X */
export const GX: M2 = [c(0, 0), c(1, 0), c(1, 0), c(0, 0)]
/** Pauli Y */
export const GY: M2 = [c(0, 0), c(0, -1), c(0, 1), c(0, 0)]
/** Pauli Z */
export const GZ: M2 = [c(1, 0), c(0, 0), c(0, 0), c(-1, 0)]
/** Hadamard */
export const GH: M2 = [c(s, 0), c(s, 0), c(s, 0), c(-s, 0)]
/** S gate */
export const GS: M2 = [c(1, 0), c(0, 0), c(0, 0), c(0, 1)]
/** T gate */
export const GT: M2 = [c(1, 0), c(0, 0), c(0, 0), expI(Math.PI / 4)]

/** RX(θ) = exp(-i θ/2 X) */
export function RX(theta: number): M2 {
  const c0 = Math.cos(theta / 2)
  const s0 = Math.sin(theta / 2)
  return [c(c0, 0), c(0, -s0), c(0, -s0), c(c0, 0)]
}

/** RY(θ) = exp(-i θ/2 Y) */
export function RY(theta: number): M2 {
  const c0 = Math.cos(theta / 2)
  const s0 = Math.sin(theta / 2)
  return [c(c0, 0), c(-s0, 0), c(s0, 0), c(c0, 0)]
}

/** RZ(θ) = exp(-i θ/2 Z) */
export function RZ(theta: number): M2 {
  return [expI(-theta / 2), c(0, 0), c(0, 0), expI(theta / 2)]
}

export type { M2 }
export type GateType = 'I' | 'X' | 'Y' | 'Z' | 'H' | 'S' | 'T' | 'RX' | 'RY' | 'RZ' | 'CNOT' | 'CZ'

export function getMatrix(type: GateType, param = 0): M2 {
  switch (type) {
    case 'I': return GI
    case 'X': return GX
    case 'Y': return GY
    case 'Z': return GZ
    case 'H': return GH
    case 'S': return GS
    case 'T': return GT
    case 'RX': return RX(param)
    case 'RY': return RY(param)
    case 'RZ': return RZ(param)
    default: return GI // CNOT / CZ handled specially in StateVector
  }
}

export const PARAMETERIZED_GATES: GateType[] = ['RX', 'RY', 'RZ']
export const TWO_QUBIT_GATES: GateType[] = ['CNOT', 'CZ']

export const GATE_COLORS: Record<string, string> = {
  H: '#818cf8',
  X: '#f87171',
  Y: '#fb923c',
  Z: '#facc15',
  S: '#34d399',
  T: '#2dd4bf',
  RX: '#c084fc',
  RY: '#e879f9',
  RZ: '#f472b6',
  CNOT: '#60a5fa',
  CZ: '#38bdf8',
  I: '#374151',
}
