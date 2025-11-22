[**daemon**](../../../../../README.md)

***

# Type Alias: BattleReactions

> **BattleReactions** = `Partial`\<`{ [K in BattleEvent]: BattleReaction<K> }`\>

Defined in: [src/core/battle/model/battleReactions.ts:88](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/battle/model/battleReactions.ts#L88)

BattleReactions is a map of named battle lifecycle stages (f.e `RoundStart`, or `DamagesApplied`) to a (optionally async blocking) callback
Used to "react" to parts of the battle execution, and potentially block evaluation to run supplamental code first.
Each lifecycle event has a different payload (context) that is provided to it, for varying context.

This is namely used by battleEngineBridge to update the UI, run animations, etc (blocking engine where necessary).
