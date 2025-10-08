[**daemon**](../../../../README.md)

***

# Function: startBattle()

> **startBattle**(`opponentData`): `Promise`\<[`BattleOutcome`](../../engine/battle.types/enumerations/BattleOutcome.md)\>

Defined in: [src/core/battle/startBattle.tsx:19](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/startBattle.tsx#L19)

Starts a battle with the given opponent data. If a battle is already active, it will log an error and reject the promise.

## Parameters

### opponentData

[`DVOpponentData`](../../engine/battle.types/interfaces/DVOpponentData.md)

The data of the opponent to battle against.

## Returns

`Promise`\<[`BattleOutcome`](../../engine/battle.types/enumerations/BattleOutcome.md)\>

A promise that resolves with the battle outcome.

## Throws

An error if a battle is already active.

## Example

```ts
startBattle(opponentData).then(outcome => {
    // Handle the battle outcome
})
```

## See

 - BattleProps for the properties of the battle component.
 - DVOpponentData for the structure of the opponent data.
 - BattleOutcome for the possible outcomes of the battle.
