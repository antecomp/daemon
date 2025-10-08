[**daemon**](../../../../../README.md)

***

# Interface: MoveContext

Defined in: [src/core/battle/moves/moves.types.ts:37](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/moves/moves.types.ts#L37)

Contextual information provided during the execution of a move. This includes
details about the actors involved, the sequence of moves, and utility functions
for appending action messages.

## Properties

### appendActionMessage

> **appendActionMessage**: [`ActionMessageAppender`](../../../engine/battle.types/type-aliases/ActionMessageAppender.md)

Defined in: [src/core/battle/moves/moves.types.ts:44](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/moves/moves.types.ts#L44)

***

### index

> **index**: `number`

Defined in: [src/core/battle/moves/moves.types.ts:41](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/moves/moves.types.ts#L41)

***

### movePerspective

> **movePerspective**: [`MovePerspective`](../enumerations/MovePerspective.md)

Defined in: [src/core/battle/moves/moves.types.ts:40](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/moves/moves.types.ts#L40)

***

### opponent

> **opponent**: [`Actor`](../../../engine/actor/classes/Actor.md)

Defined in: [src/core/battle/moves/moves.types.ts:39](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/moves/moves.types.ts#L39)

***

### self

> **self**: [`Actor`](../../../engine/actor/classes/Actor.md)

Defined in: [src/core/battle/moves/moves.types.ts:38](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/moves/moves.types.ts#L38)

***

### sequence

> **sequence**: [`Move`](Move.md)[]

Defined in: [src/core/battle/moves/moves.types.ts:42](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/moves/moves.types.ts#L42)

***

### sequenceBuffer

> **sequenceBuffer**: `SequenceBuffer`

Defined in: [src/core/battle/moves/moves.types.ts:43](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/moves/moves.types.ts#L43)
