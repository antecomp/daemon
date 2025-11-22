[**daemon**](../../../../../README.md)

***

# Enumeration: BattleUIState

Defined in: [src/features/battle/bridge/battleEngineBridge.ts:34](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/features/battle/bridge/battleEngineBridge.ts#L34)

UI States for various stages in battle execution, used to conditionally lock some components.

## Enumeration Members

### END

> **END**: `3`

Defined in: [src/features/battle/bridge/battleEngineBridge.ts:42](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/features/battle/bridge/battleEngineBridge.ts#L42)

Battle end state, (temporary lock while closing animation plays)

***

### EXECUTING

> **EXECUTING**: `2`

Defined in: [src/features/battle/bridge/battleEngineBridge.ts:40](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/features/battle/bridge/battleEngineBridge.ts#L40)

Running the clashes, animations and whatnot, (round execute)

***

### READY

> **READY**: `1`

Defined in: [src/features/battle/bridge/battleEngineBridge.ts:38](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/features/battle/bridge/battleEngineBridge.ts#L38)

User input of correct size, waiting for "execute"

***

### WAITING

> **WAITING**: `0`

Defined in: [src/features/battle/bridge/battleEngineBridge.ts:36](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/features/battle/bridge/battleEngineBridge.ts#L36)

Waiting for user input (building sequence)
