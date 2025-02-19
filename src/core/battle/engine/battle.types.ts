import { Move } from "../moves/moves.types";
import { Actor } from "./actor";

export type MultiplierSet = {incoming: number, outgoing: number};

export interface MoveData extends Move {
    displayName: string, // Can differ from the name of the instance, if we want a custom name for a generic move (e.g "slash" vs "attack")
    icon: string, // image url
    // description: string // for tooltip (to implement)
}

export interface PlayerMoveData extends MoveData {
    rbIcon: string // seperate icon for the runebuilder.
}

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
    moveBin: MoveData[]
    actor: Actor
}