import { Definition, Equation, PaperRemark } from '../../components/TeachPrimitives'
import { CompareTable } from '../../components/TeachPanel'

export function U7L1() {
  return (
    <div className="flex flex-col gap-4 text-sm text-q-sub leading-relaxed">
      <p>
        The most common request a quantum consultancy gets is not "train a model" — it is "solve this hard combinatorial
        decision": which assets to hold, how to route trucks, how to schedule jobs. Almost all of these compress into one
        canonical form: <strong className="text-q-text">QUBO</strong>.
      </p>
      <Definition title="QUBO — Quadratic Unconstrained Binary Optimization">
        Choose bits x ∈ {'{0,1}'}ⁿ to minimize xᵀQx. Portfolio selection (hold asset i or not), Max-Cut, and scheduling all
        map onto picking the bit-string of lowest cost.
      </Definition>
      <Equation
        math={`\\min_{x \\in \\{0,1\\}^n} \\; x^\\top Q x \\quad\\Longleftrightarrow\\quad \\min_{s \\in \\{\\pm 1\\}^n} \\; -\\!\\sum_{ij} J_{ij} s_i s_j - \\sum_i h_i s_i`}
        gloss={<>substitute x = (1−s)/2 and QUBO becomes the Ising energy — the same object physicists minimize. The optimal bit-string is the ground state.</>}
      />
      <p>
        That last equivalence is the bridge to quantum: encode the cost as a <strong className="text-q-text">diagonal cost
        Hamiltonian</strong> whose lowest-energy state is your answer. QAOA (next lesson) and quantum annealers are both just
        machines for finding that ground state.
      </p>
      <CompareTable rows={[
        { classical: 'integer / binary program', quantum: 'QUBO xᵀQx' },
        { classical: 'a loss to minimize', quantum: 'cost Hamiltonian energy' },
        { classical: 'optimal assignment', quantum: 'ground state |x*⟩' },
      ]} />
      <PaperRemark source="Why it scales painfully">
        Brute force is O(2ⁿ): a 150-asset portfolio is 2¹⁵⁰ combinations, and adding 50 more assets makes it astronomically
        worse. Classical heuristics handle this today; quantum methods aim to do better as hardware grows — the advantage is
        still unproven, which is exactly why honest benchmarking is the job.
      </PaperRemark>
    </div>
  )
}

export function U7L2() {
  return (
    <div className="flex flex-col gap-4 text-sm text-q-sub leading-relaxed">
      <p>
        <strong className="text-q-text">QAOA</strong> (Quantum Approximate Optimization Algorithm) is the gate-model way to
        attack a QUBO. It is a shallow PQC with a very specific structure, trained exactly like the variational models from
        Unit 4.
      </p>
      <Definition title="Two alternating layers">
        Start in a uniform superposition over all bit-strings. Then repeat p times: a <strong className="text-q-text">cost
        layer</strong> e<sup>−iγC</sup> that phases each bit-string by its energy, and a <strong className="text-q-text">mixer
        layer</strong> e<sup>−iβB</sup> (X-rotations) that shuffles amplitude between bit-strings. Tune the 2p angles γ, β.
      </Definition>
      <Equation
        math={`|\\gamma,\\beta\\rangle = e^{-i\\beta_p B} e^{-i\\gamma_p C} \\cdots e^{-i\\beta_1 B} e^{-i\\gamma_1 C}\\, H^{\\otimes n}|0\\rangle`}
        gloss={<>cost phases + mixing, p times; good angles make low-cost bit-strings interfere constructively so they dominate the measurement.</>}
      />
      <p>
        In the playground, tune γ/β (or hit <em>Optimize</em>) and watch the output distribution concentrate on the
        maximum-cut string, beating the uniform baseline; the approximation ratio rises. Add nodes and the brute-force
        search space doubles each time, while QAOA's circuit only grows linearly in n — the whole point of the approach.
      </p>
      <CompareTable rows={[
        { classical: 'simulated annealing', quantum: 'QAOA cost + mixer layers' },
        { classical: 'learned optimizer', quantum: 'classically-tuned γ, β angles' },
        { classical: 'read the best sample', quantum: 'measure → low-cost bit-strings' },
      ]} />
    </div>
  )
}

export function U7L3() {
  return (
    <div className="flex flex-col gap-4 text-sm text-q-sub leading-relaxed">
      <p>
        Everything so far assumed a perfect machine. Real NISQ devices are <strong className="text-q-text">noisy</strong>,
        and that single fact dictates how every applied quantum project is engineered.
      </p>
      <Equation
        math={`\\langle O \\rangle_{\\text{noisy}} \\;\\approx\\; \\langle O \\rangle_{\\text{ideal}} \\cdot e^{-\\lambda \\cdot \\text{depth}}`}
        gloss={<>each gate adds error, so the measurable signal decays exponentially with circuit depth — past ~100–200 gates it is buried in noise.</>}
      />
      <Definition title="Two independent error sources">
        <strong className="text-q-text">Hardware noise</strong> (decoherence) shrinks the signal as the circuit deepens.
        <strong className="text-q-text"> Shot noise</strong> is statistical: every measurement is one Born sample, so the
        error on an expectation falls only as 1/√shots — 100× precision costs 10,000× the shots, and shots cost real money.
      </Definition>
      <p>
        In the lab, raise the depth or λ and the curve collapses toward zero; drop the shot count and the estimate jitters.
        This is why NISQ circuits stay shallow and why "just run it deeper" is not an option — it is the practical ceiling
        the whole field works under.
      </p>
      <CompareTable rows={[
        { classical: 'accumulating float error', quantum: 'decoherence with depth' },
        { classical: 'Monte-Carlo variance', quantum: 'shot noise ~1/√shots' },
        { classical: 'more iterations = cost', quantum: 'more shots = $ and time' },
      ]} />
    </div>
  )
}

export function U7L4() {
  return (
    <div className="flex flex-col gap-4 text-sm text-q-sub leading-relaxed">
      <p>
        You cannot afford full quantum error <em>correction</em> on NISQ hardware (it needs thousands of physical qubits per
        logical one). So applied teams use cheaper <strong className="text-q-text">error mitigation</strong> to claw accuracy
        back statistically.
      </p>
      <Definition title="Zero-noise extrapolation (ZNE)">
        Counter-intuitively, deliberately <em>amplify</em> the noise — run the circuit at noise factors 1×, 2×, 3× (e.g. by
        stretching gates) — measure the expectation at each, then fit a curve and extrapolate back to the
        <strong className="text-q-text"> zero-noise limit</strong>. Toggle ZNE in the lab to see the extrapolated value snap
        back toward the ideal.
      </Definition>
      <Definition title="Circuit cutting / knitting">
        When a circuit is too wide or deep, cut it at a few wires into smaller fragments, run each on the QPU, and recombine
        the results <strong className="text-q-text">classically</strong>. You trade exponential classical post-processing for
        usable quantum depth — recent demonstrations stretched usable circuits from ~hundreds of gates to many thousands this
        way.
      </Definition>
      <Equation
        math={`\\text{classical} \\;\\to\\; \\text{quantum (small piece)} \\;\\to\\; \\text{classical recombine}`}
        gloss={<>the defining NISQ pattern: the CPU does pre/post-processing and stitching, the QPU only runs the small hard kernel.</>}
      />
      <CompareTable rows={[
        { classical: 'Richardson extrapolation', quantum: 'zero-noise extrapolation' },
        { classical: 'model/data sharding', quantum: 'circuit cutting & knitting' },
        { classical: 'average out noise', quantum: 'noise-aware post-processing' },
      ]} />
    </div>
  )
}
