import { gradientVariance, lossSurface, randomAnsatz } from './landscape'

interface WorkerMessage {
  type: 'variance' | 'surface'
  qubits: number
  depth: number
  seed?: number
}

self.onmessage = (e: MessageEvent<WorkerMessage>) => {
  const { type, qubits, depth, seed } = e.data
  if (type === 'variance') {
    const variance = gradientVariance(qubits, depth, 40, seed ?? 42)
    self.postMessage({ type: 'variance', variance })
  } else if (type === 'surface') {
    const circuit = randomAnsatz(qubits, depth, seed ?? 42)
    const paramGates = circuit.gates.filter((g) => g.param !== undefined)
    if (paramGates.length < 2) {
      self.postMessage({ type: 'surface', grid: null })
      return
    }
    const idx1 = circuit.gates.indexOf(paramGates[0])
    const idx2 = circuit.gates.indexOf(paramGates[1])
    const grid = lossSurface(circuit, idx1, idx2, 20)
    self.postMessage({ type: 'surface', grid })
  }
}
