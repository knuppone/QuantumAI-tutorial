import { useState, useRef } from 'react'
import { GATE_COLORS, PARAMETERIZED_GATES, TWO_QUBIT_GATES, type GateType } from '../quantum/gates'
import type { GatePlacement, Circuit } from '../quantum/circuit'
import { newGateId } from '../quantum/circuit'

const GATE_PALETTE: { type: GateType; label: string }[] = [
  { type: 'H', label: 'H' },
  { type: 'X', label: 'X' },
  { type: 'Y', label: 'Y' },
  { type: 'Z', label: 'Z' },
  { type: 'RX', label: 'RX' },
  { type: 'RY', label: 'RY' },
  { type: 'RZ', label: 'RZ' },
  { type: 'S', label: 'S' },
  { type: 'T', label: 'T' },
  { type: 'CNOT', label: 'CX' },
  { type: 'CZ', label: 'CZ' },
]

const COL_W = 52
const ROW_H = 48
const MARGIN_LEFT = 48
const MARGIN_TOP = 24

interface Props {
  circuit: Circuit
  selectedGateId?: string | null
  onAddGate: (type: GateType, qubits: number[], column: number, param?: number) => void
  onRemoveGate: (id: string) => void
  onUpdateParam: (id: string, param: number) => void
  onSelect: (id: string | null) => void
  maxColumns?: number
}

