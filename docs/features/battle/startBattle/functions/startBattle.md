[**daemon**](../../../../README.md)

***

# Function: startBattle()

> **startBattle**(`opponentProfile`): `Promise`\<[`BattleOutcome`](../../../../core/battle/model/battle/enumerations/BattleOutcome.md)\>

Defined in: [src/features/battle/startBattle.tsx:21](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/features/battle/startBattle.tsx#L21)

Initializes a new battle and adds it as a UI layer.

## Parameters

### opponentProfile

[`OpponentProfile`](../../bridge/battleProfiles/interfaces/OpponentProfile.md)

OpponentProfile representing the opponent for this battle.

## Returns

`Promise`\<[`BattleOutcome`](../../../../core/battle/model/battle/enumerations/BattleOutcome.md)\>

a promise of the battle result (to properly await and respond to battle completion)
