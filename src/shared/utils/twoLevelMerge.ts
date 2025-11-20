import { mapObject } from "./mapObject";

/**
 * Shallowly merges an object-of-objects with per-key overlays.
 *
 * Behavior:
 * - For each outer key K in `a`, merges `b[K]` (if present) into `a[K]`.
 * - Only keys already present in `a` are considered; extra keys in `b` are ignored.
 * - Merges are shallow at the inner level; nested objects are not deep-merged.
 * - Returns a new outer object; inner values for keys not present in `b` are reused by reference.
 *
 * Type safety:
 * - `I` is the shape of `a`, where each value is an object-like record.
 * - `b` is a partial overlay keyed by `keyof I`; each overlay is `Partial<I[K]>`.
 * - The result preserves the exact shape of `I`.
 *
 * @example
 * const base = { x: { a: 1, b: 2 }, y: { c: 3 } };
 * const overlay = { x: { b: 20 }, z: { w: 9 } }; // 'z' is ignored
 * twoLevelMerge(base, overlay)
 *   => { x: { a: 1, b: 20 }, y: { c: 3 } }
 *
*/
export default function twoLevelMerge<
    I extends Record<string, (Record<string, any>)>>(
    a: I, 
    b: {[P in keyof I]?: Partial<I[P]>} // What is this god forsaken type
) {
    return mapObject(a, (inner, key) => ({...inner, ...b[key]})) as I;
}

// this works :)
//console.log(twoLevelMerge({x: {e: 'hi', b: 'bhdfs'}}, {x: {e: 'bye'}}));