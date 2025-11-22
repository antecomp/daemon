[**daemon**](../../../../../README.md)

***

# Function: createUIBridgedBattleEngine()

> **createUIBridgedBattleEngine**(`opponentProfile`, `lexicons`, `onEnd`, `startMeltAnimation`, `requestOverlayAnimation`): `object`

Defined in: [src/features/battle/bridge/battleEngineBridge.ts:64](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/features/battle/bridge/battleEngineBridge.ts#L64)

Contained helper to manage a battleEngine instance and translate emissions to changes in Solid (UI) signals and other UI-based side effects.

## Parameters

### opponentProfile

[`OpponentProfile`](../../battleProfiles/interfaces/OpponentProfile.md)

### lexicons

[`Sides`](../../../../../core/battle/utils/sides.utils/type-aliases/Sides.md)\<[`MoveLexicon`](../../../lexicon/moveLexicon/type-aliases/MoveLexicon.md)\>

### onEnd

(`res`) => `void`

### startMeltAnimation

[`MeltAnimationFn`](../../../../../shared/hooks/createMeltEffect/type-aliases/MeltAnimationFn.md)

### requestOverlayAnimation

[`OverlayAnimationRequester`](../../../animation/overlayAnimations/overlayAnimations.types/type-aliases/OverlayAnimationRequester.md)

## Returns

`object`

### actionMessages

> **actionMessages**: `Accessor`\<[`ActionMessage`](../../../ui/ActionMessages/interfaces/ActionMessage.md)[]\>

### attachToRegistry

> **attachToRegistry**: [`RegistryAttacher`](../../../../../shared/utils/refRegistry/type-aliases/RegistryAttacher.md)\<[`BattleRefNames`](../../../animation/uiAnimations/battleUIRefRegistry/type-aliases/BattleRefNames.md)\>

### battleUIState

> **battleUIState**: `Accessor`\<[`BattleUIState`](../enumerations/BattleUIState.md)\>

### currentClash

> **currentClash**: `Accessor`\<`undefined` \| [`Sides`](../../../../../core/battle/utils/sides.utils/type-aliases/Sides.md)\<\{ `moveName`: `"repeat"` \| `"nothingMove"` \| `"attack"` \| `"observe"` \| `"evade"` \| `"heal"` \| `"prepare"` \| `"defend"` \| `"idle"` \| `"overwhelm"` \| `"mirror"`; `tags`: `undefined` \| [`MoveTags`](../../../../../core/battle/model/move.types/type-aliases/MoveTags.md); \}\>\> = `currentMoveClash`

### currentlyExecutingMoveIndex

> **currentlyExecutingMoveIndex**: `Accessor`\<`null` \| `number`\>

### currentStatusIcons

> **currentStatusIcons**: `Accessor`\<[`Sides`](../../../../../core/battle/utils/sides.utils/type-aliases/Sides.md)\<(`undefined` \| `string`)[]\>\>

### displayMults

> **displayMults**: `Accessor`\<[`Sides`](../../../../../core/battle/utils/sides.utils/type-aliases/Sides.md)\<[`DamageMultipliers`](../../../../../core/battle/model/battle/type-aliases/DamageMultipliers.md)\>\>

### engine

> **engine**: `object`

#### engine.executeRound()

> **executeRound**: (`playerPlan`) => `Promise`\<`void`\>

Execute a round of the battle, given the players move sequence. Expects setupRound to have been run first.

##### Parameters

###### playerPlan

[`PlannedSequence`](../../../../../core/battle/model/plannedMove/type-aliases/PlannedSequence.md)

##### Returns

`Promise`\<`void`\>

#### engine.handleBattleEnd()

> **handleBattleEnd**: (`outcome`) => `Promise`\<`void`\>

Prematurely end a round with a provided resolution. Should only ever be executed when *not* in the middle of an execution.

##### Parameters

###### outcome

[`BattleOutcome`](../../../../../core/battle/model/battle/enumerations/BattleOutcome.md)

##### Returns

`Promise`\<`void`\>

#### engine.setupRound()

> **setupRound**: () => `Promise`\<`void`\>

Generates a new sequence for the opponent, emits round start signals (which can be listened to for setting dependant state)

##### Returns

`Promise`\<`void`\>

### opponentHealthPercentage

> **opponentHealthPercentage**: `Accessor`\<`number`\>

### opponentPlanPreview

> **opponentPlanPreview**: `Accessor`\<(`null` \| `string`)[]\>

### playerHealthPercentage

> **playerHealthPercentage**: `Accessor`\<`number`\>

### setBattleUIState

> **setBattleUIState**: `Setter`\<[`BattleUIState`](../enumerations/BattleUIState.md)\>
