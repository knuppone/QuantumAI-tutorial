import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { useMemo } from 'react'
import { emptyCircuit, simulate, type Circuit, type GatePlacement, newGateId } from '../quantum/circuit'
import { StateVector } from '../quantum/statevector'
import { angleEmbed1Qubit, amplitudeEmbed } from '../quantum/embedding'
import { allBlochVectors, type BlochVector } from '../quantum/density'
import type { GateType } from '../quantum/gates'
import { makeRng } from '../quantum/rng'

export type EmbeddingMode = 'angle' | 'amplitude'

export interface CircuitState {
  // Circuit config
  nQubits: number
  circuit: Circuit
  // Embedding (Module 1)
  embeddingMode: EmbeddingMode
  dataX: number // [-1, 1]
  dataY: number // [-1, 1]
  amplitudeValues: [number, number, number, number]
  // Measurement (Module 4)
  shots: number
  seed: number
  measurementCounts: number[] | null
  collapsedState: number | null
  // Selection
  selectedGateId: string | null
  // Derived (computed lazily via selectors)
  _svDirty: boolean
}

interface CircuitActions {
  setNQubits: (n: number) => void
  addGate: (type: GateType, qubits: number[], column: number, param?: number) => void
  removeGate: (id: string) => void
  updateGateParam: (id: string, param: number) => void
  moveGate: (id: string, column: number) => void
  setEmbeddingMode: (mode: EmbeddingMode) => void
  setDataPoint: (x: number, y: number) => void
  setAmplitudeValues: (values: [number, number, number, number]) => void
  setShots: (shots: number) => void
  measure: () => void
  resetMeasurement: () => void
  selectGate: (id: string | null) => void
  resetCircuit: () => void
}

type Store = CircuitState & CircuitActions

function computeEmbedding(state: CircuitState): StateVector | undefined {
  if (state.nQubits === 1) {
    return angleEmbed1Qubit(state.dataX, state.dataY)
  }
  if (state.embeddingMode === 'amplitude' && state.nQubits >= 2) {
    return amplitudeEmbed(state.amplitudeValues)
  }
  return undefined
}

export function computeStateVector(state: CircuitState): StateVector {
  const embedding = computeEmbedding(state)
  return simulate(state.circuit, embedding)
}

export const useCircuitStore = create<Store>()(
  immer((set, get) => ({
    nQubits: 2,
    circuit: (() => {
      const c = emptyCircuit(2)
      // default: H on qubit 0
      c.gates.push({ type: 'H', qubits: [0], column: 0, id: newGateId() })
      return c
    })(),
    embeddingMode: 'angle',
    dataX: 0.5,
    dataY: 0.3,
    amplitudeValues: [0.5, 0.5, 0.5, 0.5],
    shots: 100,
    seed: 42,
    measurementCounts: null,
    collapsedState: null,
    selectedGateId: null,
    _svDirty: true,

    setNQubits: (n) =>
      set((s) => {
        s.nQubits = n
        s.circuit = emptyCircuit(n)
        s.measurementCounts = null
        s.collapsedState = null
      }),

    addGate: (type, qubits, column, param) =>
      set((s) => {
        s.circuit.gates.push({ type, qubits, param, column, id: newGateId() })
        s.measurementCounts = null
      }),

    removeGate: (id) =>
      set((s) => {
        s.circuit.gates = s.circuit.gates.filter((g: GatePlacement) => g.id !== id)
        if (s.selectedGateId === id) s.selectedGateId = null
      }),

    updateGateParam: (id, param) =>
      set((s) => {
        const g = s.circuit.gates.find((g: GatePlacement) => g.id === id)
        if (g) g.param = param
        s.measurementCounts = null
      }),

    moveGate: (id, column) =>
      set((s) => {
        const g = s.circuit.gates.find((g: GatePlacement) => g.id === id)
        if (g) g.column = column
      }),

    setEmbeddingMode: (mode) => set((s) => { s.embeddingMode = mode }),
    setDataPoint: (x, y) => set((s) => { s.dataX = x; s.dataY = y }),
    setAmplitudeValues: (values) => set((s) => { s.amplitudeValues = values }),

    setShots: (shots) => set((s) => {
      s.shots = shots
      s.measurementCounts = null
    }),

    measure: () =>
      set((s) => {
        const sv = computeStateVector(s)
        const rng = makeRng(s.seed + 1)
        if (s.shots === 1) {
          const rng2 = makeRng(s.seed + 2)
          const collapsed = sv.clone()
          const outcome = collapsed.collapse(rng2)
          s.collapsedState = outcome
          s.measurementCounts = (() => {
            const arr = new Array(1 << s.nQubits).fill(0)
            arr[outcome] = 1
            return arr
          })()
        } else {
          s.measurementCounts = sv.sample(s.shots, rng)
          s.collapsedState = null
        }
        s.seed = s.seed + 1
      }),

    resetMeasurement: () => set((s) => { s.measurementCounts = null; s.collapsedState = null }),

    selectGate: (id) => set((s) => { s.selectedGateId = id }),

    resetCircuit: () =>
      set((s) => {
        s.circuit = emptyCircuit(s.nQubits)
        s.measurementCounts = null
        s.collapsedState = null
        s.selectedGateId = null
      }),
  })),
)

/** React hook: recomputed whenever circuit/embedding inputs actually change */
export function useLiveStateVector(): StateVector {
  const circuit = useCircuitStore((s) => s.circuit)
  const embeddingMode = useCircuitStore((s) => s.embeddingMode)
  const dataX = useCircuitStore((s) => s.dataX)
  const dataY = useCircuitStore((s) => s.dataY)
  const amplitudeValues = useCircuitStore((s) => s.amplitudeValues)
  return useMemo(
    () => computeStateVector({ circuit, embeddingMode, dataX, dataY, amplitudeValues } as CircuitState),
    [circuit, embeddingMode, dataX, dataY, amplitudeValues],
  )
}

export function useLiveBlochVectors(): BlochVector[] {
  const sv = useLiveStateVector()
  return useMemo(() => allBlochVectors(sv), [sv])
}
