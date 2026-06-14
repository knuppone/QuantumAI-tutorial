import { StateVector } from './statevector'
import { RY, RX } from './gates'

/**
 * Angle embedding: encode a single data point (x, y) into a 1-qubit state via
 * RY(x * π) · RX(y * π) |0⟩.
 * x, y ∈ [-1, 1].
 */
export function angleEmbed1Qubit(x: number, y: number): StateVector {
  const sv = new StateVector(1)
  sv.applySingleQubitGate(RX(y * Math.PI), 0)
  sv.applySingleQubitGate(RY(x * Math.PI), 0)
  return sv
}

/**
 * Angle embedding for 2 qubits: each qubit gets one feature.
 * qubit 0: RY(x * π) · RX(y * π)
 * qubit 1: RY(a * π) · RX(b * π)   [a, b default to x, y]
 */
export function angleEmbed2Qubit(x: number, y: number, a = x, b = y): StateVector {
  const sv = new StateVector(2)
  sv.applySingleQubitGate(RX(y * Math.PI), 0)
  sv.applySingleQubitGate(RY(x * Math.PI), 0)
  sv.applySingleQubitGate(RX(b * Math.PI), 1)
  sv.applySingleQubitGate(RY(a * Math.PI), 1)
  return sv
}

/**
 * Amplitude embedding: pack 4 classical values into a 2-qubit state.
 * Normalizes the vector automatically.
 * Demonstrates "4 numbers → 2 qubits."
 */
export function amplitudeEmbed(values: [number, number, number, number]): StateVector {
  const sv = new StateVector(2)
  const norm = Math.sqrt(values.reduce((s, v) => s + v * v, 0)) || 1
  sv.re[0] = values[0] / norm
  sv.re[1] = values[1] / norm
  sv.re[2] = values[2] / norm
  sv.re[3] = values[3] / norm
  sv.im.fill(0)
  return sv
}

/**
 * Basis encoding: a bit-string → the matching computational basis state.
 * `bits` are big-endian (bits[0] = most significant qubit). E.g. [1,0] → |10⟩.
 * This is the most literal "classical bit = qubit" encoding: n bits use n qubits.
 */
export function basisEmbed(bits: number[]): StateVector {
  const n = bits.length
  const sv = new StateVector(n)
  let index = 0
  for (let i = 0; i < n; i++) index = (index << 1) | (bits[i] ? 1 : 0)
  sv.re.fill(0)
  sv.im.fill(0)
  sv.re[index] = 1
  return sv
}

/**
 * Qsample encoding: a probability distribution → amplitudes = √probabilities.
 * Measuring the state reproduces the distribution (Born rule). `probs` length must
 * be a power of two; it is renormalised to sum to 1 first.
 */
export function qsampleEmbed(probs: number[]): StateVector {
  const n = Math.round(Math.log2(probs.length))
  const sv = new StateVector(n)
  const total = probs.reduce((s, p) => s + Math.max(0, p), 0) || 1
  sv.re.fill(0)
  sv.im.fill(0)
  for (let i = 0; i < probs.length; i++) {
    sv.re[i] = Math.sqrt(Math.max(0, probs[i]) / total)
  }
  return sv
}
