
/**
 * Computes the mathematical modulo of `n` by `m`, normalized to the range [0, m).
*  Differs from normal (%) mod operator with how signage is handled.
 * @param n - The dividend.
 * @param m - The divisor.
 * @returns The **non-negative** remainder of `n` modulo `m`.
 */
export default function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}