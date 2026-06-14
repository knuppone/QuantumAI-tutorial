import type { Unit, Lesson } from './types'

// Existing interactive modules (reused as embedded lesson steps)
import { EmbeddingDock } from '../modules/EmbeddingDock'
import { PQCSandbox } from '../modules/PQCSandbox'
import { EntanglementView } from '../modules/EntanglementView'
import { MeasurementReactor } from '../modules/MeasurementReactor'
import { ParameterShiftView } from '../modules/ParameterShiftView'
import { BarrenPlateauSim } from '../modules/BarrenPlateauSim'

// New widgets
import { EncodingExplorer } from '../components/widgets/EncodingExplorer'
import { InterferenceClassifier } from '../components/widgets/InterferenceClassifier'
import { KernelVisualizer } from '../components/widgets/KernelVisualizer'
import { CompressionExplorer } from '../components/widgets/CompressionExplorer'
import { OptimizationPlayground } from '../components/widgets/OptimizationPlayground'
import { NoiseLab } from '../components/widgets/NoiseLab'

// Lesson content
import { U0L1, U0L2 } from './lessons/unit0'
import { U1L1, U1L2, U1L3 } from './lessons/unit1'
import { U2L1, U2L2, U2L3, U2L4 } from './lessons/unit2'
import { U3L1, U3L2, U3L3, U3L4 } from './lessons/unit3'
import { U4L1, U4L2, U4L3, U4L4 } from './lessons/unit4'
import { U5L1, U5L2, U5L3, U5L4 } from './lessons/unit5'
import { U6L1, U6L2, U6L3 } from './lessons/unit6'
import { U7L1, U7L2, U7L3, U7L4 } from './lessons/unit7'
import { U8L1, U8L2, U8L3 } from './lessons/unit8'

