# Quantum AI Explainer

An interactive, intuition-first curriculum that teaches **quantum machine learning to people with an ML background** — every concept is mapped onto something you already know (embeddings, dense layers, attention, backprop, softmax) and paired with a *live* widget you can manipulate.

Like the Transformer Explainer, but for variational quantum circuits — and the applied quantum stack around them.

## What's inside

- **Guided course — 9 units, 31 lessons.** A sequenced, progress-tracked path:
  - **0 – Why quantum for ML?** the map and the honest caveat
  - **1 – Loading data into qubits** encodings & the read-in/read-out bottleneck
  - **2 – Inference as geometry** interference classifier, quantum kernels, concentration
  - **3 – A trainable quantum model** PQC = a layer, entanglement = the non-linearity, measurement = softmax
  - **4 – Training** parameter-shift gradients, the hybrid loop, barren plateaus
  - **5 – Models & frontiers** energy-based models, variational classifiers, the quantum transformer
  - **6 – Quantum-inspired AI** tensor networks & low-rank compression (runs classically now)
  - **7 – Optimization & NISQ engineering** QUBO/QAOA, noise, shots, error mitigation
  - **8 – Hybrid orchestration** the "quantum OS", backends, and the hardware landscape
- **Playground** — 6 standalone interactive modules (embedding, PQC sandbox, entanglement, measurement, parameter-shift, barren plateau).
- **Study guide** — chapter notes from the source material with self-check questions.
- **Interactive widgets** — Bloch sphere, circuit board, probability histograms, encoding explorer, interference classifier, kernel visualizer, SVD compression explorer, QAOA optimization playground, and a NISQ noise + zero-noise-extrapolation lab. All touch-enabled.
- **Automatic mobile/desktop detection** — a hamburger-drawer mobile layout with a manual "Desktop site" override; single-codebase, responsive.

The lessons draw on three sources: Schuld & Petruccione (*Supervised Learning with Quantum Computers*), Du et al. 2025 (*QML: A Hands-on Tutorial*, arXiv:2502.01146), and applied industry practice.

## Tech stack

React 18 · TypeScript · Vite 6 · Tailwind CSS · Zustand · Framer Motion · Three.js (react-three-fiber) · KaTeX · Vitest.

A small dependency-free quantum engine lives in `src/quantum/` (statevector simulation, gates, encodings, density matrices, parameter-shift gradients, kernels, tensor-network SVD, QUBO/QAOA, and a noise model).

## Getting started

```bash
npm install
npm run dev        # http://localhost:5173  (also exposed on your LAN at http://<your-ip>:5173)
```

### Other scripts

```bash
npm run build      # type-check (tsc -b) + production build to dist/
npm run preview    # serve the production build
npm run test       # run the Vitest suite (engine unit tests)
```

## Project layout

```
src/
├── App.tsx                 # shell: landing, course, playground, study-guide views
├── course/                 # curriculum data + lesson content + course shell
│   ├── curriculum.ts       # the 9 units / 31 lessons (data-driven)
│   ├── lessons/            # lesson prose components (unit0…unit8)
│   ├── CourseShell.tsx     # guided-course UI + progress
│   └── progressStore.ts    # persisted lesson progress
├── modules/                # the 6 playground modules + study guide
├── components/             # reusable visuals (Bloch sphere, circuit board, …)
│   └── widgets/            # course-specific interactive widgets
├── quantum/                # the quantum/linear-algebra engine (+ __tests__)
├── responsive/             # device detection + mobile nav drawer
└── store/                  # circuit state (Zustand)
```

## Note on quantum advantage

The curriculum is deliberately honest: it explains where quantum *could* help and is explicit that a real-world advantage on most of these workloads is still unproven. The goal is intuition and clarity, not hype.
