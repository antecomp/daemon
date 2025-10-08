[**daemon**](../../../../README.md)

***

# Interface: InteractableComponent

Defined in: [src/core/interaction/interactable.types.ts:38](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/interaction/interactable.types.ts#L38)

## Properties

### interactions?

> `optional` **interactions**: [`InteractionMap`](../type-aliases/InteractionMap.md)

Defined in: [src/core/interaction/interactable.types.ts:49](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/interaction/interactable.types.ts#L49)

Map of interaction modes to a CB to run for handling that interaction type.
Used by YBillboard and Interactable.

An InteractionMap can either be an object that maps to the enum directly, or you can just shorthand as an array of `[interact(), chat(), observe()]`

***

### onClick?

> `optional` **onClick**: [`interactionCB`](../type-aliases/interactionCB.md)

Defined in: [src/core/interaction/interactable.types.ts:40](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/interaction/interactable.types.ts#L40)

interactionCB that runs regardless of interaction mode, for any user click.

***

### onHover?

> `optional` **onHover**: [`interactionCB`](../type-aliases/interactionCB.md)

Defined in: [src/core/interaction/interactable.types.ts:42](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/interaction/interactable.types.ts#L42)

interactionCB that runs regardless of interaction mode, on mouse over (as in, raycast hit)

***

### onHoverLeave()?

> `optional` **onHoverLeave**: () => `void`

Defined in: [src/core/interaction/interactable.types.ts:51](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/interaction/interactable.types.ts#L51)

CB that runs regardless of interaction mode, when mouse leaves.

#### Returns

`void`
