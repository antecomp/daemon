import { Side, Sides } from "../utils/sides.utils";
import { BattleOutcome, DamageMultipliers } from "./battle";
import { Combatant } from "./combatant";
import { MoveSideEffectOutcome, Move, MoveSignal } from "./move.types";
import { PlannedSequence } from "./plannedMove";

/** Discriminated set of lifecycle events emitted by battle engine. Keys for `BattleReactions` */
export type BattleEvent =
    | "RoundPrepared"
    | "RoundStart"
    | "MoveStart"
    | "PreEffectResolved"
    | "MultipliersComputed"
    | "DamagesApplied"
    | "PostEffectResolved"
    | "MoveEnd"
    | "RoundEnd"
    | "BattleEnd"
    | "MoveEmission" // Random Emissions from move side effects.

/** Payload shape for each of the battle events (lifecycle stages). Provided by battleEngine.
 * Update as needed.
  */
export type BattleEventPayload = {
    RoundPrepared: {
        combatants: Sides<Combatant>  
        opponentPlan: PlannedSequence
    };
    RoundStart: {
        combatants: Sides<Combatant>
        plans: Sides<PlannedSequence>
    };
    MoveStart: {
        moveIndex: number,
        sequences: Sides<Move[]>,
        plans: Sides<PlannedSequence>,
        moves: Sides<Move>
    };
    PreEffectResolved: {
        preEffectOutcomes: Sides<MoveSideEffectOutcome | undefined>,
        combatants: Sides<Combatant> // for reading statuses
    };
    MultipliersComputed: {
        plannedSequences: Sides<PlannedSequence>,
        moveIndex: number,
        moves: Sides<Move>,
        combatants: Sides<Combatant>,
        damageMultipliers: Sides<DamageMultipliers>,
        preEffectOutcomes: Sides<MoveSideEffectOutcome | undefined>
    };
    DamagesApplied: {
        combatants: Sides<Combatant>
        damagesDealt: Sides<number>
    };
    PostEffectResolved: {
        postEffectOutcomes: Sides<MoveSideEffectOutcome | undefined>
        combatants: Sides<Combatant> // In case of extra damage / healing + reading statuses
    };
    MoveEnd: {
        combatants: Sides<Combatant>
    };
    RoundEnd: {
        combatants: Sides<Combatant>
    };
    BattleEnd: {
        outcome: BattleOutcome
        combatants: Sides<Combatant>
    };

    MoveEmission: {
        moveName: string
        signal: MoveSignal,
        perspective: Side
        // Consider adding a 'phase' section?
        // feel free to add other stuff like index or whatever. 
    }
}

/** TODO: Document */
type BattleReaction<K extends BattleEvent> = (payload: BattleEventPayload[K]) => void | Promise<void>;

/** BattleReactions is a map of named battle lifecycle stages (f.e `RoundStart`, or `DamagesApplied`) to a (optionally async blocking) callback
 * Used to "react" to parts of the battle execution, and potentially block evaluation to run supplamental code first.
 * Each lifecycle event has a different payload (context) that is provided to it, for varying context.
 * 
 * This is namely used by battleEngineBridge to update the UI, run animations, etc (blocking engine where necessary).
  */
export type BattleReactions = Partial<{[K in BattleEvent]: BattleReaction<K>}>;

