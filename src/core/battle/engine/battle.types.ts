import { MoveMeta, PlayerMoveMeta } from "../moves/moves.types";
import { Actor } from "./actor";
import { ActionIconTable } from "./battle.config";

/** Damage multiplier struct */
export type MultiplierSet = {incoming: number, outgoing: number};

export interface DVOpponentData {
    name: string
    icon: string
    sprite: string
    maxHealth: number
    // Use opponent and player state to make decisions...
    getSequence: (me: Actor, player: Actor) => MoveMeta[]
    backgroundShader: string
}


// Will be moved to an interface and modifies as part of GameData later.
export interface PlayerData {
    moveBin: PlayerMoveMeta[]
    actor: Actor
}

export interface ActionMessage {
    icon?: keyof ActionIconTable // <- I think this should be a string for a lookup table of standard icons rather than named imports/urls
    text: string
}

export type ActionMessageAppender = (text: string, icon?: keyof ActionIconTable) => void;