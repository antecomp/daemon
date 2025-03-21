import { Accessor, Setter } from "solid-js";
import { MoveMeta, PlayerMoveMeta } from "../moves/moves.types";
import { Actor } from "./actor";
import { ActionIconTable } from "./battle.config";
import { BattleUIState } from "./battle.context";

/** Damage multiplier struct */
export type MultiplierSet = {incoming: number, outgoing: number};

/**
 * Represents the data structure for an opponent in the battle engine.
 * This interface defines the properties and methods required for an opponent's behavior and appearance.
 */
export interface DVOpponentData {
    /** * The display name of the opponent.  */
    name: string;

    /** * The icon representing the opponent (top left corner of UI).  */
    icon: string;

    /** * The sprite asset url.  */
    sprite: string;

    /** * The maximum health value of the opponent. Also used as initial health.  */
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

    /** * The fragment shader used for rendering the opponent's background.  */
    backgroundShader: string;
}


// (!!!) Will be moved to an interface and modifies as part of GameData later.
export interface PlayerData {
    moveBin: PlayerMoveMeta[]
    actor: Actor
}

/**
 * Represents a message (flair text) associated with an action in the battle engine.  *
 * @property {keyof ActionIconTable} [icon] - An optional key referencing an icon, registered in the ActionIconTable.
 * @property {string} text - The text content of the action message.
 */
export interface ActionMessage {
    icon?: keyof ActionIconTable
    text: string
}

/** Method for adding an ActionMessage to the UI, message immediately rendered on append. */
export type ActionMessageAppender = (text: string, icon?: keyof ActionIconTable) => void;


/**
 * Interface representing the core battle engine for managing and executing battle logic.
 * Provides signals, state management, and core methods for handling battle rounds and outcomes.
 * 
 * This is what is provided by useBattleLogic.
 */
export interface BattleEngine {
    /** Simple signal getter indicating player incoming/outgoing multipliers */  
        playerMults: Accessor<MultiplierSet>,
        /** Simple signal getter indicating opponent incoming/outgoing multipliers */
        opponentMults: Accessor<MultiplierSet>,
        /** Signal for battle UI state. Reference battle.context.ts */ 
        battleUIState: Accessor<BattleUIState>, 
        /** Signal setter for battle UI state. Reference battle.context.ts */
        setBattleUIState: Setter<BattleUIState>,
        /** Player actor object (proxied with createMutable) */ 
        player: Actor,
        /** Opponent actor object (proxied with createMutable) */ 
        opponent: Actor, 
        /** Round initialization and setup function.
         * Fetches opponent moves, updates displayed hint, and resets battle state.
         */
        setupRound: () => Promise<void>,
        /** Round execution function, triggered by user event.
         * - Builds sequence and executes it, updating the battle state.
         * - Core battle logic is executed here.
         * - Automatically triggers setupRound or handleDeath as needed.
         */ 
        executeRound: (userSelectedSequence: PlayerMoveMeta[]) => Promise<void>, 
        /** Signal for the current "hint" of the opponent sequence. */
        insight: Accessor<(MoveMeta | undefined)[]>, 
        /** Simple object representing the current status icons for the player and opponent (for UI) */
        currentStatuses: Accessor<{
            player: string[];
            opp: string[];
        }>, 
        /** Signal for the current action messages (flair text) */
        actionMessages: Accessor<ActionMessage[]>,
        /** Promise representing the battle outcome, resolved when the player or opponent die.
         * 
         * Await/then this to handle battle resolution.
         * @resolves "player" when player wins (opponent death)
         * @resolves "opponent" when opponent wins (player death)
         * @resolves "draw" when both player and opponent die.
         */
        battleResultPromise: Promise<"draw" | "player" | "opponent">
}