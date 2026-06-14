import { Definition, Equation, PaperRemark } from '../../components/TeachPrimitives'
import { CompareTable } from '../../components/TeachPanel'

export function U5L1() {
  return (
    <div className="flex flex-col gap-4 text-sm text-q-sub leading-relaxed">
      <p>
        So far the quantum computer ran a model we designed. A different philosophy is to use the quantum system as the model
        itself — <strong className="text-q-text">energy-based models</strong>, the quantum descendants of Hopfield nets and
        Boltzmann machines.
      </p>
      <Definition title="Quantum Ising / Boltzmann machine">
        Encode your problem so that low-energy configurations of a quantum Ising system correspond to good solutions or
        high-probability data. Training shapes the energy landscape; sampling the system's low-energy states gives you the
        model's outputs — a quantum Gibbs sampler.
      </Definition>
      <Equation
        math={`p(s) \\propto e^{-E(s)/T}, \\qquad E(s) = -\\sum_{ij} J_{ij}\\, s_i s_j - \\sum_i h_i s_i`}
        gloss={<>the same Boltzmann distribution you know from energy-based ML; the quantum version adds off-diagonal (transverse-field) terms and can sample it on annealing hardware.</>}
      />
      <p>
        This is the one corner of QML with real commercial hardware today (quantum annealers). The catch: it targets
        optimization/sampling problems, and a clean, general learning advantage over classical samplers remains unproven.
      </p>
      <CompareTable rows={[
        { classical: 'Hopfield / Boltzmann machine', quantum: 'quantum Ising / Boltzmann machine' },
        { classical: 'Gibbs sampling', quantum: 'quantum annealing / sampling' },
        { classical: 'energy minimization', quantum: 'relax to ground state' },
      ]} />
    </div>
  )
}

export function U5L2() {
  return (
    <div className="flex flex-col gap-4 text-sm text-q-sub leading-relaxed">
      <p>
        Let us tie the whole course together on one object. A variational classifier — the PQC from Unit 3 trained with the
        parameter-shift rule from Unit 4 — <strong className="text-q-text">is</strong> a neural network, just expressed in the
        language of unitaries and measurements.
      </p>
      <CompareTable rows={[
        { classical: 'embedding layer', quantum: 'data encoder U(x)' },
        { classical: 'linear layers', quantum: 'rotation gates V(θ)' },
        { classical: 'non-linearity', quantum: 'entangling gates' },
        { classical: 'output head + softmax', quantum: 'measurement ⟨O⟩' },
        { classical: 'backprop + Adam', quantum: 'parameter-shift + Adam' },
      ]} />
      <Definition title="What is genuinely different">
        Not the wrapper — the <em>hypothesis class</em>. The functions a unitary-plus-measurement model represents are
        Fourier-like in the data, with a structure set by the encoding. Whether that structure ever helps on a real task is the
        open empirical question the whole field is chasing.
      </Definition>
      <p className="text-q-faint text-xs">
        Revisit the PQC sandbox with this lens: it is a tiny neural net whose weights are angles and whose activations are entanglement.
      </p>
    </div>
  )
}

export function U5L3() {
  return (
    <div className="flex flex-col gap-4 text-sm text-q-sub leading-relaxed">
      <p>
        The lesson ML engineers care about most: could a quantum computer speed up the
        <strong className="text-q-text"> Transformer</strong>? In principle, yes — by attacking the attention bottleneck.
      </p>
      <Equation
        math={`\\text{Attention}(Q,K,V) = \\mathrm{softmax}\\!\\left(\\tfrac{QK^\\top}{\\sqrt{d}}\\right)V`}
        gloss={<>computing QKᵀ costs O(n²d) for sequence length n — the quadratic wall that makes long contexts expensive.</>}
      />
      <Definition title="QSVT — the key primitive">
        Quantum Singular Value Transformation applies a polynomial to the singular values of a matrix embedded in a circuit.
        It unifies HHL, amplitude amplification, and phase estimation — and lets the attention matrix-vector product run in
        roughly O(n√n) instead of O(n²).
      </Definition>
      <CompareTable rows={[
        { classical: 'self-attention O(n²d)', quantum: 'O(n√n · poly d) via QSVT' },
        { classical: 'quadratic in context length', quantum: 'sub-quadratic in context length' },
      ]} />
      <PaperRemark source="The catch (Du et al. 2025)">
        It needs FTQC hardware, a working QRAM to load tokens, and careful read-out so the speedup survives end-to-end — none
        available today. It is a proof of principle that the architecture behind LLMs has a quantum-friendly core, not a
        deployable system. Industry roadmaps place the required hardware in the 2030s+.
      </PaperRemark>
    </div>
  )
}

export function U5L4() {
  return (
    <div className="flex flex-col gap-4 text-sm text-q-sub leading-relaxed">
      <p>
        You now have the whole arc: encode data, do inference as geometry (kernels), build trainable models (QNNs), train them
        (parameter-shift, fighting barren plateaus), and glimpse the FTQC frontier (HHL, quantum transformer). Close with the
        questions that decide whether any of it matters.
      </p>
      <CompareTable rows={[
        { classical: 'sample complexity', quantum: 'can quantum learn from fewer examples?' },
        { classical: 'model / VC-style complexity', quantum: 'is the hypothesis class richer per parameter?' },
        { classical: 'computational complexity', quantum: 'is the model cheaper to run end-to-end?' },
      ]} />
      <Definition title="The three learnability dials (Du et al.)">
        Expressivity (what functions the model can represent), trainability (can you actually optimize it — barren plateaus),
        and generalization (train-vs-test gap). Pushing one often hurts another; the art of QML is balancing them for a task
        with the right structure.
      </Definition>
      <Equation
        math={`\\text{useful QML} \\;=\\; \\text{right task} \\;\\cap\\; \\text{trainable model} \\;\\cap\\; \\text{honest end-to-end cost}`}
        gloss={<>a method only pays off when all three hold at once — which is exactly why demonstrating real-world quantum advantage is still open.</>}
      />
      <PaperRemark source="Where to go next">
        Both source books have companion code (PennyLane / the qml-tutorial site). Re-run these widgets, then try the
        hands-on notebooks to build a variational classifier and watch a barren plateau appear for real.
      </PaperRemark>
    </div>
  )
}
