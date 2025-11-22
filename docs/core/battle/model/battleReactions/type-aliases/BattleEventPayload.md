[**daemon**](../../../../../README.md)

***

# Type Alias: BattleEventPayload

> **BattleEventPayload** = `object`

Defined in: [src/core/battle/model/battleReactions.ts:24](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/battle/model/battleReactions.ts#L24)

Payload shape for each of the battle events (lifecycle stages). Provided by battleEngine.
Update as needed.

## Properties

### BattleEnd

> **BattleEnd**: `object`

Defined in: [src/core/battle/model/battleReactions.ts:65](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/battle/model/battleReactions.ts#L65)

#### combatants

> **combatants**: [`Sides`](../../../utils/sides.utils/type-aliases/Sides.md)\<[`Combatant`](../../combatant/classes/Combatant.md)\>

#### outcome

> **outcome**: [`BattleOutcome`](../../battle/enumerations/BattleOutcome.md)

***

### DamagesApplied

> **DamagesApplied**: `object`

Defined in: [src/core/battle/model/battleReactions.ts:51](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/battle/model/battleReactions.ts#L51)

#### combatants

> **combatants**: [`Sides`](../../../utils/sides.utils/type-aliases/Sides.md)\<[`Combatant`](../../combatant/classes/Combatant.md)\>

#### damagesDealt

> **damagesDealt**: [`Sides`](../../../utils/sides.utils/type-aliases/Sides.md)\<`number`\>

***

### MoveEmission

> **MoveEmission**: `object`

Defined in: [src/core/battle/model/battleReactions.ts:70](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/battle/model/battleReactions.ts#L70)

#### moveName

> **moveName**: `string`

#### perspective

> **perspective**: [`Side`](../../../utils/sides.utils/type-aliases/Side.md)

#### signal

> **signal**: [`MoveSignal`](../../move.types/type-aliases/MoveSignal.md)

***

### MoveEnd

> **MoveEnd**: `object`

Defined in: [src/core/battle/model/battleReactions.ts:59](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/battle/model/battleReactions.ts#L59)

#### combatants

> **combatants**: [`Sides`](../../../utils/sides.utils/type-aliases/Sides.md)\<[`Combatant`](../../combatant/classes/Combatant.md)\>

***

### MoveStart

> **MoveStart**: `object`

Defined in: [src/core/battle/model/battleReactions.ts:33](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/battle/model/battleReactions.ts#L33)

#### moveIndex

> **moveIndex**: `number`

#### moves

> **moves**: [`Sides`](../../../utils/sides.utils/type-aliases/Sides.md)\<[`Move`](../../move.types/interfaces/Move.md)\>

#### plans

> **plans**: [`Sides`](../../../utils/sides.utils/type-aliases/Sides.md)\<[`PlannedSequence`](../../plannedMove/type-aliases/PlannedSequence.md)\>

#### sequences

> **sequences**: [`Sides`](../../../utils/sides.utils/type-aliases/Sides.md)\<[`Move`](../../move.types/interfaces/Move.md)[]\>

***

### MultipliersComputed

> **MultipliersComputed**: `object`

Defined in: [src/core/battle/model/battleReactions.ts:43](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/battle/model/battleReactions.ts#L43)

#### combatants

> **combatants**: [`Sides`](../../../utils/sides.utils/type-aliases/Sides.md)\<[`Combatant`](../../combatant/classes/Combatant.md)\>

#### damageMultipliers

> **damageMultipliers**: [`Sides`](../../../utils/sides.utils/type-aliases/Sides.md)\<[`DamageMultipliers`](../../battle/type-aliases/DamageMultipliers.md)\>

#### moveIndex

> **moveIndex**: `number`

#### moves

> **moves**: [`Sides`](../../../utils/sides.utils/type-aliases/Sides.md)\<[`Move`](../../move.types/interfaces/Move.md)\>

#### plannedSequences

> **plannedSequences**: [`Sides`](../../../utils/sides.utils/type-aliases/Sides.md)\<[`PlannedSequence`](../../plannedMove/type-aliases/PlannedSequence.md)\>

#### preEffectOutcomes

> **preEffectOutcomes**: [`Sides`](../../../utils/sides.utils/type-aliases/Sides.md)\<[`MoveSideEffectOutcome`](../../move.types/enumerations/MoveSideEffectOutcome.md) \| `undefined`\>

***

### PostEffectResolved

> **PostEffectResolved**: `object`

Defined in: [src/core/battle/model/battleReactions.ts:55](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/battle/model/battleReactions.ts#L55)

#### combatants

> **combatants**: [`Sides`](../../../utils/sides.utils/type-aliases/Sides.md)\<[`Combatant`](../../combatant/classes/Combatant.md)\>

#### postEffectOutcomes

> **postEffectOutcomes**: [`Sides`](../../../utils/sides.utils/type-aliases/Sides.md)\<[`MoveSideEffectOutcome`](../../move.types/enumerations/MoveSideEffectOutcome.md) \| `undefined`\>

***

### PreEffectResolved

> **PreEffectResolved**: `object`

Defined in: [src/core/battle/model/battleReactions.ts:39](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/battle/model/battleReactions.ts#L39)

#### combatants

> **combatants**: [`Sides`](../../../utils/sides.utils/type-aliases/Sides.md)\<[`Combatant`](../../combatant/classes/Combatant.md)\>

#### preEffectOutcomes

> **preEffectOutcomes**: [`Sides`](../../../utils/sides.utils/type-aliases/Sides.md)\<[`MoveSideEffectOutcome`](../../move.types/enumerations/MoveSideEffectOutcome.md) \| `undefined`\>

***

### RoundEnd

> **RoundEnd**: `object`

Defined in: [src/core/battle/model/battleReactions.ts:62](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/battle/model/battleReactions.ts#L62)

#### combatants

> **combatants**: [`Sides`](../../../utils/sides.utils/type-aliases/Sides.md)\<[`Combatant`](../../combatant/classes/Combatant.md)\>

***

### RoundPrepared

> **RoundPrepared**: `object`

Defined in: [src/core/battle/model/battleReactions.ts:25](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/battle/model/battleReactions.ts#L25)

#### combatants

> **combatants**: [`Sides`](../../../utils/sides.utils/type-aliases/Sides.md)\<[`Combatant`](../../combatant/classes/Combatant.md)\>

#### opponentPlan

> **opponentPlan**: [`PlannedSequence`](../../plannedMove/type-aliases/PlannedSequence.md)

***

### RoundStart

> **RoundStart**: `object`

Defined in: [src/core/battle/model/battleReactions.ts:29](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/battle/model/battleReactions.ts#L29)

#### combatants

> **combatants**: [`Sides`](../../../utils/sides.utils/type-aliases/Sides.md)\<[`Combatant`](../../combatant/classes/Combatant.md)\>

#### plans

> **plans**: [`Sides`](../../../utils/sides.utils/type-aliases/Sides.md)\<[`PlannedSequence`](../../plannedMove/type-aliases/PlannedSequence.md)\>
