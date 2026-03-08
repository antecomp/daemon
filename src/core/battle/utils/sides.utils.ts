/**
 * @fileoverview
 * Utilities for handling "sides" in battle logic. Where "sides" is simply a Record<'player' | 'opponent', any>
 *
 * This module provides types and helper functions for working with the two sides
 * in a battle: the human player and the AI opponent. It includes utilities for
 * mapping, iterating, and constructing objects keyed by side, as well as for
 * flipping perspectives between sides.
 */

/**
 * Represents a side in battle logic.
 * - 'player' refers to the human player.
 * - 'opponent' refers to the AI combatant.
 */
export type Side = 'player' | 'opponent';

/**
 * Ordered list of sides (player first, opponent second).
 * Useful for deterministic iteration.
 *
 * @example
 * sides.forEach(side => { ... });
 */
export const sides: readonly Side[] = ['player', 'opponent'] as const;

/**
 * A container that holds a value for each side.
 *
 * @template T Type of the stored value per side.
 * @example
 * const hp: Sides<number> = { player: 10, opponent: 12 };
 */
export type Sides<T> = { player: T; opponent: T };

/**
 * Constructs a `Sides<T>` from two values, one per side.
 *
 * @template T Type of the values.
 * @param player Value for the player side.
 * @param opponent Value for the opponent side.
 * @returns A `Sides<T>` object with both values.
 * @example
 * const combatants = makeSidesMap(playerCombatant, opponentCombatant);
 */
export function makeSidesMap<T>(player: T, opponent: T): Sides<T> { return { player, opponent } }

/** Returns the opposite side. Useful for when logic needs to flip perspective.
 * 
 * @param side The current side.
 * @returns The opposite side ('player' <-> 'opponent').
 * @example
 * oppositeSide('player') // 'opponent'
 */
export const oppositeSide = (side: Side): Side => (side == 'player' ? 'opponent' : 'player');

/**
 * Maps the values of a `Sides<Input>` to a new `Sides<Output>.`
 *
 * @template Input Input value type.
 * @template Output Output value type.
 * @param pair The input Sides container.
 * @param mapper Mapping function called for each side.
 * @returns A new Sides<Output> with mapped values.
 * @example
 * const lengths = mapSides(names, (name) => name.length);
 */
export function mapSides<Input, Output>(pair: Sides<Input>, mapper: (value: Input, role: Side, whole: Sides<Input>) => Output): Sides<Output> {
    return {
        player: mapper(pair.player, 'player', pair),
        opponent: mapper(pair.opponent, 'opponent', pair),
    };
}

/**
 * Invokes an effect for each side’s value.
 *
 * @template T Value type.
 * @param pair The Sides<T> container.
 * @param effect Effect function called per side.
 * @returns void
 * @example
 * forEachSide(combatants, (c) => c.tickStatuses());
 */
export function forEachSide<T>(pair: Sides<T>, action: ((value: T, role: Side) => void)) {
    for(const [role, entry] of Object.entries(pair)) {
        action(entry, role as Side);
    }
}

/**
 * Builds a Sides<T> by calling a builder for each side.
 *
 * @template T Value type.
 * @param builder Function that creates a value for a given side.
 * @returns A Sides<T> with built values.
 * @example
 * const contexts = buildSidesMap((side) => ({
 *   self: combatants[side],
 *   opponent: combatants[oppositeSide(side)],
 *   sequence: sequences[side],
 * }));
 */
export const buildSidesMap = <T>(builder: (role: Side) => T): Sides<T> => ({
    player: builder('player'),
    opponent: builder('opponent'),
});