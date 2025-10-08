[**daemon**](../../../../../README.md)

***

# Interface: ActionMessage

Defined in: [src/core/battle/engine/battle.types.ts:78](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/engine/battle.types.ts#L78)

Represents a message (flair text) associated with an action in the battle engine.  *

## Properties

### icon?

> `optional` **icon**: `"default"` \| `"focus"` \| `"heal"` \| `"mania"`

Defined in: [src/core/battle/engine/battle.types.ts:79](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/engine/battle.types.ts#L79)

An optional key referencing an icon, registered in the ActionIconTable.

***

### text

> **text**: `string`

Defined in: [src/core/battle/engine/battle.types.ts:80](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/engine/battle.types.ts#L80)

The text content of the action message.
