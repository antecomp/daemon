[**daemon**](../../../../../README.md)

***

# Type Alias: OpponentDisplayPredicateArgs

> **OpponentDisplayPredicateArgs** = `object`

Defined in: [src/features/battle/bridge/battleProfiles.ts:29](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/features/battle/bridge/battleProfiles.ts#L29)

Arguments passed to opponent display predicates to decide if
a behavior should run given the current combatant state.

## Properties

### combatants

> **combatants**: [`Sides`](../../../../../core/battle/utils/sides.utils/type-aliases/Sides.md)\<[`Combatant`](../../../../../core/battle/model/combatant/classes/Combatant.md)\>

Defined in: [src/features/battle/bridge/battleProfiles.ts:29](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/features/battle/bridge/battleProfiles.ts#L29)

The battle's combatants by side. 
(Feel free to extend this args object to require other context as needed)
