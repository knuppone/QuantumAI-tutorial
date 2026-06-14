import { Definition, Equation, PaperRemark } from '../../components/TeachPrimitives'
import { CompareTable } from '../../components/TeachPanel'

export function U1L1() {
  return (
    <div className="flex flex-col gap-4 text-sm text-q-sub leading-relaxed">
      <p>
        Forget spooky metaphors. For an ML person a single qubit is just a <strong className="text-q-text">normalized
        2-dimensional complex vector</strong> — and the Bloch sphere below is simply a picture of that unit vector.
      </p>
      <Equation
        math={`|\\psi\\rangle = \\alpha|0\\rangle + \\beta|1\\rangle, \\quad |\\alpha|^2 + |\\beta|^2 = 1`}
        gloss={<>a length-1 vector with two complex entries; the north pole is |0⟩, the south pole is |1⟩, everything else is a blend.</>}
      />
      <p>
        The twist that makes qubits powerful: <em>n</em> of them do not give you <em>2n</em> numbers, they give you
        <strong className="text-q-text"> 2ⁿ</strong> complex amplitudes — one per bit-string — because qubits combine by the
        tensor product, not the Cartesian product. Fifty qubits already carry ~10¹⁵ amplitudes. That exponential state
        space is the whole reason anyone hopes for an advantage.
      </p>
      <Definition title="Born rule (how you read a qubit)">
        You never see the amplitudes directly. Measuring collapses the state to one basis outcome, and you get
        outcome <em>i</em> with probability |amplitudeᵢ|². It is exactly a categorical sample from a softmax-like distribution —
        except the "logits" are complex and can interfere.
      </Definition>
      <CompareTable rows={[
        { classical: 'n bits → one of 2ⁿ strings', quantum: 'n qubits → 2ⁿ amplitudes at once' },
        { classical: 'read a bit, it stays', quantum: 'measure, the state collapses' },
        { classical: 'deterministic output', quantum: 'probabilistic (Born rule)' },
      ]} />
      <p className="text-q-faint text-xs">Drag the point in the embed below — the Bloch arrow is just this 2-vector, live.</p>
    </div>
  )
}

export function U1L2() {
  return (
    <div className="flex flex-col gap-4 text-sm text-q-sub leading-relaxed">
      <p>
        A circuit cannot read a CSV. Just like NLP turns text into token embeddings, QML needs an
        <strong className="text-q-text"> encoding</strong> that loads classical numbers into a quantum state. There is not one
        way to do it — there is a small zoo, each with a different cost/benefit. Toggle between them in the explorer.
      </p>
      <CompareTable rows={[
        { classical: 'Basis encoding', quantum: 'a bit-string → the matching |x⟩. n bits cost n qubits.' },
        { classical: 'Angle encoding', quantum: 'a feature → a rotation angle. Hardware-native, most used.' },
        { classical: 'Amplitude encoding', quantum: '2ⁿ values → n qubits. Huge compression, costly to prepare.' },
        { classical: 'Qsample encoding', quantum: 'a distribution → amplitudes √p, so measuring samples it.' },
      ]} />
      <Equation
        math={`x \\in \\mathbb{R}^d \\;\\xrightarrow{\\;U(x)\\;}\\; |\\phi(x)\\rangle = U(x)\\,|0\\rangle^{\\otimes n}`}
        gloss={<>encoding is a data-dependent circuit U(x) that rotates the blank |0…0⟩ register into a state that "is" your data point.</>}
      />
      <p>
        The choice matters enormously downstream: amplitude encoding gives you exponential compression but is expensive and
        fragile; angle encoding is cheap and what real hardware actually runs. There is no free lunch — compression you gain
        on qubit count you pay back in state-preparation depth.
      </p>
    </div>
  )
}

export function U1L3() {
  return (
    <div className="flex flex-col gap-4 text-sm text-q-sub leading-relaxed">
      <p>
        Here is the trap that sinks many "exponential speedup" headlines: the speedup is for the
        <em> computation in the middle</em>, but you still have to get data <strong className="text-q-text">in</strong> and answers
        <strong className="text-q-text"> out</strong> — and those steps can themselves be exponentially expensive.
      </p>
      <Definition title="Read-in">
        Preparing an arbitrary amplitude-encoded state from a classical vector can take time comparable to the data size,
        or assume a hardware "QRAM" that does not exist at scale. If loading the data costs as much as the speedup saves, the
        advantage evaporates.
      </Definition>
      <Definition title="Read-out">
        The output is a quantum state, not a number. Reconstructing the full state (tomography) costs O(4ⁿ) measurements.
        Even extracting <em>one</em> entry of a solution vector can cost O(√N) — the famous caveat on the HHL linear-systems algorithm.
      </Definition>
      <Equation
        math={`T_{\\text{total}} = T_{\\text{read-in}} + T_{\\text{compute}} + T_{\\text{read-out}}`}
        gloss={<>a speedup in the middle term is worthless if either edge term dominates. Always price all three.</>}
      />
      <PaperRemark source="Rule of thumb">
        A claimed quantum speedup is only real <em>end-to-end</em> if the algorithm produces a small summary (an expectation
        value, a single bit, a class label) rather than the whole exponential-size state — and if the data can be loaded cheaply.
      </PaperRemark>
    </div>
  )
}
