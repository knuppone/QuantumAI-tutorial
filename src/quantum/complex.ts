/** A complex number [re, im]. */
export type C = readonly [number, number]

export const c = (re: number, im: number): C => [re, im]
export const ZERO: C = [0, 0]
export const ONE: C = [1, 0]
export const I: C = [0, 1]

export function add(a: C, b: C): C {
  return [a[0] + b[0], a[1] + b[1]]
}

export function sub(a: C, b: C): C {
  return [a[0] - b[0], a[1] - b[1]]
}

export function mul(a: C, b: C): C {
  return [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]]
}

export function scale(a: C, s: number): C {
  return [a[0] * s, a[1] * s]
}

export function conj(a: C): C {
  return [a[0], -a[1]]
}

export function abs2(a: C): number {
  return a[0] * a[0] + a[1] * a[1]
}

export function abs(a: C): number {
  return Math.sqrt(abs2(a))
}

/** e^(i*theta) */
export function expI(theta: number): C {
  return [Math.cos(theta), Math.sin(theta)]
}

/** 2×2 complex matrix as flat array [a,b,c,d] = [[a,b],[c,d]] */
export type M2 = readonly [C, C, C, C]

export function matMul(A: M2, B: M2): M2 {
  return [
    add(mul(A[0], B[0]), mul(A[1], B[2])),
    add(mul(A[0], B[1]), mul(A[1], B[3])),
    add(mul(A[2], B[0]), mul(A[3], B[2])),
    add(mul(A[2], B[1]), mul(A[3], B[3])),
  ]
}

export function matVec(M: M2, v: [C, C]): [C, C] {
  return [add(mul(M[0], v[0]), mul(M[1], v[1])), add(mul(M[2], v[0]), mul(M[3], v[1]))]
}
