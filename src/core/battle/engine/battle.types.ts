import { MoveMeta, PlayerMoveMeta } from "../moves/moves.types";
import { Actor } from "./actor";
import { ActionIconTable } from "./battle.config";

/** Damage multiplier struct */
export type MultiplierSet = {incoming: number, outgoing: number};


/**
 * Represents the data structure for an opponent in the battle engine.
 * This interface defines the properties and methods required for an opponent's behavior and appearance.
 */
export interface DVOpponentData {
    /**
     * The display name of the opponent.
     */
    name: string;

    /**
     * The icon representing the opponent (top left corner of UI).
     */
    icon: string;

    /**
     * The sprite asset url.
     */
    sprite: string;

    /**
     * The maximum health value of the opponent. Also used as initial health.
     */
    maxHealth: number;

    /**
     * A function that determines the sequence of moves the opponent will make.
     * The decision is based on the opponent's state (`me`) and the player's state (`player`).
     *
     * @param me - The current state of the opponent.
     * @param player - The current state of the player.
     * @returns An array of `MoveMeta` objects representing the opponent's move sequence.
     */
    getSequence: (me: Actor, player: Actor) => MoveMeta[];

    /**
     * The fragment shader used for rendering the opponent's background.
     */
    backgroundShader: string;
}


// (!!!) Will be moved to an interface and modifies as part of GameData later.
export interface PlayerData {
    moveBin: PlayerMoveMeta[]
    actor: Actor
}

/**
 * Represents a message (flair text) associated with an action in the battle engine.
 *
 * @property {keyof ActionIconTable} [icon] - An optional key referencing an icon, registered in the ActionIconTable.
 * @property {string} text - The text content of the action message.
 */
export interface ActionMessage {
    icon?: keyof ActionIconTable
    text: string
}


/** Method for adding an ActionMessage to the UI, message immediately rendered on append. */
export type ActionMessageAppender = (text: string, icon?: keyof ActionIconTable) => void;