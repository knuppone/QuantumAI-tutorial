import { useRef, useState } from 'react'
import { Panel } from '../Panel'
import { interferenceClassify, type Point2D } from '../../quantum/interference'

const SIZE = 260

type Handle = 'train0' | 'train1' | 'test'

const COLORS: Record<Handle, string> = {
  train0: '#f43f5e', // class 0 — rose
  train1: '#22d3ee', // class 1 — cyan
  test: '#a5b4fc',   // test — indigo
}

function toPx(p: Point2D) {
  return { x: ((p.x + 1) / 2) * SIZE, y: ((1 - p.y) / 2) * SIZE }
}

export function InterferenceClassifier() {
  const svgRef = useRef<SVGSVGElement>(null)
  const [train0, setTrain0] = useState<Point2D>({ x: -0.7, y: -0.4 })
  const [train1, setTrain1] = useState<Point2D>({ x: 0.7, y: 0.5 })
  const [test, setTest] = useState<Point2D>({ x: 0.1, y: 0.2 })
  const [drag, setDrag] = useState<Handle | null>(null)

  const setter: Record<Handle, (p: Point2D) => void> = {
    train0: setTrain0, train1: setTrain1, test: setTest,
  }

  function coordsFromEvent(e: React.PointerEvent<SVGSVGElement>): Point2D {
    const rect = svgRef.current!.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / SIZE) * 2 - 1
    const y = -(((e.clientY - rect.top) / SIZE) * 2 - 1)
    return { x: Math.max(-1, Math.min(1, x)), y: Math.max(-1, Math.min(1, y)) }
  }

  const result = interferenceClassify(train0, train1, test)

  const points: { handle: Handle; p: Point2D; label: string }[] = [
    { handle: 'train0', p: train0, label: 'class 0' },
    { handle: 'train1', p: train1, label: 'class 1' },
    { handle: 'test', p: test, label: 'test' },
  ]

  const predColor = result.prediction === 1 ? COLORS.train1 : COLORS.train0

  return (
    <div className="flex flex-wrap gap-4 items-start">
      <Panel title="Drag the points" subtitle="two class anchors + one test point" className="flex-shrink-0">
        <svg
          ref={svgRef} width={SIZE} height={SIZE}
          className="rounded-lg cursor-crosshair block select-none touch-none max-w-full"
          style={{ background: 'radial-gradient(ellipse at center, #0f1e3a 0%, #060b18 100%)' }}
          onPointerMove={(e) => drag && setter[drag](coordsFromEvent(e))}
          onPointerUp={() => setDrag(null)}
          onPointerCancel={() => setDrag(null)}
        >
          {/* axes */}
          <line x1={SIZE / 2} y1={0} x2={SIZE / 2} y2={SIZE} stroke="#1e293b" strokeWidth={1} />
          <line x1={0} y1={SIZE / 2} x2={SIZE} y2={SIZE / 2} stroke="#1e293b" strokeWidth={1} />

          {/* direction rays from the origin — the data is compared by direction (angle),
              which is what the amplitude encoding + overlap actually measures */}
          {points.map(({ handle, p }) => {
            const b = toPx(p)
            return <line key={`ray-${handle}`} x1={SIZE / 2} y1={SIZE / 2} x2={b.x} y2={b.y} stroke={COLORS[handle]} strokeWidth={1} strokeOpacity={0.3} strokeDasharray="3 3" />
          })}

          {points.map(({ handle, p, label }) => {
            const { x, y } = toPx(p)
            const isTest = handle === 'test'
            return (
              <g key={handle} onPointerDown={(e) => { setDrag(handle); svgRef.current?.setPointerCapture(e.pointerId) }} className="cursor-grab">
                <circle cx={x} cy={y} r={14} fill={COLORS[handle]} opacity={0.12} />
                <circle cx={x} cy={y} r={isTest ? 7 : 8} fill={isTest ? COLORS.test : COLORS[handle]}
                  stroke={isTest ? predColor : '#fff'} strokeWidth={isTest ? 3 : 1.5} />
                <text x={x + 11} y={y - 9} fill={COLORS[handle]} fontSize={10} fontFamily="JetBrains Mono, monospace">{label}</text>
              </g>
            )
          })}
        </svg>
      </Panel>

      <Panel title="Interference read-out" subtitle="P(class | ancilla = 0)" className="w-full sm:flex-1 sm:min-w-[280px]">
        <div className="flex flex-col gap-4">
          {/* class probability bar */}
          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span style={{ color: COLORS.train0 }}>class 0 · {(result.pClass0 * 100).toFixed(0)}%</span>
              <span style={{ color: COLORS.train1 }}>class 1 · {(result.pClass1 * 100).toFixed(0)}%</span>
            </div>
            <div className="flex h-4 rounded-full overflow-hidden border border-q-border">
              <div style={{ width: `${result.pClass0 * 100}%`, background: COLORS.train0 }} className="transition-all duration-150" />
              <div style={{ width: `${result.pClass1 * 100}%`, background: COLORS.train1 }} className="transition-all duration-150" />
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <span className="text-q-faint">Prediction:</span>
            <span className="font-semibold px-2 py-0.5 rounded" style={{ color: predColor, border: `1px solid ${predColor}55` }}>
              class {result.prediction}
            </span>
          </div>

          <div className="rounded-lg border border-q-border bg-q-dim/40 p-3 text-xs text-q-faint leading-relaxed">
            <div className="flex justify-between font-mono">
              <span>similarity to class 0</span><span className="text-q-text">{result.overlap0.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-mono mt-1">
              <span>similarity to class 1</span><span className="text-q-text">{result.overlap1.toFixed(2)}</span>
            </div>
            <p className="mt-2">
              One Hadamard interferes the test point with each class anchor. The branch where they
              <em> add up</em> (constructive interference) survives the ancilla = 0 measurement — so the
              nearer anchor wins. This is a nearest-centroid classifier run by wave interference, never
              computing a distance explicitly.
            </p>
          </div>
        </div>
      </Panel>
    </div>
  )
}
