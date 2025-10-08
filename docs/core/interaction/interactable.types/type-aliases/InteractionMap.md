[**daemon**](../../../../README.md)

***

# Type Alias: InteractionMap

> **InteractionMap** = `{ [mode in InteractionMode]?: interactionCB }` \| \[[`interactionCB`](interactionCB.md)?, [`interactionCB`](interactionCB.md)?, [`interactionCB`](interactionCB.md)?\]

Defined in: [src/core/interaction/interactable.types.ts:34](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/interaction/interactable.types.ts#L34)

Map of interaction modes to a CB to run for handling that interaction type.
Used by YBillboard and Interactable

A map can either be an object that maps to the enum directly, or you can just shorthand as an array of [interact(), chat(), observe()]