export function CircuitBoard({
  circuit,
  selectedGateId,
  onAddGate,
  onRemoveGate,
  onUpdateParam,
  onSelect,
  maxColumns = 10,
}: Props) {
  const { nQubits, gates } = circuit
  const [dragging, setDragging] = useState<GateType | null>(null)
  const [draggingTwo, setDraggingTwo] = useState<{ type: GateType; control: number } | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  const numCols = maxColumns
  const svgW = MARGIN_LEFT + numCols * COL_W + 24
  const svgH = MARGIN_TOP + nQubits * ROW_H + 16

  function gridCoords(e: React.MouseEvent<SVGSVGElement>): { col: number; row: number } {
    const rect = svgRef.current!.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const col = Math.floor((x - MARGIN_LEFT) / COL_W)
    const row = Math.floor((y - MARGIN_TOP) / ROW_H)
    return { col: Math.max(0, Math.min(col, numCols - 1)), row: Math.max(0, Math.min(row, nQubits - 1)) }
  }

  function handleSvgClick(e: React.MouseEvent<SVGSVGElement>) {
    if (!dragging) return
    const { col, row } = gridCoords(e)
    const isParam = PARAMETERIZED_GATES.includes(dragging)
    onAddGate(dragging, [row], col, isParam ? 0 : undefined)
    setDragging(null)
  }

  function handleSvgDoubleClick(e: React.MouseEvent<SVGSVGElement>) {
    if (!dragging) return
    // first click placed it above — ignore double, just clear
    setDragging(null)
  }

  function handleGateClick(e: React.MouseEvent, gate: GatePlacement) {
    e.stopPropagation()
    onSelect(gate.id)
  }

  function handleGateRightClick(e: React.MouseEvent, gate: GatePlacement) {
    e.preventDefault()
    onRemoveGate(gate.id)
  }

  // Two-qubit gate placement: first click = control, second click = target
  function handleTwoQubitFirstClick(e: React.MouseEvent<SVGSVGElement>) {
    if (!draggingTwo) return
    const { col, row } = gridCoords(e)
    // already have control — place CNOT
    onAddGate(draggingTwo.type, [draggingTwo.control, row], col)
    setDraggingTwo(null)
  }

  const selectedGate = gates.find((g) => g.id === selectedGateId)

  return (
    <div className="flex flex-col gap-3">
      {/* Palette */}
      <div className="flex flex-wrap gap-1.5">
        {GATE_PALETTE.map(({ type, label }) => (
          <button
            key={type}
            onClick={() => setDragging(type)}
            style={{ backgroundColor: GATE_COLORS[type] + '33', borderColor: GATE_COLORS[type] }}
            className={`px-2 py-1 rounded text-xs font-mono font-bold border transition-all
              ${dragging === type ? 'ring-2 ring-white/50 scale-110' : 'hover:scale-105'}`}
          >
            {label}
          </button>
        ))}
        {dragging && (
          <button
            onClick={() => setDragging(null)}
            className="px-2 py-1 rounded text-xs font-mono text-slate-400 border border-slate-600 hover:border-slate-400"
          >
            ✕ cancel
          </button>
        )}
      </div>

      {dragging && (
        <div className="text-xs text-indigo-300 animate-pulse">
          {TWO_QUBIT_GATES.includes(dragging as any)
            ? 'Click once for control qubit row, then again for target row'
            : 'Click a grid cell to place the gate'}
        </div>
      )}

      {/* SVG circuit (horizontally scrollable on narrow screens) */}
      <div className="max-w-full overflow-x-auto">
      <svg
        ref={svgRef}
        width={svgW}
        height={svgH}
        className={`rounded-lg bg-slate-900/80 border border-slate-700 select-none touch-pan-x ${dragging ? 'cursor-crosshair' : ''}`}
        onClick={(e) => {
          if (!dragging) return
          const { col, row } = gridCoords(e)
          if (TWO_QUBIT_GATES.includes(dragging as any)) {
            if (!draggingTwo) {
              setDraggingTwo({ type: dragging as GateType, control: row })
            } else {
              onAddGate(draggingTwo.type, [draggingTwo.control, row], col)
              setDraggingTwo(null)
              setDragging(null)
            }
          } else {
            const isParam = PARAMETERIZED_GATES.includes(dragging)
            onAddGate(dragging, [row], col, isParam ? 0 : undefined)
            setDragging(null)
          }
        }}
      >
        {/* Qubit wires */}
        {Array.from({ length: nQubits }, (_, q) => {
          const y = MARGIN_TOP + q * ROW_H + ROW_H / 2
          return (
            <g key={q}>
              <line
                x1={8} y1={y} x2={svgW - 8} y2={y}
                stroke="#334155" strokeWidth={2}
              />
              <text x={8} y={y + 4} fill="#64748b" fontSize={11} fontFamily="monospace">
                q{q}
              </text>
            </g>
          )
        })}

        {/* Column separators */}
        {Array.from({ length: numCols + 1 }, (_, c) => (
          <line
            key={c}
            x1={MARGIN_LEFT + c * COL_W} y1={MARGIN_TOP - 8}
            x2={MARGIN_LEFT + c * COL_W} y2={svgH - 8}
            stroke="#1e293b" strokeWidth={1}
          />
        ))}

        {/* Gates */}
        {gates.map((gate) => {
          const cx = MARGIN_LEFT + gate.column * COL_W + COL_W / 2
          const isTwoQubit = gate.qubits.length === 2
          if (isTwoQubit) {
            const cy0 = MARGIN_TOP + gate.qubits[0] * ROW_H + ROW_H / 2
            const cy1 = MARGIN_TOP + gate.qubits[1] * ROW_H + ROW_H / 2
            const color = GATE_COLORS[gate.type] ?? '#6366f1'
            return (
              <g
                key={gate.id}
                onClick={(e) => handleGateClick(e, gate)}
                onContextMenu={(e) => handleGateRightClick(e, gate)}
                style={{ cursor: 'pointer' }}
              >
                <line x1={cx} y1={cy0} x2={cx} y2={cy1} stroke={color} strokeWidth={2} />
                {/* Control dot */}
                <circle cx={cx} cy={cy0} r={5} fill={color} />
                {/* Target */}
                {gate.type === 'CNOT' ? (
                  <>
                    <circle cx={cx} cy={cy1} r={10} fill="none" stroke={color} strokeWidth={2} />
                    <line x1={cx - 10} y1={cy1} x2={cx + 10} y2={cy1} stroke={color} strokeWidth={1.5} />
                    <line x1={cx} y1={cy1 - 10} x2={cx} y2={cy1 + 10} stroke={color} strokeWidth={1.5} />
                  </>
                ) : (
                  <rect x={cx - 10} y={cy1 - 10} width={20} height={20}
                    fill={color + '33'} stroke={color} strokeWidth={2} rx={3}
                  />
                )}
              </g>
            )
          }

          const cy = MARGIN_TOP + gate.qubits[0] * ROW_H + ROW_H / 2
          const color = GATE_COLORS[gate.type] ?? '#6366f1'
          const isSelected = gate.id === selectedGateId
          return (
            <g
              key={gate.id}
              onClick={(e) => handleGateClick(e, gate)}
              onContextMenu={(e) => handleGateRightClick(e, gate)}
              style={{ cursor: 'pointer' }}
            >
              <rect
                x={cx - 14} y={cy - 13} width={28} height={26} rx={4}
                fill={color + '33'}
                stroke={isSelected ? '#fff' : color}
                strokeWidth={isSelected ? 2.5 : 1.5}
              />
              <text x={cx} y={cy + 4} textAnchor="middle" fill={color}
                fontSize={10} fontFamily="monospace" fontWeight="bold">
                {gate.type}
              </text>
              {gate.param !== undefined && (
                <text x={cx} y={cy + 18} textAnchor="middle" fill="#94a3b8" fontSize={8} fontFamily="monospace">
                  {gate.param.toFixed(2)}
                </text>
              )}
            </g>
          )
        })}
      </svg>
      </div>

      {/* Selected gate: delete (works on touch — replaces right-click) */}
      {selectedGate && (
        <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-800/60 border border-slate-700">
          <span className="text-xs font-mono text-slate-300">
            Selected <span className="text-white">{selectedGate.type}</span> · q{selectedGate.qubits.join(',')}
          </span>
          <button
            onClick={() => { onRemoveGate(selectedGate.id); onSelect(null) }}
            className="text-xs font-mono px-2.5 py-1 rounded bg-rose-900/40 text-rose-300 border border-rose-700/50 hover:bg-rose-900/70 transition-colors"
          >
            ✕ Delete gate
          </button>
        </div>
      )}

      {/* Selected gate param slider */}
      {selectedGate && selectedGate.param !== undefined && (
        <div className="p-3 rounded-lg bg-slate-800/80 border border-indigo-500/40 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-indigo-300">{selectedGate.type} gate — θ parameter</span>
            <span className="text-white">{selectedGate.param.toFixed(3)} rad</span>
          </div>
          <input
            type="range"
            min={-Math.PI * 2}
            max={Math.PI * 2}
            step={0.01}
            value={selectedGate.param}
            onChange={(e) => onUpdateParam(selectedGate.id, parseFloat(e.target.value))}
            className="w-full accent-indigo-500"
          />
          <div className="flex justify-between text-xs text-slate-500 font-mono">
            <span>-2π</span><span>0</span><span>+2π</span>
          </div>
        </div>
      )}

      <p className="text-xs text-slate-500">
        Tap a gate in the palette, then tap a cell to place it. Tap a placed gate to select it (θ slider + Delete). Right-click also removes on desktop.
      </p>
    </div>
  )
}
