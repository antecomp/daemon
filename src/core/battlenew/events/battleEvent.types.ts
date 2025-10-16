import { Sides } from "../utils/sides.utils";
import { BattleOutcome, DamageMultipliers } from "../model/battle";
import { Combatant } from "../model/combatant";
import { MoveSideEffectOutcome, Move } from "../model/move";
import { PlannedMove, PlannedSequence } from "../model/plannedmove";

// Change to Enum?
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

// Update this as needed for whatever information is needed/available.
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
        moves: Sides<Move>
    };
    PreEffectResolved: {
        preEffectOutcomes: Sides<MoveSideEffectOutcome | undefined>,
        combatants: Sides<Combatant> // for reading statuses
    };
    MultipliersComputed: {
        plannedMoves: Sides<PlannedMove>,
        moves: Sides<Move>,
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

    };
    RoundEnd: {
        combatants: Sides<Combatant>
    };
    BattleEnd: {
        outcome: BattleOutcome
        combatants: Sides<Combatant>
    };
}

export type Reaction<K extends BattleEvent> = (payload: BattleEventPayload[K]) => void | Promise<void>;
export type BattleReactions = Partial<{[K in BattleEvent]: Reaction<K>}>;

