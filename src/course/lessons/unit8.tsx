import { Definition, Equation, PaperRemark } from '../../components/TeachPrimitives'
import { CompareTable } from '../../components/TeachPanel'

export function U8L1() {
  return (
    <div className="flex flex-col gap-4 text-sm text-q-sub leading-relaxed">
      <p>
        No real application is "run it on a quantum computer." It is a classical program that offloads one small, hard
        kernel to a QPU — exactly how a GPU is used. The art is deciding <strong className="text-q-text">what runs where</strong>.
      </p>
      <Definition title="The QPU is a coprocessor">
        CPU/GPU: data loading, the optimizer, error mitigation, recombination, the UI — everything cheap-but-bulky. QPU: the
        narrow sub-routine that is hard classically (state preparation, the variational forward pass, a cut-out circuit
        fragment). The orchestration logic — scheduling, batching, fallbacks — lives in classical code.
      </Definition>
      <Equation
        math={`\\text{problem} = \\underbrace{\\text{prep + optimize + stitch}}_{\\text{CPU/GPU}} \\;+\\; \\underbrace{\\text{hard kernel}}_{\\text{QPU}}`}
        gloss={<>the same hybrid loop as variational training, generalized: keep the QPU's job small and let classical hardware carry the rest.</>}
      />
      <p>
        The hard design questions are exactly the seams: <em>where</em> do you split the problem, and <em>when</em> does the
        classical part hand off to quantum and take back over? Every problem cuts differently, and getting the boundary right
        is most of the engineering.
      </p>
      <CompareTable rows={[
        { classical: 'CPU + GPU offload', quantum: 'CPU + QPU coprocessor' },
        { classical: 'kernel launch', quantum: 'circuit job submission' },
        { classical: 'host orchestrates', quantum: 'classical code orchestrates' },
      ]} />
    </div>
  )
}

export function U8L2() {
  return (
    <div className="flex flex-col gap-4 text-sm text-q-sub leading-relaxed">
      <p>
        Quantum hardware is changing monthly and no single device is best at everything. So applied platforms build a
        <strong className="text-q-text"> hardware-agnostic layer</strong> — a "quantum operating system" — that compiles one
        program to whatever backend fits.
      </p>
      <Definition title="Write once, target many">
        You express the circuit or QUBO once; a backend selector routes it to the right device — a GPU/FPGA simulator, a
        superconducting QPU, an annealer — based on size, connectivity, queue, and cost. It is a compiler choosing a target,
        applied to quantum hardware.
      </Definition>
      <Definition title="The self-improving agent loop">
        Wrap the coprocessor in a controller that runs a job, reads back the result and its quality/cost, then adjusts —
        parameters, backend choice, mitigation strategy, even reformulating the problem — and reruns. Over many jobs it
        learns which device and settings suit which problem, and can use idle time to pre-explore.
      </Definition>
      <Equation
        math={`\\text{run} \\to \\text{measure cost} \\to \\text{adapt (params · backend · mitigation)} \\to \\text{run}`}
        gloss={<>a feedback loop around the QPU — the same closed-loop idea as an AutoML / agentic system, but choosing quantum resources.</>}
      />
      <CompareTable rows={[
        { classical: 'compiler target selection', quantum: 'backend-agnostic routing' },
        { classical: 'AutoML / agent loop', quantum: 'self-improving job controller' },
        { classical: 'fallback to CPU', quantum: 'fallback to simulator' },
      ]} />
      <PaperRemark source="Why agnostic matters commercially">
        Customers also demand sovereignty and continuity — if one cloud or vendor disappears, the workload must move. A
        portable layer over many backends is as much a business requirement as a technical one.
      </PaperRemark>
    </div>
  )
}

export function U8L3() {
  return (
    <div className="flex flex-col gap-4 text-sm text-q-sub leading-relaxed">
      <p>
        Finally, the landscape the orchestrator chooses from. There is no one "quantum computer" — there are several
        modalities with very different strengths, plus classical simulators that are often the right answer.
      </p>
      <CompareTable rows={[
        { classical: 'general-purpose CPU', quantum: 'gate model (e.g. superconducting / IQM)' },
        { classical: 'special-purpose ASIC', quantum: 'annealer (e.g. D-Wave)' },
        { classical: 'GPU/FPGA accelerator', quantum: 'statevector simulator (≲30 qubits)' },
      ]} />
      <Definition title="Gate model vs annealer">
        <strong className="text-q-text">Gate model</strong> (superconducting, trapped-ion, photonic): universal — runs QAOA,
        QNNs, any circuit. <strong className="text-q-text">Annealer</strong>: special-purpose Ising minimizer with many more
        qubits but only solves optimization/sampling. You pick the modality by the problem.
      </Definition>
      <Definition title="When to just simulate">
        Below ~30 qubits an exact statevector simulator on a GPU/FPGA is faster, noise-free, and has no queue — it is the
        right backend for development and small instances. (It is exactly what every widget in this course runs on.) Real
        hardware adds queue latency and per-shot cost, which a good orchestrator hides by batching and falling back to sims.
      </Definition>
      <Equation
        math={`\\text{pick backend} = f(\\text{qubits},\\ \\text{depth},\\ \\text{connectivity},\\ \\text{queue},\\ \\text{cost})`}
        gloss={<>the same kind of cost/latency/throughput tradeoff you already make choosing CPU vs GPU vs TPU — now with simulators, gate QPUs, and annealers as the options.</>}
      />
    </div>
  )
}
