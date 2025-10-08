[**daemon**](../../../../../README.md)

***

# Type Alias: UILayer

> **UILayer** = `object`

Defined in: [src/app/shell/layers/ui-layers.types.ts:23](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/app/shell/layers/ui-layers.types.ts#L23)

Represents a UI layer with its associated properties.

## Properties

### blockBehind?

> `optional` **blockBehind**: `boolean`

Defined in: [src/app/shell/layers/ui-layers.types.ts:28](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/app/shell/layers/ui-layers.types.ts#L28)

(Optional) Whether interactions with layers behind this one are blocked.

***

### component()

> **component**: () => `JSX.Element`

Defined in: [src/app/shell/layers/ui-layers.types.ts:25](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/app/shell/layers/ui-layers.types.ts#L25)

A function that returns the JSX element for the UI layer.

#### Returns

`JSX.Element`

***

### id

> **id**: `string`

Defined in: [src/app/shell/layers/ui-layers.types.ts:24](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/app/shell/layers/ui-layers.types.ts#L24)

A unique identifier for the UI layer.

***

### lock?

> `optional` **lock**: `"sidebar"` \| `"scene"` \| `"all"`

Defined in: [src/app/shell/layers/ui-layers.types.ts:27](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/app/shell/layers/ui-layers.types.ts#L27)

(Optional) The lock state associated with the UI layer.

***

### metaLayer?

> `optional` **metaLayer**: [`MetaLayer`](MetaLayer.md)

Defined in: [src/app/shell/layers/ui-layers.types.ts:26](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/app/shell/layers/ui-layers.types.ts#L26)

(Optional) The meta layer of the UI layer, determining its stacking order.

***

### style?

> `optional` **style**: `JSX.CSSProperties`

Defined in: [src/app/shell/layers/ui-layers.types.ts:29](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/app/shell/layers/ui-layers.types.ts#L29)

(Optional) Custom CSS properties for the UI layer (containing div).
