/** @fileoverview
 * Battle profile types for opponent and player display/logic.
 *
 * Provides structured configuration for:
 * - Opponent display (name, icon, sprite, background shader)
 * - Opponent contextual UI behaviors (pre/post round)
 * - Opponent AI and stats
 * - Player display lexicon
 */

import { OpponentAI, OpponentStats } from '@/core/battle/ai/opponentAI.types';
import { Point } from '@/shared/types/3d.types';
import { AssetURL } from '@/shared/types/misc.types';
import { MoveLexicon } from '../lexicon/moveLexicon';
import { Combatant } from '@/core/battle/model/combatant';
import { ActionMessageAppender } from './actionMessages';
import { Sides } from '@/core/battle/utils/sides.utils';
import { BattleEventPayload } from '@/core/battle/model/battleReactions';

/**
 * Arguments passed to opponent display predicates to decide if
 * a behavior should run given the current combatant state.
 *
 * @property {Sides<Combatant>} combatants - The battle's combatants by side. 
 * (Feel free to extend this args object to require other context as needed)
 */
export type OpponentDisplayPredicateArgs = { combatants: Sides<Combatant> } // Or whatever other needed for conditions

/**
 * Dependencies injected into opponent display behaviors when they execute.
 *
 * @property {ActionMessageAppender} appendActionMessage - Appends a message to the battle action log/UI. 
 * Feel free to extend this object with other dependencies as needed.
 */
export type OpponentDisplayBehaviorDeps = { appendActionMessage: ActionMessageAppender }

/**
 * A UI-focused, contextual behavior that an opponent can perform.
 * Behaviors can be gated by a predicate, run once, and operate on
 * injected UI helpers.
 *
 * @property {string} key - Stable identifier for the behavior (used for tracking/execution).
 * @property {(args: OpponentDisplayPredicateArgs) => boolean} [when] - Optional predicate to determine if the behavior should run.
 * @property {(deps: OpponentDisplayBehaviorDeps) => void} run - Executes the behavior with provided dependencies.
 * @property {boolean} [once] - If true, runs at most once across the battle.
 */
export interface OpponentDisplayBehavior {
    key: string;
    when?: (args: OpponentDisplayPredicateArgs) => boolean;
    run: (deps: OpponentDisplayBehaviorDeps) => void;
    once?: boolean
}

/**
 * Full opponent profile combining display configuration and battle logic.
 */
export interface OpponentProfile {
    /**
     * Visual and UI configuration for the opponent.
     *
     * @property {string} name - Display name for the opponent.
     * @property {AssetURL} icon - Icon for lists/selectors/HUD.
     * @property {Partial<MoveLexicon>} lexicon - Text/Icon overrides for moves display.
     * @property {AssetURL} sprite - Primary opponent sprite.
     * @property {Point} [spriteOffset] - Optional sprite offset in scene coordinates.
     * @property {string} backgroundShader - Background shader to run behind opponent (fragment shader string, typically imported from some .glsl file)
     * @property {AssetURL} [backgroundShaderTexture] - Optional texture to send to the background shader.
     * @property {{ preRound?: OpponentDisplayBehavior[]; postRound?: OpponentDisplayBehavior[] }} [behaviors]
     * Contextual UI behaviors grouped by timing (pre/post round).
     */
    display: {
        name: string;
        icon: AssetURL;
        lexicon: Partial<MoveLexicon>;

        sprite: AssetURL;
        spriteOffset?: Point;

        backgroundShader: string;
        backgroundShaderTexture?: AssetURL;

        // UI-Based Contextual Behaviors.
        behaviors?: {
            preRound?: OpponentDisplayBehavior[]
            postRound?: OpponentDisplayBehavior[]
            // Opponent has their own reaction to move emissions (custom notifications). Returns true if it handled an emission and wants to skips default handler.
            moveEmissionHandler?: (data: BattleEventPayload['MoveEmission'], opponentProfile: OpponentProfile, lexicons: Sides<MoveLexicon>, appendActionMessage: ActionMessageAppender) => boolean;
        }
    };

    /**
     * Battle logic configuration for the opponent.
     *
     * @property {OpponentAI} ai - AI implementation to decide actions. (@ref opponentAI.types.ts)
     * @property {OpponentStats} stats - Base stats used by the AI and engine.
     */
    logic: {
        ai: OpponentAI;
        stats: OpponentStats;
    };
}

/**
 * Player profile surface for display settings and text lexicon.
 */
export interface PlayerProfile {
    /**
 * Player-facing display configuration.
 *
 * @property {Partial<MoveLexicon>} lexicon - Text/Icon overrides for moves.
 * 
 * Feel free to add additional display properties as needed
 */
    display: {
        lexicon: Partial<MoveLexicon>;
    };
}