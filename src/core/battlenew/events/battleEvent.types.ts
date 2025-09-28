import { Sides } from "../utils/sideUtils";
import { BattleOutcome, DamageMultipliers } from "../model/battle";
import { Combatant } from "../model/combatant";
import { EffectOutcome, Move, PlannedSequence } from "../model/move";

// Change to Enum?
export type BattleEvent =
    // | "BattleInit"
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
        preEffectOutcomes: Sides<EffectOutcome | undefined>
    };
    MultipliersComputed: {
        damageMultipliers: Sides<DamageMultipliers>
    };
    DamagesApplied: {
        combatants: Sides<Combatant>
        damagesDealt: Sides<number>
    };
    PostEffectResolved: {
        postEffectOutcomes: Sides<EffectOutcome | undefined>
    };
    MoveEnd: {

    };
    RoundEnd: {
        combatants: Sides<Combatant>
    };
    BattleEnd: {
        outcome: BattleOutcome
    };
}

export type Reaction<K extends BattleEvent> = (payload: BattleEventPayload[K]) => void | Promise<void>;
export type BattleReactions = Partial<{[K in BattleEvent]: Reaction<K>[]}>;

