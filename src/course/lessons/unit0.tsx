import { Definition, Equation, PaperRemark } from '../../components/TeachPrimitives'
import { CompareTable } from '../../components/TeachPanel'

export function U0L1() {
  return (
    <div className="flex flex-col gap-4 text-sm text-q-sub leading-relaxed">
      <p>
        You already know how to train a model: embed the input, push it through layers of weights and
        non-linearities, read out a prediction, and use gradients to improve. Quantum machine learning (QML)
        keeps <em className="text-q-text">that exact pipeline</em> and swaps the implementation of each box for a
        quantum one. Nothing about the <em>goal</em> changes — only the machine doing the linear algebra.
      </p>

      <Definition title="QML, informally">
        Learning algorithms executed on a quantum computer to accomplish a task with a <strong className="text-q-text">potential advantage</strong> over
        the classical version. The three ingredients: a quantum processor, a learning task, and a hoped-for advantage.
      </Definition>

      <p>People split QML into four quadrants by <em>what kind of data</em> and <em>what kind of computer</em>:</p>
      <CompareTable rows={[
        { classical: 'CC — classical algo, classical data', quantum: 'ordinary ML (GPT, ResNet). Not this course.' },
        { classical: 'CQ — classical algo, quantum data', quantum: 'use ML to study quantum systems' },
        { classical: 'QC — quantum algo, classical data', quantum: 'the main focus: kernels, QNNs' },
        { classical: 'QQ — quantum algo, quantum data', quantum: 'learn directly on quantum states' },
      ]} />

      <p>
        And by <em>what hardware era</em> you target. Today we are in the <strong className="text-q-text">NISQ</strong> era
        (noisy, ~hundreds of qubits, shallow circuits). The fault-tolerant <strong className="text-q-text">FTQC</strong> era
        (error-corrected, deep circuits) is where the big asymptotic speedups live — but it needs hardware that does not exist yet.
      </p>
      <CompareTable rows={[
        { classical: 'NISQ — now', quantum: 'noisy qubits, shallow PQCs + kernels' },
        { classical: 'FTQC — 2030s+', quantum: 'error-corrected, HHL / quantum transformer' },
      ]} />

      <PaperRemark source="Where this course comes from">
        We union two books written for ML people: Schuld &amp; Petruccione's <em>Supervised Learning with Quantum
        Computers</em> (the intuition + foundations) and Du et al.'s 2025 hands-on tutorial (the modern NISQ-era picture).
      </PaperRemark>
    </div>
  )
}

export function U0L2() {
  return (
    <div className="flex flex-col gap-4 text-sm text-q-sub leading-relaxed">
      <p>
        Before we get excited, the honest part. "Quantum advantage" is not one thing — there are three different
        axes on which a quantum learner could beat a classical one, and a method can win on one while losing on the others.
      </p>

      <CompareTable rows={[
        { classical: 'Computational complexity', quantum: 'fewer operations to run the model?' },
        { classical: 'Sample complexity', quantum: 'fewer training examples to learn?' },
        { classical: 'Model complexity', quantum: 'richer hypothesis class for the same size?' },
      ]} />

      <p>
        Some of these have <em>provable</em> quantum advantages — but usually on artificial, quantum-flavoured
        datasets (e.g. data built from the discrete-logarithm problem). For generic real-world tabular/image/text data
        drawn i.i.d. from nature, <strong className="text-q-text">no proven advantage exists</strong>, and quantum models
        often underperform a good classical baseline.
      </p>

      <Equation
        math={`\\text{advantage} = f(\\text{task},\\, \\text{data structure},\\, \\text{hardware era})`}
        gloss={<>advantage is conditional — it depends on the problem having the right structure, not on "quantum" being magic.</>}
      />

      <PaperRemark source="The mindset for this course">
        Treat every claimed speedup as "advantage on <em>which</em> task, under <em>which</em> hardware assumptions, paying
        <em> which</em> read-in/read-out cost?" That single habit will keep you grounded through the rest of the units.
      </PaperRemark>
    </div>
  )
}
