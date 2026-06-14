import { useState } from 'react'
import { MathLabel } from '../components/MathLabel'
import { Definition, PaperRemark, SelfCheck, PageRef } from '../components/TeachPrimitives'

// ─── Chapter panels ──────────────────────────────────────────────────────────

function ChapterOverview() {
  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-xl border border-q-border bg-q-card p-5">
        <div className="text-xs font-mono text-q-faint mb-3">arXiv:2502.01146 · Du et al. (Feb 2025) · 260 pages</div>
        <blockquote className="text-sm text-q-sub italic leading-relaxed border-l-2 border-indigo-500 pl-4">
          "QML explores learning algorithms that can be executed on quantum computers to accomplish specified tasks with <strong className="text-q-text not-italic">potential advantages</strong> over classical implementations."
        </blockquote>
        <div className="mt-3 text-xs text-q-faint">— Informal definition, Ch. 1.1, p. 3</div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-q-text mb-3">The 4 sectors of QML <PageRef pages="9–10" /></h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { sector: 'CC', label: 'Classical for Classical', desc: 'Traditional ML. Classical algorithms on classical data (GPT, ResNet). Not this tutorial.', color: 'border-q-border text-q-faint' },
            { sector: 'CQ', label: 'Classical for Quantum', desc: 'Classical algorithms to analyze quantum systems — e.g., ML to classify quantum states or predict quantum experiments.', color: 'border-q-border text-q-faint' },
            { sector: 'QC', label: 'Quantum for Classical', desc: 'Quantum algorithms processing classical data. The primary focus of this paper — quantum kernel machines and QNNs.', color: 'border-indigo-700/60 text-indigo-300 bg-indigo-950/30' },
            { sector: 'QQ', label: 'Quantum for Quantum', desc: 'Quantum algorithms processing quantum data — e.g., classifying quantum states, simulating quantum many-body systems.', color: 'border-indigo-700/40 text-indigo-200 bg-indigo-950/20' },
          ].map(({ sector, label, desc, color }) => (
            <div key={sector} className={`rounded-lg border p-3 ${color}`}>
              <div className="text-base font-mono font-bold mb-1">{sector}</div>
              <div className="text-xs font-semibold mb-1">{label}</div>
              <div className="text-xs text-q-faint leading-relaxed">{desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-q-text mb-3">NISQ vs FTQC <PageRef pages="12–15" /></h3>
        <div className="rounded-xl border border-q-border overflow-hidden">
          <div className="grid grid-cols-1 sm:grid-cols-2 bg-q-dim px-4 py-2 text-xs font-mono text-q-faint border-b border-q-border">
            <span>NISQ (now: 2020–2030)</span>
            <span>FTQC (future: 2030+)</span>
          </div>
          {[
            ['Noisy, error-prone qubits', 'Error-corrected logical qubits'],
            ['100s–1000s of physical qubits', 'Billions of physical qubits needed'],
            ['Limited coherence time', 'Arbitrary circuit depth possible'],
            ['QNNs (PQCs) + quantum kernels', 'HHL, QSVT, quantum transformer'],
            ['No overhead for error correction', 'Massive overhead (~1000× qubit overhead)'],
            ['Quantum utility possible now', 'True quantum advantage: factoring, QML speedups'],
          ].map(([nisq, ftqc], i) => (
            <div key={i} className="grid grid-cols-1 sm:grid-cols-2 px-4 py-2 border-t border-q-border/50 text-xs">
              <span className="text-amber-300/80">{nisq}</span>
              <span className="text-emerald-300/80">{ftqc}</span>
            </div>
          ))}
        </div>
        <PaperRemark>
          "John Preskill coined the term 'noisy intermediate-scale quantum' (NISQ) era (Preskill, 2018), which describes the current generation of quantum processors. These processors feature up to thousands of qubits, but their capabilities are restricted with error-prone gates and limited coherence times."
        </PaperRemark>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-q-text mb-3">Three learnability dimensions of QML models <PageRef pages="17–18" /></h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { name: 'Expressivity', icon: '📐', desc: 'How many distinct functions/unitaries a model can represent. Larger hypothesis space → more expressible. Closely related to the size of the unitary 2-design covered.' },
            { name: 'Trainability', icon: '🎚️', desc: 'Convergence behaviour during training. Central challenge: barren plateaus where gradients vanish exponentially with qubit count and circuit depth.' },
            { name: 'Generalization', icon: '🎯', desc: 'Gap between training and test error. Quantum kernels can achieve generalization advantage over classical models on certain quantum-generated datasets.' },
          ].map(({ name, icon, desc }) => (
            <div key={name} className="rounded-lg border border-q-border bg-q-card p-3">
              <div className="text-2xl mb-2">{icon}</div>
              <div className="text-sm font-semibold text-q-text mb-1">{name}</div>
              <div className="text-xs text-q-faint leading-relaxed">{desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-q-text mb-3">Tutorial structure</h3>
        <div className="flex flex-col gap-1.5">
          {[
            { ch: 'Ch. 2', title: 'Basics of Quantum Computing', pages: '21–65', desc: 'Qubits, density matrices, gates, circuits, read-in/read-out protocols, quantum linear algebra' },
            { ch: 'Ch. 3', title: 'Quantum Kernel Methods', pages: '67–111', desc: 'Classical SVM → quantum kernel → expressivity & generalization theory → MNIST demo' },
            { ch: 'Ch. 4', title: 'Quantum Neural Networks', pages: '113–177', desc: 'Classical MLP → FTQC perceptron (Grover) → NISQ PQCs → barren plateau theory' },
            { ch: 'Ch. 5', title: 'Quantum Transformer', pages: '179–203', desc: 'Classical attention → quantum self-attention via QSVT → O(n√n) vs O(n²) runtime' },
          ].map(({ ch, title, pages, desc }) => (
            <div key={ch} className="flex items-start gap-3 px-4 py-2.5 rounded-lg border border-q-border bg-q-card hover:border-q-border2 transition-colors">
              <span className="text-xs font-mono text-indigo-400 w-10 flex-shrink-0 pt-0.5">{ch}</span>
              <div>
                <div className="text-sm font-medium text-q-text">{title} <span className="text-xs font-mono text-q-faint ml-1">p. {pages}</span></div>
                <div className="text-xs text-q-faint mt-0.5">{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <SelfCheck questions={[
        "What is the informal definition of QML given in the paper? → 'QML explores learning algorithms that can be executed on quantum computers to accomplish specified tasks with potential advantages over classical implementations.' The three key elements are: quantum processors, specified tasks, and advantages.",
        "Which two QML sectors does this tutorial focus on, and why? → The QC sector (quantum algorithms for classical data) and QQ sector (quantum algorithms for quantum data). These are where quantum computers can offer computational advantages. The CC sector is just classical ML, and CQ uses classical ML to study quantum systems.",
        "What distinguishes NISQ from FTQC devices? → NISQ devices have noisy, error-prone qubits with limited coherence times. FTQC devices use quantum error correction codes and can run arbitrary-depth circuits, but require billions of physical qubits (far beyond current technology).",
      ]} />
    </div>
  )
}

function ChapterQuantumBasics() {
  return (
    <div className="flex flex-col gap-5">
      <Definition title="Qubit (Definition 2.1-style, p. 22)">
        A single-qubit state is a 2D complex unit vector:
        <div className="my-2 text-center"><MathLabel math={`|a\\rangle = a_1|0\\rangle + a_2|1\\rangle \\in \\mathbb{C}^2 \\quad \\text{s.t.} \\quad |a_1|^2 + |a_2|^2 = 1`} /></div>
        where <MathLabel math={`a_1, a_2`} /> are <strong className="text-q-text">probability amplitudes</strong>. Measuring gives |0⟩ with probability |a₁|² or |1⟩ with probability |a₂|². An N-qubit system is a <MathLabel math={`2^N`} />-dimensional complex vector — exponentially larger than N classical bits.
      </Definition>

      <div>
        <h3 className="text-sm font-semibold text-q-text mb-2">Classical bits vs qubits: the fundamental difference <PageRef pages="22–25" /></h3>
        <div className="rounded-xl border border-q-border overflow-hidden text-xs font-mono">
          <div className="grid grid-cols-1 sm:grid-cols-2 bg-q-dim px-4 py-2 text-q-faint border-b border-q-border">
            <span>Classical (N bits)</span><span>Quantum (N qubits)</span>
          </div>
          {[
            ['One of 2ᴺ bit-strings', '2ᴺ-dimensional complex vector'],
            ['Cartesian product rule', 'Tensor product rule (⊗)'],
            ['State fully readable', 'State collapses on measurement'],
            ['AND/OR/NOT gates (irreversible)', 'Unitary gates (reversible)'],
            ['Deterministic output', 'Probabilistic output (Born rule)'],
            ['Classical correlation', 'Quantum entanglement (non-local)'],
          ].map(([cl, qu], i) => (
            <div key={i} className="grid grid-cols-1 sm:grid-cols-2 px-4 py-2 border-t border-q-border/50">
              <span className="text-q-sub">{cl}</span><span className="text-indigo-300">{qu}</span>
            </div>
          ))}
        </div>
      </div>

      <Definition title="Entanglement (Definition 2.2, p. 25)">
        An N-qubit state |ψ⟩ is <strong className="text-q-text">entangled</strong> if it cannot be expressed as a tensor product of subsystem states:
        <div className="my-2 text-center"><MathLabel math={`|\\psi\\rangle \\neq |\\psi_a\\rangle \\otimes |\\psi_b\\rangle`} /></div>
        The four Bell states are maximally entangled 2-qubit states: <MathLabel math={`|\\Phi^+\\rangle = \\tfrac{1}{\\sqrt{2}}(|00\\rangle + |11\\rangle)`} />. The GHZ state generalises this to N qubits: <MathLabel math={`|GHZ_N\\rangle = \\tfrac{1}{\\sqrt{2}}(|0\\rangle^{\\otimes N} + |1\\rangle^{\\otimes N})`} />.
        <div className="mt-2 text-xs text-q-faint">Entanglement is an indispensable factor for quantum supremacy (Jozsa and Linden, 2003).</div>
      </Definition>

      <Definition title="Density matrix (§2.1.3, p. 26)">
        The density operator generalises the state vector to handle <strong className="text-q-text">mixed states</strong> (when qubits interact with the environment):
        <div className="my-2 text-center"><MathLabel math={`\\rho = \\sum_i p_i |\\psi_i\\rangle\\langle\\psi_i|, \\quad p_i \\geq 0,\\; \\sum_i p_i = 1`} /></div>
        <strong className="text-q-text">Pure state:</strong> Tr(ρ²) = 1 &nbsp;|&nbsp; <strong className="text-q-text">Mixed state:</strong> Tr(ρ²) &lt; 1. The mixed state arises naturally when tracing out entangled qubits — this is why entangled Bloch spheres go fuzzy (purity drops below 1).
      </Definition>

      <div>
        <h3 className="text-sm font-semibold text-q-text mb-2">Quantum gates: the computational toolkit <PageRef pages="30–41" /></h3>
        <p className="text-sm text-q-sub mb-3">Any single-qubit unitary can be decomposed as U = RZ(α)RY(β)RZ(γ) (Theorem 4.1 in Nielsen & Chuang). Under the density operator representation, a gate acts as <MathLabel math={`\\hat{\\rho} = U\\rho U^\\dagger`} />.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-lg border border-q-border bg-q-card p-3">
            <div className="text-xs font-semibold text-q-text mb-2">Read-in protocols (§2.3.1)</div>
            <div className="flex flex-col gap-1.5 text-xs">
              {[
                { name: 'Basis encoding', desc: 'Binary number → computational basis state |x⟩. Simple but uses n qubits for n bits.' },
                { name: 'Angle embedding', desc: 'Feature xᵢ → rotation angle in RY(xᵢ). One qubit per feature.' },
                { name: 'Amplitude embedding', desc: 'Normalised vector of 2ⁿ features → amplitudes of n qubits. Exponential compression but hard to prepare on hardware.' },
              ].map(({ name, desc }) => (
                <div key={name} className="flex flex-col gap-0.5">
                  <span className="text-indigo-300 font-mono">{name}</span>
                  <span className="text-q-faint">{desc}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-q-border bg-q-card p-3">
            <div className="text-xs font-semibold text-q-text mb-2">Read-out protocols (§2.3.2)</div>
            <div className="flex flex-col gap-1.5 text-xs">
              {[
                { name: 'Expectation value', desc: '⟨O⟩ = Tr(Oρ). Most common output. Requires many shots to estimate.' },
                { name: 'Sampling', desc: 'Measure in computational basis, collect bit-string counts.' },
                { name: 'State tomography', desc: 'Reconstruct the full density matrix. Requires O(4ⁿ) measurements — exponential cost.' },
                { name: 'Shadow tomography', desc: 'Efficient approximation: estimate k observables using O(log k) measurements.' },
              ].map(({ name, desc }) => (
                <div key={name} className="flex flex-col gap-0.5">
                  <span className="text-indigo-300 font-mono">{name}</span>
                  <span className="text-q-faint">{desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <SelfCheck questions={[
        "Why does an N-qubit system have 2ᴺ degrees of freedom instead of N? → Because qubits obey the tensor product rule rather than the Cartesian product. N qubits form a 2ᴺ-dimensional complex Hilbert space. This exponential scaling is the source of potential quantum advantage — a 50-qubit system has ~10¹⁵ amplitudes.",
        "What is the physical meaning of Tr(ρ²) < 1? → It means the qubit is in a mixed state — a statistical mixture of pure states, not a coherent superposition. This arises when a qubit is entangled with other qubits (partial trace) or when it has interacted with the environment (decoherence). The Bloch sphere arrow shrinks inside the sphere.",
        "What is the read-in/read-out bottleneck mentioned in the paper? → Preparing a quantum state from classical data (read-in) and extracting a classical answer from a quantum state (read-out) can both be exponentially expensive. The HHL algorithm's claimed exponential speedup collapses if you need to read out the full solution vector — extracting one entry costs O(√N) (Aaronson, 2015).",
      ]} />
    </div>
  )
}

function ChapterKernels() {
  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-q-sub leading-relaxed">
        Chapter 3 follows the pattern: <em>classical kernel machines → quantum feature maps → quantum kernels → theoretical analysis</em>. This is the QML approach that is most naturally motivated from classical SVM theory.
      </p>

      <Definition title="Classical kernel (§3.1, p. 68)">
        A kernel function k(x, x') measures <strong className="text-q-text">similarity</strong> between data points via an implicit feature map φ: k(x, x') = ⟨φ(x), φ(x')⟩. The kernel trick allows SVMs to operate in exponentially high-dimensional feature spaces without computing φ explicitly — only pairwise similarities are needed.
      </Definition>

      <Definition title="Quantum kernel (§3.2.2, p. 77)">
        Map classical data x into a quantum state via a <strong className="text-q-text">quantum feature map</strong> circuit U(x):
        <div className="my-2 text-center"><MathLabel math={`\\phi(x) = U(x)|0\\rangle^{\\otimes n}`} /></div>
        The quantum kernel is then the inner product in Hilbert space:
        <div className="my-2 text-center"><MathLabel math={`k(x, x') = |\\langle 0|U(x')^\\dagger U(x)|0\\rangle|^2`} /></div>
        This is estimated by preparing U(x)|0⟩ and U(x')|0⟩ on a quantum computer and measuring overlap — something that can be exponentially hard classically if U is a deep random circuit.
      </Definition>

      <div>
        <h3 className="text-sm font-semibold text-q-text mb-2">Classical SVM → Quantum kernel SVM <PageRef pages="76–84" /></h3>
        <div className="rounded-xl border border-q-border overflow-hidden text-xs font-mono">
          <div className="grid grid-cols-1 sm:grid-cols-2 bg-q-dim px-4 py-2 text-q-faint border-b border-q-border">
            <span>Classical kernel SVM</span><span>Quantum kernel SVM</span>
          </div>
          {[
            ['Feature map φ(x) ∈ ℝᵈ', 'Quantum feature map U(x)|0⟩ ∈ ℂ²ⁿ'],
            ['Kernel k(x,x\') = φ(x)ᵀφ(x\')', 'k(x,x\') = |⟨0|U†(x\')U(x)|0⟩|²'],
            ['Explicit or implicit φ', 'φ always implicit (too large to store)'],
            ['RBF / polynomial kernels', 'IQP circuits, random circuits'],
            ['Dual SVM: max Σαᵢ - ½ΣΣαᵢαⱼyᵢyⱼk', 'Same dual formulation, quantum kernel matrix'],
          ].map(([cl, qu], i) => (
            <div key={i} className="grid grid-cols-1 sm:grid-cols-2 px-4 py-2 border-t border-q-border/50">
              <span className="text-q-sub">{cl}</span><span className="text-indigo-300">{qu}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-q-text mb-2">Theoretical foundations <PageRef pages="86–97" /></h3>
        <div className="grid grid-cols-1 gap-3">
          <div className="rounded-lg border border-q-border bg-q-card p-3 text-sm text-q-sub">
            <div className="text-xs font-semibold text-indigo-300 mb-1">Expressivity (RKHS)</div>
            The <strong className="text-q-text">reproducing kernel Hilbert space (RKHS)</strong> of a quantum kernel captures what functions can be learned. Schuld (2021) proved quantum kernels satisfy a universality approximation theorem — they can approximate a wide class of functions. However, universal quantum kernels may be computationally expensive to construct.
          </div>
          <div className="rounded-lg border border-rose-900/40 bg-rose-950/20 p-3 text-sm text-q-sub">
            <div className="text-xs font-semibold text-rose-300 mb-1">⚠ Critical problem: Exponential kernel concentration</div>
            Thanasilp et al. (2022) identified that quantum kernels suffer from <strong className="text-q-text">vanishing similarity</strong> — in high-dimensional feature spaces, quantum feature maps tend to be "far" from each other, making k(x, x') ≈ 0 for almost all pairs. Four contributing factors: high expressivity of embeddings, global measurements, entanglement, and noise. This leads to poor generalisation.
          </div>
          <div className="rounded-lg border border-emerald-900/40 bg-emerald-950/20 p-3 text-sm text-q-sub">
            <div className="text-xs font-semibold text-emerald-300 mb-1">Generalization advantage</div>
            Huang et al. (2021) showed that for <em>quantum-generated data</em>, quantum kernels can achieve a generalization advantage over all classical learning models. Liu et al. (2021) showed quantum kernels can efficiently solve the discrete logarithm problem (classically hard). However, these advantages are on artificial tasks — demonstrating advantage on real-world problems remains an open challenge.
          </div>
        </div>
      </div>

      <PaperRemark>
        "Despite these promising results, Kübler et al. (2021) argued that quantum kernels, lacking inductive bias, often fail to outperform classical models in practical scenarios. This underscores the importance of carefully designing embeddings and aligning kernels to achieve meaningful and practical quantum advantages." (p. 109)
      </PaperRemark>

      <SelfCheck questions={[
        "What is the kernel trick and why does it matter for quantum computing? → The kernel trick avoids explicitly computing high-dimensional feature maps — only pairwise similarities k(x,x') are needed. For quantum kernels, the feature space is 2ⁿ-dimensional (exponentially large), so the trick is essential: you never compute the full quantum state representation, just the overlap between two circuit outputs.",
        "What is the exponential kernel concentration problem? → As circuits become more expressive, quantum feature maps become nearly orthogonal to each other, making k(x,x') ≈ 1/2ⁿ for most pairs. This means the kernel matrix is nearly proportional to the identity — useless for classification. It is the kernel analogue of the barren plateau.",
        "Under what conditions can quantum kernels provably outperform classical models? → On quantum-generated data (Liu et al., 2021), or on problems like the discrete logarithm that are classically hard. For classical i.i.d. data from typical real-world distributions, no proven advantage exists and quantum kernels often underperform.",
      ]} />
    </div>
  )
}

function ChapterQNN() {
  return (
    <div className="flex flex-col gap-5">
      <Definition title="Quantum neural network — informal (§1.2.3, p. 15)">
        "A quantum neural network (QNN) is a <strong className="text-q-text">hybrid model</strong> that leverages quantum computers to implement trainable models similar to classical neural networks, while using <strong className="text-q-text">classical optimizers</strong> to complete the training process."
      </Definition>

      <div>
        <h3 className="text-sm font-semibold text-q-text mb-2">Classical MLP → Near-term QNN (PQC) <PageRef pages="128–140" /></h3>
        <div className="rounded-xl border border-q-border overflow-hidden text-xs font-mono">
          <div className="grid grid-cols-1 sm:grid-cols-2 bg-q-dim px-4 py-2 text-q-faint border-b border-q-border">
            <span>Classical MLP (§4.1.2)</span><span>Near-term QNN / PQC (§4.3)</span>
          </div>
          {[
            ['Input layer: x ∈ ℝᵈ', 'Data encoder: U(x)|0⟩ ∈ ℂ²ⁿ'],
            ['Hidden layers: σ(Wᵢx + bᵢ)', 'Trainable ansatz: V(θ) = ∏ᵢ Uᵢ(θᵢ)'],
            ['Non-linearity: ReLU, sigmoid', 'Non-linearity: entanglement via CNOT'],
            ['Output: softmax(Wx)', 'Output: ⟨ψ(x,θ)|O|ψ(x,θ)⟩ (expectation)'],
            ['Loss: cross-entropy, MSE', 'Loss: same classical objectives'],
            ['Gradient: backprop (chain rule)', 'Gradient: parameter-shift rule'],
          ].map(([cl, qu], i) => (
            <div key={i} className="grid grid-cols-1 sm:grid-cols-2 px-4 py-2 border-t border-q-border/50">
              <span className="text-q-sub">{cl}</span><span className="text-indigo-300">{qu}</span>
            </div>
          ))}
        </div>
      </div>

      <Definition title="Near-term QNN general framework (§4.3.1, p. 129)">
        A QNN processes an input x ∈ ℝᵈ through three stages:
        <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
          <li><strong className="text-q-text">Data encoder</strong> U(x): Embeds classical input into quantum state via angle or amplitude embedding.</li>
          <li><strong className="text-q-text">Trainable ansatz</strong> V(θ): A PQC with learnable rotation parameters θ. Often uses alternating rotation layers and CNOT entanglers (hardware-efficient ansatz).</li>
          <li><strong className="text-q-text">Measurement</strong>: Expectation value <MathLabel math={`f(x,\\theta) = \\langle 0|U(x)^\\dagger V(\\theta)^\\dagger O\\, V(\\theta)U(x)|0\\rangle`} /></li>
        </ol>
        <div className="mt-2 text-xs text-q-faint">Optimization: classical optimizer updates θ using parameter-shift gradients. Supports discriminative (classification) and generative (quantum GANs) tasks.</div>
      </Definition>

      <div>
        <h3 className="text-sm font-semibold text-q-text mb-2">Fault-tolerant path: Grover search → quantum perceptron <PageRef pages="122–128" /></h3>
        <div className="rounded-lg border border-q-border bg-q-card p-4 text-sm text-q-sub">
          <p><strong className="text-q-text">Grover's algorithm</strong> (1996) solves unstructured search in <MathLabel math={`O(\\sqrt{d})`} /> queries vs classical <MathLabel math={`O(d)`} />. Kapoor et al. (2016) used this to build a fault-tolerant quantum perceptron with a <strong className="text-q-text">quadratic speedup</strong> in query complexity during training.</p>
          <p className="mt-2">Key insight: the perceptron training algorithm can be framed as a search for the misclassified example — exactly the unstructured search Grover solves. This reduces training from O(1/γ²) to O(1/γ) mistakes where γ is the margin.</p>
          <p className="mt-2 text-xs text-q-faint">Requires FTQC. Not usable today, but shows quantum advantage is achievable in principle for learning algorithms.</p>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-q-text mb-3">Theoretical foundations of QNNs <PageRef pages="140–154" /></h3>
        <div className="flex flex-col gap-3">
          <div className="rounded-lg border border-q-border bg-q-card p-3">
            <div className="text-xs font-semibold text-indigo-300 mb-1">Expressivity (§4.4.1)</div>
            <p className="text-xs text-q-sub">QNNs are expressive if they can approximate arbitrary unitaries — the quantum universal approximation theorem (Universality). The expressivity depends on the ansatz structure, depth, and connectivity. However, <em>high expressivity correlates with barren plateaus</em> — a fundamental tension.</p>
          </div>
          <div className="rounded-lg border border-rose-900/40 bg-rose-950/20 p-3">
            <div className="text-xs font-semibold text-rose-300 mb-1">Trainability: the barren plateau theorem (§4.4.2)</div>
            <p className="text-xs text-q-sub mb-2">For a random ansatz over n qubits with L layers, the variance of any gradient element satisfies:</p>
            <div className="text-center my-2"><MathLabel math={`\\text{Var}\\left[\\frac{\\partial \\mathcal{L}}{\\partial \\theta_k}\\right] \\in \\mathcal{O}\\left(\\frac{1}{2^n}\\right)`} /></div>
            <p className="text-xs text-q-sub">This is <strong className="text-q-text">exponentially worse</strong> than classical vanishing gradients (polynomial decay). The root cause: random quantum circuits form unitary t-designs — they cover the unitary group uniformly, leaving no gradient signal.</p>
          </div>
          <div className="rounded-lg border border-emerald-900/40 bg-emerald-950/20 p-3">
            <div className="text-xs font-semibold text-emerald-300 mb-1">Generalization (§4.4.1)</div>
            <p className="text-xs text-q-sub">QNNs generalize in the PAC learning framework. The generalization error depends on the number of training samples, the expressivity of the circuit, and measurement noise. For certain tasks with quantum data, QNNs provably generalize better than classical models.</p>
          </div>
        </div>
      </div>

      <SelfCheck questions={[
        "What is the structural difference between a classical MLP forward pass and a QNN forward pass? → In an MLP, each layer is σ(Wx+b) — a matrix multiply followed by a non-linear activation. In a QNN, the data is first embedded into a quantum state via U(x)|0⟩, then processed through a parameterized unitary V(θ), and finally measured as an expectation value ⟨O⟩. The non-linearity comes from entanglement (CNOT gates) rather than ReLU.",
        "How does Grover search enable a quantum perceptron? What is the speedup? → The perceptron training algorithm searches for a misclassified example to update on. Grover search finds one target in an unsorted database in O(√d) instead of O(d) queries. This reduces the perceptron's training complexity from O(1/γ²) to O(1/γ) mistakes — a quadratic speedup in query complexity. Requires a fault-tolerant quantum computer.",
        "Why is the barren plateau exponentially worse than classical vanishing gradients? → In classical deep networks, gradients vanish polynomially with depth (e.g., sigmoid gates squash gradients by ~0.25 per layer). In quantum circuits, random ansatze form unitary 2-designs that cover the full unitary group uniformly. The gradient variance then scales as O(2⁻ⁿ) — exponential in the number of qubits, not just depth. Adding one qubit halves the gradient signal.",
      ]} />
    </div>
  )
}

function ChapterTransformer() {
  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-q-sub leading-relaxed">
        Chapter 5 is the most directly relevant for ML engineers. It shows exactly how a quantum computer could speed up the Transformer — the architecture behind GPT, BERT, and almost all modern LLMs.
      </p>

      <div>
        <h3 className="text-sm font-semibold text-q-text mb-2">Classical Transformer bottleneck <PageRef pages="180–185" /></h3>
        <div className="rounded-lg border border-q-border bg-q-card p-4 text-sm text-q-sub">
          <p>For a sequence of n tokens with embedding dimension d, the dominant cost is <strong className="text-q-text">self-attention</strong>:</p>
          <div className="my-3 text-center"><MathLabel math={`\\text{Attention}(Q,K,V) = \\text{softmax}\\left(\\frac{QK^\\top}{\\sqrt{d}}\\right)V`} /></div>
          <p>Computing QKᵀ costs <strong className="text-q-text">O(n²d)</strong> — quadratic in sequence length. For n = 100k tokens (long documents), this is the primary memory and compute bottleneck.</p>
        </div>
      </div>

      <Definition title="Quantum Singular Value Transformation — QSVT (§2.4.3, p. 56)">
        QSVT (Gilyén et al., 2019) enables polynomial transformations of singular values of any matrix A embedded in a unitary circuit (<em>block encoding</em>). It unifies many quantum algorithms — HHL, amplitude amplification, quantum phase estimation — into one framework.
        <div className="mt-2 text-xs text-q-faint">Applying QSVT to the attention matrix enables the quadratic speedup: the O(n²) matrix-vector product becomes O(n√n) on a quantum computer.</div>
      </Definition>

      <div>
        <h3 className="text-sm font-semibold text-q-text mb-2">Fault-tolerant Quantum Transformer <PageRef pages="186–201" /></h3>
        <div className="rounded-xl border border-q-border overflow-hidden text-xs font-mono">
          <div className="grid grid-cols-1 sm:grid-cols-3 bg-q-dim px-4 py-2 text-q-faint border-b border-q-border">
            <span>Component</span><span>Classical cost</span><span>Quantum cost</span>
          </div>
          {[
            ['Self-attention QKᵀV', 'O(n²d)', 'O(n√n · poly(d)) via QSVT'],
            ['Layer normalization', 'O(nd)', 'O(n√d) via block encoding'],
            ['Residual connection', 'O(nd)', 'O(n√d)'],
            ['Feed-forward layer', 'O(nd²)', 'O(n√d · poly(d))'],
            ['Overall inference', 'O(n²d)', 'O(n√n · poly(d)) ✓'],
          ].map(([comp, cl, qu], i) => (
            <div key={i} className="grid grid-cols-1 sm:grid-cols-3 px-4 py-2 border-t border-q-border/50">
              <span className="text-q-sub">{comp}</span>
              <span className="text-rose-300">{cl}</span>
              <span className="text-emerald-300">{qu}</span>
            </div>
          ))}
        </div>
        <div className="mt-2 text-xs text-q-faint font-mono">Speedup is quadratic: O(n²) → O(n√n). For n=1M tokens: 10¹² → 10⁹ operations.</div>
      </div>

      <div className="rounded-lg border border-rose-900/40 bg-rose-950/20 p-4">
        <div className="text-xs font-semibold text-rose-300 mb-2">⚠ Critical caveats (§5.3)</div>
        <div className="flex flex-col gap-2 text-sm text-q-sub">
          <p><strong className="text-q-text">1. Requires FTQC:</strong> The quantum transformer needs error-corrected quantum computers with billions of physical qubits. Not available today, not in the NISQ era.</p>
          <p><strong className="text-q-text">2. Requires QRAM:</strong> Quantum random access memory to load classical data into superposition. No physical QRAM implementation exists at scale.</p>
          <p><strong className="text-q-text">3. Read-out cost:</strong> The output is a quantum state. Extracting one token embedding costs O(√n) — this must be amortized carefully for the speedup to hold end-to-end.</p>
          <p><strong className="text-q-text">4. Poly(d) factors:</strong> The "poly(d)" hides constants. For large d (e.g., d=4096 in GPT-3), these constants may dominate in practice.</p>
        </div>
      </div>

      <PaperRemark>
        "The quantum transformer demonstrates that, in principle, quantum computing can offer quadratic speedups for core LLM operations. Whether this translates to practical advantage depends on the development of fault-tolerant hardware — a milestone that industry roadmaps place at 2030–2040." (p. 198–199, paraphrased)
      </PaperRemark>

      <SelfCheck questions={[
        "What is the computational bottleneck in classical transformers and how does the quantum approach address it? → The bottleneck is self-attention: computing QKᵀ costs O(n²d) for sequence length n and dimension d. The quantum approach uses QSVT (Quantum Singular Value Transformation) to implement the attention matrix-vector product in O(n√n · poly(d)) — a quadratic speedup in n. This makes 1M-token context windows more tractable in principle.",
        "What is QSVT and why is it central to quantum ML beyond just the transformer? → Quantum Singular Value Transformation (Gilyén et al. 2019) enables polynomial functions of singular values of a matrix encoded in a unitary. It unifies HHL (linear systems), amplitude amplification, quantum simulation, and quantum ML speedups. It is the core primitive behind most FTQC-era QML algorithms.",
        "Why can't we use the quantum transformer today, even if we had better hardware? → Three reasons: (1) It requires FTQC — fault-tolerant error-corrected quantum computers needing billions of physical qubits, far beyond 2025 hardware. (2) It requires QRAM to load classical data at quantum speed, which doesn't exist at scale. (3) The read-out cost means you can't easily extract the full output — it must be carefully structured to maintain the speedup advantage.",
      ]} />
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

const TABS = [
  { id: 'overview', label: 'Overview', short: 'Overview' },
  { id: 'ch2', label: 'Ch. 2 — Quantum Basics', short: 'Ch.2' },
  { id: 'ch3', label: 'Ch. 3 — Quantum Kernels', short: 'Ch.3' },
  { id: 'ch4', label: 'Ch. 4 — Quantum NNs', short: 'Ch.4' },
  { id: 'ch5', label: 'Ch. 5 — Quantum Transformer', short: 'Ch.5' },
]

export function StudyGuide() {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="flex flex-col gap-5 animate-slide-up max-w-4xl">
      {/* Header */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-sm font-bold">📖</div>
          <h2 className="text-xl font-semibold text-white">Study Guide</h2>
        </div>
        <p className="text-sm text-q-sub max-w-2xl leading-relaxed ml-0 sm:ml-10">
          Structured notes from <em>Quantum Machine Learning: A Hands-on Tutorial for ML Practitioners and Researchers</em> (Du et al., arXiv:2502.01146, Feb 2025). Each section links concepts back to the interactive modules in this app.
        </p>
        <div className="ml-0 sm:ml-10 flex items-center gap-2 mt-1">
          <a
            href="https://arxiv.org/abs/2502.01146"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-mono text-indigo-400 hover:text-indigo-300 underline underline-offset-2 transition-colors"
          >
            arxiv.org/abs/2502.01146
          </a>
          <span className="text-q-faint text-xs">·</span>
          <span className="text-xs font-mono text-q-faint">260 pages · companion code at qml-tutorial.github.io</span>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 flex-wrap border-b border-q-border pb-0">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-2 text-xs font-mono rounded-t-lg transition-all border-b-2 -mb-px ${
              activeTab === tab.id
                ? 'border-amber-500 text-amber-300 bg-amber-950/30'
                : 'border-transparent text-q-faint hover:text-q-sub hover:bg-q-dim'
            }`}
          >
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.short}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {activeTab === 'overview' && <ChapterOverview />}
        {activeTab === 'ch2' && <ChapterQuantumBasics />}
        {activeTab === 'ch3' && <ChapterKernels />}
        {activeTab === 'ch4' && <ChapterQNN />}
        {activeTab === 'ch5' && <ChapterTransformer />}
      </div>
    </div>
  )
}
