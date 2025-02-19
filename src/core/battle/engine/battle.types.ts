import { MoveData, PlayerMoveData } from "../moves/moves.types";
import { Actor } from "./actor";

export type MultiplierSet = {incoming: number, outgoing: number};

// Avoid using this type, it's stupid. Im in the process of just switching it out
// We already have gaurds for the sequence length, ejforcing it in TS provides no benefit.
export type MoveDataSequence = [MoveData, MoveData, MoveData, MoveData, MoveData];

export interface DVOpponentData {
    name: string
    icon: string
    sprite: string
    //actor: Actor (instead generate actor on creation)
    moveBin: MoveData[]
    maxHealth: number
    // Use opponent and player state to make decisions...
    getSequence: (me: Actor, player: Actor) => MoveDataSequence
    backgroundShader: string
}


// Will be moved to an interface and modifies as part of GameData later.
export interface PlayerData {
    moveBin: PlayerMoveData[]
    actor: Actor
}