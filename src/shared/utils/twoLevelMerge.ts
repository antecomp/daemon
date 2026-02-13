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
    I extends Record<string, (Record<string, any> | undefined)>>(
    a: I, 
    b: {[P in keyof I]?: Partial<I[P]>} // What is this god forsaken type
) {
    return mapObject(a, (inner, key) => ({...inner, ...b[key]})) as I;
}

/**
 * Shallowly merges two object-of-objects and includes new outer keys from `b`.
 *
 * Behavior:
 * - For each outer key in `a`, merges `b[key]` (if present) into `a[key]`.
 * - If a key exists in `b` but not in `a`, that key is added to the result.
 * - Inner merges are shallow; nested objects are not deep-merged.
 * - Returns a new outer object.
 * - For keys from `a` with no overlay in `b`, the original inner value is reused by reference.
 *
 * @typeParam A - Base outer object type.
 * @typeParam B - Overlay outer object type (may include keys not in `A`).
 * @param a Base object.
 * @param b Overlay object.
 * @returns A merged object containing keys from both `a` and `b`.
 *
 * @example
 * const base = { x: { a: 1 }, y: { b: 2 } };
 * const overlay = { x: { a: 3 }, z: { c: 4 } };
 * twoLevelMergeWithNewEntries(base, overlay);
 * // => { x: { a: 3 }, y: { b: 2 }, z: { c: 4 } }
 */
export function twoLevelMergeWithNewEntries<
    A extends Record<string, Record<string, any> | undefined>,
    B extends Record<string, Record<string, any> | undefined>
>(
    a: A,
    b: {[P in keyof B]?: Partial<B[P]>}
) {
    const out: Record<string, any> = {};

    for (const key in a) {
        if (!Object.prototype.hasOwnProperty.call(a, key)) continue;
        const inner = a[key];
        const overlay = b[key];
        out[key] = overlay ? {...inner, ...overlay} : inner;
    }

    for (const key in b) {
        if (!Object.prototype.hasOwnProperty.call(b, key)) continue;
        if (!Object.prototype.hasOwnProperty.call(a, key)) out[key] = b[key];
    }

    return out as A & B;
}

// this works :)
//console.log(twoLevelMerge({x: {e: 'hi', b: 'bhdfs'}}, {x: {e: 'bye'}}));