export const UNITS: Unit[] = [
  {
    id: 'u0', num: '00', title: 'Why Quantum for ML?', subtitle: 'Orientation',
    color: 'from-slate-600 to-indigo-600',
    lessons: [
      {
        id: 'u0-l1', title: 'The map: classical ML → QML', subtitle: 'swap the implementation, keep the pipeline',
        classicalAnalogy: 'the same ML pipeline', Content: U0L1,
        bookRefs: [{ book: 'A', where: 'Ch.1' }, { book: 'B', where: 'Ch.1' }],
        selfChecks: [
          'What are the three ingredients of QML? → A quantum processor, a learning task, and a potential advantage over the classical version.',
          'Which of the four sectors (CC/CQ/QC/QQ) is this course about? → Mainly QC (quantum algorithms on classical data) and QQ (quantum algorithms on quantum data). CC is ordinary ML; CQ uses classical ML to study quantum systems.',
          'NISQ vs FTQC in one line each? → NISQ: today\'s noisy, shallow, ~hundreds-of-qubits machines. FTQC: future error-corrected machines with deep circuits, where the big asymptotic speedups live.',
        ],
      },
      {
        id: 'u0-l2', title: 'The honest caveat', subtitle: 'advantage vs hype',
        classicalAnalogy: 'no free lunch', Content: U0L2,
        bookRefs: [{ book: 'A', where: 'Ch.4' }],
        selfChecks: [
          'Name the three axes of "quantum advantage". → Computational complexity (fewer ops), sample complexity (fewer examples), and model complexity (richer hypothesis class).',
          'On what data do quantum models have proven advantages? → Mostly artificial, quantum-structured datasets (e.g. built from discrete-log). For generic real-world i.i.d. data, no advantage is proven.',
          'What single question should you ask of every claimed speedup? → "Advantage on which task, under which hardware assumptions, paying which read-in/read-out cost?"',
        ],
      },
    ],
  },
  {
    id: 'u1', num: '01', title: 'Loading Data into Qubits', subtitle: 'Encoding',
    color: 'from-indigo-600 to-violet-600',
    lessons: [
      {
        id: 'u1-l1', title: 'What is a qubit (for ML people)', subtitle: 'a normalized 2-vector',
        classicalAnalogy: 'a unit vector', Content: U1L1, interactive: EmbeddingDock,
        interactiveLabel: 'Drag the data point — the Bloch arrow is this 2-vector, live', playgroundId: 'embedding',
        bookRefs: [{ book: 'A', where: 'Ch.3' }, { book: 'B', where: 'Ch.2' }],
        selfChecks: [
          'Why does an n-qubit system have 2ⁿ amplitudes, not 2n? → Qubits combine by the tensor product, not the Cartesian product, so the joint state lives in a 2ⁿ-dimensional space.',
          'What is the Born rule? → Measuring collapses the state to one basis outcome; you get outcome i with probability |amplitudeᵢ|².',
          'Is the Bloch sphere anything mystical? → No — it is just a picture of a single qubit\'s normalized 2D complex vector on a unit sphere.',
        ],
      },
      {
        id: 'u1-l2', title: 'The encoding taxonomy', subtitle: 'basis · angle · amplitude · qsample',
        classicalAnalogy: 'tokenization schemes', Content: U1L2, interactive: EncodingExplorer,
        interactiveLabel: 'Toggle encodings — see the same data map to qubits four different ways',
        bookRefs: [{ book: 'A', where: 'Ch.3.4 / Ch.5' }],
        selfChecks: [
          'Angle vs amplitude encoding — the core tradeoff? → Angle: one qubit per feature, hardware-native, no compression. Amplitude: 2ⁿ values in n qubits (exponential compression) but expensive/fragile to prepare.',
          'What does basis encoding cost for n classical bits? → n qubits — it is the literal "one bit, one qubit" map with no compression.',
          'What is qsample encoding? → Storing a probability distribution as amplitudes √p, so measuring the register samples from that distribution.',
        ],
      },
      {
        id: 'u1-l3', title: 'The read-in / read-out bottleneck', subtitle: 'where speedups die',
        classicalAnalogy: 'I/O dominates', Content: U1L3,
        bookRefs: [{ book: 'A', where: 'Ch.5' }, { book: 'B', where: 'Ch.2.3' }],
        selfChecks: [
          'Why can a "middle" speedup be worthless? → Because total time = read-in + compute + read-out; if loading the data or extracting the answer is exponentially costly, it dominates.',
          'What does full state read-out (tomography) cost? → O(4ⁿ) measurements; even extracting one entry of an HHL solution costs ~O(√N).',
          'When is an end-to-end speedup plausible? → When the output is a small summary (an expectation value / a label), not the whole exponential-size state, and the data loads cheaply.',
        ],
      },
    ],
  },
  {
    id: 'u2', num: '02', title: 'Inference as Geometry', subtitle: 'Interference & Kernels',
    color: 'from-violet-600 to-cyan-600',
    lessons: [
      {
        id: 'u2-l1', title: 'The interference classifier', subtitle: 'distance by wave interference',
        classicalAnalogy: 'nearest-centroid', Content: U2L1, interactive: InterferenceClassifier,
        interactiveLabel: 'Drag the test point between the two class anchors — watch the class flip',
        bookRefs: [{ book: 'A', where: 'Ch.1.2 / Ch.6' }],
        selfChecks: [
          'What does the single Hadamard actually compute? → It interferes the test state with each class anchor; constructive interference (nearer point) survives the ancilla=0 measurement, giving P(class) ∝ 1 + cos θ.',
          'How is the predicted class read off? → By measuring the ancilla / class qubit — the nearer anchor has the larger conditional probability.',
          'Map this to a classical model. → It is a nearest-centroid (1-NN-style) classifier, but no distance is ever computed — the amplitudes do the geometry physically.',
        ],
      },
      {
        id: 'u2-l2', title: 'Feature maps & quantum kernels', subtitle: 'the kernel trick, quantum-style',
        classicalAnalogy: 'SVM kernel trick', Content: U2L2, interactive: KernelVisualizer,
        interactiveLabel: 'The bright diagonal blocks are the two clusters — a kernel that sees structure',
        bookRefs: [{ book: 'A', where: 'Ch.6.2' }, { book: 'B', where: 'Ch.3' }],
        selfChecks: [
          'What is the quantum kernel formula? → k(x,x\') = |⟨0|U(x\')†U(x)|0⟩|² — the squared overlap of the two feature states.',
          'State the kernel trick in one sentence. → An SVM only needs pairwise similarities k(x,x\'), never the feature vectors themselves, so the feature space can be enormous as long as the similarity is cheap to compute.',
          'Why is the feature map always "implicit" in the quantum case? → The feature space is the 2ⁿ-dimensional Hilbert space — far too large to write down; only the overlap (a single number) is ever produced.',
        ],
      },
      {
        id: 'u2-l3', title: 'When kernels fail: concentration', subtitle: 'the barren plateau\'s cousin',
        classicalAnalogy: 'over-expressivity hurts', Content: U2L3, interactive: KernelVisualizer,
        interactiveLabel: 'Crank the depth slider — the off-diagonals collapse toward the identity',
        bookRefs: [{ book: 'B', where: 'Ch.3' }],
        selfChecks: [
          'What is exponential kernel concentration? → As the feature map gets more expressive, almost all pairs become near-orthogonal (k≈0); the kernel matrix approaches the identity and is useless for learning.',
          'Why is "more expressive" not "more powerful"? → A map that distinguishes every point finds no useful similarities; good kernels need the right inductive bias for the data, not maximal expressivity.',
          'What drives concentration? → Over-expressive embeddings, global measurements, excessive entanglement, and noise.',
        ],
      },
      {
        id: 'u2-l4', title: 'Distance-based & probabilistic models', subtitle: 'k-NN and graphical models',
        classicalAnalogy: 'k-NN / PGMs', Content: U2L4,
        bookRefs: [{ book: 'A', where: 'Ch.6.3' }],
        selfChecks: [
          'How does a quantum distance-based classifier scale up the interference trick? → It evaluates the overlap of a test point against a superposition of many training points at once.',
          'How does a qsample act like a probabilistic graphical model? → Combining qsamples joins distributions, partial measurement marginalises, and rejection sampling conditions — distribution operations become circuit operations.',
          'What does tracing out (ignoring) a qubit correspond to? → Marginalising over that variable in the encoded distribution.',
        ],
      },
    ],
  },
  {
    id: 'u3', num: '03', title: 'A Trainable Quantum Model', subtitle: 'QNN / PQC',
    color: 'from-cyan-600 to-emerald-600',
    lessons: [
      {
        id: 'u3-l1', title: 'The PQC is a layer', subtitle: 'gate angles are weights',
        classicalAnalogy: 'dense layer', Content: U3L1, interactive: PQCSandbox,
        interactiveLabel: 'Drag gates and move the θ sliders — the output histogram updates live', playgroundId: 'pqc',
        bookRefs: [{ book: 'A', where: 'Ch.8.2' }, { book: 'B', where: 'Ch.4.3' }],
        selfChecks: [
          'What plays the role of the weight matrix W? → The trainable gate angles θ in the rotation gates (RX, RY, RZ).',
          'What is the matrix-multiply analogy? → Each unitary U(θ) is a norm-preserving linear map applied to the 2ⁿ-dim amplitude vector — a "matrix multiply" on the state.',
          'Why is a PQC of only rotations still limited? → Without entangling gates each qubit evolves independently, like a network with no connections — it cannot mix features.',
        ],
      },
      {
        id: 'u3-l2', title: 'Entanglement = the non-linearity', subtitle: 'CNOT couples features',
        classicalAnalogy: 'ReLU / attention', Content: U3L2, interactive: EntanglementView,
        interactiveLabel: 'Add a CNOT — each qubit\'s Bloch arrow shrinks as info moves into correlations', playgroundId: 'entanglement',
        bookRefs: [{ book: 'A', where: 'Ch.3.1' }, { book: 'B', where: 'Ch.2' }],
        selfChecks: [
          'Why is entanglement the "non-linearity"? → Two-qubit gates make one qubit\'s state depend on another\'s, creating feature interactions a product of independent rotations cannot represent — the role ReLU/attention plays classically.',
          'What does a Bloch arrow shorter than 1 mean? → The qubit is in a mixed state (purity < 1) because its information now lives in correlations with other qubits, not on itself.',
          'Write the separability condition for "not entangled". → |ψ⟩ = |ψ_a⟩ ⊗ |ψ_b⟩ — the joint state factorises into independent parts.',
        ],
      },
      {
        id: 'u3-l3', title: 'Measurement = softmax / sampling', subtitle: 'the output head',
        classicalAnalogy: 'softmax + sampling', Content: U3L3, interactive: MeasurementReactor,
        interactiveLabel: 'Slide the shots count — one collapse vs thousands recovering the distribution', playgroundId: 'measurement',
        bookRefs: [{ book: 'A', where: 'Ch.3.1' }, { book: 'B', where: 'Ch.2.3' }],
        selfChecks: [
          'What is the model\'s output, concretely? → An expectation value ⟨ψ|O|ψ⟩ — a single real number estimated by averaging many measurement shots.',
          'How are "shots" like Monte-Carlo logits? → Each shot is one Born-rule categorical sample; few shots give a noisy estimate, many shots converge to the true probabilities.',
          'Is shot noise avoidable? → No — it is an intrinsic part of a quantum model\'s forward pass; you trade more shots for less variance.',
        ],
      },
      {
        id: 'u3-l4', title: 'The full QNN forward pass', subtitle: 'encode → ansatz → measure',
        classicalAnalogy: 'embed → layers → head', Content: U3L4,
        bookRefs: [{ book: 'B', where: 'Ch.4.3.1' }],
        selfChecks: [
          'Compare an MLP and a QNN forward pass. → MLP: x → σ(Wx+b) layers → softmax. QNN: U(x)|0⟩ encode → V(θ) ansatz → measure ⟨O⟩. Same shape; entanglement replaces ReLU.',
          'Read f = ⟨0|U(x)†V(θ)†OV(θ)U(x)|0⟩ right-to-left. → Blank register → embed data → apply trainable layers → measure observable O.',
          'What classical training machinery still transfers? → Optimizers, loss functions, schedulers, early stopping — only the forward pass and gradient move onto the QPU.',
        ],
      },
    ],
  },
  {
    id: 'u4', num: '04', title: 'Training Quantum Models', subtitle: 'Gradients & Pitfalls',
    color: 'from-emerald-600 to-amber-600',
    lessons: [
      {
        id: 'u4-l1', title: 'Analytic gradients: parameter-shift', subtitle: 'backprop\'s job, without autograd',
        classicalAnalogy: 'backprop', Content: U4L1, interactive: ParameterShiftView,
        interactiveLabel: 'The two shifted runs at θ ± π/2 are drawn explicitly', playgroundId: 'gradient',
        bookRefs: [{ book: 'A', where: 'Ch.7.3' }, { book: 'B', where: 'Ch.4.3' }],
        selfChecks: [
          'State the parameter-shift rule. → ∂f/∂θ = ½[ f(θ+π/2) − f(θ−π/2) ] — the exact gradient from two shifted circuit evaluations.',
          'Why ±π/2 and not a tiny ε like finite differences? → Because the output is sinusoidal in θ, the macroscopic ±π/2 shift gives the exact derivative, not an approximation, and is robust to shot noise.',
          'Why can\'t we just backprop through the circuit? → There are no stored intermediate activations to differentiate; measuring them would collapse the state.',
        ],
      },
      {
        id: 'u4-l2', title: 'The hybrid training loop', subtitle: 'QPU forward, CPU optimizer',
        classicalAnalogy: 'gradient descent', Content: U4L2,
        bookRefs: [{ book: 'A', where: 'Ch.7.3' }, { book: 'B', where: 'Ch.4.3' }],
        selfChecks: [
          'What runs where in a variational/hybrid loop? → The QPU evaluates the forward pass and parameter-shift gradients; a classical optimizer (Adam/SGD) on the CPU updates θ.',
          'Why is this called "variational"? → A classical optimizer varies the circuit parameters to minimise a cost — the quantum device just provides function/gradient evaluations.',
          'What new difficulties appear vs classical training? → Shot noise in the gradient, hardware noise, and barren plateaus.',
        ],
      },
      {
        id: 'u4-l3', title: 'Barren plateaus', subtitle: 'vanishing gradients ×1000',
        classicalAnalogy: 'vanishing gradient', Content: U4L3, interactive: BarrenPlateauSim,
        interactiveLabel: 'Crank qubits and depth — the loss landscape flattens to a desert', playgroundId: 'barren',
        bookRefs: [{ book: 'B', where: 'Ch.4.4.2' }],
        selfChecks: [
          'How does gradient variance scale in a barren plateau? → Var[∂L/∂θ] ∈ O(1/2ⁿ) — exponentially small in the qubit count, so each added qubit roughly halves the signal.',
          'Why is it exponential, not polynomial like classical vanishing gradients? → A deep/random ansatz behaves like a uniformly random unitary (a 2-design), spreading the state so evenly the loss is nearly constant everywhere.',
          'Name two mitigations. → Local (not global) cost functions, and shallow or structured ansätze (plus smart initialization and layerwise training).',
        ],
      },
      {
        id: 'u4-l4', title: 'FTQC training speedups', subtitle: 'Grover, HHL, annealing',
        classicalAnalogy: 'provable speedups', Content: U4L4,
        bookRefs: [{ book: 'A', where: 'Ch.7.1–7.4' }],
        selfChecks: [
          'How does Grover speed up perceptron training? → Perceptron training searches for a misclassified example; Grover finds a target among d items in O(√d) vs O(d) — a quadratic query speedup.',
          'What does HHL do, and what is its big caveat? → Inverts a sparse, well-conditioned matrix in time ~O(log N), but returns the solution as a quantum state — reading it out can erase the advantage.',
          'How does quantum annealing differ from gradient descent? → It encodes the loss as an energy landscape and lets the hardware relax toward the minimum, rather than following gradients.',
        ],
      },
    ],
  },
  {
    id: 'u5', num: '05', title: 'Quantum Models & Frontiers', subtitle: 'Energy models, Transformers',
    color: 'from-amber-600 to-rose-600',
    lessons: [
      {
        id: 'u5-l1', title: 'Energy-based quantum models', subtitle: 'Ising · Boltzmann · Hopfield',
        classicalAnalogy: 'Boltzmann machine', Content: U5L1,
        bookRefs: [{ book: 'A', where: 'Ch.8.1' }],
        selfChecks: [
          'What is a quantum Boltzmann/Ising machine? → A quantum Ising system whose low-energy configurations encode good solutions or high-probability data; sampling its low-energy states gives the model output.',
          'Which QML corner has real commercial hardware today? → Quantum annealers (energy-based optimization/sampling).',
          'What is still unproven for these models? → A clean, general learning advantage over classical samplers.',
        ],
      },
      {
        id: 'u5-l2', title: 'Variational classifiers as neural nets', subtitle: 'tying it together',
        classicalAnalogy: 'it IS a neural net', Content: U5L2, interactive: PQCSandbox,
        interactiveLabel: 'Revisit the PQC with the full lens: weights are angles, activations are entanglement', playgroundId: 'pqc',
        bookRefs: [{ book: 'A', where: 'Ch.8.2' }, { book: 'B', where: 'Ch.4' }],
        selfChecks: [
          'Map a variational classifier onto an NN end-to-end. → Encoder = embedding, V(θ) = linear layers, entangling gates = non-linearity, measurement = output head/softmax, parameter-shift + Adam = backprop + optimizer.',
          'What is genuinely different — the wrapper or the hypothesis class? → The hypothesis class. The functions are Fourier-like in the data with structure set by the encoding; the training wrapper is unchanged.',
          'What is the open empirical question? → Whether that hypothesis-class structure ever helps on a real-world task.',
        ],
      },
      {
        id: 'u5-l3', title: 'The quantum Transformer', subtitle: 'attention O(n²) → O(n√n)',
        classicalAnalogy: 'the LLM core', Content: U5L3,
        bookRefs: [{ book: 'B', where: 'Ch.5' }],
        selfChecks: [
          'What is the classical attention bottleneck? → Computing QKᵀ costs O(n²d) — quadratic in sequence length n.',
          'What is QSVT and why is it central? → Quantum Singular Value Transformation applies polynomials to a matrix\'s singular values; it unifies HHL, amplitude amplification and phase estimation and enables the O(n√n) attention.',
          'Why can\'t we run a quantum transformer today? → It needs FTQC hardware, a scalable QRAM to load tokens, and careful read-out — none exist yet (roadmaps: 2030s+).',
        ],
      },
      {
        id: 'u5-l4', title: 'Advantage & complexity recap', subtitle: 'where to go next',
        classicalAnalogy: 'the big picture', Content: U5L4,
        bookRefs: [{ book: 'A', where: 'Ch.4' }, { book: 'B', where: 'Ch.1' }],
        selfChecks: [
          'Name the three learnability dials. → Expressivity (representable functions), trainability (can you optimise it — barren plateaus), and generalization (train-vs-test gap).',
          'Why do the dials trade off? → Pushing expressivity tends to worsen trainability (barren plateaus / concentration) and can hurt generalization; QML is balancing them for a structured task.',
          'When does QML actually pay off? → Only when a task with the right structure, a trainable model, and an honest end-to-end cost all hold at once — which is why real-world advantage is still open.',
        ],
      },
    ],
  },
  {
    id: 'u6', num: '06', title: 'Quantum-Inspired AI', subtitle: 'Tensor Networks & Compression',
    color: 'from-rose-600 to-fuchsia-600',
    lessons: [
      {
        id: 'u6-l1', title: 'The same math, classically now', subtitle: 'why a quantum company ships classical software first',
        classicalAnalogy: 'low-rank adapters (LoRA)', Content: U6L1,
        bookRefs: [{ book: 'C', where: 'tensor networks' }],
        selfChecks: [
          'What is the core "quantum-inspired" claim? → The tensor-network math built to simulate quantum states (low-rank factorization + truncation) is itself a powerful classical compressor — you get the acceleration today, on CPU/GPU, with a clean upgrade path to a QPU later.',
          'Why does a quantum consultancy sell classical software? → The same code path (contract a tensor network, drop small singular values) runs on classical hardware now and on a quantum backend later — one API, two engines, value captured immediately.',
          'How is this like LoRA? → Both replace a big dense object with a small low-rank factorization; quantum-inspired methods generalize that idea using tensor networks.',
        ],
      },
      {
        id: 'u6-l2', title: 'Low-rank truncation', subtitle: 'compress without losing accuracy',
        classicalAnalogy: 'PCA / quantization', Content: U6L2, interactive: CompressionExplorer,
        interactiveLabel: 'Drag the rank slider — watch reconstruction error fall and the parameter count shrink',
        bookRefs: [{ book: 'C', where: 'SVD compression' }],
        selfChecks: [
          'What does a rank-r factorization store? → r left vectors + r singular values + r right vectors = r(2N+1) numbers instead of N², so it compresses whenever r ≪ N.',
          'Why can rank be cut with little accuracy loss? → Structured matrices (real weights/images) have fast-decaying singular values; the dropped components carry little energy, and truncated SVD is the provably optimal rank-r approximation (Eckart–Young).',
          'Why does it fail on random weights? → A random matrix has a flat spectrum — every component carries signal, so truncation destroys it. Compression works because real data is structured.',
        ],
      },
      {
        id: 'u6-l3', title: 'Matrix product states', subtitle: 'a chain of SVDs',
        classicalAnalogy: 'factorized layers', Content: U6L3, interactive: CompressionExplorer,
        interactiveLabel: 'Read the rank slider as the bond dimension at one cut of the tensor train',
        bookRefs: [{ book: 'C', where: 'MPS / tensor train' }],
        selfChecks: [
          'What is an MPS? → A big tensor factorized by a chain of SVDs into small core tensors linked by "bonds"; it is how you compress a many-index object the way SVD compresses a matrix.',
          'What does bond dimension control? → The amount of correlation/entanglement kept across that cut — it is the same rank knob as a single truncated SVD: larger = more faithful and more parameters.',
          'Where does this run today vs tomorrow? → Classically as tensor-network compression of model weights/activations; the identical contraction maps onto a quantum circuit when a QPU backend is plugged in.',
        ],
      },
    ],
  },
  {
    id: 'u7', num: '07', title: 'Optimization & NISQ Engineering', subtitle: 'QUBO · QAOA · Noise',
    color: 'from-fuchsia-600 to-amber-600',
    lessons: [
      {
        id: 'u7-l1', title: 'Business problems as energy', subtitle: 'QUBO / Ising',
        classicalAnalogy: 'integer programming', Content: U7L1,
        bookRefs: [{ book: 'C', where: 'optimization' }, { book: 'A', where: 'Ch.8.1' }],
        selfChecks: [
          'What is a QUBO? → Quadratic Unconstrained Binary Optimization: minimize xᵀQx over bits x∈{0,1}ⁿ; portfolio selection, Max-Cut, and scheduling all map onto it.',
          'How does QUBO relate to Ising? → Substitute x=(1−s)/2 with spins s∈{−1,+1} and you get the Ising energy E=−ΣJ_ij s_i s_j − Σh_i s_i — the same object, different variables.',
          'Why is this the bridge to quantum? → The QUBO cost becomes a diagonal cost Hamiltonian whose ground state is the optimum — exactly what QAOA and annealers minimize.',
        ],
      },
      {
        id: 'u7-l2', title: 'QAOA', subtitle: 'variational optimization on a gate machine',
        classicalAnalogy: 'learned optimizer', Content: U7L2, interactive: OptimizationPlayground,
        interactiveLabel: 'Tune γ/β (or Optimize) and add nodes — QAOA beats the uniform baseline while the brute-force search explodes',
        bookRefs: [{ book: 'C', where: 'QAOA' }],
        selfChecks: [
          'What are the two QAOA layers? → A cost layer e^{−iγC} that phases each bit-string by its energy, and a mixer e^{−iβB} (X-rotations) that spreads amplitude between bit-strings; p alternations with 2p angles.',
          'How do you read QAOA\'s answer? → Measure the final state; high-probability bit-strings are low-cost candidates, and ⟨C⟩ scores how good the angles are.',
          'Why "add 50 assets → 200"? → Brute force is O(2ⁿ) and dies fast; QAOA\'s circuit width grows linearly in n, so it targets the regime where enumeration cannot follow (advantage still unproven).',
        ],
      },
      {
        id: 'u7-l3', title: 'NISQ reality: noise, depth, shots', subtitle: 'why circuits stay shallow',
        classicalAnalogy: 'accumulating float error', Content: U7L3, interactive: NoiseLab,
        interactiveLabel: 'Crank depth and λ — the signal decays exponentially; lower the shots and watch sampling noise jitter the estimate',
        bookRefs: [{ book: 'C', where: 'NISQ hardware' }, { book: 'B', where: 'Ch.1' }],
        selfChecks: [
          'Why do NISQ circuits stay shallow? → Each gate has error; the expectation decays ~e^{−λ·depth}, so beyond ~100–200 gates the signal is buried in noise.',
          'What is shot noise and how does it scale? → Each measurement is one Born sample; the statistical error shrinks like 1/√shots, so precision costs quadratically more shots (and money).',
          'Name the two distinct error sources. → Hardware/decoherence noise (decay with depth) and finite-sampling shot noise (variance from limited shots) — independent, both must be budgeted.',
        ],
      },
      {
        id: 'u7-l4', title: 'Error mitigation', subtitle: 'zero-noise extrapolation & circuit cutting',
        classicalAnalogy: 'Richardson extrapolation', Content: U7L4, interactive: NoiseLab,
        interactiveLabel: 'Toggle ZNE — measure at noise ×1,2,3, fit, and extrapolate back to the ideal',
        bookRefs: [{ book: 'C', where: 'error mitigation' }],
        selfChecks: [
          'What is zero-noise extrapolation? → Deliberately amplify the noise (run at factors 1×,2×,3×), measure the expectation at each, then fit and extrapolate back to the zero-noise limit.',
          'What is circuit cutting / knitting? → Split a wide/deep circuit at a few wires, run the smaller fragments on the QPU, and recombine classically — trading exponential classical post-processing for usable quantum depth.',
          'Why "classical ↔ quantum ↔ classical"? → Pre/post-processing and recombination run on the CPU; only the small fragments run on the QPU — the hybrid pattern that defines NISQ engineering.',
        ],
      },
    ],
  },
  {
    id: 'u8', num: '08', title: 'Hybrid Orchestration', subtitle: 'The Quantum OS & Hardware',
    color: 'from-amber-600 to-emerald-600',
    lessons: [
      {
        id: 'u8-l1', title: 'Splitting the problem', subtitle: 'what runs where',
        classicalAnalogy: 'CPU + GPU offload', Content: U8L1,
        bookRefs: [{ book: 'C', where: 'hybrid architecture' }],
        selfChecks: [
          'What belongs on the QPU vs the CPU? → QPU: the small kernel that is hard classically (state prep, the variational forward pass, a fragment). CPU/GPU: data, the optimizer, mitigation, recombination — everything else.',
          'Why treat the QPU like a GPU? → It is a coprocessor you offload a narrow, expensive sub-kernel to; the orchestration (scheduling, batching, fallbacks) lives in classical code.',
          'What are the hard design questions? → Where to cut the problem, and when the classical part hands off to quantum and takes back over — every problem cuts differently.',
        ],
      },
      {
        id: 'u8-l2', title: 'The "quantum OS"', subtitle: 'hardware-agnostic backends & the agent loop',
        classicalAnalogy: 'compiler target / AutoML', Content: U8L2,
        bookRefs: [{ book: 'C', where: 'orchestration' }],
        selfChecks: [
          'What does a hardware-agnostic layer buy you? → Write the circuit once and a backend selector routes it to the best/available device (simulator, superconducting, annealer) — like a compiler choosing a target.',
          'What is the self-improving agent loop? → A controller that runs a job, reads the result/cost, then adapts parameters, backend choice, or mitigation and reruns — a closed loop around the quantum coprocessor.',
          'Why does agnosticism matter commercially? → Sovereignty and continuity — if one vendor/cloud disappears, the workload must move; portability is a business requirement, not just technical.',
        ],
      },
      {
        id: 'u8-l3', title: 'Modalities, simulators, queues', subtitle: 'superconducting · annealers · GPU sims',
        classicalAnalogy: 'CPU vs GPU vs TPU', Content: U8L3,
        bookRefs: [{ book: 'C', where: 'hardware landscape' }],
        selfChecks: [
          'Gate model vs annealer in one line each? → Gate model (e.g. superconducting / IQM): universal, runs QAOA/QNNs. Annealer (e.g. D-Wave): special-purpose Ising minimizer, many more qubits but only optimization/sampling.',
          'Why simulate on GPU/FPGA at all? → For ≲30 qubits an exact statevector simulator is faster, noise-free, and queue-free — the right backend for development and small problems (it is what this whole course runs on).',
          'What is the hidden cost of real hardware? → Queue latency and per-shot cost; an orchestrator hides this by batching jobs and falling back to simulators.',
        ],
      },
    ],
  },
]

/** Flattened lesson list for global prev/next + progress indexing. */
export const LESSONS: Lesson[] = UNITS.flatMap((u) => u.lessons)

export const firstLessonId = LESSONS[0].id

export function lessonById(id: string): Lesson | undefined {
  return LESSONS.find((l) => l.id === id)
}

export function unitOfLesson(id: string): Unit | undefined {
  return UNITS.find((u) => u.lessons.some((l) => l.id === id))
}

export function lessonIndex(id: string): number {
  return LESSONS.findIndex((l) => l.id === id)
}
