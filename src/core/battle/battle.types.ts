// Simple Helper Types.

import { Actor } from "./actor";
import { Move } from "./moves";

export type MultiplierSet = {incoming: number, outgoing: number};

export interface MoveData {
    displayName: string, // Can differ from the name of the instance, if we want a custom name for a generic move (e.g "slash" vs "attack")
    icon: string, // image url
    instance: Move 
    // description: string // for tooltip (to implement)
}

export interface PlayerMoveData extends MoveData {
    rbIcon: string // seperate icon for the runebuilder.
}

export type MoveDataSequence = [MoveData, MoveData, MoveData, MoveData, MoveData];


// export class DVOpponent {
//     name: string
//     icon: string
//     sprite: string
//     actor: Actor
//     moveBin: MoveData[]
//     getSequence?: () => MoveSequence // Make non-optional later. We just have this so we can test UI init

//     constructor(name: string, icon: string, sprite: string, actor: Actor, moveBin: MoveData[], getSequenceArrowFunc?: (() => MoveSequence)) {
//         this.name = name;
//         this.icon = icon;
//         this.sprite = sprite;
//         this.actor = actor;
//         this.moveBin = moveBin;
//         this.getSequence = getSequenceArrowFunc
//     }
// }

export interface DVOpponentData {
    name: string
    icon: string
    sprite: string
    //actor: Actor (instead generate actor on creation)
    moveBin: MoveData[]
    maxHealth: number
    // Use opponent and player state to make decisions...
    getSequence: (me: Actor, player: Actor) => MoveDataSequence // HOW THE FUCK DO I MAKE THIS ACCESS MOVEBIN? WHAT IS THE FUCKING POINT OF MOVEBIN!?!?!?!?
}


// Will be moved to an interface and modifies as part of GameData later.
export interface PlayerData {
    moveBin: MoveData[]
    actor: Actor
}