[**daemon**](../../../../README.md)

***

# Function: default()

> **default**\<`I`\>(`a`, `b`): `I`

Defined in: [src/shared/utils/twoLevelMerge.ts:24](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/shared/utils/twoLevelMerge.ts#L24)

Shallowly merges an object-of-objects with per-key overlays.

Behavior:
- For each outer key K in `a`, merges `b[K]` (if present) into `a[K]`.
- Only keys already present in `a` are considered; extra keys in `b` are ignored.
- Merges are shallow at the inner level; nested objects are not deep-merged.
- Returns a new outer object; inner values for keys not present in `b` are reused by reference.

Type safety:
- `I` is the shape of `a`, where each value is an object-like record.
- `b` is a partial overlay keyed by `keyof I`; each overlay is `Partial<I[K]>`.
- The result preserves the exact shape of `I`.

## Type Parameters

### I

`I` *extends* `Record`\<`string`, `Record`\<`string`, `any`\>\>

## Parameters

### a

`I`

### b

\{ \[P in string \| number \| symbol\]?: Partial\<I\[P\]\> \}

## Returns

`I`

## Example

```ts
const base = { x: { a: 1, b: 2 }, y: { c: 3 } };
const overlay = { x: { b: 20 }, z: { w: 9 } }; // 'z' is ignored
twoLevelMerge(base, overlay)
  => { x: { a: 1, b: 20 }, y: { c: 3 } }
```
