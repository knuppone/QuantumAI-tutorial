/**
 * Small, dependency-free linear algebra for the "quantum-inspired" lessons.
 * Tensor-network / low-rank compression boils down to the truncated SVD, so we
 * implement a one-sided Jacobi SVD that is numerically stable for the small
 * matrices used in the demos (≤ ~16×16). A = U · diag(s) · Vᵀ.
 */

export interface SVD {
  /** m×n, orthonormal columns (left singular vectors). */
  U: number[][]
  /** length-n singular values, sorted descending. */
  s: number[]
  /** n×n, orthonormal columns (right singular vectors). */
  V: number[][]
}

function identity(n: number): number[][] {
  return Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)))
}

/** One-sided Jacobi SVD of a real m×n matrix (m ≥ n recommended; works for square). */
export function svd(A: number[][]): SVD {
  const m = A.length
  const n = A[0].length
  // W = A·V, rotated in place; V accumulates the right rotations.
  const W = A.map((row) => row.slice())
  const V = identity(n)
  const eps = 1e-12
  const maxSweeps = 60

  for (let sweep = 0; sweep < maxSweeps; sweep++) {
    let off = 0
    for (let i = 0; i < n - 1; i++) {
      for (let j = i + 1; j < n; j++) {
        let alpha = 0, beta = 0, gamma = 0
        for (let k = 0; k < m; k++) {
          alpha += W[k][i] * W[k][i]
          beta += W[k][j] * W[k][j]
          gamma += W[k][i] * W[k][j]
        }
        off += gamma * gamma
        if (Math.abs(gamma) < eps * Math.sqrt(alpha * beta) || alpha === 0 || beta === 0) continue
        const zeta = (beta - alpha) / (2 * gamma)
        const t = Math.sign(zeta) / (Math.abs(zeta) + Math.sqrt(1 + zeta * zeta))
        const c = 1 / Math.sqrt(1 + t * t)
        const sR = c * t
        for (let k = 0; k < m; k++) {
          const wi = W[k][i], wj = W[k][j]
          W[k][i] = c * wi - sR * wj
          W[k][j] = sR * wi + c * wj
        }
        for (let k = 0; k < n; k++) {
          const vi = V[k][i], vj = V[k][j]
          V[k][i] = c * vi - sR * vj
          V[k][j] = sR * vi + c * vj
        }
      }
    }
    if (off < 1e-28) break
  }

  // Singular values = norms of W columns; U columns = normalized W columns.
  const s = new Array(n).fill(0)
  const U = Array.from({ length: m }, () => new Array(n).fill(0))
  for (let j = 0; j < n; j++) {
    let norm = 0
    for (let k = 0; k < m; k++) norm += W[k][j] * W[k][j]
    norm = Math.sqrt(norm)
    s[j] = norm
    if (norm > 1e-13) for (let k = 0; k < m; k++) U[k][j] = W[k][j] / norm
  }

  // Sort by singular value descending, permuting U and V columns to match.
  const order = Array.from({ length: n }, (_, j) => j).sort((a, b) => s[b] - s[a])
  const sS = order.map((j) => s[j])
  const sortCols = (M: number[][]) => M.map((row) => order.map((j) => row[j]))
  return { U: sortCols(U), s: sS, V: sortCols(V) }
}

/** Best rank-`rank` approximation of A: Σ_{r<rank} s_r · u_r · v_rᵀ (Eckart–Young optimal). */
export function lowRankApprox(A: number[][], rank: number): number[][] {
  const m = A.length
  const n = A[0].length
  const { U, s, V } = svd(A)
  const r = Math.max(0, Math.min(rank, s.length))
  const out = Array.from({ length: m }, () => new Array(n).fill(0))
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      let acc = 0
      for (let k = 0; k < r; k++) acc += s[k] * U[i][k] * V[j][k]
      out[i][j] = acc
    }
  }
  return out
}

/** Frobenius norm of the difference A − B. */
export function frobeniusError(A: number[][], B: number[][]): number {
  let acc = 0
  for (let i = 0; i < A.length; i++)
    for (let j = 0; j < A[0].length; j++) {
      const d = A[i][j] - B[i][j]
      acc += d * d
    }
  return Math.sqrt(acc)
}

/** Numbers stored by a rank-r factorization: r left vectors + r values + r right vectors. */
export function paramCount(rows: number, cols: number, rank: number): number {
  return rank * (rows + cols + 1)
}
