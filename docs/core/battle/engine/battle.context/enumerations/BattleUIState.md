[**daemon**](../../../../../README.md)

***

# Enumeration: BattleUIState

Defined in: [src/core/battle/engine/battle.context.ts:12](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/engine/battle.context.ts#L12)

State machine for the Battle UI.

## State

WAITING: Waiting for player input.

## State

READY: Player has selected a move and is ready to execute

## State

EXECUTING: Sequence is being executed (animations, damage calculations, etc)

## State

END: Battle has ended, either by player defeat or victory.

Battle starts in WAITING state. Goes Waiting -> Ready -> Executing -> Back to Waiting (or end)

## Enumeration Members

### END

> **END**: `3`

Defined in: [src/core/battle/engine/battle.context.ts:14](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/engine/battle.context.ts#L14)

***

### EXECUTING

> **EXECUTING**: `2`

Defined in: [src/core/battle/engine/battle.context.ts:13](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/engine/battle.context.ts#L13)

***

### READY

> **READY**: `1`

Defined in: [src/core/battle/engine/battle.context.ts:13](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/engine/battle.context.ts#L13)

***

### WAITING

> **WAITING**: `0`

Defined in: [src/core/battle/engine/battle.context.ts:13](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/engine/battle.context.ts#L13)
