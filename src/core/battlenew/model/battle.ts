export type DamageMultipliers = {incoming: number, outgoing: number};
export enum BattleOutcome {
    PlayerVictory, OpponentVictory, Draw, PlayerEject
}
export const PASSTHROUGH_MULTPLIERS: DamageMultipliers = { incoming: 1, outgoing: 1 };
