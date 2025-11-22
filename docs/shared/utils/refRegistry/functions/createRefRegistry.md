[**daemon**](../../../../README.md)

***

# Function: createRefRegistry()

> **createRefRegistry**\<`K`\>(): `object`

Defined in: [src/shared/utils/refRegistry.ts:52](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/shared/utils/refRegistry.ts#L52)

Creates a typed element reference registry and an attacher for a finite set
of keys. The generic parameter `K` defines the only allowed key strings.

Because `K` cannot be inferred (there are no value parameters), you must
provide a type argument that is a tuple of string literals.

## Type Parameters

### K

`K` *extends* readonly `string`[]

Tuple of allowed key strings.

## Returns

`object`

Object containing:
  - `attachToRegistry`: Registers an `HTMLElement` for a given key.
  - `refRegistry`: Backing map of key → `HTMLElement | undefined`.

### attachToRegistry

> **attachToRegistry**: [`RegistryAttacher`](../type-aliases/RegistryAttacher.md)\<`K`\>

### refRegistry

> **refRegistry**: [`Registry`](../type-aliases/Registry.md)\<`K`\>

## Examples

```ts
// Using a type alias:
type Keys = ["egg", "slop", "stew"];
const { attachToRegistry, refRegistry } = createRefRegistry<Keys>();
attachToRegistry("egg", document.createElement("div"));
const node = refRegistry.egg; // HTMLElement | undefined
```

```ts
// Using a const tuple value type:
const KEYS = ["egg", "slop", "stew"] as const;
const { attachToRegistry, refRegistry } = createRefRegistry<typeof KEYS>();
attachToRegistry("slop", document.createElement("div"));
const maybeEl = refRegistry.slop; // HTMLElement | undefined
```
