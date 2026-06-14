import { Definition, Equation, PaperRemark } from '../../components/TeachPrimitives'
import { CompareTable } from '../../components/TeachPanel'

export function U4L1() {
  return (
    <div className="flex flex-col gap-4 text-sm text-q-sub leading-relaxed">
      <p>
        You cannot backprop through a quantum computer — there are no intermediate activations to cache; measuring would
        collapse them. Remarkably, you do not need to. For the rotation gates used in QNNs, the
        <strong className="text-q-text"> exact</strong> gradient comes from running the circuit twice.
      </p>
      <Definition title="The parameter-shift rule">
        For a gate with angle θ, the derivative of the output equals the difference between running the circuit at θ + π/2 and
        θ − π/2 — same circuit, two shifted parameter values, no finite-difference approximation.
      </Definition>
      <Equation
        math={`\\frac{\\partial f}{\\partial \\theta} = \\tfrac{1}{2}\\big[\\, f(\\theta + \\tfrac{\\pi}{2}) - f(\\theta - \\tfrac{\\pi}{2}) \\,\\big]`}
        gloss={<>evaluate the model at two macroscopically shifted angles and subtract — an exact gradient, because the output is a sinusoid in θ.</>}
      />
      <p>
        In the demo, the two shifted runs are drawn explicitly. The cost: two circuit evaluations per parameter, so the
        gradient is linear in the number of parameters — more expensive than backprop's single reverse pass, but it is the
        real gradient, computable on hardware that can only be measured, not inspected.
      </p>
      <CompareTable rows={[
        { classical: 'backprop (chain rule)', quantum: 'parameter-shift (θ ± π/2)' },
        { classical: 'one backward pass', quantum: 'two forward passes per parameter' },
        { classical: 'needs cached activations', quantum: 'needs only measurable outputs' },
      ]} />
    </div>
  )
}

export function U4L2() {
  return (
    <div className="flex flex-col gap-4 text-sm text-q-sub leading-relaxed">
      <p>
        QNN training is a <strong className="text-q-text">hybrid loop</strong>: the quantum device only evaluates the forward
        pass and the parameter-shift gradients; an ordinary classical optimizer (Adam, SGD, …) living on your CPU proposes the
        next θ. This is why these are called variational algorithms.
      </p>
      <Equation
        math={`\\theta_{t+1} = \\theta_t - \\eta\\, \\nabla_\\theta \\mathcal{L}(\\theta_t)`}
        gloss={<>the update is plain gradient descent — the only difference is that f(x,θ) and its gradient are measured on a QPU rather than computed in NumPy.</>}
      />
      <CompareTable rows={[
        { classical: 'forward pass on GPU', quantum: 'forward pass on QPU (shots)' },
        { classical: 'autograd gradient', quantum: 'parameter-shift gradient' },
        { classical: 'optimizer on CPU', quantum: 'optimizer on CPU (unchanged)' },
      ]} />
      <p>
        Because the optimizer is classical and unchanged, all your tooling transfers. The genuinely new difficulties are
        quantum-specific: shot noise in the gradient estimate, hardware noise, and the trainability wall we hit next.
      </p>
    </div>
  )
}

export function U4L3() {
  return (
    <div className="flex flex-col gap-4 text-sm text-q-sub leading-relaxed">
      <p>
        The defining obstacle of QNN training. Classical deep nets can suffer vanishing gradients; quantum nets suffer a far
        worse version called the <strong className="text-q-text">barren plateau</strong>.
      </p>
      <Equation
        math={`\\mathrm{Var}\\!\\left[\\frac{\\partial \\mathcal{L}}{\\partial \\theta_k}\\right] \\in \\mathcal{O}\\!\\left(\\frac{1}{2^{n}}\\right)`}
        gloss={<>the gradient's variance shrinks exponentially in the number of qubits — every qubit you add roughly halves the signal, so the loss landscape flattens into a featureless desert.</>}
      />
      <Definition title="Why it is exponential, not polynomial">
        A sufficiently random/deep ansatz behaves like a uniformly random unitary (a "2-design"), which spreads the state so
        evenly that the loss is almost the same everywhere. There is no slope to descend — gradients are not just small, they
        are exponentially small, and shot noise drowns them entirely.
      </Definition>
      <p>
        Crank qubits and depth in the simulator: the landscape goes flat. Mitigations are an active research area — local
        (not global) cost functions, shallow or structured ansätze, smart initialization, layerwise training — but barren
        plateaus remain the central reason naive "make it bigger" does not work for QNNs.
      </p>
      <CompareTable rows={[
        { classical: 'vanishing gradient (poly decay)', quantum: 'barren plateau (exp decay)' },
        { classical: 'fix: residuals, norm, init', quantum: 'fix: local costs, shallow/structured ansatz' },
      ]} />
    </div>
  )
}

export function U4L4() {
  return (
    <div className="flex flex-col gap-4 text-sm text-q-sub leading-relaxed">
      <p>
        Everything so far is NISQ-friendly. With a future fault-tolerant machine, a different toolbox of training speedups
        opens up — provable, but requiring hardware that does not yet exist. A quick survey.
      </p>
      <Definition title="Grover → quantum perceptron">
        Perceptron training is a search for a misclassified example. Grover's algorithm searches an unstructured set of size d
        in O(√d) instead of O(d), giving a quadratic speedup in the perceptron's training queries.
      </Definition>
      <Definition title="Quantum BLAS / HHL matrix inversion">
        Linear models and least-squares reduce to solving linear systems. The HHL algorithm inverts a (sparse, well-conditioned)
        matrix in time polylogarithmic in its size — but remember the read-in/read-out caveat: you get the solution as a state,
        not as readable numbers.
      </Definition>
      <Definition title="Amplitude amplification & annealing">
        Amplitude amplification generalizes Grover for sampling-based training. Quantum annealing takes a different route
        entirely: encode the loss as an energy landscape and let the hardware relax toward the minimum.
      </Definition>
      <CompareTable rows={[
        { classical: 'find misclassified: O(d)', quantum: 'Grover: O(√d)' },
        { classical: 'solve Ax=b: O(N)', quantum: 'HHL: O(log N) (with caveats)' },
        { classical: 'gradient descent', quantum: 'anneal to the energy minimum' },
      ]} />
      <PaperRemark source="Reality check">
        These are asymptotic, FTQC-era results. They show advantage is possible in principle for learning, but none run usefully
        on today's noisy hardware.
      </PaperRemark>
    </div>
  )
}
