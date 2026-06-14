import { Definition, Equation, PaperRemark } from '../../components/TeachPrimitives'
import { CompareTable } from '../../components/TeachPanel'

export function U6L1() {
  return (
    <div className="flex flex-col gap-4 text-sm text-q-sub leading-relaxed">
      <p>
        Here is the surprise that keeps quantum companies in business <em>before</em> useful quantum hardware exists:
        the math invented to <strong className="text-q-text">simulate</strong> quantum systems on classical computers is,
        by itself, a powerful classical tool. It is called <strong className="text-q-text">quantum-inspired</strong> computing —
        and it runs on the GPU you already own.
      </p>
      <Definition title="The quantum-inspired claim">
        A quantum state of n qubits is a tensor with 2ⁿ entries. To simulate it classically you never store all 2ⁿ —
        you keep a <strong className="text-q-text">low-rank tensor-network</strong> approximation and throw away the small
        pieces. That same "factorize and truncate" operation is a state-of-the-art way to compress neural-network weights
        and activations <em>today</em>.
      </Definition>
      <p>
        So an applied quantum team ships <strong className="text-q-text">one code path with two engines</strong>: contract a
        tensor network and drop small singular values. On classical hardware that is model compression you can deploy now;
        on a future QPU the same contraction becomes a quantum circuit. You capture value immediately and upgrade the
        backend later — no rewrite.
      </p>
      <CompareTable rows={[
        { classical: 'LoRA / low-rank adapters', quantum: 'low-rank tensor factorization' },
        { classical: 'PCA / SVD compression', quantum: 'bond-dimension truncation' },
        { classical: 'runs on GPU today', quantum: 'same math maps to a QPU later' },
      ]} />
      <PaperRemark source="Why a quantum company sells classical software">
        It is not a detour from the quantum mission — it is the on-ramp. The acceleration is real now, the customer
        relationship and the data pipeline are built now, and the switch to quantum hardware is a backend swap rather than
        a new product.
      </PaperRemark>
    </div>
  )
}

export function U6L2() {
  return (
    <div className="flex flex-col gap-4 text-sm text-q-sub leading-relaxed">
      <p>
        The unit operation behind all of this is the <strong className="text-q-text">truncated SVD</strong> — the same
        decomposition you may know from PCA. Any matrix factors into a sum of rank-1 pieces ordered by importance; keep the
        top few and you have a faithful, far smaller copy.
      </p>
      <Equation
        math={`A = \\sum_{k=1}^{N} \\sigma_k\\, u_k v_k^\\top \\;\\approx\\; \\sum_{k=1}^{r} \\sigma_k\\, u_k v_k^\\top`}
        gloss={<>the singular values σ₁ ≥ σ₂ ≥ … rank the components; truncating to the top r is the <em>provably optimal</em> rank-r approximation (Eckart–Young).</>}
      />
      <p>
        Slide the rank in the demo. On the <strong className="text-q-text">smooth</strong> matrix the singular values
        collapse fast — a couple of components reconstruct it almost perfectly, so you store r(2N+1) numbers instead of N²
        with tiny error. On <strong className="text-q-text">random</strong> weights the spectrum is flat: every component
        matters, and truncation destroys it. Real model weights look much more like the smooth case — that is <em>why</em>
        compression works.
      </p>
      <Definition title="What you actually store">
        A rank-r factorization keeps r left vectors, r singular values, and r right vectors = r(2N+1) numbers. Compression
        kicks in as soon as r ≪ N — exactly the regime structured data lives in.
      </Definition>
      <CompareTable rows={[
        { classical: 'keep all N² weights', quantum: 'keep r(2N+1) ≪ N²' },
        { classical: 'quantize to fewer bits', quantum: 'drop small singular directions' },
        { classical: 'lossy but accurate', quantum: 'optimal error for that rank' },
      ]} />
    </div>
  )
}

export function U6L3() {
  return (
    <div className="flex flex-col gap-4 text-sm text-q-sub leading-relaxed">
      <p>
        A single SVD compresses a 2-index object (a matrix). A neural-network weight tensor or a quantum state has
        <em> many</em> indices. The fix is to chain SVDs into a <strong className="text-q-text">matrix product state
        (MPS)</strong> — the workhorse tensor network.
      </p>
      <Definition title="Matrix product state (tensor train)">
        Reshape the big tensor, SVD-truncate at the first cut, carry the remainder forward, SVD-truncate at the next cut,
        and so on. The result is a chain of small "core" tensors linked by indices called <strong className="text-q-text">bonds</strong>.
        The <strong className="text-q-text">bond dimension</strong> is just the rank you keep at each cut.
      </Definition>
      <Equation
        math={`T_{i_1 i_2 \\cdots i_n} \\approx \\sum_{\\alpha} A^{(1)}_{i_1 \\alpha_1} A^{(2)}_{\\alpha_1 i_2 \\alpha_2} \\cdots A^{(n)}_{\\alpha_{n-1} i_n}`}
        gloss={<>one giant tensor becomes a product of small ones; the bond indices α carry just enough correlation across each cut. Bigger bond = more faithful, more parameters.</>}
      />
      <p>
        Reuse the same demo with this lens: the rank slider <em>is</em> the bond dimension at one cut. Larger bond keeps
        more correlation (more "entanglement") and costs more parameters; smaller bond compresses harder. This is the knob
        an applied team turns to trade accuracy for size on a model — and the very same object that, on a quantum computer,
        describes how much entanglement a circuit must carry.
      </p>
      <CompareTable rows={[
        { classical: 'factorized / low-rank layers', quantum: 'MPS cores + bonds' },
        { classical: 'compression ratio', quantum: 'bond dimension' },
        { classical: 'accuracy vs size knob', quantum: 'entanglement kept across a cut' },
      ]} />
    </div>
  )
}
