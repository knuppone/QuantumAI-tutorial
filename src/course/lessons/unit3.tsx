import { Definition, Equation, PaperRemark } from '../../components/TeachPrimitives'
import { CompareTable } from '../../components/TeachPanel'

export function U3L1() {
  return (
    <div className="flex flex-col gap-4 text-sm text-q-sub leading-relaxed">
      <p>
        Kernels were the SVM analogy. Now the neural-network analogy: the
        <strong className="text-q-text"> parameterized quantum circuit (PQC)</strong>, also called a QNN. A PQC is a circuit
        whose gates carry trainable rotation angles θ — and those angles are your weights.
      </p>
      <Equation
        math={`V(\\theta) = \\prod_i U_i(\\theta_i), \\qquad |\\psi\\rangle = V(\\theta)\\,U(x)\\,|0\\rangle`}
        gloss={<>a product of tunable unitary "layers" applied to the encoded data — structurally a stack of (data-independent) weight matrices.</>}
      />
      <CompareTable rows={[
        { classical: 'weight matrix W', quantum: 'gate angles θ (RX, RY, RZ)' },
        { classical: 'matrix multiply Wx', quantum: 'unitary U(θ)|ψ⟩' },
        { classical: 'a dense layer', quantum: 'a rotation + entangle block' },
      ]} />
      <p>
        In the sandbox, drag gates and move the θ sliders — the output probability histogram updates live. Every unitary is
        just a (norm-preserving) linear map on the amplitude vector, so a PQC really is a deep linear model on 2ⁿ-dim
        features... until we add the one missing ingredient in the next lesson.
      </p>
    </div>
  )
}

export function U3L2() {
  return (
    <div className="flex flex-col gap-4 text-sm text-q-sub leading-relaxed">
      <p>
        A stack of single-qubit rotations alone is weak — each qubit evolves independently, like a network with no
        connections between neurons. The coupling that makes a QNN expressive is
        <strong className="text-q-text"> entanglement</strong>, created by two-qubit gates like CNOT.
      </p>
      <Definition title="Entanglement = the non-linearity">
        A two-qubit gate makes a qubit's state depend on another's, so features can no longer be described independently.
        That cross-talk plays the role ReLU or attention plays classically: it is what lets the model represent functions a
        product of independent rotations never could.
      </Definition>
      <Equation
        math={`|\\psi\\rangle \\neq |\\psi_a\\rangle \\otimes |\\psi_b\\rangle`}
        gloss={<>entangled means "not separable" — the joint state carries correlations you cannot recover from the parts alone.</>}
      />
      <p>
        Watch the Bloch spheres in the demo: add a CNOT and each individual qubit's arrow <em>shrinks inside</em> the sphere
        (purity drops below 1). The information has moved into the <em>correlations between</em> qubits — it no longer lives on
        any single one. That migration of information is the quantum non-linearity at work.
      </p>
      <CompareTable rows={[
        { classical: 'ReLU / attention', quantum: 'CNOT / CZ entangler' },
        { classical: 'feature interactions', quantum: 'qubit correlations' },
        { classical: 'pure activation', quantum: 'purity = 1 (separable)' },
      ]} />
    </div>
  )
}

export function U3L3() {
  return (
    <div className="flex flex-col gap-4 text-sm text-q-sub leading-relaxed">
      <p>
        After encode + ansatz, the state holds your answer in its amplitudes — but you cannot read amplitudes. The
        <strong className="text-q-text"> measurement</strong> is the output head, and it behaves like softmax + sampling glued together.
      </p>
      <Equation
        math={`f(x, \\theta) = \\langle \\psi(x,\\theta)|\\,O\\,|\\psi(x,\\theta)\\rangle`}
        gloss={<>the model's output is an expectation value of some observable O — a single real number, estimated by averaging many measurement shots.</>}
      />
      <Definition title="Shots = Monte-Carlo logits">
        Each measurement is one categorical sample (Born rule). With a few shots you get a noisy estimate; with many shots the
        histogram converges to the true probabilities. The "shot noise" is a genuine, unavoidable part of a quantum model's forward pass.
      </Definition>
      <CompareTable rows={[
        { classical: 'softmax probabilities', quantum: 'Born-rule probabilities |αᵢ|²' },
        { classical: 'sample from output', quantum: 'one measurement shot' },
        { classical: 'logit', quantum: 'expectation value ⟨O⟩' },
      ]} />
      <p className="text-q-faint text-xs">
        Slide the shots count in the reactor: one shot is a single collapse; thousands recover the smooth distribution.
      </p>
    </div>
  )
}

export function U3L4() {
  return (
    <div className="flex flex-col gap-4 text-sm text-q-sub leading-relaxed">
      <p>
        Put the three pieces together and a QNN forward pass is line-for-line the same shape as an MLP forward pass — just
        with quantum implementations of each stage.
      </p>
      <CompareTable rows={[
        { classical: 'input x ∈ ℝᵈ', quantum: 'data encoder U(x)|0⟩' },
        { classical: 'hidden layers σ(Wx+b)', quantum: 'trainable ansatz V(θ)' },
        { classical: 'non-linearity (ReLU)', quantum: 'entanglement (CNOT)' },
        { classical: 'output softmax(Wx)', quantum: 'measurement ⟨O⟩' },
        { classical: 'loss (CE / MSE)', quantum: 'same classical losses' },
        { classical: 'gradient: backprop', quantum: 'gradient: parameter-shift (next unit)' },
      ]} />
      <Equation
        math={`f(x,\\theta) = \\langle 0|\\,U(x)^\\dagger V(\\theta)^\\dagger\\,O\\,V(\\theta)\\,U(x)|0\\rangle`}
        gloss={<>read right-to-left: blank register → embed data → apply trainable layers → measure. Encode, transform, read out.</>}
      />
      <PaperRemark source="Why this matters">
        Because the wrapper is identical, you can reuse your entire classical training stack — optimizers, loss functions,
        schedulers, early stopping. Only the forward pass and the gradient computation move onto the quantum device.
      </PaperRemark>
    </div>
  )
}
