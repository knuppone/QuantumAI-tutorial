import { Definition, Equation, PaperRemark } from '../../components/TeachPrimitives'
import { CompareTable } from '../../components/TeachPanel'

export function U2L1() {
  return (
    <div className="flex flex-col gap-4 text-sm text-q-sub leading-relaxed">
      <p>
        The cleanest "aha" in the whole field is Schuld's interference classifier. It is a nearest-centroid /
        1-nearest-neighbour classifier — but the distance comparison is done by <strong className="text-q-text">wave
        interference</strong> instead of arithmetic. Drag the test point and watch the class flip.
      </p>
      <Definition title="The idea">
        Load the two class anchors and the test point into superposition, entangled with their class label. One Hadamard
        makes the test branch <em>interfere</em> with each anchor: where they point the same way the amplitudes
        <em> add</em> (constructive), where they oppose they <em>cancel</em> (destructive). Then you simply measure.
      </Definition>
      <Equation
        math={`P(\\text{class}=c \\mid \\text{ancilla}=0) \\;\\propto\\; 1 + \\cos\\theta_c`}
        gloss={<>θ_c is the angle between the test point and class c's anchor — smaller angle (closer point) ⇒ bigger probability. The geometry falls out of the interference for free.</>}
      />
      <p>
        Notice what did <em>not</em> happen: no distance was ever computed, no loop over training points, no dot products
        summed. The amplitudes did the comparison physically, in one shot. This is the prototype for "inference as geometry."
      </p>
      <CompareTable rows={[
        { classical: 'nearest-centroid distance', quantum: 'overlap via Hadamard interference' },
        { classical: 'argmin over classes', quantum: 'measure the ancilla / class qubit' },
      ]} />
    </div>
  )
}

export function U2L2() {
  return (
    <div className="flex flex-col gap-4 text-sm text-q-sub leading-relaxed">
      <p>
        That overlap is exactly a <strong className="text-q-text">kernel</strong> — a similarity score between two data points.
        And kernels are the bridge that makes quantum models look like SVMs you already understand.
      </p>
      <Definition title="The kernel trick (recap)">
        An SVM never needs the feature vectors φ(x) themselves — only pairwise similarities k(x, x') = ⟨φ(x), φ(x')⟩.
        So you can work in a gigantic feature space as long as you can <em>compute the similarity</em> cheaply.
      </Definition>
      <Equation
        math={`k(x, x') = \\big|\\langle 0|\\,U(x')^\\dagger U(x)\\,|0\\rangle\\big|^2`}
        gloss={<>prepare the two feature states and measure how much they overlap. The "feature space" is the 2ⁿ-dim Hilbert space — too big to ever write down, but the overlap is a single number a quantum computer can estimate.</>}
      />
      <p>
        The matrix below is the <strong className="text-q-text">kernel (Gram) matrix</strong> — the only object the quantum
        computer ever has to hand the SVM. Bright = similar, dark = dissimilar. The two clusters show up as bright diagonal
        blocks: a kernel that "sees" the structure.
      </p>
      <CompareTable rows={[
        { classical: 'RBF / polynomial kernel', quantum: 'overlap of feature circuits' },
        { classical: 'φ(x) ∈ ℝᵈ (maybe explicit)', quantum: 'φ always implicit (2ⁿ-dim)' },
      ]} />
    </div>
  )
}

export function U2L3() {
  return (
    <div className="flex flex-col gap-4 text-sm text-q-sub leading-relaxed">
      <p>
        Now the failure mode. It is tempting to make the feature map U(x) as rich and "expressive" as possible. Crank the
        depth slider and watch what happens to the kernel matrix.
      </p>
      <Definition title="Exponential kernel concentration">
        As the feature map gets more expressive, almost any two distinct data points become nearly orthogonal —
        k(x, x') ≈ 0 for all pairs. The kernel matrix collapses toward the identity, so every point looks equally dissimilar
        to every other and the SVM has nothing to learn from.
      </Definition>
      <Equation
        math={`k(x, x') \\to \\tfrac{1}{2^{n}} \\quad \\text{as expressivity grows}`}
        gloss={<>the off-diagonal similarities shrink exponentially in the number of qubits — the kernel's version of the barren plateau.</>}
      />
      <p>
        The lesson is counterintuitive but central: <strong className="text-q-text">more expressive is not more powerful.</strong>{' '}
        A feature map that can tell every point apart is one that finds <em>no</em> useful similarities. Good quantum kernels
        need the right inductive bias for the data, not maximal expressivity — the same tension you will meet again with QNNs.
      </p>
      <PaperRemark source="Du et al. 2025">
        Drivers of concentration include over-expressive embeddings, global measurements, too much entanglement, and noise —
        which is also why quantum kernels often fail to beat classical baselines on ordinary data.
      </PaperRemark>
    </div>
  )
}

export function U2L4() {
  return (
    <div className="flex flex-col gap-4 text-sm text-q-sub leading-relaxed">
      <p>
        Interference and kernels cover more than SVMs. The same "amplitudes encode similarity / probability" idea gives you
        quantum versions of two other familiar model families.
      </p>
      <Definition title="Distance-based classifiers">
        k-NN and nearest-centroid are just repeated overlap estimates. A quantum computer can evaluate the overlap of a test
        point against a <em>superposition</em> of training points at once — the interference classifier scaled up.
      </Definition>
      <Definition title="Probabilistic (qsample) models">
        If you encode a distribution as amplitudes √p (qsample encoding), then operations on the state correspond to operations
        on the distribution: combining qsamples = joining distributions, partial measurement = marginalisation, and rejection
        sampling = conditioning. A quantum state becomes a little probabilistic graphical model you can manipulate.
      </Definition>
      <CompareTable rows={[
        { classical: 'k-NN / centroid', quantum: 'overlap with data superposition' },
        { classical: 'joint distribution p(x,y)', quantum: 'qsample amplitudes √p(x,y)' },
        { classical: 'marginalize a variable', quantum: 'trace out / ignore a qubit' },
        { classical: 'condition on evidence', quantum: 'rejection sampling on a measurement' },
      ]} />
      <Equation
        math={`|p\\rangle = \\sum_x \\sqrt{p(x)}\\,|x\\rangle`}
        gloss={<>a distribution stored in amplitudes; measuring the register draws a sample x ∼ p. Inference becomes circuit manipulation.</>}
      />
    </div>
  )
}
