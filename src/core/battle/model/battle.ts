import { makeSidesMap } from "../utils/sides.utils";

export type DamageMultipliers = {incoming: number, outgoing: number};

export enum BattleOutcome {
    PlayerVictory, OpponentVictory, Draw, PlayerEject
}

/** Utility instance of DamageMultipliers to essentially act as a noop/passthrough (just multiply by 1). */
export const PASSTHROUGH_MULTPLIERS: DamageMultipliers = { incoming: 1, outgoing: 1 };

/** Utility instance of DamageMultipliers to zero values out. */
export const ZERO_MULTIPLIERS = makeSidesMap({ incoming: 0, outgoing: 0 }, { incoming: 0, outgoing: 0 });
